import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { verifyWebhookSignature, parseWebhookPayload, saspayAmount, saspayErrorMessage } = await import("@/lib/saspay");

const SECRET = "whsec_test_123";
const sign = (ts: string, body: string, secret = SECRET) =>
  createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");

describe("signature des webhooks SasPay", () => {
  const body = JSON.stringify({ event: "transaction.success", data: { id: "tx_1", amount: "4900.00" } });
  const now = 1_800_000_000;
  const ts = String(now);

  it("accepte une signature valide", () => {
    expect(verifyWebhookSignature({ rawBody: body, signature: sign(ts, body), timestamp: ts, secret: SECRET, nowSeconds: now })).toEqual({
      ok: true,
    });
  });

  it("refuse un corps modifié", () => {
    const res = verifyWebhookSignature({
      rawBody: body.replace("4900", "100"),
      signature: sign(ts, body),
      timestamp: ts,
      secret: SECRET,
      nowSeconds: now,
    });
    expect(res).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("refuse un mauvais secret", () => {
    const res = verifyWebhookSignature({ rawBody: body, signature: sign(ts, body, "autre"), timestamp: ts, secret: SECRET, nowSeconds: now });
    expect(res).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("refuse un horodatage de plus de 5 minutes (rejeu)", () => {
    const old = String(now - 301);
    const res = verifyWebhookSignature({ rawBody: body, signature: sign(old, body), timestamp: old, secret: SECRET, nowSeconds: now });
    expect(res).toEqual({ ok: false, reason: "stale_timestamp" });
  });

  it("accepte 5 minutes pile", () => {
    const edge = String(now - 300);
    const res = verifyWebhookSignature({ rawBody: body, signature: sign(edge, body), timestamp: edge, secret: SECRET, nowSeconds: now });
    expect(res.ok).toBe(true);
  });

  it("refuse les en-têtes manquants ou mal formés", () => {
    expect(verifyWebhookSignature({ rawBody: body, signature: null, timestamp: ts, secret: SECRET, nowSeconds: now }).ok).toBe(false);
    expect(verifyWebhookSignature({ rawBody: body, signature: sign(ts, body), timestamp: null, secret: SECRET, nowSeconds: now }).ok).toBe(false);
    expect(verifyWebhookSignature({ rawBody: body, signature: sign(ts, body), timestamp: "abc", secret: SECRET, nowSeconds: now }).ok).toBe(false);
    expect(verifyWebhookSignature({ rawBody: body, signature: sign(ts, body), timestamp: ts, secret: "", nowSeconds: now }).ok).toBe(false);
  });

  it("refuse une signature de longueur différente sans planter", () => {
    expect(verifyWebhookSignature({ rawBody: body, signature: "abc", timestamp: ts, secret: SECRET, nowSeconds: now }).ok).toBe(false);
  });
});

describe("lecture du corps du webhook", () => {
  it("lit un corps valide", () => {
    expect(parseWebhookPayload('{"event":"transaction.success","data":{"id":"tx_9"}}')?.data.id).toBe("tx_9");
  });
  it("rejette un JSON invalide ou incomplet", () => {
    expect(parseWebhookPayload("pas du json")).toBeNull();
    expect(parseWebhookPayload('{"event":"x"}')).toBeNull();
    expect(parseWebhookPayload('{"event":"x","data":{"id":5}}')).toBeNull();
  });
});

describe("montants SasPay", () => {
  it("formate en chaîne décimale", () => {
    delete process.env.SASPAY_TEST_AMOUNT_XOF;
    expect(saspayAmount(4900)).toBe("4900.00");
    expect(saspayAmount(14900)).toBe("14900.00");
  });
  it("utilise le montant de test s'il est défini (règle 4)", () => {
    process.env.SASPAY_TEST_AMOUNT_XOF = "500";
    expect(saspayAmount(4900)).toBe("500.00");
    // SasPay refuse moins de 200 FCFA : un montant de test trop bas est relevé au minimum.
    process.env.SASPAY_TEST_AMOUNT_XOF = "100";
    expect(saspayAmount(4900)).toBe("200.00");
    expect(saspayErrorMessage({ amount: ["Le montant minimum est de 200 XOF."] })).toBe("amount : Le montant minimum est de 200 XOF.");
    expect(saspayErrorMessage({ message: "Clé invalide", code: "unauthorized" })).toBe("Clé invalide");
    delete process.env.SASPAY_TEST_AMOUNT_XOF;
  });
});
