import Link from "next/link";
import { templateExamples } from "@/config/home";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/button-link";
import { InvitationCard } from "@/components/invitation-card";
import { SectionHeading } from "@/components/section-heading";

export function TemplateGallery() {
  return (
    <section
      id="modeles"
      aria-labelledby="modeles-titre"
      className="mx-auto w-full max-w-[1180px] scroll-mt-24 px-5 pb-16 lg:pb-24"
    >
      <SectionHeading
        id="modeles-titre"
        eyebrow="Inspiration"
        title="Des cartes qui ressemblent à vos fêtes"
        subtitle="Chaque modèle est créé par l'IA puis personnalisable : couleurs bogolan, photos, textes et musique."
      />

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templateExamples.map((tpl) => (
          <li
            key={tpl.id}
            className="overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-card transition-shadow hover:shadow-card-hover"
          >
            <Link href={`/exemple/${tpl.id}`} aria-label={`Voir l'exemple : ${tpl.title}`} className="block">
              <InvitationCard
                theme={tpl.theme}
                category={tpl.category}
                names={tpl.names}
                date={tpl.date}
                className="aspect-[4/3.4]"
              />
            </Link>
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold tracking-[0.1em] text-terracotta uppercase">
                  {tpl.category}
                </p>
                <h3 className="mt-0.5 truncate text-lg font-semibold text-ink">{tpl.title}</h3>
                <p className="truncate text-[13px] text-ink/55">{tpl.place}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <ButtonLink href={`/exemple/${tpl.id}`} variant="outline" size="sm" aria-label={`Voir l'exemple ${tpl.title}`}>
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
    </section>
  );
}
