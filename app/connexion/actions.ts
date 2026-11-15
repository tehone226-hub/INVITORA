"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { safeNextPath } from "@/lib/auth";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

const callbackUrl = (next: string) => `${publicEnv.siteUrl}/auth/callback?suivant=${encodeURIComponent(next)}`;

export async function sendMagicLink(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return { ok: false, message: "La connexion n'est pas encore configurée." };

  const parsed = z.string().trim().toLowerCase().email().max(200).safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, fieldErrors: { email: "Saisissez une adresse e-mail valide, par exemple awa@gmail.com." } };
  }
  const next = safeNextPath(formData.get("suivant"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: callbackUrl(next), shouldCreateUser: true },
  });
  if (error) {
    console.error("[connexion] lien magique", error.message);
    return {
      ok: false,
      message:
        error.status === 429
          ? "Trop de demandes en peu de temps. Patientez une minute puis réessayez."
          : "Le lien n'a pas pu être envoyé. Vérifiez votre adresse et réessayez.",
    };
  }
  return {
    ok: true,
    message: `Un lien de connexion a été envoyé à ${parsed.data}. Ouvrez votre boîte e-mail et cliquez sur le lien (pensez aux courriers indésirables).`,
  };
}

export async function signInWithGoogle(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/connexion?erreur=configuration");
  const next = safeNextPath(formData.get("suivant"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(next) },
  });
  if (error || !data.url) redirect("/connexion?erreur=google");
  redirect(data.url);
}
