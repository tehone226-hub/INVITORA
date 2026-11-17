import sharp from "sharp";
export { sharp };

export const W = 1200;
export const H = 1500;
export const CX = W / 2;
export const CY = H / 2;

export const C = {
  terracotta: "#C0572B",
  terracottaDark: "#A94A22",
  forest: "#1F4D3A",
  forestDark: "#173A2C",
  gold: "#D9A441",
  cream: "#FAF5EC",
  sand: "#F2E8D5",
  ink: "#211915",
  ecru: "#EAD9BC",
  mud: "#2B1D14",
  clay: "#8A5A33",
  ochre: "#B5532A",
  chaux: "#F4E6CF",
  indigo: "#1B2A49",
  indigoMid: "#2A3F68",
  indigoLight: "#7F9CC8",
};

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

/** Trait « fait main » : segment découpé et légèrement tremblé. */
export function handLine(r, x1, y1, x2, y2, amp = 1.2, seg = 6) {
  const pts = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const j = i === 0 || i === seg ? amp * 0.4 : amp;
    pts.push([x1 + (x2 - x1) * t + (r() - 0.5) * j, y1 + (y2 - y1) * t + (r() - 0.5) * j]);
  }
  return "M" + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L");
}

/** Polyligne tremblée */
export function handPoly(r, pts, amp = 1.2, close = false) {
  const d = pts.map(([x, y]) => `${f(x + (r() - 0.5) * amp)} ${f(y + (r() - 0.5) * amp)}`);
  return "M" + d.join(" L") + (close ? " Z" : "");
}

/** Cercle tremblé */
export function handCircle(r, cx, cy, rad, amp = 0.06, n = 28) {
  const pts = [];
  const phase = r() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const a = phase + (i / n) * Math.PI * 2;
    const rr = rad * (1 + (r() - 0.5) * amp);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return "M" + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L") + " Z";
}

export const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
/** 0 au centre, 1 vers les bords (ellipse) */
export const edgeness = (x, y, rx = 430, ry = 540) =>
  Math.sqrt(((x - CX) / rx) ** 2 + ((y - CY) / ry) ** 2);

/** Grain de coton commun à toutes les pièces */
export function grainDefs(id, seed, strength = 0.09, freq = 0.85) {
  return `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.05" result="a"/>
    <feComponentTransfer in="a"><feFuncA type="linear" slope="${strength * 2.2}"/></feComponentTransfer>
  </filter>`;
}

/** Marbrure lente (teinture irrégulière) */
export function mottleDefs(id, seed, color, opacity, freq = 0.006) {
  return `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 ${hexToUnit(color)[0]}  0 0 0 0 ${hexToUnit(color)[1]}  0 0 0 0 ${hexToUnit(color)[2]}  1.6 0 0 0 -0.55"/>
    <feComponentTransfer><feFuncA type="linear" slope="${opacity}"/></feComponentTransfer>
  </filter>`;
}

export function hexToUnit(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((v) => v.toFixed(3));
}

export const svgWrap = (defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>${defs}</defs>
${body}
</svg>`;

