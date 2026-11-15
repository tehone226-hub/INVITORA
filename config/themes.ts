/**
 * Thèmes d'invitation (voir BRAND.md, section 7).
 * Les motifs sont de petits SVG répétés en fond : aucun texte, très légers
 * (quelques centaines d'octets), donc parfaits en 3G.
 * Plus tard, les fonds générés par IA (étape 6) viendront s'ajouter par-dessus,
 * avec ces motifs comme image de secours.
 */

export type ThemeId = "faso-dan-fani" | "bogolan" | "tiebele" | "indigo";

export interface InvitationTheme {
  id: ThemeId;
  name: string;
  description: string;
  /** Tuile SVG répétée en fond */
  pattern: string;
  /** Taille de la tuile, en pixels */
  tileSize: number;
  colors: {
    /** Fond du panneau central */
    panel: string;
    /** Couleur du texte sur le panneau */
    text: string;
    /** Couleur d'accent (petites capitales, « & », filets) */
    accent: string;
  };
}

function svgUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}")`;
}

export const THEMES: Record<ThemeId, InvitationTheme> = {
  "faso-dan-fani": {
    id: "faso-dan-fani",
    name: "Faso Dan Fani",
    description: "L'étoffe tissée : bandes verticales terre cuite, vert et or.",
    tileSize: 48,
    pattern: svgUrl(`
      <svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'>
        <rect width='48' height='48' fill='#C0572B'/>
        <rect width='8' height='48' fill='#1F4D3A'/>
        <rect x='10' width='2' height='48' fill='#D9A441'/>
        <rect x='14' width='1' height='48' fill='#FAF5EC' opacity='.6'/>
        <rect x='30' width='4' height='48' fill='#A94A22'/>
        <rect x='36' width='2' height='48' fill='#D9A441'/>
        <g fill='#FAF5EC' opacity='.3'><rect width='8' height='4'/><rect y='24' width='8' height='4'/></g>
      </svg>`),
    colors: { panel: "rgba(250,245,236,0.95)", text: "#211915", accent: "#C0572B" },
  },
  bogolan: {
    id: "bogolan",
    name: "Bogolan",
    description: "L'argile et la terre : motifs dessinés à la main sur fond écru.",
    tileSize: 64,
    pattern: svgUrl(`
      <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
        <rect width='64' height='64' fill='#EAD9BC'/>
        <g stroke='#2B1D14' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'>
          <path d='M4 8 L12 4 L20 8 L28 4'/>
          <path d='M44 6 v10 M39 11 h10'/>
          <circle cx='12' cy='40' r='5'/>
          <path d='M36 36 l8 8 l8 -8'/>
        </g>
        <g fill='#8A5A33'>
          <circle cx='26' cy='24' r='2'/><circle cx='32' cy='24' r='2'/>
          <circle cx='56' cy='54' r='2'/><circle cx='4' cy='58' r='1.5'/>
        </g>
      </svg>`),
    colors: { panel: "rgba(250,245,236,0.94)", text: "#2B1D14", accent: "#8A5A33" },
  },
  tiebele: {
    id: "tiebele",
    name: "Tiébélé",
    description: "Les murs peints : losanges noirs et blancs sur ocre.",
    tileSize: 48,
    pattern: svgUrl(`
      <svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'>
        <rect width='48' height='48' fill='#B5532A'/>
        <path d='M24 4 L44 24 L24 44 L4 24Z' fill='#F4E6CF'/>
        <path d='M24 12 L36 24 L24 36 L12 24Z' fill='#211915'/>
        <path d='M24 18 L30 24 L24 30 L18 24Z' fill='#B5532A'/>
        <path d='M0 0 H8 L0 8Z M48 0 H40 L48 8Z M0 48 H8 L0 40Z M48 48 H40 L48 40Z' fill='#211915'/>
      </svg>`),
    colors: { panel: "#F4E6CF", text: "#211915", accent: "#B5532A" },
  },
  indigo: {
    id: "indigo",
    name: "Indigo de Ouaga",
    description: "La nuit élégante : étoffe indigo, fines touches dorées.",
    tileSize: 56,
    pattern: svgUrl(`
      <svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'>
        <rect width='56' height='56' fill='#1B2A49'/>
        <circle cx='14' cy='14' r='9' fill='none' stroke='#3F5E8C' stroke-width='1.5'/>
        <circle cx='42' cy='42' r='9' fill='none' stroke='#3F5E8C' stroke-width='1.5'/>
        <path d='M42 10 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2z' fill='#D9A441' opacity='.8'/>
        <path d='M14 38 l1.5 3 l3 1.5 l-3 1.5 l-1.5 3 l-1.5 -3 l-3 -1.5 l3 -1.5z' fill='#D9A441' opacity='.6'/>
      </svg>`),
    colors: { panel: "rgba(27,42,73,0.9)", text: "#F2E8D5", accent: "#D9A441" },
  },
};
