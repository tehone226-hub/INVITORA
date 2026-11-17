/**
 * Les 10 styles de la collection « Papier Silencieux ». Chaque fonction reçoit une palette
 * (config/theme-palettes.json) et renvoie un SVG 1200 × 1500 SANS AUCUN TEXTE.
 * Règle commune : le centre (x 16–84 %, y 20–80 %) reste calme, le décor vit sur les bords.
 */
import { H, W, blurFilter, f, fracture, lerp, mix, pick, rng, sheet, smoothPath, splineAt, washFilter } from "./art-lib.mjs";

const deg = (a) => (a * 180) / Math.PI;
const unit = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((v) => v.toFixed(3));
};

/* ------------------------------------------------------------------ */
/* 1. Aura : halos de couleur fondus, plus denses sur une diagonale     */
/* ------------------------------------------------------------------ */
export function aura(p) {
  const halo = (cx, cy, rx, ry, color, o) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}" opacity="${o}"/>`;
  const layers = `
  <g filter="url(#blur)">
    ${halo(40, 30, 640, 430, p.t1, 1)}
    ${halo(330, -70, 330, 200, p.t2, p.dark ? 0.7 : 0.5)}
    ${halo(1200, 250, 300, 380, p.t2, p.dark ? 0.5 : 0.34)}
    ${halo(1180, 1480, 680, 430, p.t1, 1)}
    ${halo(900, 1560, 340, 200, p.t2, p.dark ? 0.7 : 0.5)}
    ${halo(0, 1300, 280, 330, p.t2, p.dark ? 0.45 : 0.3)}
    ${halo(1040, 40, 200, 150, p.metal, p.dark ? 0.3 : 0.24)}
    ${halo(170, 1480, 220, 150, p.metal, p.dark ? 0.24 : 0.2)}
  </g>
  <ellipse cx="600" cy="750" rx="540" ry="620" fill="url(#clear)"/>`;
  const defs = `${blurFilter("blur", 100)}
  <radialGradient id="clear"><stop offset="0" stop-color="${p.bg}" stop-opacity="0.97"/><stop offset="0.64" stop-color="${p.bg}" stop-opacity="0.82"/><stop offset="1" stop-color="${p.bg}" stop-opacity="0"/></radialGradient>`;
  return sheet(p, 11, { defs, layers, vignette: 0, grain: p.dark ? 0.07 : 0.09 });
}

/* ------------------------------------------------------------------ */
/* 2. Arche : formes bohèmes ancrées en bas et en haut à droite         */
/* ------------------------------------------------------------------ */
export function arche(p) {
  const shape = (x, w, top) => {
    const r = w / 2;
    return `M${x} ${H + 20} V${top + r} A${r} ${r} 0 0 1 ${x + w} ${top + r} V${H + 20}`;
  };
  const arch = (x, w, top, fill, o = 1) => `<path d="${shape(x, w, top)} Z" fill="${fill}" opacity="${o}"/>`;
  const line = (x, w, top) => `<path d="${shape(x, w, top)}" fill="none" stroke="${p.metal}" stroke-width="1.6"/>`;
  const pale = mix(p.bg, p.t1, p.dark ? 0.7 : 0.55);
  const layers = `
  <!-- haut droite : soleil coupé par le bord, halo et anneau -->
  <circle cx="1096" cy="84" r="226" fill="${pale}"/>
  <circle cx="1096" cy="84" r="132" fill="${p.t2}" opacity="${p.dark ? 0.92 : 0.86}"/>
  <circle cx="1096" cy="84" r="178" fill="none" stroke="${p.metal}" stroke-width="1.6"/>
  <!-- marge gauche : grande arche pâle -->
  ${arch(-124, 268, 610, pale)}
  <!-- bas gauche : arches emboîtées -->
  ${arch(-46, 420, 1214, p.t1)}
  ${arch(20, 288, 1280, p.t2, p.dark ? 0.95 : 0.9)}
  ${arch(86, 156, 1346, p.t3, 0.92)}
  ${line(-74, 476, 1186)}
  <!-- bas : colline basse et arche droite -->
  <path d="M470 ${H} A210 210 0 0 1 890 ${H} Z" fill="${p.t1}" opacity="0.62"/>
  ${arch(978, 240, 1250, p.t2, p.dark ? 0.75 : 0.6)}
  ${arch(1066, 200, 1328, p.t3, 0.9)}`;
  return sheet(p, 23, { layers, vignette: 0.35, grain: p.dark ? 0.07 : 0.085 });
}

