import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { InvitationView } from "@/components/invitation/invitation-view";
import { Notice } from "@/components/ui/notice";
import { templateExamples } from "@/config/home";
import { RsvpForm } from "@/app/(site)/i/[slug]/rsvp-form";
import type { EventRow, EventType } from "@/lib/types";

const TYPE_BY_CATEGORY: Record<string, EventType> = {
  Mariage: "mariage",
  Anniversaire: "anniversaire",
  Baptême: "bapteme",
  Funérailles: "funerailles",
  Entreprise: "entreprise",
  Dot: "dot",
};

const MESSAGES: Record<EventType, string> = {
  mariage: "Les familles ont la joie de vous convier à la célébration de ce mariage. Votre présence sera notre plus beau cadeau.",
  dot: "Les familles ont l'honneur de vous inviter à la cérémonie de dot. Venez partager ce moment de joie avec nous.",
  bapteme: "Nous avons la joie de vous présenter notre enfant et de vous inviter à son baptême. Venez bénir ce nouveau départ avec nous.",
  anniversaire: "Trente ans, ça se fête ! Venez partager un repas, de la musique et beaucoup de bonne humeur.",
  funerailles: "La famille vous informe de la cérémonie d'hommage. Votre présence et vos prières nous accompagneront.",
  entreprise: "Nous avons le plaisir de vous convier à notre soirée de fin d'année pour célébrer ensemble les réussites de l'année.",
  soutenance: "",
  autre: "",
};

const PROGRAM = [
  { time: "16 h 00", label: "Accueil des invités" },
  { time: "17 h 00", label: "Cérémonie" },
  { time: "19 h 00", label: "Dîner et animation" },
];

/** Données fictives de démonstration (les modèles de l'accueil). */
function sampleEvent(id: string): EventRow | null {
  const t = templateExamples.find((x) => x.id === id);
  if (!t) return null;
  const type = TYPE_BY_CATEGORY[t.category] ?? "autre";
  const [venue, city] = t.place.split(" • ");
  const months: Record<string, string> = { décembre: "12", janvier: "01" };
  const m = t.date.match(/(\d{1,2}) (\S+) (\d{4})/); // \S : « décembre » contient un caractère accentué
  const startsAt = m ? `${m[3]}-${months[m[2]] ?? "12"}-${m[1].padStart(2, "0")}T16:00:00.000Z` : null;
  return {
    id: "00000000-0000-0000-0000-000000000000",
    owner_id: "",
    slug: `exemple-${t.id}`,
    event_type: type,
    title: t.title,
    hosts: t.names,
    starts_at: startsAt,
    venue: venue ?? null,
    city: city ?? null,
    address: null,
    maps_url: null,
    message: MESSAGES[type] || null,
    program: PROGRAM,
    dress_code: type === "mariage" || type === "dot" ? "Faso Dan Fani" : null,
    rsvp_deadline: null,
    contact_phone: null,
    language: "fr",
    theme: t.theme,
    cover_image_url: null,
    status: "published",
    plan: "celebration",
    plan_expires_at: null,
    guest_limit: null,
    image_generations: 0,
    blocked_at: null,
    created_at: "",
    updated_at: "",
  };
}

export function generateStaticParams() {
  return templateExamples.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/exemple/[id]">): Promise<Metadata> {
  const { id } = await params;
  const e = sampleEvent(id);
  return { title: e ? `Exemple : ${e.title}` : "Exemple", robots: { index: false } };
}

export default async function ExamplePage({ params }: PageProps<"/exemple/[id]">) {
  const { id } = await params;
  const event = sampleEvent(id);
  if (!event) notFound();
  return (
    <section className="w-full px-4 py-8 sm:py-12">
      <div className="mx-auto mb-5 max-w-md">
        <Notice tone="info" title="Exemple d'invitation">
          Voici ce que reçoivent vos invités sur WhatsApp. Les informations sont fictives.
        </Notice>
      </div>
      <InvitationView event={event}>
        <RsvpForm slug={event.slug} demo />
        <div className="mt-6 text-center">
          <ButtonLink href="/creer" size="lg">
            <Sparkles />
            Créer la mienne
          </ButtonLink>
        </div>
      </InvitationView>
    </section>
  );
}
