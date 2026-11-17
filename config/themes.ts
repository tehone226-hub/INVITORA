/**
 * Fonds d'invitation : 10 styles × 10 coloris = 100 fonds, dessinés par nous
 * (scripts/generate-theme-art.mjs, philosophie « Trame Vivante » dans design/art/).
 * Aucun texte n'est dans les images : prénoms, dates et lieux sont posés en HTML par-dessus.
 * Il n'y a plus de génération d'images par IA : ces fonds sont fixes, légers (≈ 70 Ko) et gratuits.
 */
import themeColors from "./theme-colors.json";

export const STYLES = [
  { id: "faso-dan-fani", name: "Faso Dan Fani", description: "L'étoffe tissée : bandes verticales et lisières en damier." },
  { id: "bogolan", name: "Bogolan", description: "La terre et l'argile : symboles tracés à la main sur fond écru." },
  { id: "tiebele", name: "Tiébélé", description: "Les murs peints : triangles, losanges et zigzags." },
  { id: "indigo", name: "Indigo de Ouaga", description: "L'étoffe teinte à la réserve : cercles et étoiles d'or." },
  { id: "wax", name: "Wax", description: "Le pagne imprimé : éventails et cercles concentriques." },
  { id: "senoufo", name: "Sénoufo", description: "Le tissu peint de Korhogo : poissons, losanges et zigzags." },
  { id: "adinkra", name: "Adinkra", description: "Le tissu estampé : symboles géométriques sur fond sombre." },
  { id: "savane", name: "Savane", description: "Les épis de mil au soleil bas, tout en douceur." },
  { id: "coton", name: "Coton brodé", description: "La dentelle de fil vert et or, fleurs et festons." },
  { id: "ardoise", name: "Ardoise", description: "Filets d'or sur vert profond : sobre et élégant." },
] as const;

export const COLORWAYS = [
  { id: "origine", name: "Couleurs d'origine" },
  { id: "braise", name: "Braise" },
  { id: "ocre", name: "Ocre" },
  { id: "olive", name: "Olive" },
  { id: "foret", name: "Forêt" },
  { id: "lagune", name: "Lagune" },
  { id: "nuit", name: "Nuit" },
  { id: "prune", name: "Prune" },
  { id: "grenade", name: "Grenade" },
  { id: "cendre", name: "Cendre" },
] as const;

export type StyleId = (typeof STYLES)[number]["id"];
export type ColorwayId = (typeof COLORWAYS)[number]["id"];
/** « faso-dan-fani--origine », « wax--braise »… */
export type ThemeId = `${StyleId}--${ColorwayId}`;

export const DEFAULT_THEME: ThemeId = "faso-dan-fani--origine";

export interface InvitationTheme {
  id: ThemeId;
  styleId: StyleId;
  colorwayId: ColorwayId;
  /** « Wax · Braise » */
  name: string;
  description: string;
  /** Fond illustré sans texte (public/demo/themes) */
  image: string;
  /** Couleur moyenne du fond : affichée pendant le chargement de l'image et pour les pastilles */
  color: string;
  colors: {
    /** Fond du panneau central (toujours clair, pour la lisibilité) */
    panel: string;
    /** Couleur du texte sur le panneau */
    text: string;
    /** Couleur d'accent : petites capitales, « & », filets */
    accent: string;
  };
}

/** Assombrit une couleur « #rrggbb » (pour le texte d'accent, qui doit rester lisible sur le panneau clair). */
function darken(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const c = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount)).toString(16).padStart(2, "0");
  return `#${c(16)}${c(8)}${c(0)}`;
}

const colors = themeColors as Record<string, string>;

export const THEMES = Object.fromEntries(
  STYLES.flatMap((style) =>
    COLORWAYS.map((cw) => {
      const id = `${style.id}--${cw.id}` as ThemeId;
      const color = colors[id] ?? "#6D3BF5";
      const theme: InvitationTheme = {
        id,
        styleId: style.id,
        colorwayId: cw.id,
        name: `${style.name} · ${cw.name}`,
        description: style.description,
        image: `/demo/themes/${id}.webp`,
        color,
        colors: { panel: "rgba(250,245,236,0.95)", text: "#211915", accent: darken(color, 0.38) },
      };
      return [id, theme] as const;
    }),
  ),
) as Record<ThemeId, InvitationTheme>;

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export const isThemeId = (value: unknown): value is ThemeId => typeof value === "string" && Object.hasOwn(THEMES, value);

/** Thème d'une invitation ; repli sur le thème par défaut si l'identifiant est inconnu. */
export const getTheme = (id: string | null | undefined): InvitationTheme => (isThemeId(id) ? THEMES[id] : THEMES[DEFAULT_THEME]);

/** Ancien identifiant (4 thèmes sans coloris) → nouvel identifiant. */
export const LEGACY_THEMES: Record<string, ThemeId> = {
  "faso-dan-fani": "faso-dan-fani--origine",
  bogolan: "bogolan--origine",
  tiebele: "tiebele--origine",
  indigo: "indigo--origine",
};
