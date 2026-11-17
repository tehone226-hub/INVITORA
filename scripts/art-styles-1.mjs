// Styles 1 à 4 : Faso Dan Fani, Bogolan, Tiébélé, Indigo (voir design/art/philosophie-visuelle.md)
import { C, CX, CY, H, W, edgeness, f, grainDefs, handCircle, handLine, handPoly, mottleDefs, rng, smooth, svgWrap } from "./art-lib.mjs";

/* =========================================================
 * 1. FASO DAN FANI — l'étoffe tissée
 * ========================================================= */
export function fasoDanFani() {
  const r = rng(1957);
  const out = [];

  // Bandes de la lisière vers le centre (moitié gauche, puis miroir)
  const unit = [
    [6, C.ink],
    [10, C.gold],
    [40, C.forest, "diamonds"],
    [3, C.cream],
    [8, C.forest],
    [4, C.gold],
    [34, C.terracotta],
    [3, C.ink],
    [14, C.terracottaDark],
    [22, C.forest, "checker"],
    [6, C.gold],
    [2, C.cream],
    [6, C.gold],
    [22, C.forest],
    [46, C.terracottaDark, "weft"],
    [3, C.gold],
  ];
  const bands = [];
  let x = 0;
  for (const [w, col, kind] of unit) {
    const ww = w + (w > 8 ? (r() - 0.5) * 2 : 0);
    bands.push({ x, w: ww, col, kind });
    x += ww;
  }
  const fieldStart = x;

  // Champ central terre cuite
  out.push(`<rect width="${W}" height="${H}" fill="${C.terracotta}"/>`);
  // Fines rayures dans le champ (rythme discret)
  for (let px = fieldStart + 46; px < W - fieldStart - 20; px += 58 + (r() - 0.5) * 6) {
    out.push(`<rect x="${f(px)}" y="0" width="2.2" height="${H}" fill="${C.terracottaDark}" opacity="0.55"/>`);
    out.push(`<rect x="${f(px + 5)}" y="0" width="0.9" height="${H}" fill="${C.gold}" opacity="0.35"/>`);
  }

  const drawBand = (b, mirror) => {
    const bx = mirror ? W - b.x - b.w : b.x;
    out.push(`<rect x="${f(bx)}" y="0" width="${f(b.w)}" height="${H}" fill="${b.col}"/>`);
    if (b.kind === "diamonds") {
      for (let y = 30; y < H; y += 44) {
        const cx = bx + b.w / 2;
        const s = 7;
        out.push(
          `<path d="M${f(cx)} ${y - s} L${f(cx + s)} ${y} L${f(cx)} ${y + s} L${f(cx - s)} ${y} Z" fill="${C.gold}"/>`,
          `<rect x="${f(cx - 1.5)}" y="${y - 1.5}" width="3" height="3" fill="${C.forest}"/>`,
          `<circle cx="${f(cx)}" cy="${y + 22}" r="1.6" fill="${C.cream}" opacity="0.8"/>`,
        );
      }
    }
    if (b.kind === "checker") {
      const s = b.w / 3;
      for (let y = 0, row = 0; y < H; y += s, row++) {
        for (let k = 0; k < 3; k++) {
          if ((row + k) % 2 === 0)
            out.push(`<rect x="${f(bx + k * s)}" y="${f(y)}" width="${f(s)}" height="${f(s)}" fill="${C.cream}" opacity="0.9"/>`);
        }
      }
    }
    if (b.kind === "weft") {
      for (let y = 0; y < H; y += 9) {
        out.push(`<rect x="${f(bx)}" y="${y}" width="${f(b.w)}" height="3" fill="${C.ink}" opacity="0.12"/>`);
      }
    }
  };
  for (const b of bands) drawBand(b, false);
  for (const b of bands) drawBand(b, true);

  // Lisières haute et basse : damier et bandes
  const selvedge = (top) => {
    const y0 = top ? 0 : H;
    const s = top ? 1 : -1;
    const rows = [
      [10, C.ink],
      [6, C.gold],
      ["checker", 16],
      ["checker2", 16],
      [5, C.cream],
      [26, C.forest],
      [4, C.gold],
      [3, C.ink],
    ];
    let yy = 0;
    for (const row of rows) {
      if (row[0] === "checker" || row[0] === "checker2") {
        const sz = row[1];
        const off = row[0] === "checker2" ? 1 : 0;
        out.push(`<rect x="0" y="${top ? yy : H - yy - sz}" width="${W}" height="${sz}" fill="${C.ink}"/>`);
        for (let k = 0; k * sz < W; k++) {
          if ((k + off) % 2 === 0)
            out.push(`<rect x="${k * sz}" y="${top ? yy : H - yy - sz}" width="${sz}" height="${sz}" fill="${C.gold}"/>`);
        }
        yy += sz;
      } else {
        const [h, col] = row;
        out.push(`<rect x="0" y="${top ? yy : H - yy - h}" width="${W}" height="${h}" fill="${col}"/>`);
        yy += h;
      }
    }
    // Petits triangles tissés sous la lisière
    const ty = top ? yy : H - yy;
    for (let k = 0; k * 24 < W; k++) {
      const tx = k * 24;
      out.push(
        `<path d="M${tx} ${ty} L${tx + 12} ${ty + s * 12} L${tx + 24} ${ty} Z" fill="${C.forest}" opacity="0.9"/>`,
      );
    }
    void y0;
  };
  selvedge(true);
  selvedge(false);

  // Trame horizontale sur toute l'étoffe
  const weave = [];
  for (let y = 0; y < H; y += 4) {
    weave.push(`<rect x="0" y="${y}" width="${W}" height="1.3" fill="${y % 8 === 0 ? "#000" : "#fff"}" opacity="${y % 8 === 0 ? 0.07 : 0.035}"/>`);
  }
  out.push(`<g>${weave.join("")}</g>`);
  out.push(`<rect width="${W}" height="${H}" filter="url(#grain)"/>`);

  return svgWrap(grainDefs("grain", 7, 0.1), out.join("\n"));
}

