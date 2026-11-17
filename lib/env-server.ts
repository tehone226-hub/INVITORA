import "server-only";

/**
 * Clés secrètes : JAMAIS dans le code ni dans Git (règle 1 de CLAUDE.md).
 * Elles viennent de .env.local en local et des variables Vercel en production.
 */
export const serverEnv = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  dataApiUrl: (process.env.NEON_DATA_API_URL ?? "").replace(/\/$/, ""),
  neonAuthBaseUrl: process.env.NEON_AUTH_BASE_URL ?? "",
  neonAuthCookieSecret: process.env.NEON_AUTH_COOKIE_SECRET ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  saspaySecretKey: process.env.SASPAY_SECRET_KEY ?? "",
  saspayWebhookSecret: process.env.SASPAY_WEBHOOK_SECRET ?? "",
};

export const features = {
  /** Textes rédigés par Gemini (sinon : modèles de textes intégrés) */
  aiText: Boolean(serverEnv.geminiApiKey),
  /** Paiement SasPay */
  payments: Boolean(serverEnv.saspaySecretKey && serverEnv.saspayWebhookSecret),
  /** Connexion SQL directe côté serveur (webhook, activation de formule, compteurs, administration) */
  database: Boolean(serverEnv.databaseUrl),
};
