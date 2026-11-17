"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PLANS, type PlanId } from "@/config/plans";
import { isThemeId } from "@/config/themes";
import { generateInvitationText } from "@/lib/ai/invitation-text";
import { getCurrentUser } from "@/lib/auth";
import { SESSION_LIFETIME_HOURS, refreshPaymentStatus } from "@/lib/billing";
import { publicEnv } from "@/lib/env";
import { features } from "@/lib/env-server";
import { isEventType, isLanguage } from "@/lib/event-types";
import { EVENT_COLUMNS, eventTag, isPlanActive, planOf } from "@/lib/events";
import { toIsoFromLocal } from "@/lib/format";
import { SaspayError, createCheckoutSession, saspayAmount } from "@/lib/saspay";
import { db, rows } from "@/lib/neon/sql";
import { createClient } from "@/lib/neon/data";
import type { ActionState, EventRow, RsvpRow } from "@/lib/types";



/** Événement accessible à l'utilisateur connecté (RLS : propriétaire ou admin). */
async function loadEvent(id: string) {
  const user = await getCurrentUser();
  if (!user || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select(EVENT_COLUMNS).eq("id", id).maybeSingle<EventRow>();
  // Défense en profondeur : la RLS filtre déjà, on revérifie le propriétaire avant toute action serveur.
  if (!data || (data.owner_id !== user.id && !user.isAdmin)) return null;
  return { user, event: data, supabase };
}

/** Une modification qui n'a touché aucune ligne n'est pas un succès. */
const touched = (res: { data: unknown[] | null; error: unknown }) => !res.error && (res.data?.length ?? 0) > 0;

const refresh = (e: EventRow) => updateTag(eventTag(e.slug));

/* ------------------------------------------------------------------ */
/* Modification                                                         */
/* ------------------------------------------------------------------ */

const EditSchema = z.object({
  eventType: z.string().refine(isEventType),
  title: z.string().trim().min(2, "Le titre est trop court.").max(160),
  hosts: z.string().trim().max(160),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choisissez une date.").or(z.literal("")),
  time: z.string().regex(/^\d{2}:\d{2}$/).or(z.literal("")),
  venue: z.string().trim().max(160),
  address: z.string().trim().max(240),
  city: z.string().trim().max(80),
  maps_url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https:\/\//.test(v), "Le lien doit commencer par https://")
    .or(z.literal("")),
  message: z.string().trim().max(2000),
  program: z.string().max(4000),
  dress_code: z.string().trim().max(160),
  rsvp_deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  contact_phone: z.string().trim().max(30).regex(/^[+\d\s().-]*$/, "Numéro invalide."),
  language: z.string().refine(isLanguage),
  theme: z.string().refine(isThemeId, "Choisissez un fond de la liste."),
});

/** « 16 h 00 — Accueil » par ligne → [{time, label}] */
function parseProgram(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((line) => {
      const m = line.match(/^(.{1,20}?)\s*[—–-]\s*(.+)$/);
      return m ? { time: m[1].trim(), label: m[2].trim().slice(0, 120) } : { time: "", label: line.slice(0, 120) };
    });
}

export async function updateEvent(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await loadEvent(id);
  if (!ctx) return { ok: false, message: "Invitation introuvable ou session expirée." };

  const parsed = EditSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Vérifiez les champs en rouge.", fieldErrors };
  }
  const v = parsed.data;
  const { error } = await ctx.supabase
    .from("events")
    .update({
      event_type: v.eventType,
      title: v.title,
      hosts: v.hosts || null,
      starts_at: v.date ? toIsoFromLocal(v.date, v.time) : null,
      venue: v.venue || null,
      address: v.address || null,
      city: v.city || null,
      maps_url: v.maps_url || null,
      message: v.message || null,
      program: parseProgram(v.program),
      dress_code: v.dress_code || null,
      rsvp_deadline: v.rsvp_deadline || null,
      contact_phone: v.contact_phone || null,
      language: v.language,
      theme: v.theme,
    })
    .eq("id", id);
  if (error) {
    console.error("[modifier]", error.message);
    return { ok: false, message: "Les modifications n'ont pas pu être enregistrées. Réessayez." };
  }
  refresh(ctx.event);
  redirect(`/tableau-de-bord/evenements/${id}?enregistre=1`);
}

