import { NextResponse } from "next/server";
import { handleWebhook } from "@/lib/billing";
import { features, serverEnv } from "@/lib/env-server";
import { parseWebhookPayload, verifyWebhookSignature } from "@/lib/saspay";

/**
 * Webhook SasPay (règle 3 de CLAUDE.md).
 * À déclarer dans le tableau de bord SasPay : https://VOTRE-DOMAINE/api/saspay/webhook
 * Événement à cocher : transaction.success (les autres sont enregistrés puis ignorés).
 */
export async function POST(request: Request) {
  if (!features.payments || !features.database) {
    return NextResponse.json({ error: "paiement_non_configure" }, { status: 503 });
  }

  // Corps BRUT : la signature est calculée sur les octets reçus, pas sur un objet re-sérialisé.
  const rawBody = await request.text();
  const check = verifyWebhookSignature({
    rawBody,
    signature: request.headers.get("x-webhook-signature"),
    timestamp: request.headers.get("x-webhook-timestamp"),
    secret: serverEnv.saspayWebhookSecret,
  });
  if (!check.ok) {
    console.warn(`[saspay] webhook refusé : ${check.reason}`);
    return NextResponse.json({ error: check.reason }, { status: 403 });
  }

  const payload = parseWebhookPayload(rawBody);
  if (!payload) return NextResponse.json({ error: "corps_invalide" }, { status: 400 });

  try {
    const outcome = await handleWebhook(payload);
    console.info(`[saspay] ${payload.event} ${payload.data.id} -> ${outcome}`);
    // « unmatched » : réponse 500 pour que SasPay réessaie plus tard (jusqu'à 5 fois).
    if (outcome === "unmatched") return NextResponse.json({ received: true, outcome }, { status: 500 });
    return NextResponse.json({ received: true, outcome });
  } catch (error) {
    console.error("[saspay] erreur de traitement", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "erreur_interne" }, { status: 500 });
  }
}
