/**
 * Fonds d'invitation : images fournies par le porteur du projet (design/fonds-sources/),
 * préparées par `npm run fonds` (scripts/prepare-fonds.mjs) au format 9:16, 720 × 1280.
 * Aucun texte n'est dans les images : prénoms, dates et lieux sont posés en HTML dans la
 * zone libre de chaque fond (`zone`, en % : haut, droite, bas, gauche).
 * Chaque fond a aussi une enveloppe scellée (`cover`) que l'invité ouvre avant de lire l'invitation.
 * Les zones doivent rester identiques à celles de scripts/prepare-fonds.mjs.
 */

export const COVERS = {
  "sceau-rouge": { name: "Enveloppe ivoire, sceau rouge", image: "/demo/enveloppes/sceau-rouge.webp" },
  "sceau-or": { name: "Feuillage en relief, sceau doré", image: "/demo/enveloppes/sceau-or.webp" },
  lys: { name: "Portes aux arums", image: "/demo/enveloppes/lys.webp" },
  cygnes: { name: "Enveloppe aux cygnes", image: "/demo/enveloppes/cygnes.webp" },
} as const;
export type CoverId = keyof typeof COVERS;

type Zone = readonly [top: number, right: number, bottom: number, left: number];

const FONDS = [
  { id: "jardin--ivoire", name: "Jardin ivoire", description: "Fleurs blanches et filet doré sur papier ivoire.", zone: [33, 13, 33, 13], color: "#f8f2e6", text: "#33301f", accent: "#7a5c1e", cover: "sceau-or" },
  { id: "arche--florale", name: "Arche florale", description: "Une arche fine, des roses et des pampas.", zone: [27, 19, 27, 19], color: "#ffffff", text: "#3a2a22", accent: "#a34a2e", cover: "lys" },
  { id: "dentelle--grenat", name: "Dentelle grenat", description: "Dentelle en relief et fleurs grenat.", zone: [24, 16, 26, 16], color: "#e6dcca", text: "#3b1c1f", accent: "#8a1c2b", cover: "sceau-rouge" },
  { id: "satin--bordeaux", name: "Satin bordeaux", description: "Une arche de satin blanc et des fleurs bordeaux.", zone: [40, 31, 29, 9], color: "#f5f5f5", text: "#33161d", accent: "#7a1f33", cover: "cygnes" },
  { id: "broderie--rouge", name: "Broderie rouge", description: "Galon brodé rouge et paniers tressés.", zone: [22, 8, 40, 25], color: "#f1ece6", text: "#3b1f1f", accent: "#9a2424", cover: "sceau-rouge" },
  { id: "vannerie--sable", name: "Vannerie sable", description: "Paniers tressés et grande arche couleur sable.", zone: [33, 6, 20, 25], color: "#d3bda8", text: "#2e2016", accent: "#5c3418", cover: "lys" },
  { id: "vannerie--cacao", name: "Vannerie cacao", description: "Paniers dorés sur fond cacao.", zone: [39, 15, 30, 17], color: "#f0e7d8", text: "#3a2618", accent: "#7a4a22", cover: "lys" },
  { id: "vannerie--indigo", name: "Vannerie indigo", description: "Paniers dorés sur pagne bleu.", zone: [39, 22, 37, 22], color: "#f0e7d8", text: "#22283a", accent: "#1f5378", cover: "lys" },
  { id: "vannerie--zebu", name: "Vannerie et zébu", description: "Paniers, arches et zébu : pour la dot.", zone: [42, 37, 34, 12], color: "#d7baa2", text: "#2e2016", accent: "#5c3418", cover: "sceau-rouge" },
  { id: "shweshwe--marmites", name: "Indigo et marmites", description: "Éventail de pagnes indigo et marmites de fête.", zone: [30, 6, 38, 23], color: "#f4f4f4", text: "#1f2740", accent: "#2b4680", cover: "lys" },
  { id: "shweshwe--zebu", name: "Indigo et zébu", description: "Pagnes indigo, paniers et zébu.", zone: [42, 6, 37, 24], color: "#e0ccb6", text: "#2e2016", accent: "#5c3418", cover: "sceau-rouge" },
] as const satisfies readonly { id: string; name: string; description: string; zone: Zone; color: string; text: string; accent: string; cover: CoverId }[];

export type ThemeId = (typeof FONDS)[number]["id"];

export const DEFAULT_THEME: ThemeId = "jardin--ivoire";

export interface InvitationTheme {
  id: ThemeId;
  name: string;
  description: string;
  /** Fond sans texte (public/demo/themes), 9:16 */
  image: string;
  /** Couleur de la zone de texte : affichée pendant le chargement de l'image */
  color: string;
  /** Zone libre où poser le texte, en % : haut, droite, bas, gauche */
  zone: Zone;
  colors: {
    /** Couleur du texte posé sur le fond */
    text: string;
    /** Couleur d'accent lisible sur le fond : catégorie, « & », filets */
    accent: string;
  };
  /** Enveloppe scellée affichée avant l'invitation */
  cover: { id: CoverId; name: string; image: string };
}

export const THEMES = Object.fromEntries(
  FONDS.map((f) => {
    const theme: InvitationTheme = {
      id: f.id,
      name: f.name,
      description: f.description,
      image: `/demo/themes/${f.id}.webp`,
      color: f.color,
      zone: f.zone,
      colors: { text: f.text, accent: f.accent },
      cover: { id: f.cover, ...COVERS[f.cover] },
    };
    return [f.id, theme] as const;
  }),
) as Record<ThemeId, InvitationTheme>;

export const THEME_IDS = FONDS.map((f) => f.id) as ThemeId[];
export const THEME_LIST = THEME_IDS.map((id) => THEMES[id]);

export const isThemeId = (value: unknown): value is ThemeId => typeof value === "string" && Object.hasOwn(THEMES, value);

/**
 * Styles des anciennes collections (étoffes, puis papeterie dessinée, retirées le 17 novembre 2026)
 * → fond de la collection actuelle. Sert aux invitations créées avant le changement.
 */
export const LEGACY_THEMES: Record<string, ThemeId> = {
  "faso-dan-fani": "vannerie--sable",
  bogolan: "vannerie--cacao",
  tiebele: "broderie--rouge",
  indigo: "shweshwe--marmites",
  wax: "vannerie--indigo",
  senoufo: "vannerie--zebu",
  adinkra: "vannerie--sable",
  savane: "vannerie--zebu",
  coton: "jardin--ivoire",
  ardoise: "vannerie--cacao",
  aura: "arche--florale",
  arche: "arche--florale",
  feuillage: "jardin--ivoire",
  deco: "satin--bordeaux",
  marbre: "dentelle--grenat",
  ondes: "vannerie--sable",
  confettis: "arche--florale",
  etoiles: "shweshwe--marmites",
  sahel: "vannerie--zebu",
  epure: "vannerie--sable",
};

/** Thème d'une invitation ; ancien identifiant converti, repli sur le thème par défaut s'il est inconnu. */
export const getTheme = (id: string | null | undefined): InvitationTheme => {
  if (isThemeId(id)) return THEMES[id];
  const legacy = typeof id === "string" ? id.split("--")[0] : "";
  return THEMES[Object.hasOwn(LEGACY_THEMES, legacy) ? LEGACY_THEMES[legacy] : DEFAULT_THEME];
};
