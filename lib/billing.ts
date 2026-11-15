import "server-only";
import { revalidateTag } from "next/cache";
import { PLANS, PLAN_DURATION_MONTHS, type PlanId } from "@/config/plans";
import { getSessionStatus, type SessionStatus, type WebhookPayload } from "@/lib/saspay";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentRow } from "@/lib/types";

/** Les sessions SasPay créées par Invitora expirent après ce délai (voir createCheckoutSession). */
export const SESSION_LIFETIME_HOURS = 2;
/** Fenêtre de rapprochement des webhooks : durée de vie de la session + marge pour les nouvelles tentatives. */
const MATCH_WINDOW_HOURS = SESSION_LIFETIME_HOURS + 4;
/** Un traitement « en cours » depuis plus longtemps est considéré comme interrompu. */
const LOCK_TIMEOUT_MS = 90_000;

/** Date d'expiration : 3 mois après la date la plus tardive entre maintenant et l'expiration actuelle. */
export function computeExpiry(currentExpiry: string | null, now = new Date()): string {
  const base = currentExpiry && new Date(currentExpiry) > now ? new Date(currentExpiry) : now;
  const d = new Date(base);
  d.setUTCMonth(d.getUTCMonth() + PLAN_DURATION_MONTHS);
  return d.toISOString();
}

/**
 * Active la formule d'un événement après un paiement CONFIRMÉ par l'API SasPay.
 * Une seule transaction SQL (fonction activate_payment) : le paiement passe à « paid »
 * et l'événement reçoit sa formule, ou rien ne change. Idempotent.
 */
async function activatePayment(payment: PaymentRow, transactionId: string): Promise<boolean> {
  const admin = createAdminClient();
  const plan = PLANS[payment.plan as PlanId];
  const { data: slug, error } = await admin.rpc("activate_payment", {
    p_payment_id: payment.id,
    p_transaction_id: transactionId,
    p_guest_limit: plan.limits.guests,
    p_months: PLAN_DURATION_MONTHS,
  });
  if (error) throw error;
  if (!slug) return false; // déjà traité
  // La page invité (mise en cache) reflète tout de suite la formule active
  revalidateTag(`event-${slug}`, { expire: 0 });
  return true;
}

export type WebhookOutcome = "duplicate" | "busy" | "ignored" | "activated" | "unmatched";

/** Vrai si la session confirme un paiement réussi pour cette transaction. */
const confirms = (s: SessionStatus, transactionId: string) =>
  s.status === "PAID" && s.transaction_status === "SUCCESS" && s.transaction_id === transactionId;

/**
 * Traite un webhook déjà authentifié (signature vérifiée).
 * - Seul « transaction.success » est traité ; les autres événements sont ignorés
 *   (ils ne doivent pas occuper l'identifiant de la transaction).
 * - data.id est réservé en base avec un état « processing » puis « done » : une nouvelle
 *   tentative pendant un traitement en cours reçoit « busy » (SasPay réessaiera), jamais « duplicate ».
 * - La formule ne s'active que si l'API SasPay confirme PAID + SUCCESS pour CETTE transaction.
 */
