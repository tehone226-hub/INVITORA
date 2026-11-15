/** Fichier agenda (.ics) pour « Ajouter à mon agenda » */
export function buildIcs(e: {
  slug: string;
  title: string;
  starts_at: string;
  venue: string | null;
  city: string | null;
  address: string | null;
  url: string;
}): string {
  const start = new Date(e.starts_at);
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const location = [e.venue, e.address, e.city].filter(Boolean).join(", ");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitora//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${e.slug}@invitora`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(e.title)}`,
    location ? `LOCATION:${esc(location)}` : "",
    `URL:${e.url}`,
    `DESCRIPTION:${esc(`Invitation : ${e.url}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
