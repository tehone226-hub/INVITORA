import Image from "next/image";
import { CalendarDays, Clock, MapPin, Phone, Shirt } from "lucide-react";
import { THEMES } from "@/config/themes";
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
  const theme = THEMES[event.theme] ?? THEMES["faso-dan-fani"];
  const [first, second] = (event.hosts ?? "").split(" & ");
  const map = mapsLink(event);

  return (
    <article className="mx-auto w-full max-w-md">
      {/* Carte illustrée : fond sans texte + textes en HTML (règle 2) */}
      <div
        className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[28px] p-7 shadow-float"
        style={{ backgroundImage: theme.pattern, backgroundSize: `${theme.tileSize}px` }}
      >
        <Image
          src={event.cover_image_url || theme.image}
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 480px) 448px, 100vw"
          className="object-cover"
          unoptimized={Boolean(event.cover_image_url)}
        />
        <div
          className="relative flex w-full max-w-[290px] flex-col items-center gap-2.5 rounded-2xl px-5 py-9 text-center shadow-[0_12px_36px_rgba(0,0,0,0.25)]"
          style={{ backgroundColor: theme.colors.panel, color: theme.colors.text, outline: `1px solid ${theme.colors.accent}`, outlineOffset: "-7px" }}
        >
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: theme.colors.accent }}>
            {eventTypeLabel(event.event_type)}
          </span>
          <h1 className="font-heading text-[30px] leading-[1.1] font-semibold text-balance">
            {second !== undefined ? (
              <>
                {first}
                <span className="block text-2xl italic" style={{ color: theme.colors.accent }}>
                  &amp;
                </span>
                {second}
              </>
            ) : (
              event.hosts || event.title
            )}
          </h1>
          {event.starts_at && (
            <p className="mt-1 text-sm font-semibold">
              {formatDate(event.starts_at)}
              <br />
              {formatTime(event.starts_at)}
            </p>
          )}
          {event.city && <p className="text-[13px] opacity-80">{event.city}</p>}
        </div>
      </div>

      <div className="relative -mt-6 rounded-[28px] border border-ink/5 bg-white px-5 pt-9 pb-7 shadow-card sm:px-7">
        <h2 className="text-center font-heading text-2xl leading-tight font-semibold text-balance">{event.title}</h2>
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
                <a href={map} target="_blank" rel="noopener noreferrer" className="mt-1 block font-bold text-terracotta underline underline-offset-4">
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
              <a href={`tel:${event.contact_phone.replace(/\s/g, "")}`} className="font-bold text-terracotta underline underline-offset-4">
                {event.contact_phone}
              </a>
            </InfoRow>
          )}
        </dl>

        {event.program?.length > 0 && (
          <section className="mt-8">
            <h3 className="text-center text-xs font-bold tracking-[0.14em] text-terracotta uppercase">Programme</h3>
            <ol className="mt-4 space-y-3 border-l-2 border-sand pl-5">
              {event.program.map((p, i) => (
                <li key={i} className="relative">
                  <span className="absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-white bg-gold" aria-hidden="true" />
                  {p.time && <span className="block text-sm font-bold text-forest">{p.time}</span>}
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
      <dt className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sand text-forest [&_svg]:size-[18px]">
        {icon}
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="pt-1.5 leading-snug text-ink/85">{children}</dd>
    </div>
  );
}
