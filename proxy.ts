import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rafraîchit la session Supabase à chaque requête des espaces connectés.
 * (Next.js 16 : « proxy » remplace « middleware ».)
 * La vérification des droits se fait ensuite dans chaque page (lib/auth.ts).
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // Ne rien placer entre la création du client et cet appel.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/tableau-de-bord/:path*", "/admin/:path*", "/creer/:path*", "/paiement/:path*", "/auth/:path*", "/connexion"],
};
