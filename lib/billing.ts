import "server-only";
import { PLANS, PLAN_DURATION_MONTHS, type PlanId } from "@/config/plans";
import { getSessionStatus, type WebhookPayload } from "@/lib/saspay";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentRow } from "@/lib/types";

/** Date d'expiration : 3 mois après la date la plus tardive entre maintenant et l'expiration actuelle. */
export function computeExpiry(currentExpiry: string | null, now = new Date()): string {
  const base = currentExpiry && new Date(currentExpiry) > now ? new Date(currentExpiry) : now;
  const d = new Date(base);
  d.setUTCMonth(d.getUTCMonth() + PLAN_DURATION_MONTHS);
  return d.toISOString();
}

/** Active la formule d'un événement après un paiement CONFIRMÉ par l'API SasPay. */
async function activatePayment(payment: PaymentRow, transactionId: string) {
  const admin = createAdminClient();

  // Verrou d'idempotence : on ne passe à « paid » qu'une seule fois.
  const { data: updated, error } = await admin
    .from("payments")
    .update({ status: "paid", paid_at: new Date().toISOString(), saspay_transaction_id: transactionId })
    .eq("id", payment.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!updated) return false;

  const { data: event, error: evErr } = await admin
    .from("events")
    .select("plan_expires_at")
    .eq("id", payment.event_id)
    .single<{ plan_expires_at: string | null }>();
  if (evErr) throw evErr;

  const plan = PLANS[payment.plan as PlanId];
  const { error: upErr } = await admin
    .from("events")
    .update({
      plan: plan.id,
      plan_expires_at: computeExpiry(event.plan_expires_at),
      guest_limit: plan.limits.guests,
    })
    .eq("id", payment.event_id);
  if (upErr) throw upErr;
  return true;
}

export type WebhookOutcome = "duplicate" | "ignored" | "activated" | "unmatched";

/**
 * Traite un webhook déjà authentifié (signature vérifiée) :
 * 1. enregistre data.id (un seul traitement par transaction) ;
 * 2. pour transaction.success, retrouve la session en attente correspondante
 *    et n'active la formule que si l'API SasPay confirme PAID + SUCCESS.
 */
export async function handleWebhook(payload: WebhookPayload): Promise<WebhookOutcome> {
  const admin = createAdminClient();

  const { error: dupErr } = await admin
    .from("webhook_events")
    .insert({ id: payload.data.id, event_type: payload.event, payload });
  if (dupErr) {
    if (dupErr.code === "23505") return "duplicate";
    throw dupErr;
  }

  if (payload.event !== "transaction.success") return "ignored";

  try {
    return await matchAndActivate(payload);
  } catch (e) {
    // En cas d'erreur, on libère data.id pour que la nouvelle tentative de SasPay soit retraitée.
    await admin.from("webhook_events").delete().eq("id", payload.data.id);
    throw e;
  }
}

async function matchAndActivate(payload: WebhookPayload): Promise<WebhookOutcome> {
  const admin = createAdminClient();

  // Paiements en attente des 7 derniers jours (le montant du webhook peut inclure des frais :
  // on ne filtre pas dessus, c'est l'API SasPay qui confirme la correspondance).
  const { data: pending, error } = await admin
    .from("payments")
    .select("*")
    .eq("status", "pending")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 3600_000).toISOString())
    .order("created_at", { ascending: false })
    .limit(25)
    .returns<PaymentRow[]>();
  if (error) throw error;

  for (const payment of pending ?? []) {
    if (!payment.saspay_session_id) continue;
    try {
      const status = await getSessionStatus(payment.saspay_session_id);
      if (status.status === "PAID" && status.transaction_status === "SUCCESS" && status.transaction_id === payload.data.id) {
        return (await activatePayment(payment, payload.data.id)) ? "activated" : "duplicate";
      }
    } catch (e) {
      console.error("[saspay] vérification de session impossible", payment.id, e instanceof Error ? e.message : e);
    }
  }

  // Aucune correspondance : on libère data.id pour qu'une nouvelle tentative de SasPay soit retraitée.
  await admin.from("webhook_events").delete().eq("id", payload.data.id);
  return "unmatched";
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
    .insert({ id: status.transaction_id, event_type: "admin.force_activation", payload: { status, adminId } });
  if (error && error.code !== "23505") throw error;
  return (await activatePayment(payment, status.transaction_id)) ? "activated" : "already";
}
