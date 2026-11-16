"use server";

import { revalidateTag, updateTag } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { PLANS, type PlanId } from "@/config/plans";
import { requireAdmin } from "@/lib/auth";
import { adminForceActivation, computeExpiry, refreshPaymentStatus } from "@/lib/billing";
import { features } from "@/lib/env-server";
import { eventTag } from "@/lib/events";
import { db, rows } from "@/lib/neon/sql";
import type { ActionState } from "@/lib/types";

/** Toutes les actions d'administration revérifient le rôle côté serveur. */
async function guard() {
  const admin = await requireAdmin();
  if (!features.database) throw new Error("DATABASE_URL manquante.");
  return { admin, sql: db() };
}

const fail = (e: unknown): ActionState => {
  unstable_rethrow(e); // laisse passer redirect() / notFound()
  console.error("[admin]", e instanceof Error ? e.message : e);
  return { ok: false, message: "Action impossible. Réessayez ou consultez les journaux du serveur." };
};

export async function setUserRole(userId: string, role: "user" | "admin"): Promise<ActionState> {
  try {
    const { admin, sql } = await guard();
    if (!/^[0-9a-f-]{36}$/i.test(userId) || (role !== "user" && role !== "admin")) return { ok: false, message: "Demande invalide." };
    if (userId === admin.id && role === "user") return { ok: false, message: "Vous ne pouvez pas retirer votre propre rôle d'administrateur." };
    await sql`update public.profiles set role = ${role} where id = ${userId}`;
    return { ok: true, message: role === "admin" ? "Rôle administrateur attribué." : "Rôle administrateur retiré." };
  } catch (e) {
    return fail(e);
  }
}

export async function setEventStatus(eventId: string, status: "draft" | "published" | "archived"): Promise<ActionState> {
  try {
    const { sql } = await guard();
    if (!["draft", "published", "archived"].includes(status)) return { ok: false, message: "Statut inconnu." };
    // Dépublier ou archiver par l'administration SUSPEND l'invitation : l'organisateur ne peut pas la remettre en ligne.
    // Publier lève la suspension.
    const updated = await rows<{ slug: string }>(
      sql`update public.events
             set status = ${status}, blocked_at = ${status === "published" ? null : new Date().toISOString()}
           where id = ${eventId} returning slug`,
    );
    if (!updated[0]) return { ok: false, message: "Invitation introuvable." };
    updateTag(eventTag(updated[0].slug));
    return { ok: true, message: "Statut mis à jour." };
  } catch (e) {
    return fail(e);
  }
}

/** Offrir une formule (geste commercial, partenaire…) : décision humaine de l'administrateur. */
export async function grantPlan(eventId: string, plan: PlanId): Promise<ActionState> {
  try {
    const { sql } = await guard();
    if (!Object.hasOwn(PLANS, plan)) return { ok: false, message: "Formule inconnue." };
    const current = await rows<{ slug: string; plan_expires_at: string | null }>(
      sql`select slug, plan_expires_at from public.events where id = ${eventId}`,
    );
    if (!current[0]) return { ok: false, message: "Invitation introuvable." };
    await sql`update public.events
                 set plan = ${plan}, plan_expires_at = ${computeExpiry(current[0].plan_expires_at)}, guest_limit = ${PLANS[plan].limits.guests}
               where id = ${eventId}`;
    updateTag(eventTag(current[0].slug));
    return { ok: true, message: `Formule ${PLANS[plan].name} offerte pour 3 mois.` };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteEvent(eventId: string): Promise<ActionState> {
  try {
    const { sql } = await guard();
    const deleted = await rows<{ slug: string }>(sql`delete from public.events where id = ${eventId} returning slug`);
    if (deleted[0]) updateTag(eventTag(deleted[0].slug));
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
    const { sql } = await guard();
    const show = formData.get("show_sample_content") === "on";
    const maintenance = String(formData.get("maintenance_message") ?? "").trim().slice(0, 200);
    await sql`insert into public.app_settings (key, value, updated_at) values
                ('show_sample_content', ${JSON.stringify(show)}::jsonb, now()),
                ('maintenance_message', ${JSON.stringify(maintenance)}::jsonb, now())
              on conflict (key) do update set value = excluded.value, updated_at = now()`;
    revalidateTag("settings", { expire: 0 });
    return { ok: true, message: "Réglages enregistrés. La page d'accueil est mise à jour." };
  } catch (e) {
    return fail(e);
  }
}
