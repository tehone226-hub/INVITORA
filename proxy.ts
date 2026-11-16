import { NextResponse, type NextRequest } from "next/server";
import { getAuth } from "@/lib/neon/auth";

/**
 * Rafraîchit la session Neon Auth et termine le retour de Google
 * (paramètre neon_auth_session_verifier). Next.js 16 : « proxy » remplace « middleware ».
 *
 * On n'applique PAS la redirection automatique de Neon : chaque page protégée appelle
 * requireUser(), qui redirige vers /connexion en mémorisant la page demandée (?suivant=).
 */
export async function proxy(request: NextRequest) {
  const configured =
    process.env.NEON_AUTH_BASE_URL && (process.env.NEON_AUTH_COOKIE_SECRET ?? "").length >= 32 && process.env.DATABASE_URL;
  if (!configured) return NextResponse.next();

  const hasSession = request.cookies.getAll().some((c) => c.name.includes("neon-auth"));
  const isOAuthReturn = request.nextUrl.searchParams.has("neon_auth_session_verifier");
  if (!hasSession && !isOAuthReturn) return NextResponse.next();

  const middleware = getAuth().middleware({
    loginUrl: "/connexion",
    publicRoutes: ["/connexion", "/", "/creer", "/paiement", "/admin", "/tableau-de-bord"],
  });
  return middleware(request);
}

export const config = {
  matcher: ["/tableau-de-bord/:path*", "/admin/:path*", "/creer/:path*", "/paiement/:path*", "/connexion", "/"],
};
