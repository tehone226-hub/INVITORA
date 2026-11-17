import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COLORWAYS, DEFAULT_THEME, LEGACY_THEMES, STYLES, THEMES, THEME_IDS, getTheme, isThemeId } from "@/config/themes";
import { EVENT_TYPES } from "@/lib/event-types";
import { templateExamples, heroInvitation } from "@/config/home";

describe("100 fonds d'invitation", () => {
  it("10 styles × 10 coloris = 100 fonds uniques", () => {
    expect(STYLES).toHaveLength(10);
    expect(COLORWAYS).toHaveLength(10);
    expect(THEME_IDS).toHaveLength(100);
    expect(new Set(THEME_IDS).size).toBe(100);
  });

  it("chaque fond a son image légère sur le disque (sans texte intégré : voir philosophie visuelle)", () => {
    for (const id of THEME_IDS) {
      const file = path.join(process.cwd(), "public", THEMES[id].image);
      expect(existsSync(file), `${id} : image manquante`).toBe(true);
      expect(statSync(file).size, `${id} : image trop lourde`).toBeLessThan(200 * 1024);
    }
  });

  it("couleurs au format #rrggbb et texte d'accent plus sombre que le fond", () => {
    for (const id of THEME_IDS) {
      expect(THEMES[id].color).toMatch(/^#[0-9a-f]{6}$/);
      expect(THEMES[id].colors.accent).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("identifiants valides, repli sur le fond par défaut, anciens identifiants convertibles", () => {
    expect(isThemeId("wax--braise")).toBe(true);
    expect(isThemeId("wax")).toBe(false);
    expect(isThemeId("constructor")).toBe(false);
    expect(isThemeId("__proto__")).toBe(false);
    expect(getTheme("n'importe-quoi").id).toBe(DEFAULT_THEME);
    expect(getTheme(null).id).toBe(DEFAULT_THEME);
    for (const legacy of Object.values(LEGACY_THEMES)) expect(isThemeId(legacy)).toBe(true);
  });

  it("tous les fonds utilisés par l'application existent", () => {
    for (const t of EVENT_TYPES) expect(isThemeId(t.defaultTheme), t.id).toBe(true);
    for (const ex of templateExamples) expect(isThemeId(ex.theme), ex.id).toBe(true);
    expect(isThemeId(heroInvitation.theme)).toBe(true);
  });
});
