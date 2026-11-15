"use server";

import { createClient as createAnonClient } from "@supabase/supabase-js";
import { z } from "zod";
import { publicEnv } from "@/lib/env";
import { getPublicEvent, isPublic } from "@/lib/events";
import type { ActionState } from "@/lib/types";

const RsvpSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{10,80}$/),
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s().-]*$/, "Numéro invalide.")
    .optional()
    .or(z.literal("")),
  response: z.enum(["yes", "no", "maybe"], { message: "Choisissez une réponse." }),
  guests_count: z.coerce.number().int().min(1).max(20).default(1),
  message: z.string().trim().max(500).optional().or(z.literal("")),
  website: z.string().optional(), // piège à robots : une personne ne le remplit jamais
});

export async function submitRsvp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = RsvpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Vérifiez votre réponse.", fieldErrors };
  }
  const r = parsed.data;
  if (r.website) return { ok: true, message: "Merci !" };

  const event = await getPublicEvent(r.slug);
  if (!event || !isPublic(event)) return { ok: false, message: "Cette invitation n'est plus disponible." };
  if (event.rsvp_deadline && new Date(`${event.rsvp_deadline}T23:59:59Z`) < new Date()) {
    return { ok: false, message: "La date limite de réponse est passée. Contactez directement l'organisateur." };
  }

  const supabase = createAnonClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // Toute la logique (date limite, limite d'invités avec verrou, rythme) est dans la fonction SQL.
  const { error } = await supabase.rpc("submit_rsvp", {
    p_slug: r.slug,
    p_name: r.name,
    p_phone: r.phone ?? "",
    p_response: r.response,
    p_guests: r.response === "no" ? 1 : r.guests_count,
    p_message: r.message ?? "",
  });

  if (error) {
    if (error.message.includes("guest_limit_reached")) {
      return { ok: false, message: "La liste des invités est complète. Contactez directement l'organisateur." };
    }
    if (error.message.includes("rsvp_closed")) {
      return { ok: false, message: "La date limite de réponse est passée. Contactez directement l'organisateur." };
    }
    if (error.message.includes("event_unavailable")) {
      return { ok: false, message: "Cette invitation n'est plus disponible." };
    }
    if (error.message.includes("too_many_requests")) {
      return { ok: false, message: "Beaucoup de réponses arrivent en même temps. Réessayez dans une minute." };
    }
    console.error("[rsvp]", error.message);
    return { ok: false, message: "Votre réponse n'a pas pu être enregistrée. Vérifiez votre connexion et réessayez." };
  }

  const thanks =
    r.response === "yes"
      ? "Merci ! Votre présence est confirmée. À très bientôt."
      : r.response === "maybe"
        ? "Merci ! Votre réponse est notée. N'hésitez pas à confirmer dès que possible."
        : "Merci de nous avoir prévenus. Vous nous manquerez.";
  return { ok: true, message: thanks };
}
