/**
 * Outils communs aux fonds d'invitation « Papier Silencieux »
 * (design/art/philosophie-visuelle.md). Chaque fond est un SVG 1200 × 1500
 * dessiné à partir d'une palette de config/theme-palettes.json.
 */
import sharp from "sharp";
export { sharp };

export const W = 1200;
export const H = 1500;
export const CX = W / 2;
export const CY = H / 2;

/** Zone calme réservée au texte posé en HTML (x 16–84 %, y 20–80 %). */
export const SAFE = { x0: W * 0.16, x1: W * 0.84, y0: H * 0.2, y1: H * 0.8 };

/* ---------- Hasard reproductible ---------- */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const f = (n) => Math.round(n * 10) / 10;
export const lerp = (a, b, t) => a + (b - a) * t;
export const pick = (r, list) => list[Math.floor(r() * list.length)];

/* ---------- Couleur ---------- */
export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return "#" + A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, "0")).join("");
}
const unit = (hex) => hexToRgb(hex).map((v) => (v / 255).toFixed(3));

/* ---------- Courbes ---------- */
/** Courbe lisse (Catmull-Rom → Bézier) passant par tous les points. */
export function smoothPath(pts, close = false) {
  const n = pts.length;
  const at = (i) => (close ? pts[(i + n) % n] : pts[Math.min(n - 1, Math.max(0, i))]);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const last = close ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (close ? " Z" : "");
}

/** Point et tangente sur la courbe lisse, t de 0 à 1. */
export function splineAt(pts, t) {
  const n = pts.length - 1;
  const x = Math.min(n - 1e-6, Math.max(0, t * n));
  const i = Math.floor(x);
  const u = x - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
  const cr = (k) => {
    const a = 2 * p1[k], b = p2[k] - p0[k], c = 2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k], d = -p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k];
    return [0.5 * (a + b * u + c * u * u + d * u * u * u), 0.5 * (b + 2 * c * u + 3 * d * u * u)];
  };
  const [px, dx] = cr(0);
  const [py, dy] = cr(1);
  return { x: px, y: py, angle: Math.atan2(dy, dx) };
}

/** Ligne brisée par déplacement du point milieu (veines de marbre). */
export function fracture(r, a, b, rough = 0.16, depth = 6) {
  let pts = [a, b];
  let amp = Math.hypot(b[0] - a[0], b[1] - a[1]) * rough;
  for (let d = 0; d < depth; d++) {
    const next = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1) || 1;
      const k = (r() - 0.5) * amp;
      next.push([(x1 + x2) / 2 + (-(y2 - y1) / len) * k, (y1 + y2) / 2 + ((x2 - x1) / len) * k], pts[i + 1]);
    }
    pts = next;
    amp *= 0.52;
  }
  return pts;
}

/* ---------- Filtres ---------- */
/** Grain de papier : bruit fin de la couleur donnée. */
export function grainFilter(id, seed, color, strength = 0.07, freq = 0.9) {
  const [r, g, b] = unit(color);
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  ${(strength * 3).toFixed(3)} 0 0 0 ${(-strength).toFixed(3)}"/>
  </filter>`;
}

/** Flou large (halos), calculé sur toute la feuille. */
export const blurFilter = (id, sd) =>
  `<filter id="${id}" filterUnits="userSpaceOnUse" x="${-W}" y="${-H}" width="${W * 3}" height="${H * 3}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${sd}"/></filter>`;

/** Bord d'aquarelle : léger déplacement du contour. */
export const washFilter = (id, seed, scale = 8, freq = 0.03) =>
  `<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>
  </filter>`;

/**
 * Assemble une feuille : papier (bg), voile des bords (soft), calques du style, grain.
 * `vignette` : opacité du voile aux coins ; `grain` : force du grain.
 */
export function sheet(p, seed, { defs = "", under = "", layers = "", vignette = 0.55, grain = p.dark ? 0.05 : 0.065 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <radialGradient id="vg" cx="50%" cy="50%" r="78%">
    <stop offset="0.5" stop-color="${p.soft}" stop-opacity="0"/>
    <stop offset="1" stop-color="${p.soft}" stop-opacity="${vignette}"/>
  </radialGradient>
  ${grainFilter("grain", seed, p.dark ? "#ffffff" : p.ink, grain)}
  ${defs}
</defs>
<rect width="${W}" height="${H}" fill="${p.bg}"/>
${under}
<rect width="${W}" height="${H}" fill="url(#vg)"/>
${layers}
<rect width="${W}" height="${H}" filter="url(#grain)"/>
</svg>`;
}
