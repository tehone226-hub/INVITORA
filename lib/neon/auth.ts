import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";
import { serverEnv } from "@/lib/env-server";

type AuthError = { message?: string; status?: number; code?: string } | null;

/**
 * Méthodes présentes à l'exécution dans le SDK serveur mais absentes de ses types :
 * jeton JWT (pour l'API de données) et connexion par code envoyé par e-mail.
 */
interface NeonAuthExtras {
  token(): Promise<{ data: { token?: string } | null; error: AuthError }>;
  emailOtp: {
    sendVerificationOtp(args: { email: string; type: "sign-in" }): Promise<{ data: unknown; error: AuthError }>;
  };
  signIn: {
    emailOtp(args: { email: string; otp: string }): Promise<{ data: unknown; error: AuthError }>;
  };
}

export type NeonAuth = Omit<ReturnType<typeof createNeonAuth>, "signIn" | "token" | "emailOtp"> &
  NeonAuthExtras & { signIn: ReturnType<typeof createNeonAuth>["signIn"] & NeonAuthExtras["signIn"] };

let instance: NeonAuth | null = null;

/** Instance Neon Auth (Better Auth géré), créée à la demande : le build n'exige pas les variables. */
export function getAuth(): NeonAuth {
  if (!instance) {
    instance = createNeonAuth({
      baseUrl: serverEnv.neonAuthBaseUrl,
      cookies: {
        secret: serverEnv.neonAuthCookieSecret,
        // « lax » : nécessaire pour revenir de Google (navigation depuis un autre site)
        sameSite: "lax",
      },
    }) as unknown as NeonAuth;
  }
  return instance;
}