/* ------------------------------------------------------------------ */
/* 3. Feuillage : branches qui entrent par deux coins opposés           */
/* ------------------------------------------------------------------ */
function leafPath(len, wid) {
  return `M0 0 C${f(len * 0.2)} ${f(-wid)} ${f(len * 0.7)} ${f(-wid * 0.9)} ${f(len)} 0 C${f(len * 0.7)} ${f(wid * 0.9)} ${f(len * 0.2)} ${f(wid)} 0 0 Z`;
}

function branch(r, p, stem, { leaves, len, spread = 48, berries = 0, tones, wide = 0.27 }) {
  const front = [];
  const back = [];
  const stemPath = `<path d="${smoothPath(stem)}" fill="none" stroke="${p.t3}" stroke-width="2.1" stroke-linecap="round" opacity="0.8"/>`;
  for (let i = 0; i < leaves; i++) {
    if (i > 1 && r() < 0.1) continue; // un manque, pour casser la régularité
    const t = 0.05 + (i / leaves) * 0.93 + (r() - 0.5) * 0.02;
    const at = splineAt(stem, t);
    const side = i % 2 === 0 ? -1 : 1;
    const size = len * lerp(1.05, 0.5, t) * (0.72 + r() * 0.5);
    const ang = deg(at.angle) + side * (spread + (r() - 0.5) * 26) * lerp(1, 0.62, t);
    const tone = pick(r, tones);
    const o = f(0.46 + r() * 0.4);
    const d = leafPath(size, size * (wide + r() * 0.09));
    const leaf = `<g transform="translate(${f(at.x)} ${f(at.y)}) rotate(${f(ang)})"><path d="${d}" fill="${tone}" opacity="${o}"/><path d="${d}" fill="none" stroke="${tone}" stroke-width="1.1" opacity="0.45"/><path d="M5 0 L${f(size * 0.84)} 0" stroke="${p.bg}" stroke-width="1" opacity="0.45"/></g>`;
    (tone === p.t1 ? back : front).push(leaf);
  }
  const tip = splineAt(stem, 1);
  front.push(`<g transform="translate(${f(tip.x)} ${f(tip.y)}) rotate(${f(deg(tip.angle))})"><path d="${leafPath(len * 0.5, len * 0.12)}" fill="${p.t2}" opacity="0.7"/></g>`);
  const fruit = [];
  for (let i = 0; i < berries; i++) {
    const at = splineAt(stem, 0.15 + r() * 0.7);
    const side = r() < 0.5 ? -1 : 1;
    const a = at.angle + side * (0.9 + r() * 0.5);
    const d = 24 + r() * 24;
    const bx = at.x + Math.cos(a) * d;
    const by = at.y + Math.sin(a) * d;
    fruit.push(`<path d="M${f(at.x)} ${f(at.y)} L${f(bx)} ${f(by)}" stroke="${p.t3}" stroke-width="1.1" opacity="0.7"/><circle cx="${f(bx)}" cy="${f(by)}" r="${f(4.4 + r() * 2.4)}" fill="${p.metal}"/>`);
  }
  return { back: back.join(""), stem: stemPath, front: front.join(""), fruit: fruit.join("") };
}