/* =========================================================
 * 2. BOGOLAN — l'argile et la terre
 * ========================================================= */
export function bogolan() {
  const r = rng(1984);
  const out = [];
  const B = 104; // bande sombre extérieure
  out.push(`<rect width="${W}" height="${H}" fill="${C.ecru}"/>`);
  out.push(`<rect width="${W}" height="${H}" filter="url(#mottle)"/>`);

  // Bande sombre extérieure
  out.push(
    `<path fill-rule="evenodd" fill="${C.mud}" d="M0 0 H${W} V${H} H0 Z M${B} ${B} V${H - B} H${W - B} V${B} Z"/>`,
  );
  // Motifs clairs dans la bande sombre : rangées de points et croix
  const light = [];
  const along = (len, cb) => {
    for (let t = 40; t < len - 40; t += 26) cb(t);
  };
  // haut et bas
  for (const yy of [B / 2, H - B / 2]) {
    along(W, (t) => {
      if (Math.round(t / 26) % 6 === 0) {
        light.push(`<path d="${handLine(r, t - 12, yy, t + 12, yy, 1.4, 3)} ${handLine(r, t, yy - 12, t, yy + 12, 1.4, 3)}" stroke="${C.ecru}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`);
      } else {
        light.push(`<circle cx="${f(t + (r() - 0.5) * 2)}" cy="${f(yy - 14 + (r() - 0.5) * 2)}" r="${f(3.2 + r())}" fill="${C.ecru}"/>`);
        light.push(`<circle cx="${f(t + (r() - 0.5) * 2)}" cy="${f(yy + 14 + (r() - 0.5) * 2)}" r="${f(3.2 + r())}" fill="${C.ecru}"/>`);
      }
    });
  }
  // gauche et droite : zigzag
  for (const xx of [B / 2, W - B / 2]) {
    const pts = [];
    for (let y = B, k = 0; y <= H - B; y += 22, k++) pts.push([xx + (k % 2 ? 16 : -16), y]);
    light.push(`<path d="${handPoly(r, pts, 2)}" stroke="${C.ecru}" stroke-width="4.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`);
    for (let y = B + 11; y < H - B; y += 44) {
      light.push(`<circle cx="${xx}" cy="${y}" r="2.6" fill="${C.ecru}" opacity="0.85"/>`);
    }
  }
  // Doubles filets clairs au bord intérieur de la bande
  for (const inset of [B - 12, B - 6]) {
    light.push(
      `<path d="${handPoly(r, [[inset, inset], [W - inset, inset], [W - inset, H - inset], [inset, H - inset]], 1.6, true)}" stroke="${C.ecru}" stroke-width="2" fill="none" opacity="0.9"/>`,
    );
  }
  out.push(`<g>${light.join("")}</g>`);

  // Anneau de cases avec motifs sombres
  const cell = 96;
  const ring0 = B + 22;
  const motifs = [];
  const stroke = `stroke="${C.mud}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const drawMotif = (k, x, y) => {
    const c = cell / 2;
    const mx = x + c;
    const my = y + c;
    switch (k % 8) {
      case 0: // croix et points
        motifs.push(`<path d="${handLine(r, mx - 26, my, mx + 26, my)} ${handLine(r, mx, my - 26, mx, my + 26)}" ${stroke}/>`);
        for (const [dx, dy] of [[-15, -15], [15, -15], [-15, 15], [15, 15]])
          motifs.push(`<circle cx="${f(mx + dx)}" cy="${f(my + dy)}" r="4.2" fill="${C.mud}"/>`);
        break;
      case 1: // cercles concentriques
        motifs.push(`<path d="${handCircle(r, mx, my, 27)}" ${stroke}/>`);
        motifs.push(`<path d="${handCircle(r, mx, my, 15)}" ${stroke}/>`);
        motifs.push(`<circle cx="${mx}" cy="${my}" r="4.5" fill="${C.mud}"/>`);
        break;
      case 2: // trois zigzags
        for (const dy of [-16, 0, 16]) {
          const pts = [];
          for (let i = 0; i <= 6; i++) pts.push([mx - 30 + i * 10, my + dy + (i % 2 ? -6 : 6)]);
          motifs.push(`<path d="${handPoly(r, pts, 1.4)}" ${stroke}/>`);
        }
        break;
      case 3: // peigne
        motifs.push(`<path d="${handLine(r, mx - 30, my + 12, mx + 30, my + 12)}" ${stroke}/>`);
        for (let i = 0; i < 6; i++) {
          const tx = mx - 25 + i * 10;
          motifs.push(`<path d="${handLine(r, tx, my + 12, tx, my - 18 + (i % 2) * 8, 1, 3)}" ${stroke}/>`);
        }
        break;
      case 4: // losange pointé
        motifs.push(`<path d="${handPoly(r, [[mx, my - 30], [mx + 30, my], [mx, my + 30], [mx - 30, my]], 1.6, true)}" ${stroke}/>`);
        motifs.push(`<path d="${handPoly(r, [[mx, my - 14], [mx + 14, my], [mx, my + 14], [mx - 14, my]], 1.2, true)}" fill="${C.mud}"/>`);
        break;
      case 5: // grains de mil
        for (let i = -1; i <= 1; i++)
          for (let j = -1; j <= 1; j++)
            motifs.push(`<circle cx="${f(mx + i * 18 + (r() - 0.5) * 2)}" cy="${f(my + j * 18 + (r() - 0.5) * 2)}" r="${f(4 + r() * 1.2)}" fill="${C.mud}"/>`);
        break;
      case 6: // carrés emboîtés
        for (const s of [30, 18]) {
          motifs.push(`<path d="${handPoly(r, [[mx - s, my - s], [mx + s, my - s], [mx + s, my + s], [mx - s, my + s]], 1.6, true)}" ${stroke}/>`);
        }
        motifs.push(`<rect x="${mx - 5}" y="${my - 5}" width="10" height="10" fill="${C.mud}"/>`);
        break;
      case 7: // X et cercles
        motifs.push(`<path d="${handLine(r, mx - 24, my - 24, mx + 24, my + 24)} ${handLine(r, mx + 24, my - 24, mx - 24, my + 24)}" ${stroke}/>`);
        for (const [dx, dy] of [[0, -30], [30, 0], [0, 30], [-30, 0]])
          motifs.push(`<path d="${handCircle(r, mx + dx * 0.8, my + dy * 0.8, 5.5)}" stroke="${C.mud}" stroke-width="3" stroke-linecap="round" fill="none"/>`);
        break;
    }
  };
  // Positions des cases autour du champ central
  const cols = Math.floor((W - 2 * ring0) / cell);
  const rows = Math.floor((H - 2 * ring0) / cell);
  const ox = (W - cols * cell) / 2;
  const oy = (H - rows * cell) / 2;
  let k = 0;
  const cells = [];
  for (let i = 0; i < cols; i++) cells.push([i, 0]);
  for (let j = 1; j < rows; j++) cells.push([cols - 1, j]);
  for (let i = cols - 2; i >= 0; i--) cells.push([i, rows - 1]);
  for (let j = rows - 2; j >= 1; j--) cells.push([0, j]);
  for (const [i, j] of cells) {
    const x = ox + i * cell;
    const y = oy + j * cell;
    drawMotif(k++, x, y);
  }
  // Filets séparant les cases
  const grid = [];
  const g = `stroke="${C.mud}" stroke-width="2.2" fill="none" opacity="0.85"`;
  for (const inset of [0, cell]) {
    grid.push(`<path d="${handPoly(r, [[ox + inset, oy + inset], [W - ox - inset, oy + inset], [W - ox - inset, H - oy - inset], [ox + inset, H - oy - inset]], 1.8, true)}" ${g}/>`);
  }
  for (let i = 1; i < cols; i++) {
    const x = ox + i * cell;
    grid.push(`<path d="${handLine(r, x, oy, x, oy + cell, 1.2, 3)} ${handLine(r, x, H - oy - cell, x, H - oy, 1.2, 3)}" ${g}/>`);
  }
  for (let j = 1; j < rows; j++) {
    const y = oy + j * cell;
    grid.push(`<path d="${handLine(r, ox, y, ox + cell, y, 1.2, 3)} ${handLine(r, W - ox - cell, y, W - ox, y, 1.2, 3)}" ${g}/>`);
  }
  out.push(`<g>${grid.join("")}${motifs.join("")}</g>`);

  // Champ central : grains épars, très calmes
  const seeds = [];
  const ix0 = ox + cell + 34;
  const iy0 = oy + cell + 34;
  for (let y = iy0; y < H - iy0 + 1; y += 46) {
    for (let x = ix0 + ((y - iy0) / 46) % 2 * 23; x < W - ix0 + 1; x += 46) {
      seeds.push(`<circle cx="${f(x + (r() - 0.5) * 3)}" cy="${f(y + (r() - 0.5) * 3)}" r="${f(2 + r() * 0.8)}" fill="${C.clay}" opacity="0.42"/>`);
    }
  }
  out.push(`<g>${seeds.join("")}</g>`);
  out.push(`<rect width="${W}" height="${H}" filter="url(#grain)"/>`);

  return svgWrap(grainDefs("grain", 11, 0.12) + mottleDefs("mottle", 5, C.clay, 0.32), out.join("\n"));
}

/* =========================================================
 * 3. TIÉBÉLÉ — les murs peints
 * ========================================================= */
export function tiebele() {
  const r = rng(1972);
  const out = [];
  out.push(`<rect width="${W}" height="${H}" fill="${C.ochre}"/>`);
  out.push(`<rect width="${W}" height="${H}" filter="url(#mottle)"/>`);

  const paint = [];
  const P = (d, fill) => paint.push(`<path d="${d}" fill="${fill}"/>`);
  const tri = (a, b, c, fill) => P(handPoly(r, [a, b, c], 2, true), fill);

  // Une frise horizontale peinte. dir = 1 (haut) ou -1 (bas)
  const frieze = (top) => {
    const Y = (y) => (top ? y : H - y);
    let y = 0;
    const strip = (h, fill) => {
      P(handPoly(r, [[-4, Y(y)], [W + 4, Y(y)], [W + 4, Y(y + h)], [-4, Y(y + h)]], 2.4, true), fill);
      y += h;
    };
    strip(22, C.ink);
    // Triangles noirs pointe en bas sur chaux
    const h1 = 58;
    strip(h1, C.chaux);
    for (let x = 0; x < W; x += 50) tri([x, Y(y - h1)], [x + 50, Y(y - h1)], [x + 25, Y(y - 6)], C.ink);
    strip(12, C.ochre);
    strip(6, C.ink);
    // Damier de losanges
    const h2 = 64;
    strip(h2, C.ink);
    for (let x = 0; x < W + 64; x += 64) {
      const cy = Y(y - h2 / 2);
      P(handPoly(r, [[x, cy - (h2 / 2 - 6) * (top ? 1 : 1)], [x + 26, cy], [x, cy + (h2 / 2 - 6)], [x - 26, cy]], 1.8, true), C.chaux);
      P(handPoly(r, [[x, cy - 10], [x + 10, cy], [x, cy + 10], [x - 10, cy]], 1, true), C.ochre);
      P(handPoly(r, [[x + 32, cy - 6], [x + 38, cy], [x + 32, cy + 6], [x + 26, cy]], 0.8, true), C.chaux);
    }
    strip(6, C.ink);
    strip(14, C.ochre);
    // Zigzag épais chaux sur noir
    const h3 = 44;
    strip(h3, C.ink);
    const zz = [];
    for (let x = -20, k = 0; x <= W + 20; x += 30, k++) zz.push([x, Y(y - h3 / 2 + (k % 2 ? -10 : 10))]);
    paint.push(`<path d="${handPoly(r, zz, 1.6)}" stroke="${C.chaux}" stroke-width="9" fill="none" stroke-linejoin="miter"/>`);
    strip(12, C.ochre);
    // Petits triangles pointe en haut, alternés
    const h4 = 30;
    for (let x = 0, k = 0; x < W; x += 30, k++) {
      tri([x, Y(y + h4)], [x + 30, Y(y + h4)], [x + 15, Y(y + 4)], k % 2 ? C.ink : C.chaux);
    }
    y += h4;
    return y;
  };
  const fh = frieze(true);
  frieze(false);

  // Bandes verticales de chevrons sur les côtés
  const bw = 62;
  for (const side of [0, 1]) {
    const x0 = side ? W - bw - 26 : 26;
    P(handPoly(r, [[x0, fh + 18], [x0 + bw, fh + 18], [x0 + bw, H - fh - 18], [x0, H - fh - 18]], 2, true), C.chaux);
    for (let y = fh + 30; y < H - fh - 40; y += 30) {
      paint.push(
        `<path d="${handPoly(r, [[x0 + 8, y + 16], [x0 + bw / 2, y], [x0 + bw - 8, y + 16]], 1.2)}" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linejoin="miter"/>`,
      );
    }
    // Filet noir
    paint.push(`<path d="${handPoly(r, [[x0 - 8, fh + 10], [x0 - 8, H - fh - 10]], 1.4)}" stroke="${C.ink}" stroke-width="4"/>`);
    paint.push(`<path d="${handPoly(r, [[x0 + bw + 8, fh + 10], [x0 + bw + 8, H - fh - 10]], 1.4)}" stroke="${C.ink}" stroke-width="4"/>`);
  }

  // Champ central : treillis de points de chaux, discret
  const dots = [];
  for (let y = fh + 60; y < H - fh - 50; y += 40) {
    for (let x = 160 + (((y - fh) / 40) % 2) * 20; x < W - 150; x += 40) {
      const e = edgeness(x, y, 380, 470);
      const o = 0.15 + 0.35 * smooth(0.55, 1.1, e);
      dots.push(`<circle cx="${f(x + (r() - 0.5) * 2)}" cy="${f(y + (r() - 0.5) * 2)}" r="${f(2.4 + r())}" fill="${C.chaux}" opacity="${o.toFixed(2)}"/>`);
    }
  }
  out.push(`<g filter="url(#paint)">${paint.join("")}</g>`);
  out.push(`<g>${dots.join("")}</g>`);
  out.push(`<rect width="${W}" height="${H}" filter="url(#grain)"/>`);

  const paintFilter = `
  <filter id="paint" x="-2%" y="-2%" width="104%" height="104%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="9" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="4" xChannelSelector="R" yChannelSelector="G"/>
  </filter>`;

  return svgWrap(grainDefs("grain", 13, 0.13) + mottleDefs("mottle", 21, "#7A3418", 0.55, 0.008) + paintFilter, out.join("\n"));
}

/* =========================================================
 * 4. INDIGO DE OUAGA — la nuit élégante
 * ========================================================= */
export function indigo() {
  const r = rng(2026);
  const out = [];
  out.push(`<rect width="${W}" height="${H}" fill="${C.indigo}"/>`);
  out.push(`<rect width="${W}" height="${H}" filter="url(#mottle)"/>`);

  // Cercles réservés (teinture à la réserve), en treillis, qui s'effacent vers le centre
  const rings = [];
  const step = 92;
  for (let row = 0, y = 40; y < H + step; y += step * 0.866, row++) {
    for (let x = row % 2 ? step / 2 : 0; x < W + step; x += step) {
      const e = edgeness(x, y);
      const o = smooth(0.62, 1.12, e);
      if (o < 0.04) continue;
      const g = [];
      g.push(`<path d="${handCircle(r, x, y, 30, 0.08)}" stroke="${C.indigoLight}" stroke-width="5" fill="none"/>`);
      g.push(`<path d="${handCircle(r, x, y, 18, 0.1)}" stroke="${C.indigoLight}" stroke-width="3" fill="none" opacity="0.8"/>`);
      g.push(`<circle cx="${f(x)}" cy="${f(y)}" r="5" fill="${C.indigoLight}" opacity="0.9"/>`);
      rings.push(`<g opacity="${(o * 0.75).toFixed(2)}">${g.join("")}</g>`);
    }
  }
  out.push(`<g filter="url(#dye)">${rings.join("")}</g>`);

  // Points de couture (réserve cousue) entre les rangées, près des bords
  const stitches = [];
  for (let y = 40 + step * 0.433; y < H; y += step * 0.866) {
    for (let x = 6; x < W; x += 14) {
      const o = smooth(0.7, 1.15, edgeness(x, y));
      if (o < 0.05) continue;
      stitches.push(`<rect x="${f(x)}" y="${f(y - 1 + (r() - 0.5))}" width="7" height="2" rx="1" fill="${C.indigoLight}" opacity="${(o * 0.45).toFixed(2)}"/>`);
    }
  }
  out.push(`<g>${stitches.join("")}</g>`);

  // Cadre doré, double filet, coins étoilés
  const gold = [];
  const frame = (inset, w, o) =>
    gold.push(`<rect x="${inset}" y="${inset}" width="${W - 2 * inset}" height="${H - 2 * inset}" fill="none" stroke="${C.gold}" stroke-width="${w}" opacity="${o}"/>`);
  frame(54, 2.2, 0.95);
  frame(66, 1, 0.7);
  const star = (cx, cy, R, rr, n = 8) => {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
      const rad = i % 2 ? rr : R;
      pts.push(`${f(cx + Math.cos(a) * rad)} ${f(cy + Math.sin(a) * rad)}`);
    }
    return `M${pts.join(" L")} Z`;
  };
  for (const [cx, cy] of [[60, 60], [W - 60, 60], [60, H - 60], [W - 60, H - 60]]) {
    gold.push(`<circle cx="${cx}" cy="${cy}" r="22" fill="${C.indigo}"/>`);
    gold.push(`<path d="${star(cx, cy, 18, 6)}" fill="${C.gold}"/>`);
    gold.push(`<circle cx="${cx}" cy="${cy}" r="3" fill="${C.indigo}"/>`);
  }
  // Petites étoiles d'or semées vers les bords
  for (let i = 0; i < 70; i++) {
    const x = 90 + r() * (W - 180);
    const y = 90 + r() * (H - 180);
    const e = edgeness(x, y);
    if (e < 0.95) continue;
    const s = 2.5 + r() * 3.5;
    gold.push(`<path d="${star(x, y, s, s * 0.35, 4)}" fill="${C.gold}" opacity="${(0.55 + r() * 0.4).toFixed(2)}"/>`);
  }
  // Losanges dorés au milieu des côtés
  for (const [cx, cy] of [[CX, 60], [CX, H - 60], [60, CY], [W - 60, CY]]) {
    gold.push(`<path d="M${cx} ${cy - 14} L${cx + 14} ${cy} L${cx} ${cy + 14} L${cx - 14} ${cy} Z" fill="${C.indigo}" stroke="${C.gold}" stroke-width="2"/>`);
    gold.push(`<circle cx="${cx}" cy="${cy}" r="3" fill="${C.gold}"/>`);
  }
  out.push(`<g>${gold.join("")}</g>`);
  out.push(`<rect width="${W}" height="${H}" filter="url(#grain)"/>`);

  const dye = `
  <filter id="dye" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="4" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feGaussianBlur in="d" stdDeviation="1.1"/>
  </filter>`;
  return svgWrap(grainDefs("grain", 17, 0.08) + mottleDefs("mottle", 33, C.indigoMid, 0.6, 0.005) + dye, out.join("\n"));
}

