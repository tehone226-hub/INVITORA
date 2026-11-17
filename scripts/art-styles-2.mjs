// Styles 5 à 10 : Wax, Sénoufo, Adinkra, Savane, Coton brodé, Ardoise.
// Même principe que les 4 premiers (voir design/art/philosophie-visuelle.md) :
// bords riches et travaillés, centre calme où se posent les noms. Aucun texte dans l'image.
import { C, CX, CY, H, W, edgeness, f, grainDefs, handLine, handPoly, mottleDefs, rng, smooth, svgWrap } from "./art-lib.mjs";

const grainRect = `<rect width="${W}" height="${H}" filter="url(#grain)"/>`;

/* =========================================================
 * 5. WAX — éventails et cercles du pagne imprimé
 * ========================================================= */
export function wax() {
  const r = rng(505);
  const out = [];
  out.push(`<rect width="${W}" height="${H}" fill="${C.terracotta}"/>`);
  out.push(`<rect width="${W}" height="${H}" filter="url(#mottle)"/>`);

  // Petit quadrillage de points d'or dans le champ central
  const dots = [];
  for (let y = 150; y < H - 140; y += 62) {
    for (let x = 130 + (((y - 150) / 62) % 2) * 31; x < W - 120; x += 62) {
      const e = edgeness(x, y, 470, 600);
      dots.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(2.4 + r() * 0.8)}" fill="${C.gold}" opacity="${(0.22 + 0.3 * smooth(0.4, 1, e)).toFixed(2)}"/>`);
    }
  }
  out.push(`<g>${dots.join("")}</g>`);

  const R = 74;
  const palette = [C.cream, C.forest, C.gold, C.terracottaDark, C.ink];
  const fan = (cx, cy) => {
    const g = [];
    palette.forEach((col, i) => {
      const rr = R * (1 - i * 0.19);
      g.push(`<path d="M${f(cx - rr)} ${f(cy)} A${f(rr)} ${f(rr)} 0 0 1 ${f(cx + rr)} ${f(cy)} Z" fill="${col}"/>`);
    });
    g.push(`<path d="M${f(cx - R)} ${f(cy)} H${f(cx + R)}" stroke="${C.ink}" stroke-width="2" opacity=".5"/>`);
    return g.join("");
  };

  // Bandeau supérieur d'éventails en quinconce (3 rangées), recopié en miroir en bas
  const band = [];
  band.push(`<rect x="0" y="0" width="${W}" height="236" fill="${C.terracottaDark}"/>`);
  for (let row = 0; row < 3; row++) {
    const cy = 118 + row * 46;
    for (let x = row % 2 ? 0 : -R; x < W + R; x += R * 2) band.push(fan(x + R, cy));
  }
  band.push(`<rect x="0" y="236" width="${W}" height="9" fill="${C.ink}"/>`);
  band.push(`<rect x="0" y="245" width="${W}" height="4" fill="${C.gold}"/>`);
  for (let x = 20; x < W; x += 40) band.push(`<circle cx="${x}" cy="268" r="5" fill="${C.cream}" opacity=".85"/>`);
  out.push(`<g>${band.join("")}</g>`);
  out.push(`<g transform="translate(0 ${H}) scale(1 -1)">${band.join("")}</g>`);

  // Colonnes de cercles concentriques sur les côtés
  const ring = (cx, cy, rr) => {
    const cols = [C.cream, C.ink, C.gold, C.forest, C.cream, C.terracottaDark];
    return cols.map((col, i) => `<circle cx="${cx}" cy="${cy}" r="${f(rr * (1 - i * 0.17))}" fill="${col}"/>`).join("");
  };
  const side = [];
  for (let y = 330; y <= H - 330; y += 118) {
    side.push(ring(96, y, 46), ring(W - 96, y, 46));
  }
  side.push(`<rect x="160" y="276" width="3" height="${H - 552}" fill="${C.gold}" opacity=".8"/>`);
  side.push(`<rect x="${W - 163}" y="276" width="3" height="${H - 552}" fill="${C.gold}" opacity=".8"/>`);
  out.push(`<g>${side.join("")}</g>`);

  // Cadre fin intérieur
  out.push(`<rect x="196" y="316" width="${W - 392}" height="${H - 632}" rx="6" fill="none" stroke="${C.cream}" stroke-width="2" opacity=".55"/>`);
  out.push(grainRect);
  return svgWrap(grainDefs("grain", 31, 0.1) + mottleDefs("mottle", 15, C.terracottaDark, 0.45, 0.007), out.join("\n"));
}

