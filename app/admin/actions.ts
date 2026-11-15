"use server";

import { revalidateTag, updateTag } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { PLANS, type PlanId } from "@/config/plans";
import { requireAdmin } from "@/lib/auth";
import { adminForceActivation, computeExpiry, refreshPaymentStatus } from "@/lib/billing";
import { features } from "@/lib/env-server";
import { eventTag } from "@/lib/events";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionState } from "@/lib/types";

/** Toutes les actions d'administration revérifient le rôle côté serveur. */
async function guard() {
  const admin = await requireAdmin();
  if (!features.serviceRole) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante.");
  return { admin, db: createAdminClient() };
}

const fail = (e: unknown): ActionState => {
  unstable_rethrow(e); // laisse passer redirect() / notFound()
  console.error("[admin]", e instanceof Error ? e.message : e);
  return { ok: false, message: "Action impossible. Réessayez ou consultez les journaux du serveur." };
};

export async function setUserRole(userId: string, role: "user" | "admin"): Promise<ActionState> {
  try {
    const { admin, db } = await guard();
    if (userId === admin.id && role === "user") return { ok: false, message: "Vous ne pouvez pas retirer votre propre rôle d'administrateur." };
    const { error } = await db.from("profiles").update({ role }).eq("id", userId);
    if (error) throw error;
    return { ok: true, message: role === "admin" ? "Rôle administrateur attribué." : "Rôle administrateur retiré." };
  } catch (e) {
    return fail(e);
  }
}

export async function setEventStatus(eventId: string, status: "draft" | "published" | "archived"): Promise<ActionState> {
  try {
    const { db } = await guard();
    // Dépublier ou archiver par l'administration SUSPEND l'invitation : l'organisateur ne peut pas la remettre en ligne.
    // Publier lève la suspension.
    const blocked_at = status === "published" ? null : new Date().toISOString();
    const { data, error } = await db.from("events").update({ status, blocked_at }).eq("id", eventId).select("slug").single<{ slug: string }>();
    if (error) throw error;
    updateTag(eventTag(data.slug));
    return { ok: true, message: "Statut mis à jour." };
  } catch (e) {
    return fail(e);
  }
}

/** Offrir une formule (geste commercial, partenaire…) : décision humaine de l'administrateur. */
export async function grantPlan(eventId: string, plan: PlanId): Promise<ActionState> {
  try {
    const { db } = await guard();
    if (!Object.hasOwn(PLANS, plan)) return { ok: false, message: "Formule inconnue." };
    const { data: ev, error: e1 } = await db.from("events").select("slug, plan_expires_at").eq("id", eventId).single<{ slug: string; plan_expires_at: string | null }>();
    if (e1) throw e1;
    const { error } = await db
      .from("events")
      .update({ plan, plan_expires_at: computeExpiry(ev.plan_expires_at), guest_limit: PLANS[plan].limits.guests })
      .eq("id", eventId);
    if (error) throw error;
    updateTag(eventTag(ev.slug));
    return { ok: true, message: `Formule ${PLANS[plan].name} offerte pour 3 mois.` };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteEvent(eventId: string): Promise<ActionState> {
  try {
    const { db } = await guard();
    const { data, error } = await db.from("events").delete().eq("id", eventId).select("slug").maybeSingle<{ slug: string }>();
    if (error) throw error;
    if (data) updateTag(eventTag(data.slug));
    return { ok: true, message: "Invitation supprimée définitivement." };
  } catch (e) {
    return fail(e);
  }
}

export async function adminRefreshPayment(paymentId: string): Promise<ActionState> {
  try {
    await guard();
    const s = await refreshPaymentStatus(paymentId);
    return { ok: true, message: s === "paid" ? "Paiement confirmé." : s === "pending" ? "Toujours en attente chez SasPay." : "Paiement non abouti (statut mis à jour)." };
  } catch (e) {
    return fail(e);
  }
}

export async function adminActivatePayment(paymentId: string): Promise<ActionState> {
  try {
    const { admin } = await guard();
    const r = await adminForceActivation(paymentId, admin.id);
    return r === "activated"
      ? { ok: true, message: "Formule activée (paiement confirmé par SasPay)." }
      : r === "already"
        ? { ok: true, message: "Ce paiement était déjà traité." }
        : r === "not_paid"
          ? { ok: false, message: "SasPay ne confirme pas ce paiement : activation refusée." }
          : { ok: false, message: "Paiement introuvable." };
  } catch (e) {
    return fail(e);
  }
}

export async function updateSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { db } = await guard();
    const show = formData.get("show_sample_content") === "on";
    const maintenance = String(formData.get("maintenance_message") ?? "").trim().slice(0, 200);
    const now = new Date().toISOString();
    const { error } = await db.from("app_settings").upsert([
      { key: "show_sample_content", value: show, updated_at: now },
      { key: "maintenance_message", value: maintenance, updated_at: now },
    ]);
    if (error) throw error;
    revalidateTag("settings", { expire: 0 });
    return { ok: true, message: "Réglages enregistrés. La page d'accueil est mise à jour." };
  } catch (e) {
    return fail(e);
  }
}
