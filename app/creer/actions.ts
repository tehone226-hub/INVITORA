"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ThemeId } from "@/config/themes";
import { generateInvitationText } from "@/lib/ai/invitation-text";
import { getCurrentUser } from "@/lib/auth";
import { features } from "@/lib/env-server";
import { isEventType, isLanguage } from "@/lib/event-types";
import { toIsoFromLocal } from "@/lib/format";
import { makeSlug } from "@/lib/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

/** Nombre maximal de textes IA par utilisateur et par jour (maîtrise des coûts). */
const DAILY_AI_TEXT_LIMIT = 15;

const THEMES: ThemeId[] = ["faso-dan-fani", "bogolan", "tiebele", "indigo"];

const CreateSchema = z.object({
  eventType: z.string().refine(isEventType, "Choisissez un type d'événement."),
  hosts: z.string().trim().min(2, "Indiquez qui organise ou qui est célébré.").max(160),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choisissez la date de l'événement."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Indiquez l'heure de début.").or(z.literal("")),
  venue: z.string().trim().max(160),
  city: z.string().trim().min(2, "Indiquez la ville.").max(80),
  language: z.string().refine(isLanguage),
  tone: z.enum(["chaleureux", "solennel", "festif", "sobre"]),
  theme: z.string().refine((v): v is ThemeId => THEMES.includes(v as ThemeId)),
  details: z.string().trim().max(600),
});

export async function createInvitation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Votre session a expiré. Reconnectez-vous pour continuer." };

  const parsed = CreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Vérifiez les champs en rouge.", fieldErrors };
  }
  const input = parsed.data;
  const startsAt = toIsoFromLocal(input.date, input.time);
  if (startsAt && new Date(startsAt).getTime() < Date.now() - 24 * 3600_000) {
    return { ok: false, fieldErrors: { date: "Cette date est déjà passée." } };
  }

  const supabase = await createClient();

  // Limite quotidienne de textes IA
  let useAi = features.aiText;
  if (useAi) {
    const since = new Date(Date.now() - 24 * 3600_000).toISOString();
    const { count } = await supabase
      .from("ai_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", "text")
      .gte("created_at", since);
    if ((count ?? 0) >= DAILY_AI_TEXT_LIMIT) useAi = false;
  }

  const text = await generateInvitationText(
    {
      eventType: input.eventType as never,
      hosts: input.hosts,
      startsAt,
      venue: input.venue,
      city: input.city,
      language: input.language as never,
      tone: input.tone,
      details: input.details,
    },
    { allowAi: useAi },
  );

  const { data, error } = await supabase
    .from("events")
    .insert({
      slug: makeSlug(text.title || input.hosts),
      event_type: input.eventType,
      title: text.title,
      hosts: input.hosts,
      starts_at: startsAt,
      venue: input.venue || null,
      city: input.city,
      message: text.message,
      program: text.program,
      language: input.language,
      theme: input.theme,
      status: "draft",
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    console.error("[creer] insertion", error?.message);
    return { ok: false, message: "L'invitation n'a pas pu être enregistrée. Réessayez dans un instant." };
  }

  if (text.source === "ai" && features.serviceRole) {
    await createAdminClient()
      .from("ai_usage")
      .insert({ user_id: user.id, event_id: data.id, kind: "text", model: text.model ?? "claude" });
  }

  redirect(`/tableau-de-bord/evenements/${data.id}?nouveau=1`);
}
