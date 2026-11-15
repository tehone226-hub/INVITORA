import { LayoutGrid, PenLine, Send, type LucideIcon } from "lucide-react";
import { steps } from "@/config/home";
import { SectionHeading } from "@/components/section-heading";

const icons: Record<(typeof steps)[number]["icon"], LucideIcon> = {
  layout: LayoutGrid,
  pen: PenLine,
  send: Send,
};

export function HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      aria-labelledby="comment-titre"
      className="mx-auto w-full max-w-[1180px] scroll-mt-24 px-5 pb-16 lg:pb-24"
    >
      <div className="rounded-[32px] bg-forest px-5 py-12 sm:px-10 lg:px-12 lg:py-14">
        <SectionHeading
          id="comment-titre"
          eyebrow="Simple comme bonjour"
          title="Comment ça marche ?"
          tone="dark"
        />

        <ol className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-6">
          {steps.map((step, index) => {
            const Icon = icons[step.icon];
            return (
              <li key={step.title} className="rounded-3xl bg-cream p-6 lg:p-7">
                <div className="flex items-start justify-between">
                  <span className="flex size-11 items-center justify-center rounded-2xl border border-ink/10 bg-white text-ink">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-2xl font-semibold text-sand" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