export function feuillage(p) {
  const r = rng(311);
  const tones = [p.t1, p.t2, p.t2, p.t3, mix(p.t2, p.t3, 0.5), mix(p.t1, p.t2, 0.5)];
  const pale = [p.t1, p.t1, mix(p.t1, p.t2, 0.4)];
  const group = (parts) =>
    `<g filter="url(#wash)">${parts.map((b) => b.back).join("")}${parts.map((b) => b.stem + b.front).join("")}</g>${parts.map((b) => b.fruit).join("")}`;
  // coin haut gauche : longue branche le long du haut, courte le long du côté
  const topLeft = group([
    branch(r, p, [[-30, -20], [84, 78], [176, 168], [262, 238]], { leaves: 6, len: 132, spread: 50, tones: pale, wide: 0.3 }),
    branch(r, p, [[-40, 40], [140, 90], [360, 118], [560, 98], [724, 54]], { leaves: 15, len: 110, berries: 4, tones }),
    branch(r, p, [[30, -40], [84, 150], [72, 330], [94, 506]], { leaves: 10, len: 84, spread: 44, berries: 2, tones }),
    branch(r, p, [[236, -30], [280, 56], [334, 128]], { leaves: 5, len: 62, spread: 46, berries: 1, tones }),
  ]);
  // coin bas droit (retourné) : l'inverse, longue branche le long du côté
  const bottomRight = group([
    branch(r, p, [[-30, -20], [80, 76], [166, 160], [240, 220]], { leaves: 5, len: 124, spread: 50, tones: pale, wide: 0.3 }),
    branch(r, p, [[-40, 40], [130, 86], [300, 104], [436, 82]], { leaves: 9, len: 100, berries: 2, tones }),
    branch(r, p, [[30, -40], [86, 170], [70, 390], [98, 600], [82, 748]], { leaves: 15, len: 86, spread: 44, berries: 4, tones }),
  ]);
  const layers = `${topLeft}<g transform="rotate(180 ${W / 2} ${H / 2})">${bottomRight}</g>`;
  return sheet(p, 31, { defs: washFilter("wash", 5, 7, 0.028), layers, vignette: 0.3 });
}

/* ------------------------------------------------------------------ */
/* 4. Art déco : gerbes de rayons métalliques dans deux coins opposés   */
/* ------------------------------------------------------------------ */
export function deco(p) {
  const m = 58;
  /** Gerbe posée dans un coin ; les rayons s'allongent le long des bords et s'arrêtent avant le texte. */
  const burst = (cap) => {
    const out = [];
    const n = 22;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * (Math.PI / 2);
      const s = Math.max(Math.sin(a), 0.001);
      const c = Math.max(Math.cos(a), 0.001);
      // distance à laquelle le rayon entrerait dans la zone du texte
      const limit = Math.max((H * 0.2 - m) / s, (W * 0.16 - m) / c) - 22;
      const long = i % 2 === 0;
      const reach = Math.min(cap, limit) * (long ? 1 : 0.74);
      const r0 = long ? 118 : 132;
      out.push(`<path d="M${f(c * r0)} ${f(s * r0)} L${f(c * reach)} ${f(s * reach)}" stroke="${p.metal}" stroke-width="${long ? 1.6 : 1.1}" opacity="${long ? 1 : 0.72}" stroke-linecap="round"/>`);
      if (long) out.push(`<circle cx="${f(c * (reach + 11))}" cy="${f(s * (reach + 11))}" r="2.7" fill="${p.metal}"/>`);
    }
    out.push(`<path d="M104 0 A104 104 0 0 1 0 104" fill="none" stroke="${p.metal}" stroke-width="2.4"/>`);
    out.push(`<path d="M90 0 A90 90 0 0 1 0 90" fill="none" stroke="${p.metal}" stroke-width="1.1" opacity="0.8"/>`);
    out.push(`<path d="M0 0 H56 A56 56 0 0 1 0 56 Z" fill="${p.metal}"/>`);
    return out.join("");
  };
  const layers = `
  <g transform="translate(${m} ${m})">${burst(640)}</g>
  <g transform="translate(${W - m} ${H - m}) rotate(180)">${burst(380)}</g>`;
  return sheet(p, 43, { layers, vignette: p.dark ? 0.7 : 0.45 });
}

