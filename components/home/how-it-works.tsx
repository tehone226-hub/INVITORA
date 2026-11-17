import Image from "next/image";
import { CheckCheck, LayoutGrid, PenLine, Send, type LucideIcon } from "lucide-react";
import { steps } from "@/config/home";
import { THEMES, type ThemeId } from "@/config/themes";
import { SectionHeading } from "@/components/section-heading";
import { LANGUAGES } from "@/lib/event-types";

const icons: Record<(typeof steps)[number]["icon"], LucideIcon> = {
  layout: LayoutGrid,
  pen: PenLine,
  send: Send,
};

const SWATCHES: ThemeId[] = ["faso-dan-fani--origine", "wax--braise", "indigo--lagune", "bogolan--ocre"];

/** Petit visuel propre à chaque étape (décoratif). */
function StepVisual({ icon }: { icon: (typeof steps)[number]["icon"] }) {
  if (icon === "layout") {
    return (
      <div className="grid grid-cols-4 gap-2" aria-hidden="true">
        {SWATCHES.map((id) => (
          <div
            key={id}
            className="relative aspect-[3/4] overflow-hidden rounded-lg"
            style={{ backgroundColor: THEMES[id].color }}
          >
            <Image src={THEMES[id].image} alt="" fill sizes="80px" className="object-cover" />
          </div>
        ))}
      </div>
    );
  }
  if (icon === "pen") {
    return (
      <div aria-hidden="true">
        <div className="space-y-2">
          <div className="h-2.5 w-4/5 rounded-full bg-brand/25" />
          <div className="h-2.5 w-full rounded-full bg-ink/10" />
          <div className="h-2.5 w-3/5 rounded-full bg-ink/10" />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => (
            <span key={l.id} className="rounded-md bg-brand-soft px-2 py-1 text-[11px] font-bold text-brand">
              {l.label}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-end gap-1.5" aria-hidden="true">
      <span className="rounded-2xl rounded-br-sm bg-[#0E8A66] px-3.5 py-2 text-[13px] font-semibold text-white">
        Vous êtes invité(e) : ouvrez le lien
      </span>
      <span className="flex items-center gap-1 text-[11px] font-bold text-ink/50">
        <CheckCheck className="size-3.5 text-brand" />
        Réponse reçue
      </span>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" aria-labelledby="comment-titre" className="scroll-mt-20 bg-paper">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 lg:py-24">
        <SectionHeading
          id="comment-titre"
          eyebrow="Simple comme bonjour"
          title="Comment ça marche ?"
          subtitle="Trois étapes, depuis votre téléphone. Aucune compétence technique."
        />

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = icons[step.icon];
            return (
              <li
                key={step.title}
                className="flex flex-col rounded-2xl border border-ink/8 bg-white p-6 transition-colors hover:border-brand/40 lg:p-7"
              >
                <div className="flex items-start justify-between">
                  <span className="font-heading text-[56px] leading-none font-extrabold text-brand" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-ink">{step.title}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink/60">{step.text}</p>
                <div className="mt-6 rounded-xl bg-paper p-4">
                  <StepVisual icon={step.icon} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
