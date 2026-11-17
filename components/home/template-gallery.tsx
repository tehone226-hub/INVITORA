import Link from "next/link";
import { templateExamples } from "@/config/home";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/button-link";
import { InvitationCard } from "@/components/invitation-card";
import { SectionHeading } from "@/components/section-heading";

export function TemplateGallery() {
  return (
    <section id="modeles" aria-labelledby="modeles-titre" className="scroll-mt-20 bg-paper">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="modeles-titre"
            eyebrow="Inspiration"
            title="Des cartes qui ressemblent à vos fêtes"
            subtitle="Choisissez un fond, l'IA rédige le texte, puis vous modifiez tout à votre goût."
          />
          <ButtonLink href={siteConfig.routes.create} variant="dark">
            Créer la mienne
          </ButtonLink>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templateExamples.map((tpl) => (
            <li
              key={tpl.id}
              className="group overflow-hidden rounded-2xl border border-ink/8 bg-white p-2 transition-all hover:border-brand hover:shadow-card-hover"
            >
              <Link
                href={`/exemple/${tpl.id}`}
                aria-label={`Voir l'exemple : ${tpl.title}`}
                className="block overflow-hidden rounded-xl"
              >
                <InvitationCard
                  theme={tpl.theme}
                  category={tpl.category}
                  names={tpl.names}
                  date={tpl.date}
                  className="aspect-[4/3.4]"
                />
              </Link>
              <div className="flex items-center justify-between gap-3 px-3 pt-4 pb-2">
                <div className="min-w-0">
                  <p className="inline-flex rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand">
                    {tpl.category}
                  </p>
                  <h3 className="mt-1.5 truncate text-lg font-bold text-ink">{tpl.title}</h3>
                  <p className="truncate text-[13px] text-ink/55">{tpl.place}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <ButtonLink
                    href={`/exemple/${tpl.id}`}
                    variant="outline"
                    size="sm"
                    aria-label={`Voir l'exemple ${tpl.title}`}
                  >
                    Voir
                  </ButtonLink>
                  <ButtonLink
                    href={siteConfig.routes.create}
                    variant="soft"
                    size="sm"
                    aria-label={`Utiliser le modèle ${tpl.title}`}
                  >
                    Utiliser
                  </ButtonLink>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
