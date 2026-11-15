import { Check } from "lucide-react";
import { CURRENCY, PLAN_DURATION_MONTHS, PLAN_LIST, formatAmount } from "@/config/plans";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/button-link";
import { PaymentBadges } from "@/components/payment-badges";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";

export function Pricing({ showSamples }: { showSamples: boolean }) {
  return (
    <section
      id="tarifs"
      aria-labelledby="tarifs-titre"
      className="mx-auto w-full max-w-[1180px] scroll-mt-24 px-5 pb-16 lg:pb-24"
    >
      <SectionHeading
        id="tarifs-titre"
        eyebrow="Tarifs en FCFA"
        title="Un prix doux pour chaque fête"
        subtitle={`Payez avec Orange Money ou Moov Money. Paiement unique, formule active ${PLAN_DURATION_MONTHS} mois, sans abonnement.`}
      />

      <ul className="mt-12 grid items-stretch gap-6 lg:grid-cols-3 lg:items-center">
        {PLAN_LIST.map((plan) => {
          const featured = plan.highlighted === true;
          return (
            <li
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-3xl p-7",
                featured
                  ? "bg-forest text-cream shadow-card-hover lg:py-10"
                  : "border border-ink/5 bg-white text-ink shadow-card",
              )}
            >
              {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-xs font-bold whitespace-nowrap text-forest">
                  {showSamples ? "Le plus choisi" : "Recommandé"}
                </span>
              )}

              <h3 className="font-sans text-[15px] font-bold">{plan.name}</h3>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-heading text-[40px] leading-none font-semibold">
                  {formatAmount(plan.price)}
                </span>
                <span className={cn("text-sm font-bold", featured ? "text-cream/80" : "text-ink/60")}>
                  {CURRENCY}
                </span>
              </p>
              <p className={cn("mt-2 text-[13px]", featured ? "text-cream/75" : "text-ink/55")}>
                {plan.tagline}
              </p>

              <hr className={cn("my-6", featured ? "border-cream/15" : "border-ink/10")} />

              <ul className="flex-1 space-y-3 text-[15px]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className={cn("mt-0.5 size-4 shrink-0", featured ? "text-gold" : "text-forest")}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <ButtonLink
                href={siteConfig.routes.create}
                variant={featured ? "gold" : "outline"}
                className="mt-8 w-full"
              >
                Choisir {plan.name}
              </ButtonLink>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex justify-center">
        <p className="inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-ink/5 bg-white px-5 py-3 text-sm font-bold text-ink shadow-card">
          Paiement sécurisé via :
          <PaymentBadges />
        </p>
      </div>
    </section>
  );
}