/* ------------------------------------------------------------------ */
/* 5. Marbre : veines douces sur une diagonale de bord                  */
/* ------------------------------------------------------------------ */
export function marbre(p) {
  const r = rng(523);
  const veins = (list) =>
    list
      .map(([a, b, w, tone, o, gold]) => {
        const d = smoothPath(fracture(r, a, b, 0.13, 5));
        if (gold) return `<path d="${d}" fill="none" stroke="${p.metal}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
        return `<path d="${d}" fill="none" stroke="${tone}" stroke-width="${w * 20}" stroke-linecap="round" opacity="${f(o * 0.5)}" filter="url(#soft)"/><path d="${d}" fill="none" stroke="${tone}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
      })
      .join("");
  const mid = p.t2;
  const deep = p.t3;
  const top = veins([
    [[620, -20], [1220, 430], 1.3, mid, 0.5],
    [[760, -20], [1220, 300], 1.7, mid, 0.7],
    [[900, -20], [1220, 190], 1.2, deep, 0.6],
    [[1010, -20], [1220, 110], 1, mid, 0.6],
    [[1110, -20], [1220, 50], 0.9, deep, 0.5],
    [[840, 60], [1090, 250], 0.9, deep, 0.45],
    [[690, -20], [1220, 370], 2.1, null, 0.95, true],
    [[980, 80], [1220, 250], 1.2, null, 0.8, true],
  ]);
  const bottom = veins([
    [[-20, 1010], [600, 1520], 1.3, mid, 0.48],
    [[-20, 1130], [470, 1520], 1.7, mid, 0.7],
    [[-20, 1270], [330, 1520], 1.2, deep, 0.6],
    [[-20, 1390], [180, 1520], 1, mid, 0.6],
    [[120, 1290], [350, 1450], 0.9, deep, 0.45],
    [[-20, 1200], [410, 1520], 2.1, null, 0.95, true],
  ]);
  const [cr, cg, cb] = unit(p.t1);
  const defs = `${blurFilter("soft", 8)}
  <filter id="cloud" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.0032 0.0058" numOctaves="4" seed="8" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 ${cr}  0 0 0 0 ${cg}  0 0 0 0 ${cb}  2.6 0 0 0 -0.9"/></filter>
  <linearGradient id="diag" gradientUnits="userSpaceOnUse" x1="0" y1="${H}" x2="${W}" y2="0">
    <stop offset="0" stop-color="#fff"/><stop offset="0.25" stop-color="#000"/><stop offset="0.75" stop-color="#000"/><stop offset="1" stop-color="#fff"/>
  </linearGradient>
  <mask id="edge"><rect width="${W}" height="${H}" fill="url(#diag)"/></mask>`;
  const layers = `
  <g mask="url(#edge)"><rect width="${W}" height="${H}" filter="url(#cloud)"/></g>
  ${top}${bottom}`;
  return sheet(p, 59, { defs, layers, vignette: 0.25, grain: p.dark ? 0.04 : 0.05 });
}

/* ------------------------------------------------------------------ */
/* 6. Ondes : faisceaux de lignes qui s'ouvrent en éventail             */
/* ------------------------------------------------------------------ */
export function ondes(p) {
  /** Faisceau serré à gauche, qui s'ouvre vers la droite. */
  const bundle = (n, ph, goldAt, open) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const pts = [];
      for (let x = -60; x <= W + 60; x += 40) {
        const u = Math.min(1, Math.max(0, x / W));
        const gap = 3.2 + open * Math.pow(u, 1.3);
        const centre = 66 + 84 * u + 17 * Math.sin(u * 5.2 + ph);
        pts.push([x, centre + (i - (n - 1) / 2) * gap + 5 * Math.sin(u * 11 + i * 0.35 + ph)]);
      }
      const gold = i === goldAt;
      const t = i / (n - 1);
      out.push(`<path d="${smoothPath(pts)}" fill="none" stroke="${gold ? p.metal : mix(p.t2, p.t3, t)}" stroke-width="${gold ? 2.1 : 1.4}" opacity="${gold ? 1 : f(lerp(0.5, 0.95, t))}"/>`);
    }
    return out.join("");
  };
  const layers = `
  ${bundle(15, 0.4, 10, 13.5)}
  <g transform="rotate(180 ${W / 2} ${H / 2})">${bundle(12, 2.2, 3, 13)}</g>`;
  return sheet(p, 67, { layers, vignette: 0.4 });
}

