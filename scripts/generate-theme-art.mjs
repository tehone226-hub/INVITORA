/**
 * Génère les fonds d'invitation (sans aucun texte) de la collection « Papier Silencieux »
 * (design/art/philosophie-visuelle.md) : 10 styles × 10 palettes = 100 fonds.
 *
 *   npm run art
 *
 * Chaque fond est dessiné à partir de sa palette (config/theme-palettes.json).
 * Sorties :
 *   design/art/<style>.svg                     source vectorielle (palette Ivoire)
 *   public/demo/themes/<style>--<coloris>.webp image légère pour le site (800 × 1000)
 *
 * Variables :
 *   ONLY_STYLE=feuillage   ne refait qu'un style
 *   PREVIEW_DIR=chemin     écrit aussi des planches de contrôle avec un texte d'exemple
 */
import { readFileSync } from "node:fs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sharp } from "./art-lib.mjs";
import { STYLES } from "./art-styles.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const svgDir = path.join(root, "design", "art");
const webDir = path.join(root, "public", "demo", "themes");
const previewDir = process.env.PREVIEW_DIR;
const only = process.env.ONLY_STYLE;

const palettes = JSON.parse(readFileSync(path.join(root, "config", "theme-palettes.json"), "utf8"));
const colorways = Object.keys(palettes);

await mkdir(svgDir, { recursive: true });
await mkdir(webDir, { recursive: true });

// Fichiers d'anciennes collections : supprimés pour ne laisser que les 100 fonds actuels
const wanted = new Set(STYLES.flatMap((s) => colorways.map((c) => `${s.id}--${c}.webp`)));
for (const file of await readdir(webDir)) if (file.endsWith(".webp") && !wanted.has(file)) await rm(path.join(webDir, file));
for (const file of await readdir(svgDir)) if (file.endsWith(".svg") && !STYLES.some((s) => `${s.id}.svg` === file)) await rm(path.join(svgDir, file));

/** Texte d'exemple posé sur une vignette de contrôle (jamais dans les fonds eux-mêmes). */
function sampleText(p, w) {
  const h = w * 1.25;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" text-anchor="middle">
    <text x="${w / 2}" y="${h * 0.39}" font-family="Arial, sans-serif" font-size="${w * 0.03}" font-weight="700" letter-spacing="${w * 0.012}" fill="${p.accent}">MARIAGE</text>
    <text x="${w / 2}" y="${h * 0.5}" font-family="Georgia, serif" font-style="italic" font-size="${w * 0.092}" fill="${p.ink}">Awa &amp; Moussa</text>
    <text x="${w / 2}" y="${h * 0.575}" font-family="Georgia, serif" font-size="${w * 0.04}" fill="${p.ink}">samedi 20 mars 2027</text>
    <text x="${w / 2}" y="${h * 0.625}" font-family="Arial, sans-serif" font-size="${w * 0.03}" fill="${p.ink}" opacity="0.7">Ouagadougou</text>
  </svg>`);
}

async function contactSheet(tiles, w, cols, file) {
  const h = Math.round(w * 1.25);
  const gap = 10;
  const rows = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: cols * w + (cols + 1) * gap, height: rows * h + (rows + 1) * gap, channels: 3, background: "#8a8a8a" } })
    .composite(tiles.map((input, i) => ({ input, left: gap + (i % cols) * (w + gap), top: gap + Math.floor(i / cols) * (h + gap) })))
    .png()
    .toFile(file);
}

/** Vue d'ensemble : chaque style dans trois palettes (claire, chaude, sombre). */
const overview = [];
const overviewPalettes = ["ivoire", "argile", "nuit"];

let total = 0;
let bytes = 0;
let heaviest = 0;
for (const style of STYLES) {
  if (only && only !== style.id) continue;
  const tiles = [];
  for (const cw of colorways) {
    const p = palettes[cw];
    const svg = style.fn(p);
    if (cw === colorways[0]) await writeFile(path.join(svgDir, `${style.id}.svg`), svg);
    const png = await sharp(Buffer.from(svg), { density: 72 }).resize(800, 1000).png().toBuffer();
    const webp = await sharp(png).webp({ quality: 72, effort: 5 }).toBuffer();
    await writeFile(path.join(webDir, `${style.id}--${cw}.webp`), webp);
    bytes += webp.length;
    heaviest = Math.max(heaviest, webp.length);
    total++;
    if (previewDir) {
      const w = 360;
      const tile = await sharp(png).resize(w).composite([{ input: sampleText(p, w) }]).png().toBuffer();
      tiles.push(tile);
      if (overviewPalettes.includes(cw)) overview.push({ style: style.id, cw, tile });
    }
  }
  if (previewDir) {
    await mkdir(previewDir, { recursive: true });
    await contactSheet(tiles, 360, 5, path.join(previewDir, `${style.id}.png`));
  }
  console.log(`${style.id} : ${colorways.length} coloris`);
}

if (previewDir && !only) {
  for (const [n, part] of [STYLES.slice(0, 5), STYLES.slice(5)].entries()) {
    const tiles = overviewPalettes.flatMap((cw) => part.map((s) => overview.find((o) => o.style === s.id && o.cw === cw).tile));
    await contactSheet(tiles, 360, 5, path.join(previewDir, `apercu-${n + 1}.png`));
  }
}

console.log(
  `${total} fonds générés, ${(bytes / 1024 / 1024).toFixed(1)} Mo au total, ${Math.round(bytes / total / 1024)} Ko en moyenne, ${Math.round(heaviest / 1024)} Ko au plus`,
);
