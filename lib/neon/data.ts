import "server-only";
import { PostgrestClient } from "@supabase/postgrest-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { serverEnv } from "@/lib/env-server";
import { getAuth } from "@/lib/neon/auth";

/**
 * Client de l'API de données Neon, AU NOM de l'utilisateur connecté : le jeton JWT de
 * Neon Auth est transmis à chaque requête et la base applique la sécurité par ligne (RLS)
 * avec auth.uid(). Un organisateur ne lit et ne modifie que ses propres données.
 *
 * Mis en cache pour la durée d'une requête (un seul jeton demandé par page).
 */
export const createClient = cache(async () => {
  await cookies(); // dépend de la requête (voir lib/auth.ts)
  const { data } = await getAuth().token();
  const token = data?.token;
  // Session révoquée ou compte supprimé : retour à la connexion plutôt qu'une page d'erreur.
  if (!token) redirect("/connexion?erreur=session");
  return new PostgrestClient(serverEnv.dataApiUrl, {
    headers: { Authorization: `Bearer ${token}` },
    fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
  });
});