/* ------------------------------------------------------------------ */
/* Publication                                                          */
/* ------------------------------------------------------------------ */

export async function publishEvent(id: string): Promise<ActionState> {
  const ctx = await loadEvent(id);
  if (!ctx) return { ok: false, message: "Invitation introuvable." };
  if (ctx.event.blocked_at) {
    return { ok: false, message: "Cette invitation a été suspendue par l'administration. Contactez le support." };
  }
  if (!isPlanActive(ctx.event)) {
    return { ok: false, message: "Choisissez d'abord une formule pour activer le lien de votre invitation." };
  }
  const res = await ctx.supabase.from("events").update({ status: "published" }).eq("id", id).select("id");
  if (!touched(res)) return { ok: false, message: "La publication a échoué. Réessayez." };
  refresh(ctx.event);
  return { ok: true, message: "Votre invitation est en ligne. Partagez le lien à vos invités." };
}

export async function unpublishEvent(id: string): Promise<ActionState> {
  const ctx = await loadEvent(id);
  if (!ctx) return { ok: false, message: "Invitation introuvable." };
  const res = await ctx.supabase.from("events").update({ status: "draft" }).eq("id", id).select("id");
  if (!touched(res)) return { ok: false, message: "L'opération a échoué. Réessayez." };
  refresh(ctx.event);
  return { ok: true, message: "Le lien est désactivé : vos invités ne peuvent plus ouvrir l'invitation." };
}

export async function archiveEvent(id: string) {
  const ctx = await loadEvent(id);
  if (!ctx) redirect("/tableau-de-bord");
  await ctx.supabase.from("events").update({ status: "archived" }).eq("id", id);
  refresh(ctx.event);
  redirect("/tableau-de-bord?archive=1");
}

/* ------------------------------------------------------------------ */
/* IA                                                                   */
/* ------------------------------------------------------------------ */

export async function regenerateText(id: string): Promise<ActionState> {
  const ctx = await loadEvent(id);
  if (!ctx) return { ok: false, message: "Invitation introuvable." };
  const plan = planOf(ctx.event);
  if (!plan?.limits.aiTexts && !ctx.user.isAdmin) {
    return { ok: false, message: "La réécriture par l'IA est incluse dans les formules Célébration et Prestige Pro." };
  }
  if (!features.aiText) return { ok: false, message: "L'IA n'est pas encore activée sur ce site." };

  const e = ctx.event;
  const text = await generateInvitationText({
    eventType: e.event_type,
    hosts: e.hosts ?? "",
    startsAt: e.starts_at,
    venue: e.venue ?? "",
    city: e.city ?? "",
    language: e.language,
    tone: "chaleureux",
    details: [e.dress_code && `Tenue : ${e.dress_code}`].filter(Boolean).join(". "),
  });
  if (text.source !== "ai") return { ok: false, message: "L'IA n'a pas pu rédiger un nouveau texte. Réessayez dans un instant." };

  await ctx.supabase.from("events").update({ title: text.title, message: text.message, program: text.program }).eq("id", id);
  if (features.database) {
    await db()`insert into public.ai_usage (user_id, event_id, kind, model) values (${ctx.user.id}, ${id}, 'text', ${text.model ?? "claude"})`;
  }
  refresh(e);
  return { ok: true, message: "Nouveau texte rédigé. Relisez-le et modifiez-le si besoin." };
}

/* ------------------------------------------------------------------ */
/* Paiement                                                             */
/* ------------------------------------------------------------------ */