/* =========================================================
 * 6. SÉNOUFO — le tissu peint de Korhogo
 * ========================================================= */
export function senoufo() {
  const r = rng(606);
  const out = [];
  const FIELD = "#D9B67C";
  const BROWN = "#2F2016";
  out.push(`<rect width="${W}" height="${H}" fill="${FIELD}"/>`);
  out.push(`<rect width="${W}" height="${H}" filter="url(#mottle)"/>`);

  const paint = [];
  const rect = (x, y, w, h, fill) => paint.push(`<path d="${handPoly(r, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 2, true)}" fill="${fill}"/>`);
  const strokeP = (d, w, col = BROWN, extra = "") => paint.push(`<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`);

  const frieze = (y0) => {
    let y = y0;
    rect(-4, y, W + 8, 12, BROWN); y += 26;
    // losanges avec point
    for (let x = 36; x < W; x += 72) {
      paint.push(`<path d="${handPoly(r, [[x, y], [x + 30, y + 30], [x, y + 60], [x - 30, y + 30]], 1.6, true)}" fill="none" stroke="${BROWN}" stroke-width="5"/>`);
      paint.push(`<circle cx="${x}" cy="${y + 30}" r="7" fill="${C.terracottaDark}"/>`);
      paint.push(`<circle cx="${x + 36}" cy="${y + 30}" r="3.2" fill="${BROWN}"/>`);
    }
    y += 82;
    rect(-4, y, W + 8, 5, BROWN); rect(-4, y + 12, W + 8, 5, BROWN); y += 36;
    // poissons stylisés
    for (let x = 30; x < W; x += 112) {
      strokeP(`M${x} ${y + 22} Q${x + 36} ${y - 2} ${x + 72} ${y + 22} Q${x + 36} ${y + 46} ${x} ${y + 22} Z`, 5);
      strokeP(`M${x + 72} ${y + 22} L${x + 98} ${y + 4} M${x + 72} ${y + 22} L${x + 98} ${y + 40}`, 5);
      strokeP(`M${x + 14} ${y + 22} H${x + 62}`, 3);
      paint.push(`<circle cx="${x + 18}" cy="${y + 18}" r="3.6" fill="${BROWN}"/>`);
      paint.push(`<circle cx="${x + 52}" cy="${y + 22}" r="4.6" fill="${C.terracottaDark}"/>`);
    }
    y += 70;
    // zigzag épais
    const zz = [];
    for (let x = -20, k = 0; x <= W + 20; x += 30, k++) zz.push([x, y + (k % 2 ? 0 : 30)]);
    strokeP(handPoly(r, zz, 1.6), 9);
    y += 56;
    rect(-4, y, W + 8, 12, BROWN);
    return y + 12;
  };
  const yEnd = frieze(0);
  paint.push(`<g transform="translate(0 ${H}) scale(1 -1)">`);
  frieze(0);
  paint.push(`</g>`);

  // Colonnes latérales : zigzag vertical + points
  for (const x0 of [64, W - 64]) {
    const pts = [];
    for (let y = yEnd + 40, k = 0; y < H - yEnd - 40; y += 36, k++) pts.push([x0 + (k % 2 ? 20 : -20), y]);
    strokeP(handPoly(r, pts, 2), 7);
    for (let y = yEnd + 58; y < H - yEnd - 50; y += 72) paint.push(`<circle cx="${x0}" cy="${y}" r="6" fill="${C.terracottaDark}"/>`);
  }
  // Croix éparses dans le champ central
  for (let y = yEnd + 120; y < H - yEnd - 90; y += 120) {
    for (let x = 220 + (((y - yEnd) / 120) % 2) * 60; x < W - 200; x += 120) {
      const e = edgeness(x, y, 420, 520);
      if (e < 0.35 || r() > 0.55) continue;
      strokeP(`${handLine(r, x - 9, y, x + 9, y, 1, 2)} ${handLine(r, x, y - 9, x, y + 9, 1, 2)}`, 3.4, BROWN, `opacity="${(0.25 + 0.35 * e).toFixed(2)}"`);
    }
  }
  out.push(`<g filter="url(#paint)">${paint.join("")}</g>`);
  out.push(grainRect);
  const paintFilter = `<filter id="paint" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="12" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  return svgWrap(grainDefs("grain", 41, 0.12) + mottleDefs("mottle", 27, "#9A6B36", 0.5, 0.007) + paintFilter, out.join("\n"));
}

/* =========================================================
 * 7. ADINKRA — le tissu estampé
 * ========================================================= */
export function adinkra() {
  const r = rng(707);
  const out = [];
  const CLOTH = "#241913";
  out.push(`<rect width="${W}" height="${H}" fill="${CLOTH}"/>`);
  out.push(`<rect width="${W}" height="${H}" filter="url(#mottle)"/>`);

  // Cadres dorés
  const gold = [];
  for (const [inset, w, o] of [[40, 3, 0.95], [56, 1.4, 0.7], [72, 1.4, 0.5]]) {
    gold.push(`<path d="${handPoly(r, [[inset, inset], [W - inset, inset], [W - inset, H - inset], [inset, H - inset]], 1.4, true)}" stroke="${C.gold}" stroke-width="${w}" fill="none" opacity="${o}"/>`);
  }

  // Symboles estampés (géométrie abstraite) dans la couronne extérieure
  const spiral = (cx, cy, s) => {
    const pts = [];
    for (let t = 0; t <= 5.2 * Math.PI; t += 0.35) pts.push([cx + Math.cos(t) * (3 + t * s * 0.9), cy + Math.sin(t) * (3 + t * s * 0.9)]);
    return `<path d="M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")}" fill="none"/>`;
  };
  const glyphs = [
    (x, y, s) => `<circle cx="${x}" cy="${y}" r="${s}" fill="none"/><circle cx="${x}" cy="${y}" r="${s * 0.62}" fill="none"/><circle cx="${x}" cy="${y}" r="${s * 0.22}" fill="currentColor" stroke="none"/>`,
    (x, y, s) => spiral(x, y, s * 0.12),
    (x, y, s) => `<rect x="${x - s}" y="${y - s}" width="${s * 2}" height="${s * 2}" fill="none"/><path d="M${x - s} ${y} H${x + s} M${x} ${y - s} V${y + s}" />`,
    (x, y, s) => `<path d="M${x} ${y - s} L${x + s} ${y} L${x} ${y + s} L${x - s} ${y} Z" fill="none"/><path d="M${x} ${y - s * 0.5} L${x + s * 0.5} ${y} L${x} ${y + s * 0.5} L${x - s * 0.5} ${y} Z" fill="none"/>`,
    (x, y, s) => `<path d="M${x - s} ${y - s * 0.2} L${x} ${y - s} L${x + s} ${y - s * 0.2} M${x - s} ${y + s * 0.5} L${x} ${y - s * 0.3} L${x + s} ${y + s * 0.5}" fill="none"/>`,
    (x, y, s) => `<path d="M${x - s} ${y} H${x + s} M${x} ${y - s} V${y + s} M${x - s * 0.7} ${y - s * 0.7} L${x + s * 0.7} ${y + s * 0.7} M${x + s * 0.7} ${y - s * 0.7} L${x - s * 0.7} ${y + s * 0.7}" fill="none"/><circle cx="${x}" cy="${y}" r="${s * 0.5}" fill="none"/>`,
  ];
  const stamps = [];
  const cell = 108;
  let k = 0;
  for (let j = 0; j * cell + 130 < H - 100; j++) {
    for (let i = 0; i * cell + 130 < W - 100; i++) {
      const x = 130 + i * cell;
      const y = 130 + j * cell;
      if (edgeness(x, y, 470, 600) < 0.78) continue;
      const col = (i + j) % 3 === 0 ? C.cream : C.gold;
      const g = glyphs[(i * 2 + j * 3 + k++) % glyphs.length];
      stamps.push(`<g stroke="${col}" color="${col}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" opacity="${(0.82 + r() * 0.15).toFixed(2)}" transform="rotate(${f((r() - 0.5) * 5)} ${x} ${y})">${g(x, y, 30)}</g>`);
    }
  }
  out.push(`<g filter="url(#stamp)">${stamps.join("")}</g>`);
  out.push(`<g>${gold.join("")}</g>`);
  // Petits points d'or dans le champ central
  const seeds = [];
  for (let n = 0; n < 60; n++) {
    const x = 220 + r() * (W - 440);
    const y = 260 + r() * (H - 520);
    if (edgeness(x, y) > 0.6) continue;
    seeds.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.2 + r() * 1.4)}" fill="${C.gold}" opacity="${(0.15 + r() * 0.2).toFixed(2)}"/>`);
  }
  out.push(`<g>${seeds.join("")}</g>`);
  out.push(grainRect);
  const stamp = `<filter id="stamp" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="5" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="3.4" xChannelSelector="R" yChannelSelector="G" result="d"/><feComponentTransfer in="d"><feFuncA type="discrete" tableValues="0 0.55 0.8 1"/></feComponentTransfer></filter>`;
  return svgWrap(grainDefs("grain", 51, 0.1) + mottleDefs("mottle", 61, "#4A3626", 0.28, 0.006) + stamp, out.join("\n"));
}

