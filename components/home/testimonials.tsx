import { Star } from "lucide-react";
import { sampleContent } from "@/config/site";
import { SectionHeading } from "@/components/section-heading";

/**
 * Témoignages d'EXEMPLE (maquette). La page ne l'affiche que si
 * le réglage « contenus d'exemple » est activé dans l'administration (règle 7).
 */
export function Testimonials() {
  return (
    <section aria-labelledby="avis-titre" className="bg-paper">
      <div className="mx-auto w-full max-w-[1200px] px-5 pt-16 lg:pt-24">
        <SectionHeading id="avis-titre" title="Ils ont invité avec Invitora" />

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {sampleContent.testimonials.map((t) => (
            <li key={t.name} className="flex flex-col rounded-2xl border border-ink/8 bg-white p-6">
              <span className="flex gap-0.5 text-sun-dark" aria-label="5 étoiles sur 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" aria-hidden="true" />
                ))}
              </span>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink/80">« {t.quote} »</blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-ink/8 pt-4">
                <span
                  className="flex size-10 items-center justify-center rounded-lg bg-brand-soft font-heading font-bold text-brand"
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
      </div>
    </section>
  );
}
