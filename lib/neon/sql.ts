import "server-only";
import { neon, types } from "@neondatabase/serverless";
import { serverEnv } from "@/lib/env-server";

type Sql = ReturnType<typeof neon>;
let client: Sql | null = null;

/** « 2026-12-12 16:00:00+00 » → « 2026-12-12T16:00:00.000Z » (le reste du code manipule des textes ISO). */
function toIso(value: string): string {
  const d = new Date(/[+-]\d\d$/.test(value) ? `${value.replace(" ", "T")}:00` : value.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? value : d.toISOString();
}

const DATE_OID = 1082; // date : gardée en texte « AAAA-MM-JJ »
const TIMESTAMP_OIDS = new Set([1114, 1184]); // timestamp, timestamptz

/**
 * Connexion SQL directe à Neon avec le rôle propriétaire : elle contourne la RLS.
 * Réservée aux opérations de confiance côté serveur (webhook de paiement, activation de
 * formule, compteurs IA, administration, profil) et à la page invité (fonctions SQL ciblées).
 * Ne jamais l'utiliser avec des données non vérifiées ; toujours passer les valeurs en
 * paramètres (modèle étiqueté sql`...${valeur}`), jamais concaténées.
 *
 * Usage : const lignes = await rows<Type>(db()`select * from public.events where id = ${id}`);
 */
export function db(): Sql {
  if (!client) {
    if (!serverEnv.databaseUrl) throw new Error("DATABASE_URL manquante.");
    client = neon(serverEnv.databaseUrl, {
      types: {
        getTypeParser: (oid: number, format?: "text" | "binary") => {
          if (oid === DATE_OID) return (v: string) => v;
          if (TIMESTAMP_OIDS.has(oid)) return toIso;
          return types.getTypeParser(oid, format);
        },
      },
    });
  }
  return client;
}

/** Lignes typées d'une requête (le pilote renvoie des lignes d'objets). */
export async function rows<T>(query: unknown): Promise<T[]> {
  return (await query) as T[];
}