/* ------------------------------------------------------------------ */
/* 7. Confettis : pluie festive depuis le haut                          */
/* ------------------------------------------------------------------ */
export function confettis(p) {
  const r = rng(739);
  const placed = [];
  const out = [];
  const tones = [p.t1, p.t2, p.t2, p.t3, p.metal, p.metal];
  const drop = (x, y, scale) => {
    if (placed.some(([px, py, ps]) => Math.hypot(px - x, py - y) < 22 * (ps + scale))) return;
    placed.push([x, y, scale]);
    const tone = pick(r, tones);
    const rot = f(r() * 360);
    const kind = r();
    const o = tone === p.t1 ? 0.95 : f(0.78 + r() * 0.22);
    if (kind < 0.32) out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f((6 + r() * 11) * scale)}" fill="${tone}" opacity="${o}"/>`);
    else if (kind < 0.55) {
      const s = (12 + r() * 11) * scale;
      out.push(`<path d="M${f(-s)} 0 A${f(s)} ${f(s)} 0 0 1 ${f(s)} 0 Z" transform="translate(${f(x)} ${f(y)}) rotate(${rot})" fill="${tone}" opacity="${o}"/>`);
    } else if (kind < 0.8) {
      const w = (24 + r() * 14) * scale;
      out.push(`<rect x="${f(-w / 2)}" y="-3.6" width="${f(w)}" height="7.2" rx="3.6" transform="translate(${f(x)} ${f(y)}) rotate(${rot})" fill="${tone}" opacity="${o}"/>`);
    } else if (kind < 0.9) out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f((8 + r() * 6) * scale)}" fill="none" stroke="${tone}" stroke-width="2.2" opacity="${o}"/>`);
    else out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 * scale + 0.8)}" fill="${p.metal}"/>`);
  };
  for (let i = 0; i < 620; i++) {
    const u = r();
    drop(r() * W, 292 * Math.pow(u, 2.05) - 8, lerp(1.25, 0.5, u));
  }
  for (let i = 0; i < 90; i++) drop(r() * W, H + 6 - 130 * Math.pow(r(), 2.6), 0.6);
  const streamer = (x, len, tone, ph) => {
    const pts = [];
    for (let y = -10; y <= len; y += 14) pts.push([x + 16 * Math.sin(y / 22 + ph) * (0.5 + y / len / 2), y]);
    return `<path d="${smoothPath(pts)}" fill="none" stroke="${tone}" stroke-width="2.6" stroke-linecap="round" opacity="0.9"/>`;
  };
  const layers = `${streamer(214, 204, p.t2, 0)}${streamer(668, 156, p.metal, 1.4)}${streamer(1008, 232, p.t3, 2.6)}${out.join("")}`;
  return sheet(p, 79, { layers, vignette: 0.3 });
}

