import Image from "next/image";
import Link from "next/link";
import { eventTypeOfCategory, templateExamples } from "@/config/home";
import { THEME_LIST } from "@/config/themes";
import { InvitationCard } from "@/components/invitation-card";
import { SectionHeading } from "@/components/section-heading";

/** Galerie des modèles : l'invitation est la carte, la légende reste discrète dessous. */
export function TemplateGallery() {
  return (
    <section id="modeles" aria-labelledby="modeles-titre" className="scroll-mt-20 bg-paper">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 lg:py-24">
        <SectionHeading
          id="modeles-titre"
          title="Des invitations qu'on a envie de garder"
          subtitle="Partez d'un modèle. Le texte, le fond et les détails se changent en quelques secondes."
        />

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:gap-x-6 lg:gap-y-10">
          {templateExamples.map((tpl) => (
            <li key={tpl.id}>
              <Link
                href={`/exemple/${tpl.id}`}
                aria-label={`Voir l'exemple : ${tpl.title}`}
                className="block overflow-hidden rounded-xl shadow-card transition-shadow hover:shadow-card-hover focus-visible:ring-3 focus-visible:ring-brand/40 focus-visible:outline-none"
              >
                <InvitationCard
                  theme={tpl.theme}
                  category={tpl.category}
                  names={tpl.names}
                  date={tpl.date}
                  place={tpl.place}
                  size="lg"
                  sizes="(min-width: 768px) 360px, 50vw"
                  className="aspect-[9/16]"
                />
              </Link>
              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-sans text-[15px] font-bold tracking-normal text-ink">{tpl.category}</h3>
                <p className="flex gap-4 text-sm font-semibold">
                  <Link
                    href={`/creer?type=${eventTypeOfCategory(tpl.category)}`}
                    aria-label={`Utiliser le modèle ${tpl.title}`}
                    className="text-brand underline-offset-4 hover:underline"
                  >
                    Utiliser ce modèle
                  </Link>
                  <Link
                    href={`/exemple/${tpl.id}`}
                    aria-label={`Voir l'exemple ${tpl.title}`}
                    className="text-ink/60 underline-offset-4 hover:text-ink hover:underline"
                  >
                    Voir
                  </Link>
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Toute la collection, en vignettes */}
        <div className="mt-14 border-t border-ink/10 pt-6">
          <p className="text-[15px] text-ink/70">
            <span className="font-bold text-ink">{THEME_LIST.length} fonds au choix.</span> Chaque invitation arrive dans une enveloppe
            scellée que vos invités ouvrent d&apos;un geste.
          </p>
          <ul className="mt-4 flex gap-2.5 overflow-x-auto pb-2">
            {THEME_LIST.map((t) => (
              <li key={t.id} className="relative aspect-[9/16] w-[84px] shrink-0 overflow-hidden rounded-lg border border-ink/10" title={t.name}>
                <Image src={t.image} alt={t.name} fill sizes="84px" className="object-cover" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
