import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isBackendConfigured } from "@/lib/env";
import { getAuth } from "@/lib/neon/auth";
import { db, rows } from "@/lib/neon/sql";
import type { ProfileRow } from "@/lib/types";

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: ProfileRow | null;
  isAdmin: boolean;
}

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/**
 * Couche d'accès aux données : la seule façon de lire l'utilisateur connecté.
 * Toujours appelée côté serveur, derrière une zone <Suspense> (Cache Components).
 * Au premier passage, le profil est créé ; les e-mails de ADMIN_EMAILS deviennent administrateurs.
 * Mis en cache pour la durée d'une requête.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isBackendConfigured) return null;

  // Lire les cookies d'abord : pendant le pré-rendu, la page attend la requête (zone Suspense) au lieu
  // de laisser le SDK d'authentification échouer et journaliser une erreur.
  await connection(); // lecture de la session : uniquement au moment de la requête, jamais pendant la préparation
  await cookies();
  const { data } = await getAuth().getSession();
  const user = data?.user;
  if (!user?.id) return null;

  const email = user.email ?? null;
  const sql = db();
  const makeAdmin = Boolean(email && adminEmails().includes(email.toLowerCase()));

  // Profil créé à la première connexion (idempotent) ; promotion administrateur si l'e-mail est autorisé.
  const profiles = await rows<ProfileRow>(sql`
    insert into public.profiles (id, email, full_name, role)
    values (${user.id}, ${email}, ${user.name ?? null}, ${makeAdmin ? "admin" : "user"})
    on conflict (id) do update
      set email = excluded.email,
          role = case when ${makeAdmin}::boolean then 'admin' else public.profiles.role end
    returning id, email, full_name, phone, role, created_at
  `);
  const profile = profiles[0] ?? null;

  return { id: user.id, email, profile, isAdmin: profile?.role === "admin" };
});

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

/**
 * N'accepte qu'un chemin interne pour les redirections après connexion.
 * Refuse « // », les antislashs et les caractères de contrôle (« /\\evil.com » serait
 * interprété comme un autre site par les navigateurs), puis revérifie avec l'analyseur d'URL.
 */
export function safeNextPath(value: unknown, fallback = "/tableau-de-bord"): string {
  if (typeof value !== "string" || value.length > 300) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const u = new URL(value, "http://interne.invalid");
    if (u.origin !== "http://interne.invalid") return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
}
