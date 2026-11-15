import { publicEnv } from "@/lib/env";
import { formatDate } from "@/lib/format";
import type { EventRow } from "@/lib/types";

export const invitationUrl = (slug: string) => `${publicEnv.siteUrl}/i/${slug}`;

/** Message WhatsApp prêt à envoyer */
export function whatsappMessage(event: Pick<EventRow, "title" | "starts_at" | "city" | "slug">): string {
  const when = event.starts_at ? ` le ${formatDate(event.starts_at)}` : "";
  const where = event.city ? ` à ${event.city}` : "";
  return `Vous êtes invité(e) : ${event.title}${when}${where}.\nDécouvrez l'invitation et confirmez votre présence ici :\n${invitationUrl(event.slug)}`;
}

/** Lien wa.me (ouvre WhatsApp avec le message, l'utilisateur choisit le contact ou le groupe) */
export function whatsappShareUrl(text: string, phone?: string | null): string {
  const digits = phone ? phone.replace(/[^\d]/g, "") : "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
