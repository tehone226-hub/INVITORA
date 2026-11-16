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
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  blobToken: process.env.BLOB_READ_WRITE_TOKEN ?? "",
  saspaySecretKey: process.env.SASPAY_SECRET_KEY ?? "",
  saspayWebhookSecret: process.env.SASPAY_WEBHOOK_SECRET ?? "",
};

export const features = {
  /** Textes rédigés par Claude (sinon : modèles de textes intégrés) */
  aiText: Boolean(serverEnv.anthropicApiKey),
  /** Fonds générés par Gemini et enregistrés sur Vercel Blob (sinon : fonds de secours du thème) */
  aiImage: Boolean(serverEnv.geminiApiKey && serverEnv.blobToken),
  /** Paiement SasPay */
  payments: Boolean(serverEnv.saspaySecretKey && serverEnv.saspayWebhookSecret),
  /** Connexion SQL directe côté serveur (webhook, activation de formule, compteurs, administration) */
  database: Boolean(serverEnv.databaseUrl),
};
