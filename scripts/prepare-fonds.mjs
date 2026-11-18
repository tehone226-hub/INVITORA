/**
 * Prépare les fonds d'invitation et les enveloppes à partir des images sources
 * (design/fonds-sources/) : recadrage 9:16, 720 × 1280, WebP léger.
 *
 *   npm run fonds
 *
 * Sorties : public/demo/themes/<id>.webp et public/demo/enveloppes/<id>.webp.
 * Affiche la couleur moyenne de la zone de texte de chaque fond : à reporter dans
 * config/themes.ts (champ `color`), où un test vérifie la lisibilité du texte.
 * Variable PREVIEW=<dossier> : écrit une planche de contrôle avec les zones de texte tracées.
 */
import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const srcDir = path.join(root, "design", "fonds-sources");
const W = 720;
const H = 1280;

/** id → fichier source et zone de texte en % (haut, droite, bas, gauche). Garder en phase avec config/themes.ts. */
export const FONDS = {
  "jardin--ivoire": { src: "09.jpg", zone: [33, 13, 33, 13] },
  "arche--florale": { src: "02.jpg", zone: [27, 19, 27, 19] },
  "dentelle--grenat": { src: "18.jpg", zone: [24, 16, 26, 16] },
  "satin--bordeaux": { src: "10.jpg", zone: [40, 31, 29, 9] },
  "broderie--rouge": { src: "03.jpg", zone: [22, 8, 40, 25] },
  "vannerie--sable": { src: "14.jpg", zone: [33, 6, 20, 25] },
  "vannerie--cacao": { src: "07.jpg", zone: [39, 15, 30, 17] },
  "vannerie--indigo": { src: "06.jpg", zone: [39, 22, 37, 22] },
  "vannerie--zebu": { src: "05.jpg", zone: [42, 37, 34, 12] },
  "shweshwe--marmites": { src: "08.jpg", zone: [30, 6, 38, 23] },
  "shweshwe--zebu": { src: "24.jpg", zone: [42, 6, 37, 24] },
};

export const ENVELOPPES = {
  "sceau-rouge": "21.jpg",
  "sceau-or": "19.jpg",
  lys: "20.jpg",
  cygnes: "01.jpg",
};

const hex = (n) => Math.round(n).toString(16).padStart(2, "0");
const themesDir = path.join(root, "public", "demo", "themes");
const envDir = path.join(root, "public", "demo", "enveloppes");
await mkdir(themesDir, { recursive: true });
await mkdir(envDir, { recursive: true });
// Les anciens fonds (collections précédentes) sont retirés
for (const f of await readdir(themesDir)) if (!Object.hasOwn(FONDS, f.replace(/\.webp$/, ""))) await rm(path.join(themesDir, f));

const base = (file) => sharp(path.join(srcDir, file), { failOn: "none" }).resize(W, H, { fit: "cover", position: "centre" });
const sheet = [];
let bytes = 0;
for (const [id, { src, zone }] of Object.entries(FONDS)) {
  const png = await base(src).png().toBuffer();
  const info = await sharp(png).webp({ quality: 78, effort: 5 }).toFile(path.join(themesDir, `${id}.webp`));
  bytes += info.size;
  const [t, r, b, l] = zone;
  const box = { left: Math.round((W * l) / 100), top: Math.round((H * t) / 100), width: Math.round((W * (100 - l - r)) / 100), height: Math.round((H * (100 - t - b)) / 100) };
  const { channels } = await sharp(await sharp(png).extract(box).png().toBuffer()).stats(); // stats() lit l'image d'entrée : on extrait d'abord
  // Couleur la plus sombre probable sous le texte : moyenne moins un écart-type (prudence pour le contraste)
  const avg = `#${channels.slice(0, 3).map((c) => hex(c.mean)).join("")}`;
  const dark = `#${channels.slice(0, 3).map((c) => hex(Math.max(0, c.mean - c.stdev))).join("")}`;
  console.log(`${id.padEnd(20)} ${String(Math.round(info.size / 1024)).padStart(3)} Ko  zone ${avg}  (sombre ${dark})`);
  if (process.env.PREVIEW) {
    const overlay = Buffer.from(`<svg width="${W}" height="${H}"><rect x="${box.left}" y="${box.top}" width="${box.width}" height="${box.height}" fill="none" stroke="#ff00aa" stroke-width="4"/></svg>`);
    sheet.push(await sharp(await sharp(png).composite([{ input: overlay }]).png().toBuffer()).resize(240).png().toBuffer());
  }
}
for (const [id, src] of Object.entries(ENVELOPPES)) {
  const info = await base(src).webp({ quality: 78, effort: 5 }).toFile(path.join(envDir, `${id}.webp`));
  bytes += info.size;
  console.log(`enveloppe ${id.padEnd(12)} ${Math.round(info.size / 1024)} Ko`);
}
if (process.env.PREVIEW) {
  await mkdir(process.env.PREVIEW, { recursive: true });
  await sharp({ create: { width: 6 * 244, height: 2 * 431, channels: 3, background: "#777" } })
    .composite(sheet.map((input, i) => ({ input, left: (i % 6) * 244, top: Math.floor(i / 6) * 431 })))
    .jpeg({ quality: 82 })
    .toFile(path.join(process.env.PREVIEW, "zones.jpg"));
}
console.log(`Total : ${(bytes / 1024).toFixed(0)} Ko`);
