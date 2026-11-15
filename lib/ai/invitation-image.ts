import "server-only";
import { GoogleGenAI } from "@google/genai";
import { THEMES, type ThemeId } from "@/config/themes";
import { features, serverEnv } from "@/lib/env-server";

/**
 * Fonds d'invitation par IA (Gemini). RÈGLE 2 de CLAUDE.md :
 * - uniquement fonds et ornements, SANS AUCUN TEXTE dans l'image ;
 * - images mises en cache (Supabase Storage) ;
 * - 3 générations maximum par invitation ;
 * - image de secours par thème si la génération échoue.
 */
export const IMAGE_MODEL_PAID = "gemini-nano-banana-2.1";
export const IMAGE_MODEL_PREVIEW = "gemini-3.1-flash-lite-image";
export const MAX_IMAGE_GENERATIONS = 3;

const THEME_PROMPTS: Record<ThemeId, string> = {
  "faso-dan-fani":
    "a handwoven Faso Dan Fani textile from Burkina Faso, vertical woven stripes in terracotta, deep forest green, soft gold and cream, fine checkered selvedges, visible cotton weave",
  bogolan:
    "a Malian bogolan mud cloth, dark earth-brown border with hand-painted cream dots and zigzags, an ecru centre with a ring of small hand-drawn geometric symbols",
  tiebele:
    "a painted earthen wall from Tiébélé in Burkina Faso, ochre clay with hand-painted black and white triangles, diamonds and zigzag friezes along the top and bottom",
  indigo:
    "an indigo resist-dyed cloth with soft concentric circle motifs, deep night blue, thin gold accent lines and small gold stars near the edges",
};

export function buildImagePrompt(theme: ThemeId, eventLabel: string): string {
  return [
    `Elegant background for a digital ${eventLabel} invitation card, portrait 3:4.`,
    `Inspired by ${THEME_PROMPTS[theme]}.`,
    "Rich ornament along the edges, a calm and plain area in the centre where text will be placed later.",
    "Absolutely no text, no letters, no numbers, no words, no logos, no signatures, no watermark, no people.",
    "Flat textile or painted texture seen from the front, high quality, warm natural light.",
  ].join(" ");
}

export interface GeneratedImage {
  bytes: Buffer;
  mimeType: string;
  model: string;
}

/** Renvoie l'image générée, ou null (l'appelant utilise alors l'image de secours du thème). */
export async function generateBackground(theme: ThemeId, eventLabel: string, paid: boolean): Promise<GeneratedImage | null> {
  if (!features.aiImage) return null;
  const model = paid ? IMAGE_MODEL_PAID : IMAGE_MODEL_PREVIEW;
  try {
    const ai = new GoogleGenAI({ apiKey: serverEnv.geminiApiKey });
    const response = await ai.models.generateContent({
      model,
      contents: buildImagePrompt(theme, eventLabel),
      config: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: "3:4", personGeneration: "ALLOW_NONE" },
      },
    });
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return {
          bytes: Buffer.from(part.inlineData.data, "base64"),
          mimeType: part.inlineData.mimeType ?? "image/png",
          model,
        };
      }
    }
    console.warn("[ia-image] aucune image dans la réponse");
    return null;
  } catch (error) {
    console.error("[ia-image] échec de génération", error instanceof Error ? error.message : error);
    return null;
  }
}

/** Image de secours locale d'un thème */
export const fallbackImage = (theme: ThemeId) => THEMES[theme].image;