export async function startCheckout(id: string, plan: PlanId): Promise<ActionState> {
  const ctx = await loadEvent(id);
  if (!ctx) return { ok: false, message: "Invitation introuvable." };
  if (!Object.hasOwn(PLANS, plan)) return { ok: false, message: "Formule inconnue." };
  if (!features.payments || !features.database) {
    return { ok: false, message: "Le paiement en ligne n'est pas encore activé. Revenez bientôt." };
  }
  if (!ctx.user.email) return { ok: false, message: "Ajoutez une adresse e-mail à votre compte pour payer." };

  const sql = db();
  const amount = saspayAmount(PLANS[plan].price);

  // Un paiement déjà ouvert pour la même invitation et la même formule est repris, pas dupliqué.
  const existing = await rows<{ checkout_url: string }>(
    sql`select checkout_url from public.payments
        where event_id = ${id} and user_id = ${ctx.user.id} and plan = ${plan} and amount = ${amount}
          and status = 'pending' and checkout_url is not null
          and created_at > now() - (${SESSION_LIFETIME_HOURS / 2}::float * interval '1 hour')
        order by created_at desc limit 1`,
  );
  if (existing[0]) redirect(existing[0].checkout_url);

  // Garde-fou : pas plus de 5 paiements ouverts par heure et par utilisateur
  const open = await rows<{ n: number }>(
    sql`select count(*)::int as n from public.payments
        where user_id = ${ctx.user.id} and status = 'pending' and created_at > now() - interval '1 hour'`,
  );
  if ((open[0]?.n ?? 0) >= 5) {
    return { ok: false, message: "Trop de paiements ouverts en peu de temps. Patientez une heure ou terminez le paiement en cours." };
  }

  const created = await rows<{ id: string }>(
    sql`insert into public.payments (event_id, user_id, plan, amount, currency, status)
        values (${id}, ${ctx.user.id}, ${plan}, ${amount}, 'XOF', 'pending') returning id`,
  );
  const payment = created[0];
  if (!payment) return { ok: false, message: "Le paiement n'a pas pu démarrer. Réessayez." };

  let checkoutUrl: string;
  try {
    const session = await createCheckoutSession({
      amount,
      description: `Invitora — formule ${PLANS[plan].name}`,
      customerEmail: ctx.user.email,
      customerName: ctx.user.profile?.full_name || ctx.user.email.split("@")[0],
      customerPhone: ctx.user.profile?.phone ?? undefined,
      returnUrl: `${publicEnv.siteUrl}/paiement/retour?paiement=${payment.id}`,
      metadata: { payment_id: payment.id, event_id: id, plan },
      expiresInHours: SESSION_LIFETIME_HOURS,
    });
    // Sans l'identifiant de session, le paiement ne pourrait jamais être rapproché : l'erreur remonte.
    await sql`update public.payments set saspay_session_id = ${session.id}, checkout_url = ${session.checkout_url}
             where id = ${payment.id}`;
    checkoutUrl = session.checkout_url;
  } catch (e) {
    await sql`update public.payments set status = 'failed' where id = ${payment.id}`;
    console.error("[paiement] création de session", e instanceof SaspayError ? `${e.status} ${e.code ?? ""} ${e.message}` : e);
    return { ok: false, message: "Le service de paiement ne répond pas. Réessayez dans quelques minutes." };
  }
  redirect(checkoutUrl);
}

export async function checkPayment(paymentId: string): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Session expirée." };
  const supabase = await createClient();
  const { data } = await supabase.from("payments").select("id").eq("id", paymentId).maybeSingle();
  if (!data) return { ok: false, message: "Paiement introuvable." };
  try {
    const status = await refreshPaymentStatus(paymentId);
    return status === "paid"
      ? { ok: true, message: "Paiement confirmé : votre formule est active." }
      : status === "pending"
        ? { ok: true, message: "Paiement en cours de confirmation. Cela peut prendre quelques minutes." }
        : { ok: false, message: "Ce paiement n'a pas abouti. Vous pouvez recommencer." };
  } catch {
    return { ok: false, message: "Vérification impossible pour le moment. Réessayez plus tard." };
  }
}

/* ------------------------------------------------------------------ */
/* Réponses                                                             */
/* ------------------------------------------------------------------ */

export async function deleteRsvp(eventId: string, rsvpId: string): Promise<ActionState> {
  const ctx = await loadEvent(eventId);
  if (!ctx) return { ok: false, message: "Invitation introuvable." };
  const { error } = await ctx.supabase.from("rsvps").delete().eq("id", rsvpId).eq("event_id", eventId);
  if (error) return { ok: false, message: "Suppression impossible." };
  return { ok: true, message: "Réponse supprimée." };
}

/** Réponses actuelles de l'invitation (rafraîchissement automatique du tableau de bord). */
export async function fetchRsvps(eventId: string): Promise<RsvpRow[]> {
  const ctx = await loadEvent(eventId);
  if (!ctx) return [];
  const { data } = await ctx.supabase
    .from("rsvps")
    .select("id, event_id, name, phone, response, guests_count, message, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .returns<RsvpRow[]>();
  return data ?? [];
}