/* ------------------------------------------------------------------ */
/* 8. Nuit étoilée : semis d'étoiles, croissant et constellations       */
/* ------------------------------------------------------------------ */
export function etoiles(p) {
  const r = rng(877);
  const star = p.dark ? p.ink : p.t3;
  const sparkle = (x, y, s, color, o) =>
    `<path d="M0 ${-s} Q0 0 ${s} 0 Q0 0 0 ${s} Q0 0 ${-s} 0 Q0 0 0 ${-s} Z" transform="translate(${f(x)} ${f(y)})" fill="${color}" opacity="${o}"/>`;
  const out = [];
  const inSafe = (x, y, pad) => x > W * 0.16 - pad && x < W * 0.84 + pad && y > H * 0.2 - pad && y < H * 0.8 + pad;
  const moon = { x: 984, y: 152, r: 62 };
  let n = 0;
  while (n < 230) {
    const x = r() * W;
    const y = r() * H;
    if (inSafe(x, y, 16)) continue;
    if (r() > lerp(1, 0.2, y / H)) continue; // plus dense en haut
    if (Math.hypot(x - moon.x, y - moon.y) < 104) continue;
    n++;
    const gold = r() < 0.2;
    if (r() < 0.085) out.push(sparkle(x, y, 8 + r() * 10, gold ? p.metal : star, f(0.75 + r() * 0.25)));
    else out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + r() * 1.9)}" fill="${gold ? p.metal : star}" opacity="${f(0.42 + r() * 0.55)}"/>`);
  }
  // croissant : grand cercle moins un cercle décalé vers le haut à gauche
  const crescent = (() => {
    const { x, y, r: R } = moon;
    const ox = -27, oy = -15, r2 = 54;
    const d = Math.hypot(ox, oy);
    const a = (R * R - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(R * R - a * a);
    const px = x + (a * ox) / d, py = y + (a * oy) / d;
    const p1 = [px - (h * oy) / d, py + (h * ox) / d];
    const p2 = [px + (h * oy) / d, py - (h * ox) / d];
    return `<path d="M${f(p1[0])} ${f(p1[1])} A${R} ${R} 0 1 0 ${f(p2[0])} ${f(p2[1])} A${r2} ${r2} 0 0 1 ${f(p1[0])} ${f(p1[1])} Z" fill="${p.metal}"/>`;
  })();
  const constellation = (pts) =>
    `<path d="M${pts.map(([x, y]) => `${x} ${y}`).join(" L")}" fill="none" stroke="${p.metal}" stroke-width="1.1" opacity="0.7"/>` +
    pts.map(([x, y], i) => (i % 2 === 0 ? sparkle(x, y, 7.5, p.metal, 1) : `<circle cx="${x}" cy="${y}" r="3" fill="${p.metal}"/>`)).join("");
  const top = p.dark ? mix(p.bg, "#000000", 0.3) : mix(p.bg, p.t1, 0.55);
  const low = p.dark ? mix(p.bg, p.t1, 0.8) : mix(p.bg, p.t1, 0.45);
  const defs = `
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${top}"/><stop offset="0.24" stop-color="${p.bg}"/><stop offset="0.74" stop-color="${p.bg}"/><stop offset="1" stop-color="${low}"/>
  </linearGradient>
  <radialGradient id="moonGlow"><stop offset="0" stop-color="${p.metal}" stop-opacity="${p.dark ? 0.3 : 0.24}"/><stop offset="1" stop-color="${p.metal}" stop-opacity="0"/></radialGradient>`;
  const layers = `
  <circle cx="${moon.x}" cy="${moon.y}" r="200" fill="url(#moonGlow)"/>
  ${out.join("")}
  ${crescent}
  ${constellation([[96, 168], [182, 104], [284, 150], [352, 84], [462, 126], [438, 226]])}
  ${constellation([[792, 1372], [884, 1316], [972, 1384], [1066, 1306], [1128, 1396]])}`;
  return sheet(p, 83, { defs, under: `<rect width="${W}" height="${H}" fill="url(#sky)"/>`, layers, vignette: 0, grain: p.dark ? 0.045 : 0.055 });
}

