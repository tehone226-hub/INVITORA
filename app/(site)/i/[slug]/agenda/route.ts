import { connection } from "next/server";
import { getPublicEvent, isPublic } from "@/lib/events";
import { buildIcs } from "@/lib/ics";
import { invitationUrl } from "@/lib/share";

/** Fichier .ics : « Ajouter à mon agenda » */
export async function GET(_request: Request, { params }: RouteContext<"/i/[slug]/agenda">) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  await connection(); // la validité de la formule dépend de l'heure (voir la page invité)
  if (!event || !isPublic(event) || !event.starts_at) return new Response("Invitation indisponible", { status: 404 });

  const ics = buildIcs({ ...event, starts_at: event.starts_at, url: invitationUrl(event.slug) });
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="invitation-${event.slug.slice(0, 40)}.ics"`,
      "X-Robots-Tag": "noindex",
    },
  });
}
