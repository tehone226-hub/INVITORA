"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PLANS, type PlanId } from "@/config/plans";
import type { ThemeId } from "@/config/themes";
import { MAX_IMAGE_GENERATIONS, generateBackground } from "@/lib/ai/invitation-image";
import { generateInvitationText } from "@/lib/ai/invitation-text";
import { getCurrentUser } from "@/lib/auth";
import { refreshPaymentStatus } from "@/lib/billing";
import { publicEnv } from "@/lib/env";
import { features } from "@/lib/env-server";
import { eventTypeLabel, isEventType, isLanguage } from "@/lib/event-types";
import { EVENT_COLUMNS, eventTag, isPlanActive, planOf } from "@/lib/events";
import { toIsoFromLocal } from "@/lib/format";
import { SaspayError, createCheckoutSession, saspayAmount } from "@/lib/saspay";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionState, EventRow } from "@/lib/types";

const THEMES: ThemeId[] = ["faso-dan-fani", "bogolan", "tiebele", "indigo"];

/** Événement accessible à l'utilisateur connecté (RLS : propriétaire ou admin). */
async function loadEvent(id: string) {
  const user = await getCurrentUser();
  if (!user || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select(EVENT_COLUMNS).eq("id", id).maybeSingle<EventRow>();
  return data ? { user, event: data, supabase } : null;
}

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
  theme: z.string().refine((v) => THEMES.includes(v as ThemeId)),
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
  if (!isPlanActive(ctx.event)) {
    return { ok: false, message: "Choisissez d'abord une formule pour activer le lien de votre invitation." };
  }
  const { error } = await ctx.supabase.from("events").update({ status: "published" }).eq("id", id);
  if (error) return { ok: false, message: "La publication a échoué. Réessayez." };
  refresh(ctx.event);
  return { ok: true, message: "Votre invitation est en ligne. Partagez le lien à vos invités." };
}

export async function unpublishEvent(id: string): Promise<ActionState> {
  const ctx = await loadEvent(id);
  if (!ctx) return { ok: false, message: "Invitation introuvable." };
  const { error } = await ctx.supabase.from("events").update({ status: "draft" }).eq("id", id);
  if (error) return { ok: false, message: "L'opération a échoué. Réessayez." };
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
  if (features.serviceRole) {
    await createAdminClient().from("ai_usage").insert({ user_id: ctx.user.id, event_id: id, kind: "text", model: text.model ?? "claude" });
  }
  refresh(e);
  return { ok: true, message: "Nouveau texte rédigé. Relisez-le et modifiez-le si besoin." };
}

export async function generateCover(id: string): Promise<ActionState> {
  const ctx = await loadEvent(id);
  if (!ctx) return { ok: false, message: "Invitation introuvable." };
  if (!features.aiImage) return { ok: false, message: "La génération d'images n'est pas encore activée sur ce site." };
  if (!features.serviceRole) return { ok: false, message: "Configuration serveur incomplète (clé service Supabase)." };
  const e = ctx.event;
  if (e.image_generations >= MAX_IMAGE_GENERATIONS) {
    return { ok: false, message: `Vous avez utilisé les ${MAX_IMAGE_GENERATIONS} créations d'image de cette invitation.` };
  }

  const admin = createAdminClient();
  // On réserve la génération AVANT l'appel (évite de dépasser la limite en cliquant plusieurs fois).
  const { data: reserved } = await admin
    .from("events")
    .update({ image_generations: e.image_generations + 1 })
    .eq("id", id)
    .eq("image_generations", e.image_generations)
    .select("id")
    .maybeSingle();
  if (!reserved) return { ok: false, message: "Une création d'image est déjà en cours. Patientez un instant." };

  const image = await generateBackground(e.theme, eventTypeLabel(e.event_type), isPlanActive(e));
  await admin
    .from("ai_usage")
    .insert({ user_id: ctx.user.id, event_id: id, kind: "image", model: image?.model ?? "aucune", ok: Boolean(image) });

  if (!image) {
    return { ok: false, message: "L'image n'a pas pu être créée. Le fond de l'étoffe choisie reste utilisé. Réessayez plus tard." };
  }

  const ext = image.mimeType.includes("jpeg") ? "jpg" : image.mimeType.includes("webp") ? "webp" : "png";
  const path = `${e.owner_id}/${e.id}-${Date.now()}.${ext}`;
  const { error: upErr } = await admin.storage
    .from("invitations")
    .upload(path, image.bytes, { contentType: image.mimeType, cacheControl: "31536000", upsert: false });
  if (upErr) {
    console.error("[image] stockage", upErr.message);
    return { ok: false, message: "L'image a été créée mais n'a pas pu être enregistrée. Réessayez." };
  }
  const { data: pub } = admin.storage.from("invitations").getPublicUrl(path);
  await ctx.supabase.from("events").update({ cover_image_url: pub.publicUrl }).eq("id", id);
  refresh(e);
  return { ok: true, message: "Nouveau fond créé par l'IA." };
}

export async function resetCover(id: string): Promise<ActionState> {
  const ctx = await loadEvent(id);
  if (!ctx) return { ok: false, message: "Invitation introuvable." };
  await ctx.supabase.from("events").update({ cover_image_url: null }).eq("id", id);
  refresh(ctx.event);
  return { ok: true, message: "Le fond de l'étoffe est rétabli." };
}

/* ------------------------------------------------------------------ */
/* Paiement                                                             */
/* ------------------------------------------------------------------ */

export async function startCheckout(id: string, plan: PlanId): Promise<ActionState> {
  const ctx = await loadEvent(id);
  if (!ctx) return { ok: false, message: "Invitation introuvable." };
  if (!PLANS[plan]) return { ok: false, message: "Formule inconnue." };
  if (!features.payments || !features.serviceRole) {
    return { ok: false, message: "Le paiement en ligne n'est pas encore activé. Revenez bientôt." };
  }
  if (!ctx.user.email) return { ok: false, message: "Ajoutez une adresse e-mail à votre compte pour payer." };

  const admin = createAdminClient();
  const amount = saspayAmount(PLANS[plan].price);
  const { data: payment, error } = await admin
    .from("payments")
    .insert({ event_id: id, user_id: ctx.user.id, plan, amount, currency: "XOF", status: "pending" })
    .select("id")
    .single<{ id: string }>();
  if (error || !payment) return { ok: false, message: "Le paiement n'a pas pu démarrer. Réessayez." };

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
    });
    await admin.from("payments").update({ saspay_session_id: session.id, checkout_url: session.checkout_url }).eq("id", payment.id);
    checkoutUrl = session.checkout_url;
  } catch (e) {
    await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    console.error("[paiement] création de session", e instanceof SaspayError ? `${e.status} ${e.code}` : e);
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
