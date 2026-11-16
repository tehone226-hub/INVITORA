/**
 * Variables publiques (lisibles par le navigateur).
 * Les clés secrètes sont dans lib/env-server.ts (serveur uniquement).
 */
export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
};

/**
 * Vrai si la base Neon et l'authentification sont branchées :
 * DATABASE_URL, NEON_DATA_API_URL, NEON_AUTH_BASE_URL et NEON_AUTH_COOKIE_SECRET.
 */
export const isBackendConfigured = Boolean(
  process.env.DATABASE_URL &&
    process.env.NEON_DATA_API_URL &&
    process.env.NEON_AUTH_BASE_URL &&
    (process.env.NEON_AUTH_COOKIE_SECRET ?? "").length >= 32,
);
