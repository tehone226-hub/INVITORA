import "server-only";
import { revalidateTag } from "next/cache";
import { PLANS, PLAN_DURATION_MONTHS, type PlanId } from "@/config/plans";
import { db, rows } from "@/lib/neon/sql";
import { getSessionStatus, type SessionStatus, type WebhookPayload } from "@/lib/saspay";
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
  const plan = PLANS[payment.plan as PlanId];
  const result = await rows<{ slug: string | null }>(
    db()`select public.activate_payment(${payment.id}, ${transactionId}, ${plan.limits.guests}, ${PLAN_DURATION_MONTHS}) as slug`,
  );
  const slug = result[0]?.slug;
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
  const sql = db();
  const id = payload.data.id;

  // Réservation atomique de l'identifiant (clé primaire)
  const inserted = await rows<{ id: string }>(
    sql`insert into public.webhook_events (id, event_type, payload, status)
        values (${id}, ${payload.event}, ${JSON.stringify(payload)}::jsonb, 'processing')
        on conflict (id) do nothing returning id`,
  );

  if (!inserted.length) {
    const existing = await rows<{ status: string; locked_at: string }>(
      sql`select status, locked_at from public.webhook_events where id = ${id}`,
    );
    const row = existing[0];
    if (!row || row.status === "done") return "duplicate";
    if (Date.now() - new Date(row.locked_at).getTime() < LOCK_TIMEOUT_MS) return "busy";
    // Traitement interrompu : on le reprend (un seul repreneur grâce à la condition sur locked_at).
    const taken = await rows<{ id: string }>(
      sql`update public.webhook_events set locked_at = now()
           where id = ${id} and status = 'processing' and locked_at = ${row.locked_at} returning id`,
    );
    if (!taken.length) return "busy";
  }

  try {
    const outcome = await matchAndActivate(payload);
    if (outcome === "activated" || outcome === "duplicate") {
      await sql`update public.webhook_events set status = 'done' where id = ${id}`;
    } else {
      // Aucune correspondance : on libère l'identifiant pour que la nouvelle tentative de SasPay soit retraitée.
      await sql`delete from public.webhook_events where id = ${id}`;
    }
    return outcome;
  } catch (e) {
    await sql`delete from public.webhook_events where id = ${id}`;
    throw e;
  }
}

/** Retrouve la session de paiement qui correspond à la transaction et l'active si SasPay le confirme. */
async function matchAndActivate(payload: WebhookPayload): Promise<WebhookOutcome> {
  const txId = payload.data.id;

  let candidates = await rows<PaymentRow>(
    db()`select * from public.payments
          where status = 'pending' and saspay_session_id is not null
            and created_at > now() - (${MATCH_WINDOW_HOURS}::float * interval '1 hour')
          order by created_at desc limit 60`,
  );

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

async function loadPayment(paymentId: string): Promise<PaymentRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(paymentId)) return null;
  const found = await rows<PaymentRow>(db()`select * from public.payments where id = ${paymentId}`);
  return found[0] ?? null;
}

/**
 * Vérifie un paiement en attente auprès de SasPay et met à jour son statut s'il a
 * expiré ou été annulé. N'ACTIVE JAMAIS la formule (règle 3 : il faut le webhook).
 */
export async function refreshPaymentStatus(paymentId: string): Promise<"paid" | "pending" | "failed"> {
  const payment = await loadPayment(paymentId);
  if (!payment) return "failed";
  if (payment.status === "paid") return "paid";
  if (payment.status !== "pending" || !payment.saspay_session_id) return "failed";

  const status = await getSessionStatus(payment.saspay_session_id);
  if (status.status === "EXPIRED" || status.status === "CANCELLED") {
    const next = status.status === "EXPIRED" ? "expired" : "cancelled";
    await db()`update public.payments set status = ${next} where id = ${payment.id} and status = 'pending'`;
    return "failed";
  }
  return "pending";
}

/**
 * Exception réservée à l'administrateur, pour un webhook perdu : active la formule
 * UNIQUEMENT si l'API SasPay confirme PAID + SUCCESS. Action tracée dans webhook_events.
 */
export async function adminForceActivation(paymentId: string, adminId: string): Promise<"activated" | "already" | "not_paid" | "failed"> {
  const payment = await loadPayment(paymentId);
  if (!payment || !payment.saspay_session_id) return "failed";
  if (payment.status === "paid") return "already";

  const status = await getSessionStatus(payment.saspay_session_id);
  if (status.status !== "PAID" || status.transaction_status !== "SUCCESS" || !status.transaction_id) return "not_paid";

  await db()`insert into public.webhook_events (id, event_type, payload, status)
             values (${status.transaction_id}, 'admin.force_activation', ${JSON.stringify({ status, adminId })}::jsonb, 'done')
             on conflict (id) do nothing`;
  return (await activatePayment(payment, status.transaction_id)) ? "activated" : "already";
}
