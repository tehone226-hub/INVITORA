import Link from "next/link";
import { ArrowRight, Baby, Briefcase, Cake, Flower2, Heart, type LucideIcon } from "lucide-react";
import { eventTypes, type EventIcon } from "@/config/home";
import { sampleContent } from "@/config/site";
import { SectionHeading } from "@/components/section-heading";

const icons: Record<EventIcon, LucideIcon> = {
  heart: Heart,
  cake: Cake,
  baby: Baby,
  flower: Flower2,
  briefcase: Briefcase,
};

export function EventTypes({ showSamples }: { showSamples: boolean }) {
  return (
    <section aria-labelledby="evenements-titre" className="border-b border-ink/8 bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            id="evenements-titre"
            eyebrow="Pour chaque moment de vie"
            title="Un modèle pour chaque événement"
          />
          <Link
            href="/#modeles"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-dark"
          >
            {showSamples ? `Voir les ${sampleContent.templatesCount} modèles` : "Voir les modèles"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {eventTypes.map((event) => {
            const Icon = icons[event.icon];
            return (
              <li
                key={event.title}
                className="rounded-2xl border border-ink/8 bg-paper p-5 transition-all hover:border-brand hover:bg-white hover:shadow-card-hover"
              >
                <span className={`flex size-11 items-center justify-center rounded-xl ${event.tone}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-8 text-lg font-bold text-ink">{event.title}</h3>
                <p className="mt-1 text-[13px] text-ink/55">{event.subtitle}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
