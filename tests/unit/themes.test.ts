import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, LEGACY_THEMES, THEMES, THEME_IDS, getTheme, isThemeId } from "@/config/themes";
import { EVENT_TYPES } from "@/lib/event-types";
import { templateExamples, heroInvitation } from "@/config/home";

describe("fonds d'invitation", () => {
  it("11 fonds uniques, au format « collection--nom » accepté par la base", () => {
    expect(THEME_IDS).toHaveLength(11);
    expect(new Set(THEME_IDS).size).toBe(11);
    for (const id of THEME_IDS) expect(id).toMatch(/^[a-z]+(-[a-z]+)*--[a-z]+$/);
  });

  it("chaque fond et chaque enveloppe a son image légère sur le disque (sans texte intégré)", () => {
    for (const id of THEME_IDS) {
      for (const image of [THEMES[id].image, THEMES[id].cover.image]) {
        const file = path.join(process.cwd(), "public", image);
        expect(existsSync(file), `${id} : ${image} manquante`).toBe(true);
        expect(statSync(file).size, `${id} : ${image} trop lourde`).toBeLessThan(200 * 1024);
      }
    }
  });

  it("zone de texte valide et assez grande", () => {
    for (const id of THEME_IDS) {
      const [top, right, bottom, left] = THEMES[id].zone;
      expect(100 - left - right, id).toBeGreaterThanOrEqual(45);
      expect(100 - top - bottom, id).toBeGreaterThanOrEqual(18);
      for (const v of THEMES[id].zone) expect(v, id).toBeGreaterThanOrEqual(0);
    }
  });

  it("texte et accent lisibles sur la zone de texte de chaque fond (contraste ≥ 7 et ≥ 4,5)", () => {
    const lum = (hex: string) => {
      const c = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const contrast = (a: string, b: string) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
    for (const id of THEME_IDS) {
      const th = THEMES[id];
      expect(th.color).toMatch(/^#[0-9a-f]{6}$/);
      expect(th.colors.accent).toMatch(/^#[0-9a-f]{6}$/);
      expect(contrast(th.colors.text, th.color), `${id} : texte`).toBeGreaterThanOrEqual(7);
      expect(contrast(th.colors.accent, th.color), `${id} : accent`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("identifiants valides, repli sur le fond par défaut, anciens identifiants convertibles", () => {
    expect(isThemeId("vannerie--zebu")).toBe(true);
    expect(isThemeId("wax--braise")).toBe(false);
    // Une invitation créée avec un fond d'une ancienne collection reçoit un fond de la collection actuelle
    expect(getTheme("wax--braise").id).toBe("vannerie--indigo");
    expect(getTheme("feuillage--ivoire").id).toBe("jardin--ivoire");
    expect(isThemeId("constructor")).toBe(false);
    expect(isThemeId("__proto__")).toBe(false);
    expect(getTheme("n'importe-quoi").id).toBe(DEFAULT_THEME);
    expect(getTheme(null).id).toBe(DEFAULT_THEME);
    for (const legacy of Object.values(LEGACY_THEMES)) expect(isThemeId(legacy)).toBe(true);
  });

  it("tous les fonds utilisés par l'application existent", () => {
    for (const ev of EVENT_TYPES) expect(isThemeId(ev.defaultTheme), ev.id).toBe(true);
    for (const ex of templateExamples) expect(isThemeId(ex.theme), ex.id).toBe(true);
    expect(isThemeId(heroInvitation.theme)).toBe(true);
  });
});
