/**
 * Fonds d'invitation : 10 styles × 10 coloris = 100 fonds, dessinés par nous
 * (scripts/generate-theme-art.mjs, philosophie visuelle dans design/art/).
 * Aucun texte n'est dans les images : prénoms, dates et lieux sont posés en HTML,
 * directement sur le fond (le centre de chaque fond est laissé calme pour cela).
 * Les couleurs de chaque coloris sont dans config/theme-palettes.json, lu aussi par le générateur.
 */
import palettes from "./theme-palettes.json";

export const STYLES = [
  { id: "aura", name: "Aura", description: "Des halos de couleur très doux, comme une lumière." },
  { id: "arche", name: "Arche", description: "Arches et soleil en aplats, esprit bohème." },
  { id: "feuillage", name: "Feuillage", description: "Des branches à l'aquarelle dans les coins." },
  { id: "deco", name: "Art déco", description: "Des filets dorés en éventail, très chic." },
  { id: "marbre", name: "Marbre", description: "Un marbre clair traversé d'une veine dorée." },
  { id: "ondes", name: "Ondes", description: "Des lignes fines qui ondulent en haut et en bas." },
  { id: "confettis", name: "Confettis", description: "Une pluie de confettis, pour faire la fête." },
  { id: "etoiles", name: "Nuit étoilée", description: "Un ciel d'étoiles et un croissant de lune." },
  { id: "sahel", name: "Sahel", description: "Le soleil bas, les acacias et le baobab." },
  { id: "epure", name: "Épure", description: "Presque rien : un filet, un ornement, du calme." },
] as const;

export const COLORWAYS = [
  { id: "ivoire", name: "Ivoire" },
  { id: "rose", name: "Rose poudré" },
  { id: "sauge", name: "Sauge" },
  { id: "argile", name: "Argile" },
  { id: "azur", name: "Azur" },
  { id: "lavande", name: "Lavande" },
  { id: "nuit", name: "Nuit" },
  { id: "emeraude", name: "Émeraude" },
  { id: "bordeaux", name: "Bordeaux" },
  { id: "cendre", name: "Cendre" },
] as const;

export type StyleId = (typeof STYLES)[number]["id"];
export type ColorwayId = (typeof COLORWAYS)[number]["id"];
/** « feuillage--ivoire », « deco--nuit »… */
export type ThemeId = `${StyleId}--${ColorwayId}`;

export const DEFAULT_THEME: ThemeId = "feuillage--ivoire";

export interface InvitationTheme {
  id: ThemeId;
  styleId: StyleId;
  colorwayId: ColorwayId;
  /** « Art déco · Nuit » */
  name: string;
  description: string;
  /** Fond illustré sans texte (public/demo/themes) */
  image: string;
  /** Couleur de fond du coloris : affichée pendant le chargement de l'image et pour les pastilles */
  color: string;
  /** Couleur qui représente le coloris dans les pastilles de choix */
  swatch: string;
  /** Coloris sombre : le texte est clair */
  dark: boolean;
  colors: {
    /** Couleur du texte posé sur le fond */
    text: string;
    /** Couleur d'accent lisible sur le fond : catégorie, « & », filets */
    accent: string;
  };
}

interface Palette {
  name: string;
  dark: boolean;
  bg: string;
  t2: string;
  ink: string;
  accent: string;
}

const PALETTES = palettes as Record<ColorwayId, Palette>;

export const THEMES = Object.fromEntries(
  STYLES.flatMap((style) =>
    COLORWAYS.map((cw) => {
      const id = `${style.id}--${cw.id}` as ThemeId;
      const p = PALETTES[cw.id];
      const theme: InvitationTheme = {
        id,
        styleId: style.id,
        colorwayId: cw.id,
        name: `${style.name} · ${cw.name}`,
        description: style.description,
        image: `/demo/themes/${id}.webp`,
        color: p.bg.toLowerCase(),
        swatch: (p.dark ? p.bg : p.t2).toLowerCase(),
        dark: p.dark,
        colors: { text: p.ink.toLowerCase(), accent: p.accent.toLowerCase() },
      };
      return [id, theme] as const;
    }),
  ),
) as Record<ThemeId, InvitationTheme>;

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export const isThemeId = (value: unknown): value is ThemeId => typeof value === "string" && Object.hasOwn(THEMES, value);

/**
 * Anciens styles (étoffes, retirées le 17 novembre 2026) → fond de la nouvelle collection.
 * Sert aux invitations créées avant le changement (voir aussi la migration SQL du même jour).
 */
export const LEGACY_THEMES: Record<string, ThemeId> = {
  "faso-dan-fani": "feuillage--ivoire",
  bogolan: "ondes--ivoire",
  tiebele: "arche--argile",
  indigo: "etoiles--nuit",
  wax: "confettis--rose",
  senoufo: "arche--argile",
  adinkra: "epure--cendre",
  savane: "sahel--argile",
  coton: "aura--rose",
  ardoise: "deco--emeraude",
};

/** Thème d'une invitation ; ancien identifiant converti, repli sur le thème par défaut s'il est inconnu. */
export const getTheme = (id: string | null | undefined): InvitationTheme => {
  if (isThemeId(id)) return THEMES[id];
  const legacy = typeof id === "string" ? id.split("--")[0] : "";
  return THEMES[Object.hasOwn(LEGACY_THEMES, legacy) ? LEGACY_THEMES[legacy] : DEFAULT_THEME];
};