/* =========================================================
 * 8. SAVANE — les épis de mil au soleil bas
 * ========================================================= */
export function savane() {
  const r = rng(808);
  const out = [];
  const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6EBCB"/><stop offset=".55" stop-color="#EBD39B"/><stop offset="1" stop-color="#DDB76B"/></linearGradient>
  <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#F2C45A" stop-opacity=".55"/><stop offset="1" stop-color="#F2C45A" stop-opacity="0"/></radialGradient>`;
  out.push(`<rect width="${W}" height="${H}" fill="url(#sky)"/>`);
  out.push(`<circle cx="${CX}" cy="${CY - 150}" r="430" fill="url(#sun)"/>`);
  out.push(`<rect width="${W}" height="${H}" filter="url(#mottle)"/>`);

  const OLIVE = "#66723A";
  const OLIVE2 = "#8A9457";
  const HEAD = ["#B47A2E", C.terracotta, "#C99A3F"];
  const stalk = (x, baseY, h, lean, col, op, w, headCol) => {
    const topX = x + lean;
    const topY = baseY - h;
    const cx = x + lean * 0.15;
    const cy = baseY - h * 0.55;
    const g = [`<path d="M${f(x)} ${f(baseY)} Q${f(cx)} ${f(cy)} ${f(topX)} ${f(topY)}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${op}"/>`];
    // feuilles
    for (let t = 0.12; t < 0.72; t += 0.17) {
      const px = x + (topX - x) * t * 0.9 + lean * 0.05;
      const py = baseY - h * t;
      const side = (Math.round(t * 100) % 2) ? 1 : -1;
      g.push(`<ellipse cx="${f(px + side * 22)}" cy="${f(py - 12)}" rx="26" ry="5.5" fill="${col}" opacity="${op}" transform="rotate(${side * -28} ${f(px + side * 22)} ${f(py - 12)})"/>`);
    }
    // épi
    g.push(`<ellipse cx="${f(topX)}" cy="${f(topY - 26)}" rx="9" ry="30" fill="${headCol}" opacity="${op}" transform="rotate(${f(lean * 0.25)} ${f(topX)} ${f(topY - 26)})"/>`);
    for (let i = 0; i < 5; i++) g.push(`<path d="M${f(topX)} ${f(topY - 8 - i * 11)} l${i % 2 ? 10 : -10} -7" stroke="${headCol}" stroke-width="2" opacity="${op}"/>`);
    return g.join("");
  };

  const back = [];
  const front = [];
  for (let x = -10; x < W + 40; x += 38) {
    const ex = Math.abs(x - CX) / CX;
    const h = 150 + 620 * Math.pow(ex, 1.6) + r() * 90;
    back.push(stalk(x + r() * 12, H + 20, h * 0.86, (x < CX ? 1 : -1) * (14 + r() * 22) * (0.4 + ex), OLIVE2, 0.55, 3.4, HEAD[(x / 38) | 0 % 3] ?? HEAD[0]));
  }
  for (let x = 12; x < W + 40; x += 52) {
    const ex = Math.abs(x - CX) / CX;
    const h = 190 + 700 * Math.pow(ex, 1.5) + r() * 110;
    front.push(stalk(x + r() * 10, H + 30, h, (x < CX ? 1 : -1) * (16 + r() * 26) * (0.4 + ex), OLIVE, 0.92, 4.4, HEAD[Math.floor(r() * 3)]));
  }
  out.push(`<g>${back.join("")}</g><g>${front.join("")}</g>`);

  // Grains flottants en haut des bords
  const seeds = [];
  for (let n = 0; n < 90; n++) {
    const x = r() * W;
    const y = r() * 520;
    const ex = Math.abs(x - CX) / CX;
    if (ex < 0.55) continue;
    seeds.push(`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(2 + r() * 2)}" ry="${f(3.5 + r() * 3)}" fill="${HEAD[n % 3]}" opacity="${(0.35 + r() * 0.4).toFixed(2)}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`);
  }
  out.push(`<g>${seeds.join("")}</g>`);
  out.push(`<path d="${handPoly(r, [[34, 34], [W - 34, 34], [W - 34, H - 34], [34, H - 34]], 1.2, true)}" fill="none" stroke="${C.terracotta}" stroke-width="2" opacity=".55"/>`);
  out.push(grainRect);
  return svgWrap(defs + grainDefs("grain", 71, 0.08) + mottleDefs("mottle", 81, "#C99A3F", 0.35, 0.006), out.join("\n"));
}