/* ------------------------------------------------------------------ */
/* 9. Sahel : crépuscule, soleil bas, acacias et baobab                 */
/* ------------------------------------------------------------------ */
export function sahel(p) {
  const r = rng(941);
  const ink = p.dark ? mix(p.bg, "#000000", 0.72) : mix(p.t3, p.ink, 0.55);
  const haze = p.dark ? mix(p.t2, p.t3, 0.6) : mix(p.t1, p.t2, 0.55);
  const sun = p.dark ? p.metal : mix(p.t2, p.metal, 0.5);
  const horizon = 1414;

  const acacia = (x, base, h, s, color, o = 1) => {
    const top = base - h;
    const crown = (cx, cy, w, hh) =>
      `<path d="M${f(cx - w)} ${f(cy)} C${f(cx - w * 0.9)} ${f(cy - hh)} ${f(cx - w * 0.3)} ${f(cy - hh * 1.5)} ${f(cx)} ${f(cy - hh * 1.45)} C${f(cx + w * 0.4)} ${f(cy - hh * 1.5)} ${f(cx + w * 0.94)} ${f(cy - hh)} ${f(cx + w)} ${f(cy)} C${f(cx + w * 0.5)} ${f(cy + hh * 0.22)} ${f(cx - w * 0.5)} ${f(cy + hh * 0.22)} ${f(cx - w)} ${f(cy)} Z"/>`;
    return `<g fill="${color}" stroke="${color}" opacity="${o}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${x} ${base} C${f(x - 8 * s)} ${f(base - h * 0.4)} ${f(x + 12 * s)} ${f(base - h * 0.58)} ${f(x + 4 * s)} ${f(top + 28 * s)}" fill="none" stroke-width="${f(8.5 * s)}"/>
      <path d="M${f(x + 5 * s)} ${f(base - h * 0.5)} C${f(x - 22 * s)} ${f(base - h * 0.7)} ${f(x - 60 * s)} ${f(top + 40 * s)} ${f(x - 92 * s)} ${f(top + 27 * s)}" fill="none" stroke-width="${f(4.4 * s)}"/>
      <path d="M${f(x + 6 * s)} ${f(base - h * 0.52)} C${f(x + 34 * s)} ${f(base - h * 0.72)} ${f(x + 68 * s)} ${f(top + 42 * s)} ${f(x + 100 * s)} ${f(top + 29 * s)}" fill="none" stroke-width="${f(4.4 * s)}"/>
      <path d="M${f(x - 30 * s)} ${f(base - h * 0.74)} L${f(x - 44 * s)} ${f(top + 26 * s)}" fill="none" stroke-width="${f(2.6 * s)}"/>
      <path d="M${f(x + 40 * s)} ${f(base - h * 0.75)} L${f(x + 50 * s)} ${f(top + 27 * s)}" fill="none" stroke-width="${f(2.6 * s)}"/>
      <g stroke="none">${crown(x + 4 * s, top + 26 * s, 140 * s, 17 * s)}${crown(x - 74 * s, top + 34 * s, 74 * s, 11 * s)}${crown(x + 86 * s, top + 35 * s, 78 * s, 11 * s)}</g>
    </g>`;
  };

  const baobab = (x, base, s, color) => {
    const twigs = [];
    const limbs = [[-60, -70, 5.5], [-32, -92, 6.5], [-4, -100, 6], [26, -94, 6.5], [56, -70, 5.5], [-80, -40, 4], [78, -38, 4]];
    for (const [dx, dy, w] of limbs) {
      const ex = x + dx * s;
      const ey = base - 88 * s + dy * s * 0.72;
      twigs.push(`<path d="M${f(x + dx * 0.22 * s)} ${f(base - 86 * s)} Q${f(x + dx * 0.55 * s)} ${f(base - 98 * s + dy * 0.25 * s)} ${f(ex)} ${f(ey)}" stroke-width="${f(w * s)}"/>`);
      for (const k of [-1, 1]) twigs.push(`<path d="M${f(ex)} ${f(ey)} l${f((dx * 0.16 + k * 9) * s)} ${f((-13 - r() * 7) * s)}" stroke-width="${f(1.9 * s)}"/>`);
    }
    return `<g fill="${color}" stroke="${color}" stroke-linecap="round">
      <path d="M${f(x - 32 * s)} ${base} C${f(x - 25 * s)} ${f(base - 34 * s)} ${f(x - 28 * s)} ${f(base - 62 * s)} ${f(x - 22 * s)} ${f(base - 92 * s)} L${f(x + 22 * s)} ${f(base - 92 * s)} C${f(x + 28 * s)} ${f(base - 62 * s)} ${f(x + 25 * s)} ${f(base - 34 * s)} ${f(x + 34 * s)} ${base} Z" stroke="none"/>
      <g fill="none">${twigs.join("")}</g>
    </g>`;
  };

  const grass = [];
  for (let i = 0; i < 150; i++) {
    const x = r() * W;
    grass.push(`M${f(x)} ${horizon + 6} l${f((r() - 0.5) * 10)} ${f(-(6 + r() * 18))}`);
  }
  const ridge = (y, amp, seed, fill, o) => {
    const rr = rng(seed);
    const pts = [];
    for (let x = -120; x <= W + 120; x += 120) pts.push([x, y + (rr() - 0.5) * amp]);
    return `<path d="${smoothPath(pts)} L${W + 120} ${H + 20} L-120 ${H + 20} Z" fill="${fill}" opacity="${o}"/>`;
  };
  const bird = (x, y, s) =>
    `<path d="M${f(x - 12 * s)} ${f(y - 3 * s)} Q${f(x - 5 * s)} ${f(y - 9 * s)} ${x} ${y} Q${f(x + 5 * s)} ${f(y - 9 * s)} ${f(x + 12 * s)} ${f(y - 3 * s)}" fill="none" stroke="${p.dark ? p.t3 : ink}" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>`;

  const defs = `
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${p.dark ? mix(p.bg, "#000000", 0.22) : mix(p.bg, p.soft, 0.45)}"/>
    <stop offset="0.3" stop-color="${p.bg}"/>
    <stop offset="${p.dark ? 0.66 : 0.72}" stop-color="${p.bg}"/>
    <stop offset="${p.dark ? 0.8 : 0.86}" stop-color="${mix(p.bg, p.t1, p.dark ? 0.9 : 0.75)}"/>
    ${p.dark ? `<stop offset="0.885" stop-color="${p.t2}"/>` : ""}
    <stop offset="0.945" stop-color="${haze}"/>
  </linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="${sun}" stop-opacity="0.55"/><stop offset="1" stop-color="${sun}" stop-opacity="0"/></radialGradient>`;
  const layers = `
  <circle cx="420" cy="1326" r="280" fill="url(#glow)"/>
  <circle cx="420" cy="1326" r="94" fill="${sun}"/>
  ${ridge(1392, 14, 5, mix(haze, ink, 0.35), 0.9)}
  ${acacia(1092, 1400, 104, 0.5, mix(haze, ink, 0.45))}
  ${ridge(horizon + 4, 7, 9, ink, 1)}
  ${acacia(846, horizon + 6, 196, 1.12, ink)}
  ${baobab(170, horizon + 8, 1.08, ink)}
  <path d="${grass.join(" ")}" stroke="${ink}" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  ${bird(716, 236, 1)}${bird(772, 206, 0.8)}${bird(818, 248, 0.7)}`;
  return sheet(p, 97, { defs, under: `<rect width="${W}" height="${H}" fill="url(#sky)"/>`, layers, vignette: 0, grain: p.dark ? 0.05 : 0.06 });
}

