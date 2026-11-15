import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env-server";

/**
 * Client SasPay (https://docs.saspay.me/). Notes d'intégration : docs/saspay.md
 * RÈGLE 4 : les clés de test peuvent débiter de l'argent réel. Prévenir avant
 * tout test et utiliser 100 à 200 FCFA (variable SASPAY_TEST_AMOUNT_XOF).
 */
export const SASPAY_API = "https://api.saspay.me/api/v1";
export const WEBHOOK_TOLERANCE_SECONDS = 300;

export class SaspayError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "SaspayError";
  }
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown, timeoutMs = 20_000): Promise<T> {
  if (!serverEnv.saspaySecretKey) throw new SaspayError("SASPAY_SECRET_KEY manquante.", 500, "not_configured");
  const res = await fetch(`${SASPAY_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${serverEnv.saspaySecretKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const json = (await res.json().catch(() => null)) as
    | { success: true; data: T }
    | { success: false; error?: { message?: string; code?: string } }
    | null;
  if (!res.ok || !json || json.success !== true) {
    const err = json && json.success === false ? json.error : undefined;
    throw new SaspayError(err?.message ?? `Erreur SasPay (${res.status})`, res.status, err?.code);
  }
  return json.data;
}

/** Montant en chaîne décimale (« 4900.00 ») ; remplacé par le montant de test s'il est défini. */
export function saspayAmount(priceXof: number): string {
  const test = process.env.SASPAY_TEST_AMOUNT_XOF;
  const value = test && /^\d+$/.test(test) ? Number(test) : priceXof;
  return value.toFixed(2);
}

export interface CheckoutSession {
  id: string;
  checkout_url: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
  amount: string;
  currency: string;
}

export function createCheckoutSession(params: {
  amount: string;
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  returnUrl: string;
  metadata: Record<string, string>;
  /** Durée de vie de la session de paiement */
  expiresInHours?: number;
}): Promise<CheckoutSession> {
  return call<CheckoutSession>("POST", "/checkout-sessions/", {
    amount: params.amount,
    currency: "XOF",
    country: "BF",
    description: params.description,
    customer_email: params.customerEmail,
    customer_name: params.customerName,
    customer_phone: params.customerPhone ?? "",
    return_url: params.returnUrl,
    metadata: params.metadata,
    ...(params.expiresInHours ? { expires_at: new Date(Date.now() + params.expiresInHours * 3600_000).toISOString() } : {}),
  });
}

export interface SessionStatus {
  id: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
  transaction_id: string | null;
  transaction_status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | null;
}

/** Statut vérifié auprès de SasPay (qui interroge lui-même l'opérateur). */
export function getSessionStatus(sessionId: string, timeoutMs = 15_000): Promise<SessionStatus> {
  return call<SessionStatus>("GET", `/checkout-sessions/${encodeURIComponent(sessionId)}/status/`, undefined, timeoutMs);
}

/* ------------------------------------------------------------------ */
/* Webhooks                                                             */
/* ------------------------------------------------------------------ */

export type WebhookCheck = { ok: true } | { ok: false; reason: "missing_headers" | "stale_timestamp" | "bad_signature" };

/**
 * Vérifie la signature d'un webhook : hex(HMAC_SHA256(secret, `${timestamp}.${corpsBrut}`)),
 * comparaison en temps constant, horodatage à moins de 5 minutes.
 */
export function verifyWebhookSignature(params: {
  rawBody: string;
  signature: string | null;
  timestamp: string | null;
  secret: string;
  nowSeconds?: number;
}): WebhookCheck {
  const { rawBody, signature, timestamp, secret } = params;
  if (!signature || !timestamp || !secret || !/^\d+$/.test(timestamp)) return { ok: false, reason: "missing_headers" };

  const now = params.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > WEBHOOK_TOLERANCE_SECONDS) return { ok: false, reason: "stale_timestamp" };

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature.trim().toLowerCase(), "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "bad_signature" };
  return { ok: true };
}

export interface WebhookPayload {
  event: string;
  data: {
    id: string;
    reference?: string;
    status?: string;
    amount?: string;
    currency?: string;
    network?: string;
  };
}

export function parseWebhookPayload(rawBody: string): WebhookPayload | null {
  try {
    const json = JSON.parse(rawBody) as WebhookPayload;
    if (!json || typeof json.event !== "string" || !json.data || typeof json.data.id !== "string") return null;
    return json;
  } catch {
    return null;
  }
}
