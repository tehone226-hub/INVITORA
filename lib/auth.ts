import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types";

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: ProfileRow | null;
  isAdmin: boolean;
}

/**
 * Couche d'accès aux données : la seule façon de lire l'utilisateur connecté.
 * Toujours appelée côté serveur, derrière une zone <Suspense> (Cache Components).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at")
    .eq("id", data.user.id)
    .maybeSingle<ProfileRow>();

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    profile: profile ?? null,
    isAdmin: profile?.role === "admin",
  };
}

/** Exige une connexion ; sinon renvoie vers /connexion puis revient ici. */
export async function requireUser(next = "/tableau-de-bord"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?suivant=${encodeURIComponent(next)}`);
  return user;
}

/** Exige le rôle administrateur. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  if (!user.isAdmin) redirect("/tableau-de-bord?erreur=acces-admin");
  return user;
}

/** N'accepte qu'un chemin interne pour les redirections après connexion. */
export function safeNextPath(value: unknown, fallback = "/tableau-de-bord"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
