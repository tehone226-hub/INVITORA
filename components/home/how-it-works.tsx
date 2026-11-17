import { steps } from "@/config/home";
import { SectionHeading } from "@/components/section-heading";

/** Trois étapes dans l'ordre : la numérotation dit une vraie séquence. */
export function HowItWorks() {
  return (
    <section id="comment-ca-marche" aria-labelledby="comment-titre" className="scroll-mt-20 border-y border-ink/8 bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 lg:py-24">
        <SectionHeading
          id="comment-titre"
          title="Comment ça marche ?"
          subtitle="Trois étapes, depuis votre téléphone. Aucune compétence technique."
        />

        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-ink pt-5">
              <span className="font-heading text-[44px] leading-none font-extrabold text-brand tabular-nums" aria-hidden="true">
                {index + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold text-ink">{step.title}</h3>
              <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink/65">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
