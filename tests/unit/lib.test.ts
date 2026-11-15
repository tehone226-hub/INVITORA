import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { formatDate, formatTime, formatFcfa, toIsoFromLocal, toLocalInputs } = await import("@/lib/format");
const { makeSlug } = await import("@/lib/slug");
const { computeExpiry } = await import("@/lib/billing");
const { templateText } = await import("@/lib/ai/invitation-text");
const { buildIcs } = await import("@/lib/ics");
const { whatsappShareUrl } = await import("@/lib/share");
const { PLANS, formatPrice } = await import("@/config/plans");

describe("formats français", () => {
  it("date longue au fuseau de Ouagadougou", () => {
    expect(formatDate("2026-12-12T16:00:00Z")).toBe("samedi 12 décembre 2026");
  });
  it("heure « 16 h 00 »", () => {
    expect(formatTime("2026-12-12T16:00:00Z")).toBe("16 h 00");
  });
  it("montants FCFA avec espaces insécables", () => {
    expect(formatFcfa(4900)).toBe("4 900 FCFA");
    expect(formatFcfa("14900.00")).toBe("14 900 FCFA");
    expect(formatPrice(PLANS.celebration.price)).toBe("4 900 FCFA");
  });
  it("saisie de formulaire ↔ ISO (UTC+0 à Ouagadougou)", () => {
    const iso = toIsoFromLocal("2026-12-12", "16:30");
    expect(iso).toBe("2026-12-12T16:30:00.000Z");
    expect(toLocalInputs(iso)).toEqual({ date: "2026-12-12", time: "16:30" });
    expect(toIsoFromLocal("12/12/2026", "16:30")).toBeNull();
  });
});

describe("slugs d'invitation (règle 6)", () => {
  it("non devinables et uniques", () => {
    const a = makeSlug("Mariage d'Awa & Moussa");
    const b = makeSlug("Mariage d'Awa & Moussa");
    expect(a).toMatch(/^mariage-d-awa-moussa-[a-z2-9]{12}$/);
    expect(a).not.toBe(b);
  });
  it("fonctionne sans titre exploitable", () => {
    expect(makeSlug("!!!")).toMatch(/^[a-z2-9]{12}$/);
  });
});

describe("durée des formules", () => {
  const now = new Date("2026-11-15T10:00:00Z");
  it("3 mois à partir d'aujourd'hui", () => {
    expect(computeExpiry(null, now)).toBe("2027-02-15T10:00:00.000Z");
  });
  it("prolonge une formule encore active", () => {
    expect(computeExpiry("2027-01-01T00:00:00.000Z", now)).toBe("2027-04-01T00:00:00.000Z");
  });
  it("repart d'aujourd'hui si la formule a expiré", () => {
    expect(computeExpiry("2026-01-01T00:00:00.000Z", now)).toBe("2027-02-15T10:00:00.000Z");
  });
});

describe("textes de secours (sans IA)", () => {
  it("rédige un mariage complet en français", () => {
    const t = templateText({
      eventType: "mariage",
      hosts: "Awa & Moussa",
      startsAt: "2026-12-12T16:00:00Z",
      venue: "Jardin des Manguiers",
      city: "Ouagadougou",
      language: "fr",
      tone: "chaleureux",
      details: "",
    });
    expect(t.title).toBe("Mariage de Awa & Moussa");
    expect(t.message).toContain("samedi 12 décembre 2026");
    expect(t.message).toContain("Jardin des Manguiers, Ouagadougou");
    expect(t.program[0]).toEqual({ time: "16 h 00", label: "Accueil des invités" });
    expect(t.source).toBe("template");
  });
});

describe("partage et agenda", () => {
  it("lien WhatsApp encodé", () => {
    expect(whatsappShareUrl("Bonjour & bienvenue")).toBe("https://wa.me/?text=Bonjour%20%26%20bienvenue");
    expect(whatsappShareUrl("Salut", "+226 70 00 00 00")).toBe("https://wa.me/22670000000?text=Salut");
  });
  it("fichier .ics valide", () => {
    const ics = buildIcs({
      slug: "abc",
      title: "Mariage, Awa; Moussa",
      starts_at: "2026-12-12T16:00:00Z",
      venue: "Jardin",
      city: "Ouagadougou",
      address: null,
      url: "https://invitora.app/i/abc",
    });
    expect(ics).toContain("DTSTART:20261212T160000Z");
    expect(ics).toContain("SUMMARY:Mariage\\, Awa\\; Moussa");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
  });
});
