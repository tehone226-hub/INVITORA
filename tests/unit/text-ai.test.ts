import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
process.env.GEMINI_API_KEY = "cle-factice";

const calls: string[] = [];
let behaviour: (model: string) => Promise<{ text: string }> = async () => ({ text: "{}" });
vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = {
      generateContent: async (args: { model: string; config: Record<string, unknown> }) => {
        calls.push(args.model);
        expect(args.config.responseMimeType).toBe("application/json");
        return behaviour(args.model);
      },
    };
  },
}));

const { generateInvitationText, TEXT_MODELS } = await import("@/lib/ai/invitation-text");

const input = {
  eventType: "mariage" as const,
  hosts: "Awa & Moussa",
  startsAt: "2027-03-20T16:00:00.000Z",
  venue: "Jardin des Manguiers",
  city: "Ouagadougou",
  language: "fr" as const,
  tone: "chaleureux" as const,
  details: "",
};
const good = JSON.stringify({
  title: "Mariage d'Awa et Moussa",
  message: "Nous vous convions à notre mariage.",
  program: [{ time: "16 h 00", label: "Accueil" }],
});

beforeEach(() => {
  calls.length = 0;
});

describe("textes d'invitation par Gemini", () => {
  it("utilise le premier modèle quand il répond", async () => {
    behaviour = async () => ({ text: good });
    const t = await generateInvitationText(input);
    expect(t.source).toBe("ai");
    expect(t.model).toBe(TEXT_MODELS[0]);
    expect(t.title).toBe("Mariage d'Awa et Moussa");
    expect(calls).toEqual([TEXT_MODELS[0]]);
  });

  it("passe au modèle suivant si le premier est surchargé (503)", async () => {
    behaviour = async (model) => {
      if (model === TEXT_MODELS[0]) throw new Error('{"error":{"code":503,"status":"UNAVAILABLE"}}');
      return { text: good };
    };
    const t = await generateInvitationText(input);
    expect(t.source).toBe("ai");
    expect(t.model).toBe(TEXT_MODELS[1]);
  });

  it("revient aux textes types si tous les modèles échouent ou répondent hors format", async () => {
    behaviour = async () => ({ text: "pas du json" });
    const t = await generateInvitationText(input);
    expect(t.source).toBe("template");
    expect(t.title).toBe("Mariage de Awa & Moussa");
    expect(calls).toHaveLength(TEXT_MODELS.length);
  });

  it("refuse une réponse dont le format est faux (programme absent)", async () => {
    behaviour = async () => ({ text: JSON.stringify({ title: "x", message: "y" }) });
    expect((await generateInvitationText(input)).source).toBe("template");
  });

  it("n'appelle pas l'IA quand la limite quotidienne est atteinte (allowAi: false)", async () => {
    behaviour = async () => ({ text: good });
    const t = await generateInvitationText(input, { allowAi: false });
    expect(t.source).toBe("template");
    expect(calls).toHaveLength(0);
  });
});
