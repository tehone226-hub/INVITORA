import { CalendarDays, Clock, MapPin, Phone, Shirt } from "lucide-react";
import { InvitationCard } from "@/components/invitation-card";
import { eventTypeLabel } from "@/lib/event-types";
import { formatDate, formatTime } from "@/lib/format";
import type { EventRow } from "@/lib/types";

const mapsLink = (e: EventRow) =>
  e.maps_url ||
  (e.venue || e.address || e.city
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.venue, e.address, e.city].filter(Boolean).join(", "))}`
    : null);

/** Carte d'invitation complète (sans le formulaire RSVP, passé en `children`). */
export function InvitationView({ event, children, actions }: { event: EventRow; children?: React.ReactNode; actions?: React.ReactNode }) {
  const map = mapsLink(event);

  return (
    <article className="mx-auto w-full max-w-md">
      {/* Invitation : fond sans texte + textes en HTML posés dessus (règle 2) */}
      <InvitationCard
        theme={event.theme}
        category={eventTypeLabel(event.event_type)}
        names={event.hosts || event.title}
        date={event.starts_at ? formatDate(event.starts_at) : undefined}
        time={event.starts_at ? formatTime(event.starts_at) : undefined}
        place={event.city ?? undefined}
        heading="h1"
        eager
        sealed
        sizes="(min-width: 480px) 448px, 100vw"
        className="aspect-[9/16] rounded-2xl shadow-float"
      />

      <div className="mt-4 rounded-2xl border border-ink/8 bg-white px-5 pt-7 pb-7 sm:px-7">
        <h2 className="text-center font-heading text-[26px] leading-tight font-extrabold text-balance">{event.title}</h2>
        {event.message && <p className="mt-4 text-center text-[15px] leading-relaxed whitespace-pre-line text-ink/75">{event.message}</p>}

        <dl className="mt-7 space-y-4 text-[15px]">
          {event.starts_at && (
            <InfoRow icon={<CalendarDays />} label="Date">
              {formatDate(event.starts_at)}
            </InfoRow>
          )}
          {event.starts_at && (
            <InfoRow icon={<Clock />} label="Heure">
              {formatTime(event.starts_at)}
            </InfoRow>
          )}
          {(event.venue || event.address || event.city) && (
            <InfoRow icon={<MapPin />} label="Lieu">
              {[event.venue, event.address, event.city].filter(Boolean).join(", ")}
              {map && (
                <a href={map} target="_blank" rel="noopener noreferrer" className="mt-1 block font-bold text-brand underline underline-offset-4">
                  Voir l&apos;itinéraire
                </a>
              )}
            </InfoRow>
          )}
          {event.dress_code && (
            <InfoRow icon={<Shirt />} label="Tenue">
              {event.dress_code}
            </InfoRow>
          )}
          {event.contact_phone && (
            <InfoRow icon={<Phone />} label="Contact">
              <a href={`tel:${event.contact_phone.replace(/\s/g, "")}`} className="font-bold text-brand underline underline-offset-4">
                {event.contact_phone}
              </a>
            </InfoRow>
          )}
        </dl>

        {event.program?.length > 0 && (
          <section className="mt-8">
            <h3 className="mx-auto w-fit rounded-md bg-brand-soft px-2.5 py-1 font-sans text-xs font-bold text-brand">Programme</h3>
            <ol className="mt-4 space-y-3 border-l-2 border-mist pl-5">
              {event.program.map((p, i) => (
                <li key={i} className="relative">
                  <span className="absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-white bg-sun" aria-hidden="true" />
                  {p.time && <span className="block text-sm font-bold text-brand">{p.time}</span>}
                  <span className="text-[15px] text-ink/80">{p.label}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {actions && <div className="mt-8 flex flex-wrap justify-center gap-2.5">{actions}</div>}
      </div>

      {children && <div className="mt-5">{children}</div>}
    </article>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand [&_svg]:size-[18px]">
        {icon}
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="pt-1.5 leading-snug text-ink/85">{children}</dd>
    </div>
  );
}
