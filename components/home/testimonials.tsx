import { Star } from "lucide-react";
import { sampleContent } from "@/config/site";

/**
 * Témoignages d'EXEMPLE (maquette). La page ne l'affiche que si
 * `siteConfig.showSampleContent` vaut `true` (règle 7 de CLAUDE.md).
 */
export function Testimonials() {
  return (
    <section aria-labelledby="avis-titre" className="mx-auto w-full max-w-[1180px] px-5 pt-16 lg:pt-20">
      <h2 id="avis-titre" className="text-center text-[28px] font-semibold text-ink sm:text-4xl">
        Ils ont invité avec Invitora
      </h2>

      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {sampleContent.testimonials.map((t) => (
          <li key={t.name} className="flex flex-col rounded-3xl bg-white p-6 shadow-card">
            <span className="flex gap-0.5 text-gold" aria-label="5 étoiles sur 5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" aria-hidden="true" />
              ))}
            </span>
            <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink/80">
              « {t.quote} »
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <span
                className="flex size-10 items-center justify-center rounded-full bg-sand font-bold text-ink"
                aria-hidden="true"
              >
                {t.name.charAt(0)}
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold text-ink">{t.name}</span>
                <span className="block text-xs text-ink/55">{t.detail}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
