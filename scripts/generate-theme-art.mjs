/**
 * Génère les fonds d'invitation (sans aucun texte) selon la philosophie
 * « Trame Vivante » (design/art/philosophie-visuelle.md) : 10 styles × 10 coloris = 100 fonds.
 *
 *   npm run art
 *
 * Sorties :
 *   design/art/<style>.svg                     source vectorielle de chaque style
 *   public/demo/themes/<style>--<coloris>.webp image légère pour le site (800 px, ~50-130 Ko)
 *   config/theme-colors.json                   couleur moyenne de chaque fond
 *
 * Variable PREVIEW_DIR : écrit aussi des planches de contrôle (PNG).
 */
import { readFileSync } from "node:fs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { sharp } from "./art-lib.mjs";
import { adinkra, ardoise, coton, savane, senoufo, wax } from "./art-styles-2.mjs";
import { bogolan, fasoDanFani, indigo, tiebele } from "./art-styles-1.mjs";

/** Les 10 styles (l'ordre est celui de l'interface). */
export const STYLES = [
  { id: "faso-dan-fani", fn: fasoDanFani },
  { id: "bogolan", fn: bogolan },
  { id: "tiebele", fn: tiebele },
  { id: "indigo", fn: indigo },
  { id: "wax", fn: wax },
  { id: "senoufo", fn: senoufo },
  { id: "adinkra", fn: adinkra },
  { id: "savane", fn: savane },
  { id: "coton", fn: coton },
  { id: "ardoise", fn: ardoise },
];

/** Les 10 coloris : rotation de teinte, saturation et luminosité appliquées au style d'origine. */
export const COLORWAYS = [
  { id: "origine", hue: 0, saturation: 1, brightness: 1 },
  { id: "braise", hue: -16, saturation: 1.15, brightness: 0.95 },
  { id: "ocre", hue: 24, saturation: 1.05, brightness: 1.05 },
  { id: "olive", hue: 62, saturation: 0.95, brightness: 0.98 },
  { id: "foret", hue: 118, saturation: 0.9, brightness: 0.92 },
  { id: "lagune", hue: 168, saturation: 1, brightness: 0.98 },
  { id: "nuit", hue: 215, saturation: 1.05, brightness: 0.9 },
  { id: "prune", hue: 268, saturation: 0.95, brightness: 0.95 },
  { id: "grenade", hue: 318, saturation: 1.1, brightness: 0.98 },
  { id: "cendre", hue: 0, saturation: 0.12, brightness: 1 },
];

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const svgDir = path.join(root, "design", "art");
const webDir = path.join(root, "public", "demo", "themes");
const previewDir = process.env.PREVIEW_DIR;
const only = process.env.ONLY_STYLE; // ex. ONLY_STYLE=wax pour ne refaire qu'un style

await mkdir(svgDir, { recursive: true });
await mkdir(webDir, { recursive: true });

const hex = (n) => n.toString(16).padStart(2, "0");
async function averageColor(buf) {
  const { data } = await sharp(buf).resize(8, 8, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let r = 0, g = 0, b = 0;
  const n = data.length / 3;
  for (let i = 0; i < data.length; i += 3) { r += data[i]; g += data[i + 1]; b += data[i + 2]; }
  return `#${hex(Math.round(r / n))}${hex(Math.round(g / n))}${hex(Math.round(b / n))}`;
}

// Anciens fichiers (4 fonds sans coloris) : supprimés pour ne pas laisser de doublons
for (const old of await readdir(webDir)) if (!old.includes("--") && old.endsWith(".webp")) await rm(path.join(webDir, old));

let colors = {};
try { colors = JSON.parse(readFileSync(path.join(root, "config", "theme-colors.json"), "utf8")); } catch {}

let total = 0;
let bytes = 0;
for (const style of STYLES) {
  if (only && only !== style.id) continue;
  const svg = style.fn();
  await writeFile(path.join(svgDir, `${style.id}.svg`), svg);
  const base = await sharp(Buffer.from(svg), { density: 72 }).resize(800).png().toBuffer();

  const sheet = [];
  for (const cw of COLORWAYS) {
    const id = `${style.id}--${cw.id}`;
    const pipeline = cw.id === "origine" ? sharp(base) : sharp(base).modulate({ hue: cw.hue, saturation: cw.saturation, brightness: cw.brightness });
    const png = await pipeline.png().toBuffer();
    const webp = await sharp(png).webp({ quality: 70, effort: 5 }).toBuffer();
    await writeFile(path.join(webDir, `${id}.webp`), webp);
    colors[id] = await averageColor(png);
    bytes += webp.length;
    total++;
    if (previewDir) sheet.push(await sharp(png).resize(190).png().toBuffer());
  }
  if (previewDir) {
    await sharp({ create: { width: 190 * 5 + 6 * 4, height: 238 * 2 + 6, channels: 3, background: "#ddd" } })
      .composite(sheet.map((input, i) => ({ input, left: (i % 5) * 196, top: Math.floor(i / 5) * 244 })))
      .png()
      .toFile(path.join(previewDir, `coloris-${style.id}.png`));
  }
  console.log(`${style.id}: 10 coloris`);
}
await mkdir(path.join(root, "config"), { recursive: true });
await writeFile(path.join(root, "config", "theme-colors.json"), JSON.stringify(Object.fromEntries(Object.entries(colors).sort()), null, 1) + "\n");

if (previewDir && !only) {
  const bases = await Promise.all(STYLES.map(async (s) => sharp(path.join(webDir, `${s.id}--origine.webp`)).resize(190).png().toBuffer()));
  await sharp({ create: { width: 190 * 5 + 6 * 4, height: 238 * 2 + 6, channels: 3, background: "#ddd" } })
    .composite(bases.map((input, i) => ({ input, left: (i % 5) * 196, top: Math.floor(i / 5) * 244 })))
    .png()
    .toFile(path.join(previewDir, "styles.png"));
}
console.log(`${total} fonds générés, ${(bytes / 1024 / 1024).toFixed(1)} Mo au total (${Math.round(bytes / total / 1024)} Ko en moyenne)`);