/* ------------------------------------------------------------------ */
/* 10. Épure : un filet, un ornement                                    */
/* ------------------------------------------------------------------ */
export function epure(p) {
  const m = 76;
  const gap = 86;
  const cx = W / 2;
  const layers = `
  <path d="M${cx - gap} ${m} H${m} V${H - m} H${W - m} V${m} H${cx + gap}" fill="none" stroke="${p.metal}" stroke-width="1.5"/>
  <path d="M${cx} ${m - 13} L${cx + 13} ${m} L${cx} ${m + 13} L${cx - 13} ${m} Z" fill="none" stroke="${p.metal}" stroke-width="1.5"/>
  <circle cx="${cx}" cy="${m}" r="2.8" fill="${p.metal}"/>
  <circle cx="${cx - 46}" cy="${m}" r="2.8" fill="${p.metal}"/><circle cx="${cx + 46}" cy="${m}" r="2.8" fill="${p.metal}"/>`;
  return sheet(p, 101, { layers, vignette: 0.5 });
}

export const STYLES = [
  { id: "aura", fn: aura },
  { id: "arche", fn: arche },
  { id: "feuillage", fn: feuillage },
  { id: "deco", fn: deco },
  { id: "marbre", fn: marbre },
  { id: "ondes", fn: ondes },
  { id: "confettis", fn: confettis },
  { id: "etoiles", fn: etoiles },
  { id: "sahel", fn: sahel },
  { id: "epure", fn: epure },
];
