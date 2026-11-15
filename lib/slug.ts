import { randomBytes } from "node:crypto";

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // sans 0/o/1/l pour éviter les confusions

/**
 * Slug d'invitation non devinable (règle 6) : un préfixe lisible tiré du titre
 * + 12 caractères aléatoires (~60 bits d'entropie).
 */
export function makeSlug(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .replace(/-+$/g, "");
  const bytes = randomBytes(12);
  let rand = "";
  for (const b of bytes) rand += ALPHABET[b % ALPHABET.length];
  return base ? `${base}-${rand}` : rand;
}
