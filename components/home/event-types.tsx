import Link from "next/link";
import { Baby, Briefcase, Cake, Flower2, Heart, type LucideIcon } from "lucide-react";
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
    <section aria-labelledby="evenements-titre" className="mx-auto w-full max-w-[1180px] px-5 pb-16 lg:pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          id="evenements-titre"
          eyebrow="Pour chaque moment de vie"
          title="Un modèle pour chaque événement"
          align="left"
        />
        <Link
          href="/#modeles"
          className="text-sm font-bold text-terracotta underline underline-offset-4 hover:text-terracotta-dark"
        >
          {showSamples
            ? `Voir les ${sampleContent.templatesCount} modèles`
            : "Voir les modèles"}
        </Link>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {eventTypes.map((event) => {
          const Icon = icons[event.icon];
          return (
            <li
              key={event.title}
              className="flex flex-col items-center rounded-3xl border border-ink/5 bg-white px-3 py-6 text-center shadow-card transition-shadow hover:shadow-card-hover"
            >
              <span className={`flex size-12 items-center justify-center rounded-2xl ${event.tone}`}>
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{event.title}</h3>
              <p className="mt-1 text-[13px] text-ink/55">{event.subtitle}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