/* =========================================================
 * 9. COTON BRODÉ — la dentelle de fil vert et or
 * ========================================================= */
export function coton() {
  const r = rng(909);
  const out = [];
  const CREAM = "#F7EFDE";
  const GREEN = "#2F6B50";
  const defs = `<pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="3" fill="#000" opacity=".03"/><rect width="3" height="6" fill="#000" opacity=".025"/></pattern>`;
  out.push(`<rect width="${W}" height="${H}" fill="${CREAM}"/>`);
  out.push(`<rect width="${W}" height="${H}" fill="url(#weave)"/>`);
  out.push(`<rect width="${W}" height="${H}" filter="url(#mottle)"/>`);

  // Bordure festonnée
  const inset = 52;
  const rad = 26;
  const sc = [];
  const arc = (x1, y1, x2, y2, sweep) => `M${f(x1)} ${f(y1)} A${rad} ${rad} 0 0 ${sweep} ${f(x2)} ${f(y2)}`;
  for (let x = inset; x + rad * 2 <= W - inset + 0.1; x += rad * 2) {
    sc.push(arc(x, inset, x + rad * 2, inset, 1), arc(x, H - inset, x + rad * 2, H - inset, 0));
  }
  for (let y = inset; y + rad * 2 <= H - inset + 0.1; y += rad * 2) {
    sc.push(arc(inset, y, inset, y + rad * 2, 0), arc(W - inset, y, W - inset, y + rad * 2, 1));
  }
  out.push(`<path d="${sc.join(" ")}" fill="none" stroke="${GREEN}" stroke-width="4.5" stroke-linecap="round"/>`);
  // Petits points d'or entre les festons
  const gd = [];
  for (let x = inset + rad; x < W - inset; x += rad * 2) gd.push(`<circle cx="${x}" cy="${inset + rad + 12}" r="3.2" fill="${C.gold}"/>`, `<circle cx="${x}" cy="${H - inset - rad - 12}" r="3.2" fill="${C.gold}"/>`);
  for (let y = inset + rad; y < H - inset; y += rad * 2) gd.push(`<circle cx="${inset + rad + 12}" cy="${y}" r="3.2" fill="${C.gold}"/>`, `<circle cx="${W - inset - rad - 12}" cy="${y}" r="3.2" fill="${C.gold}"/>`);
  out.push(`<g>${gd.join("")}</g>`);

  // Doubles cadres : point de croix vert et filet or
  out.push(`<rect x="120" y="150" width="${W - 240}" height="${H - 300}" rx="10" fill="none" stroke="${GREEN}" stroke-width="3" stroke-dasharray="9 7" opacity=".7"/>`);
  out.push(`<rect x="132" y="162" width="${W - 264}" height="${H - 324}" rx="6" fill="none" stroke="${C.gold}" stroke-width="1.6" opacity=".9"/>`);

  // Fleurs et tiges
  const flower = (cx, cy, R, petal, centre) => {
    const g = [];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      g.push(`<circle cx="${f(cx + Math.cos(a) * R * 0.52)}" cy="${f(cy + Math.sin(a) * R * 0.52)}" r="${f(R * 0.44)}" fill="${petal}" stroke="${GREEN}" stroke-width="1.6"/>`);
    }
    g.push(`<circle cx="${cx}" cy="${cy}" r="${f(R * 0.26)}" fill="${centre}"/>`);
    return g.join("");
  };
  const leaf = (x, y, ang, len = 38) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${len / 2}" ry="${len / 6}" fill="${GREEN}" opacity=".9" transform="rotate(${f(ang)} ${f(x)} ${f(y)})"/>`;
  const vine = (yBase, dir) => {
    const pts = [];
    for (let x = 180; x <= W - 180; x += 20) pts.push([x, yBase + Math.sin((x / 90) * Math.PI) * 12 * dir]);
    const g = [`<path d="M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")}" fill="none" stroke="${GREEN}" stroke-width="3.2"/>`];
    for (let x = 220; x < W - 200; x += 70) {
      const y = yBase + Math.sin((x / 90) * Math.PI) * 12 * dir;
      g.push(leaf(x, y - 12 * dir, -dir * 35), leaf(x + 22, y + 12 * dir, dir * 35, 32));
    }
    return g.join("");
  };
  const vines = [vine(215, 1), vine(H - 215, -1)];
  const flowers = [];
  for (const [x, y] of [[200, 215], [W - 200, 215], [200, H - 215], [W - 200, H - 215]]) flowers.push(flower(x, y, 46, C.terracotta, C.gold));
  for (const [x, y] of [[CX, 215], [CX, H - 215]]) flowers.push(flower(x, y, 40, C.gold, C.terracotta));
  for (const y of [CY - 200, CY, CY + 200]) {
    flowers.push(flower(176, y, 22, C.gold, C.terracotta), flower(W - 176, y, 22, C.gold, C.terracotta));
  }
  out.push(`<g>${vines.join("")}</g><g>${flowers.join("")}</g>`);

  // Points de croix très discrets au centre
  const xs = [];
  for (let y = 380; y < H - 360; y += 64) {
    for (let x = 250 + (((y - 380) / 64) % 2) * 32; x < W - 240; x += 64) {
      if (r() > 0.22) continue;
      xs.push(`<path d="M${x - 5} ${y - 5} L${x + 5} ${y + 5} M${x + 5} ${y - 5} L${x - 5} ${y + 5}" stroke="${GREEN}" stroke-width="2" opacity=".16"/>`);
    }
  }
  out.push(`<g>${xs.join("")}</g>`);
  out.push(grainRect);
  return svgWrap(defs + grainDefs("grain", 91, 0.06) + mottleDefs("mottle", 97, "#D9C49A", 0.4, 0.006), out.join("\n"));
}