export async function handleWebhook(payload: WebhookPayload): Promise<WebhookOutcome> {
  if (payload.event !== "transaction.success") return "ignored";
  const admin = createAdminClient();
  const id = payload.data.id;

  const { error: lockErr } = await admin
    .from("webhook_events")
    .insert({ id, event_type: payload.event, payload, status: "processing" });

  if (lockErr) {
    if (lockErr.code !== "23505") throw lockErr;
    const { data: existing } = await admin.from("webhook_events").select("status, locked_at").eq("id", id).maybeSingle<{ status: string; locked_at: string }>();
    if (!existing || existing.status === "done") return "duplicate";
    if (Date.now() - new Date(existing.locked_at).getTime() < LOCK_TIMEOUT_MS) return "busy";
    // Traitement interrompu : on le reprend (un seul repreneur grâce à la condition sur locked_at).
    const { data: taken } = await admin
      .from("webhook_events")
      .update({ locked_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "processing")
      .eq("locked_at", existing.locked_at)
      .select("id")
      .maybeSingle();
    if (!taken) return "busy";
  }

  try {
    const outcome = await matchAndActivate(payload);
    if (outcome === "activated" || outcome === "duplicate") {
      await admin.from("webhook_events").update({ status: "done" }).eq("id", id);
    } else {
      // Aucune correspondance : on libère l'identifiant pour que la nouvelle tentative de SasPay soit retraitée.
      await admin.from("webhook_events").delete().eq("id", id);
    }
    return outcome;
  } catch (e) {
    await admin.from("webhook_events").delete().eq("id", id);
    throw e;
  }
}

/** Retrouve la session de paiement qui correspond à la transaction et l'active si SasPay le confirme. */
async function matchAndActivate(payload: WebhookPayload): Promise<WebhookOutcome> {
  const admin = createAdminClient();
  const txId = payload.data.id;

  const { data: pending, error } = await admin
    .from("payments")
    .select("*")
    .eq("status", "pending")
    .not("saspay_session_id", "is", null)
    .gte("created_at", new Date(Date.now() - MATCH_WINDOW_HOURS * 3600_000).toISOString())
    .order("created_at", { ascending: false })
    .limit(60)
    .returns<PaymentRow[]>();
  if (error) throw error;
  let candidates = pending ?? [];

  // 1. Corrélation directe si SasPay renvoie nos métadonnées ou notre référence dans le webhook.
  const hint = extractPaymentHint(payload);
  if (hint) {
    const direct = candidates.find((p) => p.id === hint);
    if (direct) candidates = [direct, ...candidates.filter((p) => p.id !== hint)];
  }

  // 2. Sinon, on commence par les paiements du même montant (les plus probables).
  const amount = payload.data.amount ? Number.parseFloat(payload.data.amount).toFixed(2) : null;
  if (amount && !hint) {
    candidates = [...candidates.filter((p) => p.amount === amount), ...candidates.filter((p) => p.amount !== amount)];
  }

  // Vérification auprès de SasPay par petits lots en parallèle, avec délai court (SasPay attend 15 s).
  const BATCH = 8;
  const deadline = Date.now() + 11_000;
  for (let i = 0; i < candidates.length && Date.now() < deadline; i += BATCH) {
    const batch = candidates.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (payment) => {
        try {
          const status = await getSessionStatus(payment.saspay_session_id as string, 4_000);
          return confirms(status, txId) ? payment : null;
        } catch {
          return null;
        }
      }),
    );
    const match = results.find(Boolean);
    if (match) return (await activatePayment(match, txId)) ? "activated" : "duplicate";
  }
  return "unmatched";
}

/** Identifiant de paiement Invitora éventuellement présent dans le webhook (métadonnées ou référence). */
function extractPaymentHint(payload: WebhookPayload): string | null {
  const d = payload.data as Record<string, unknown>;
  const meta = (d.metadata ?? d.session_metadata) as Record<string, unknown> | undefined;
  const candidate = meta?.payment_id ?? d.reference_id ?? d.external_reference;
  return typeof candidate === "string" && /^[0-9a-f-]{36}$/i.test(candidate) ? candidate : null;
}

/**
 * Vérifie un paiement en attente auprès de SasPay et met à jour son statut s'il a
 * expiré ou été annulé. N'ACTIVE JAMAIS la formule (règle 3 : il faut le webhook).
 */
export async function refreshPaymentStatus(paymentId: string): Promise<"paid" | "pending" | "failed"> {
  const admin = createAdminClient();
  const { data: payment } = await admin.from("payments").select("*").eq("id", paymentId).single<PaymentRow>();
  if (!payment) return "failed";
  if (payment.status === "paid") return "paid";
  if (payment.status !== "pending" || !payment.saspay_session_id) return "failed";

  const status = await getSessionStatus(payment.saspay_session_id);
  if (status.status === "EXPIRED" || status.status === "CANCELLED") {
    await admin
      .from("payments")
      .update({ status: status.status === "EXPIRED" ? "expired" : "cancelled" })
      .eq("id", payment.id)
      .eq("status", "pending");
    return "failed";
  }
  return "pending";
}

/**
 * Exception réservée à l'administrateur, pour un webhook perdu : active la formule
 * UNIQUEMENT si l'API SasPay confirme PAID + SUCCESS. Action tracée dans webhook_events.
 */
export async function adminForceActivation(paymentId: string, adminId: string): Promise<"activated" | "already" | "not_paid" | "failed"> {
  const admin = createAdminClient();
  const { data: payment } = await admin.from("payments").select("*").eq("id", paymentId).single<PaymentRow>();
  if (!payment || !payment.saspay_session_id) return "failed";
  if (payment.status === "paid") return "already";

  const status = await getSessionStatus(payment.saspay_session_id);
  if (status.status !== "PAID" || status.transaction_status !== "SUCCESS" || !status.transaction_id) return "not_paid";

  const { error } = await admin
    .from("webhook_events")
    .insert({ id: status.transaction_id, event_type: "admin.force_activation", payload: { status, adminId }, status: "done" });
  if (error && error.code !== "23505") throw error;
  return (await activatePayment(payment, status.transaction_id)) ? "activated" : "already";
}
