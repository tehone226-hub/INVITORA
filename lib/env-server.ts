import "server-only";

/**
 * Clés secrètes : JAMAIS dans le code ni dans Git (règle 1 de CLAUDE.md).
 * Elles viennent de .env.local en local et des variables Vercel en production.
 */
export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  saspaySecretKey: process.env.SASPAY_SECRET_KEY ?? "",
  saspayWebhookSecret: process.env.SASPAY_WEBHOOK_SECRET ?? "",
};

export const features = {
  /** Textes rédigés par Claude (sinon : modèles de textes intégrés) */
  aiText: Boolean(serverEnv.anthropicApiKey),
  /** Fonds générés par Gemini (sinon : fonds de secours du thème) */
  aiImage: Boolean(serverEnv.geminiApiKey),
  /** Paiement SasPay */
  payments: Boolean(serverEnv.saspaySecretKey && serverEnv.saspayWebhookSecret),
  /** Opérations serveur privilégiées (webhook, activation de formule, admin) */
  serviceRole: Boolean(serverEnv.supabaseServiceRoleKey),
};
