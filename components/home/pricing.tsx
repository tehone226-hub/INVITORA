import { Check, ShieldCheck } from "lucide-react";
import { CURRENCY, PLAN_DURATION_MONTHS, PLAN_LIST, formatAmount } from "@/config/plans";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/button-link";
import { PaymentBadges } from "@/components/payment-badges";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";

export function Pricing({ showSamples }: { showSamples: boolean }) {
  return (
    <section id="tarifs" aria-labelledby="tarifs-titre" className="scroll-mt-20 border-y border-ink/8 bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="tarifs-titre"
            eyebrow="Tarifs en FCFA"
            title="Un prix doux pour chaque fête"
            subtitle={`Payez avec Orange Money ou Moov Money. Paiement unique, formule active ${PLAN_DURATION_MONTHS} mois, sans abonnement.`}
          />
          <p className="inline-flex flex-wrap items-center gap-3 rounded-xl border border-ink/8 bg-paper px-4 py-3 text-sm font-bold text-ink">
            <ShieldCheck className="size-4 text-brand" aria-hidden="true" />
            Paiement sécurisé via :
            <PaymentBadges />
          </p>
        </div>

        <ul className="mt-10 grid items-stretch gap-4 lg:grid-cols-3">
          {PLAN_LIST.map((plan) => {
            const featured = plan.highlighted === true;
            return (
              <li
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl p-7",
                  featured ? "bg-night-glow text-white shadow-float" : "border border-ink/8 bg-paper text-ink",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-sans text-base font-bold">{plan.name}</h3>
                  {featured && (
                    <span className="rounded-md bg-sun px-2.5 py-1 text-xs font-bold whitespace-nowrap text-night">
                      {showSamples ? "Le plus choisi" : "Recommandé"}
                    </span>
                  )}
                </div>
                <p className="mt-5 flex items-baseline gap-2">
                  <span className="font-heading text-[48px] leading-none font-extrabold">{formatAmount(plan.price)}</span>
                  <span className={cn("text-sm font-bold", featured ? "text-white/75" : "text-ink/60")}>{CURRENCY}</span>
                </p>
                <p className={cn("mt-3 text-sm", featured ? "text-white/75" : "text-ink/60")}>{plan.tagline}</p>

                <ButtonLink
                  href={siteConfig.routes.create}
                  variant={featured ? "sun" : "outline"}
                  className="mt-6 w-full"
                >
                  Choisir {plan.name}
                </ButtonLink>

                <hr className={cn("my-6", featured ? "border-white/15" : "border-ink/10")} />

                <ul className="flex-1 space-y-3 text-[15px]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                          featured ? "bg-sun text-night" : "bg-brand-soft text-brand",
                        )}
                      >
                        <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
