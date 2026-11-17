"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { safeNextPath } from "@/lib/auth";
import { isBackendConfigured, publicEnv } from "@/lib/env";
import { getAuth } from "@/lib/neon/auth";

export type LoginState =
  | { step: "email"; message?: string; fieldErrors?: Record<string, string> }
  | { step: "code"; email: string; message?: string; fieldErrors?: Record<string, string> }
  | null;

const emailSchema = z.string().trim().toLowerCase().email().max(200);

/** Étape 1 : envoie un code à 6 chiffres par e-mail. */
export async function sendLoginCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isBackendConfigured) return { step: "email", message: "La connexion n'est pas encore configurée." };

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { step: "email", fieldErrors: { email: "Saisissez une adresse e-mail valide, par exemple awa@gmail.com." } };
  }

  const { error } = await getAuth().emailOtp.sendVerificationOtp({ email: parsed.data, type: "sign-in" });
  if (error) {
    console.error("[connexion] envoi du code", error.code ?? error.status, error.message);
    return {
      step: "email",
      message:
        error.status === 429 || error.code === "TOO_MANY_ATTEMPTS"
          ? "Trop de demandes en peu de temps. Patientez une minute puis réessayez."
          : "Le code n'a pas pu être envoyé. Vérifiez votre adresse et réessayez.",
    };
  }
  return { step: "code", email: parsed.data, message: `Un code à 6 chiffres a été envoyé à ${parsed.data}. Pensez à regarder les courriers indésirables.` };
}

/** Étape 2 : vérifie le code, ouvre la session puis redirige. */
export async function verifyLoginCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = emailSchema.safeParse(formData.get("email"));
  const code = z.string().trim().regex(/^\d{6}$/).safeParse(formData.get("code"));
  const next = safeNextPath(formData.get("suivant"));
  if (!email.success) return { step: "email", message: "Recommencez avec votre adresse e-mail." };
  if (!code.success) {
    return { step: "code", email: email.data, fieldErrors: { code: "Saisissez les 6 chiffres reçus par e-mail." } };
  }

  const { error } = await getAuth().signIn.emailOtp({ email: email.data, otp: code.data });
  if (error) {
    console.error("[connexion] vérification du code", error.code ?? error.status, error.message);
    return {
      step: "code",
      email: email.data,
      message:
        error.code === "TOO_MANY_ATTEMPTS"
          ? "Trop d'essais. Demandez un nouveau code."
          : "Ce code est incorrect ou a expiré. Vérifiez-le ou demandez-en un nouveau.",
    };
  }
  redirect(next);
}

/** Connexion avec Google (identifiants partagés de Neon Auth). */
export async function signInWithGoogle(formData: FormData) {
  if (!isBackendConfigured) redirect("/connexion?erreur=configuration");
  const next = safeNextPath(formData.get("suivant"));
  const { data, error } = await getAuth().signIn.social({
    provider: "google",
    callbackURL: `${publicEnv.siteUrl}${next}`,
    errorCallbackURL: `${publicEnv.siteUrl}/connexion?erreur=google`,
  });
  if (error || !data?.url) redirect("/connexion?erreur=google");
  redirect(data.url);
}
