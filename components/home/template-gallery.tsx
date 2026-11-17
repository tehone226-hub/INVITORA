import Link from "next/link";
import { eventTypeOfCategory, templateExamples } from "@/config/home";
import { COLORWAYS, STYLES, THEMES, type ThemeId } from "@/config/themes";
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
          subtitle="Partez d'un modèle. Le texte, le style et les couleurs se changent en quelques secondes."
        />

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-10">
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
                  sizes="(min-width: 1024px) 380px, 50vw"
                  className="aspect-[4/5]"
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

        {/* Toute la collection, en une ligne */}
        <div className="mt-14 flex flex-col gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl text-[15px] leading-relaxed text-ink/70">
            <span className="font-bold text-ink">
              {STYLES.length} styles, chacun en {COLORWAYS.length} coloris.
            </span>{" "}
            {STYLES.map((s) => s.name).join(", ")}.
          </p>
          <ul className="flex shrink-0 gap-1.5" aria-label={`Les ${COLORWAYS.length} coloris`}>
            {COLORWAYS.map((cw) => (
              <li
                key={cw.id}
                title={cw.name}
                className="size-6 rounded-full border border-ink/15"
                style={{ backgroundColor: THEMES[`${STYLES[0].id}--${cw.id}` as ThemeId].swatch }}
              >
                <span className="sr-only">{cw.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
