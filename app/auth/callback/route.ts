import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth";
import { features } from "@/lib/env-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Retour du lien magique ou de Google : ouvre la session puis redirige. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("suivant"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }
  if (!ok) return NextResponse.redirect(new URL("/connexion?erreur=lien", url.origin));

  await promoteConfiguredAdmin(supabase);
  return NextResponse.redirect(new URL(next, url.origin));
}

/** Les e-mails listés dans ADMIN_EMAILS deviennent administrateurs à leur connexion. */
async function promoteConfiguredAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!admins.length || !features.serviceRole) return;
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!data.user || !email || !admins.includes(email)) return;
  await createAdminClient().from("profiles").update({ role: "admin" }).eq("id", data.user.id);
}
