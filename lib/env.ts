/**
 * Variables publiques (lisibles par le navigateur).
 * Les clés secrètes sont dans lib/env-server.ts (serveur uniquement).
 */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
};

/** Vrai si Supabase est branché (URL + clé publique présentes). */
export const isSupabaseConfigured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
