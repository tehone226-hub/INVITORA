import Link from "next/link";
import { Check, Star } from "lucide-react";
import { sampleContent } from "@/config/site";
import { ButtonLink } from "@/components/button-link";
import { EVENT_TYPES } from "@/lib/event-types";
import type { EventType } from "@/lib/types";

/** Ce que chaque type d'événement évoque, en une ligne (affichée sous son nom). */
const HINTS: Record<EventType, string> = {
  mariage: "Faire-part et confirmations",
  dot: "La cérémonie en famille",
  bapteme: "Présenter l'enfant aux proches",
  anniversaire: "La fête et ses invités",
  funerailles: "Un hommage sobre",
  entreprise: "Gala, séminaire, lancement",
  soutenance: "Thèse ou mémoire",
  autre: "Toute autre occasion",
};

const GUARANTEES = ["Sans abonnement", "Orange Money & Moov Money", "Partage WhatsApp"];

/**
 * Hero sans image : le titre à gauche, et à droite la première étape de la création.
 * Choisir un événement ouvre le formulaire déjà réglé (/creer?type=…).
 */
export function Hero({ showSamples }: { showSamples: boolean }) {
  return (
    <section className="relative overflow-hidden bg-night text-white">
      {/* Une seule lueur, derrière le choix d'événement */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] size-[720px] rounded-full bg-brand/35 blur-[140px]"
      />

      <div className="relative mx-auto grid w-full max-w-[1200px] gap-12 px-5 pt-14 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16 lg:pt-24 lg:pb-24">
        {/* Titre */}
        <div>
          {showSamples && <p className="mb-6 text-sm font-semibold text-sun">{sampleContent.heroBadge}</p>}

          <h1 className="text-[40px] leading-[0.98] font-extrabold tracking-[-0.03em] text-balance sm:text-[60px] lg:text-[76px]">
            Votre invitation prête en 30 secondes
          </h1>

          <p className="mt-7 max-w-md text-[17px] leading-relaxed text-white/70">
            Dites-nous ce que vous fêtez. L&apos;IA rédige le texte, vous partagez le lien sur WhatsApp et vous voyez
            qui vient.
          </p>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 text-sm font-semibold text-white/85">
            {GUARANTEES.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-4 text-sun" strokeWidth={3} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          {showSamples && (
            <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-white/65">
              <span className="flex items-center gap-1 font-bold text-white">
                <Star className="size-3.5 fill-current text-sun" aria-hidden="true" />
                {sampleContent.rating}
              </span>
              {sampleContent.eventsCount}
            </p>
          )}
        </div>

        {/* Première étape de la création */}
        <nav aria-labelledby="hero-question">
          <h2 id="hero-question" className="font-invite text-[30px] leading-tight font-medium tracking-normal italic sm:text-[34px]">
            Quel événement préparez-vous ?
          </h2>

          <ul className="mt-6 grid grid-cols-2 gap-2.5">
            {EVENT_TYPES.map((type) => (
              <li key={type.id}>
                <Link
                  href={`/creer?type=${type.id}`}
                  className="group flex h-full min-h-[76px] flex-col justify-center rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 transition-colors hover:border-sun hover:bg-sun hover:text-night focus-visible:border-sun focus-visible:bg-sun focus-visible:text-night focus-visible:outline-none"
                >
                  <span className="font-heading text-[19px] leading-tight font-bold sm:text-[21px]">{type.label}</span>
                  <span className="mt-0.5 text-[13px] leading-snug text-white/60 group-hover:text-night/75 group-focus-visible:text-night/75">
                    {HINTS[type.id]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ButtonLink href="/#modeles" variant="ghost">
              Voir les modèles
            </ButtonLink>
            <p className="text-sm text-white/60">Aperçu gratuit, sans carte bancaire.</p>
          </div>
        </nav>
      </div>
    </section>
  );
}
