import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CalendarPlus, MessageCircle } from "lucide-react";
import { InvitationView } from "@/components/invitation/invitation-view";
import { buttonClass } from "@/components/ui/button-class";
import { getPublicEvent, isPublic } from "@/lib/events";
import { formatDate } from "@/lib/format";
import { whatsappMessage, whatsappShareUrl } from "@/lib/share";
import { RsvpForm } from "./rsvp-form";

/** Page invité : non indexée (règle 6), légère (< 500 Ko). */
export async function generateMetadata({ params }: PageProps<"/i/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  // get_public_event ne renvoie que les invitations publiées, payées et non suspendues.
  const event = await getPublicEvent(slug);
  const ok = Boolean(event);
  return {
    title: event ? event.title : "Invitation",
    description: event?.starts_at ? `${formatDate(event.starts_at)}${event.city ? ` — ${event.city}` : ""}` : undefined,
    robots: { index: false, follow: false, nocache: true },
    openGraph: ok && event ? { title: event.title, type: "website" } : undefined,
  };
}

export default function GuestPage({ params }: PageProps<"/i/[slug]">) {
  return (
    <section className="w-full px-4 py-8 sm:py-12">
      <Suspense fallback={<div className="mx-auto aspect-[3/4] w-full max-w-md animate-pulse rounded-3xl bg-mist/70" />}>
        <GuestInvitation params={params} />
      </Suspense>
    </section>
  );
}

async function GuestInvitation({ params }: { params: PageProps<"/i/[slug]">["params"] }) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  // La validité de la formule dépend de l'heure : on la vérifie à chaque requête, jamais à la préparation de la page.
  await connection();

  if (!event || !isPublic(event)) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-ink/8 bg-white p-8 text-center shadow-card">
        <h1 className="font-heading text-2xl font-extrabold">Invitation indisponible</h1>
        <p className="mt-3 text-[15px] text-ink/60">
          Ce lien n&apos;est pas ou plus actif. Vérifiez le lien reçu ou contactez la personne qui vous a invité(e).
        </p>
      </div>
    );
  }

  const deadline = event.rsvp_deadline ? formatDate(`${event.rsvp_deadline}T12:00:00Z`) : undefined;

  return (
    <InvitationView
      event={event}
      actions={
        <>
          {event.starts_at && (
            <a href={`/i/${event.slug}/agenda`} className={buttonClass("outline", "h-10 px-4 text-sm")}>
              <CalendarPlus />
              Ajouter à mon agenda
            </a>
          )}
          <a
            href={whatsappShareUrl(whatsappMessage(event))}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("outline", "h-10 px-4 text-sm")}
          >
            <MessageCircle />
            Partager
          </a>
        </>
      }
    >
      <RsvpForm slug={event.slug} deadline={deadline} />
    </InvitationView>
  );
}
