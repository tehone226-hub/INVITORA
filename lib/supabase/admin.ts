import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env-server";

/**
 * Client « service role » : contourne la RLS. Réservé au serveur pour
 * les opérations de confiance (webhook de paiement, activation de formule,
 * compteur d'images IA). Ne jamais l'utiliser avec des données non vérifiées.
 */
export function createAdminClient() {
  if (!publicEnv.supabaseUrl || !serverEnv.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante.");
  }
  return createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