/* =========================================================
 * 10. ARDOISE — filets d'or sur vert profond
 * ========================================================= */
export function ardoise() {
  const r = rng(1010);
  const out = [];
  const defs = `<radialGradient id="deep" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#1D4A3A"/><stop offset="1" stop-color="#0F2A20"/></radialGradient>
  <radialGradient id="edge" cx=".5" cy=".5" r=".72"><stop offset=".45" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
  <mask id="belt"><rect width="${W}" height="${H}" fill="url(#edge)"/></mask>`;
  out.push(`<rect width="${W}" height="${H}" fill="url(#deep)"/>`);
  out.push(`<rect width="${W}" height="${H}" filter="url(#mottle)"/>`);

  // Treillis losangé fin, visible seulement vers les bords
  const lat = [];
  for (let k = -H; k < W + H; k += 58) {
    lat.push(`M${k} 0 L${k + H} ${H}`, `M${k + H} 0 L${k} ${H}`);
  }
  out.push(`<g mask="url(#belt)"><path d="${lat.join(" ")}" stroke="${C.gold}" stroke-width="1.2" opacity=".38" fill="none"/></g>`);

  // Cadres dorés
  const gold = [];
  for (const [inset, w, o] of [[44, 3.2, 1], [60, 1.2, 0.8], [118, 1.2, 0.55]]) {
    gold.push(`<rect x="${inset}" y="${inset}" width="${W - inset * 2}" height="${H - inset * 2}" rx="${inset === 118 ? 6 : 2}" fill="none" stroke="${C.gold}" stroke-width="${w}" opacity="${o}"/>`);
  }
  // Coins : arcs concentriques et rayons (éventail)
  const corner = (cx, cy, sx, sy) => {
    const g = [];
    for (const rr of [150, 118, 86, 54]) {
      g.push(`<path d="M${cx + sx * rr} ${cy} A${rr} ${rr} 0 0 ${sx * sy > 0 ? 1 : 0} ${cx} ${cy + sy * rr}" fill="none" stroke="${C.gold}" stroke-width="${rr === 54 ? 2.4 : 1.4}" opacity=".9"/>`);
    }
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * (Math.PI / 2);
      g.push(`<path d="M${cx} ${cy} L${f(cx + sx * Math.cos(a) * 150)} ${f(cy + sy * Math.sin(a) * 150)}" stroke="${C.gold}" stroke-width="1" opacity=".55"/>`);
    }
    g.push(`<circle cx="${cx}" cy="${cy}" r="9" fill="${C.gold}"/>`);
    return g.join("");
  };
  gold.push(corner(44, 44, 1, 1), corner(W - 44, 44, -1, 1), corner(44, H - 44, 1, -1), corner(W - 44, H - 44, -1, -1));
  // Éventail au milieu des bords haut et bas
  const fanTop = (cy, sy) => {
    const g = [];
    for (let i = -10; i <= 10; i++) {
      const a = (i / 10) * 1.05;
      g.push(`<path d="M${CX} ${cy} L${f(CX + Math.sin(a) * 120)} ${f(cy + sy * Math.cos(a) * 120)}" stroke="${C.gold}" stroke-width="1.2" opacity=".7"/>`);
    }
    for (const rr of [60, 90, 120]) g.push(`<path d="M${f(CX - Math.sin(1.05) * rr)} ${f(cy + sy * Math.cos(1.05) * rr)} A${rr} ${rr} 0 0 ${sy > 0 ? 0 : 1} ${f(CX + Math.sin(1.05) * rr)} ${f(cy + sy * Math.cos(1.05) * rr)}" fill="none" stroke="${C.gold}" stroke-width="1.3" opacity=".8"/>`);
    g.push(`<circle cx="${CX}" cy="${cy}" r="7" fill="${C.gold}"/>`);
    return g.join("");
  };
  gold.push(fanTop(62, 1), fanTop(H - 62, -1));
  // Losanges au milieu des côtés
  for (const [x, y] of [[44, CY], [W - 44, CY]]) gold.push(`<path d="M${x} ${y - 22} L${x + 22} ${y} L${x} ${y + 22} L${x - 22} ${y} Z" fill="#0F2A20" stroke="${C.gold}" stroke-width="2"/>`);
  out.push(`<g>${gold.join("")}</g>`);
  // Étoiles d'or semées vers les bords
  const stars = [];
  for (let n = 0; n < 60; n++) {
    const x = 140 + r() * (W - 280);
    const y = 170 + r() * (H - 340);
    if (edgeness(x, y) < 0.9) continue;
    const s = 2 + r() * 3;
    stars.push(`<path d="M${f(x)} ${f(y - s * 2)} L${f(x + s * 0.5)} ${f(y - s * 0.5)} L${f(x + s * 2)} ${f(y)} L${f(x + s * 0.5)} ${f(y + s * 0.5)} L${f(x)} ${f(y + s * 2)} L${f(x - s * 0.5)} ${f(y + s * 0.5)} L${f(x - s * 2)} ${f(y)} L${f(x - s * 0.5)} ${f(y - s * 0.5)} Z" fill="${C.gold}" opacity="${(0.5 + r() * 0.4).toFixed(2)}"/>`);
  }
  out.push(`<g>${stars.join("")}</g>`);
  out.push(grainRect);
  return svgWrap(defs + grainDefs("grain", 111, 0.08) + mottleDefs("mottle", 117, "#2D6A52", 0.3, 0.005), out.join("\n"));
}
