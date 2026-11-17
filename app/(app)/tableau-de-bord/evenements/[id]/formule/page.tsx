import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { CURRENCY, PLAN_DURATION_MONTHS, PLAN_LIST, formatAmount } from "@/config/plans";
import { ActionButton } from "@/components/dashboard/action-button";
import { PaymentBadges } from "@/components/payment-badges";
import { Notice } from "@/components/ui/notice";
import { requireUser } from "@/lib/auth";
import { features } from "@/lib/env-server";
import { getMyEvent, planOf } from "@/lib/events";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { startCheckout } from "../actions";

export const metadata: Metadata = { title: "Choisir une formule", robots: { index: false } };

export default function PlanPage(props: PageProps<"/tableau-de-bord/evenements/[id]/formule">) {
  return (
    <section className="mx-auto w-full max-w-[1100px] px-5 py-8 lg:px-8 lg:py-10">
      <Suspense fallback={<div className="h-[560px] animate-pulse rounded-2xl bg-mist/60" />}>
        <Plans params={props.params} />
      </Suspense>
    </section>
  );
}

async function Plans({ params }: { params: PageProps<"/tableau-de-bord/evenements/[id]/formule">["params"] }) {
  const { id } = await params;
  await requireUser(`/tableau-de-bord/evenements/${id}/formule`);
  const event = await getMyEvent(id);
  const current = planOf(event);

  return (
    <>
      <Link href={`/tableau-de-bord/evenements/${id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 hover:text-brand">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour à l&apos;invitation
      </Link>
      <h1 className="mt-4 text-[28px] leading-tight font-extrabold sm:text-[32px]">Choisissez votre formule</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink/60">
        Pour « {event.title} ». Paiement unique, formule active {PLAN_DURATION_MONTHS} mois, sans abonnement.
      </p>

      {current && (
        <Notice tone="info" className="mt-5">
          Formule {current.name} active jusqu&apos;au {formatShortDate(event.plan_expires_at)}. Un nouveau paiement prolonge la durée de{" "}
          {PLAN_DURATION_MONTHS} mois.
        </Notice>
      )}
      {!features.payments && (
        <Notice tone="warning" className="mt-5" title="Paiement bientôt disponible">
          Le paiement en ligne n&apos;est pas encore activé sur ce site.
        </Notice>
      )}

      <ul className="mt-8 grid gap-5 lg:grid-cols-3">
        {PLAN_LIST.map((plan) => {
          const featured = plan.highlighted === true;
          return (
            <li
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl p-6",
                featured ? "bg-night-glow text-white shadow-card-hover" : "border border-ink/10 bg-white shadow-card",
              )}
            >
              {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sun px-3 py-1 text-xs font-bold text-night">
                  Recommandé
                </span>
              )}
              <h2 className="font-sans text-[15px] font-bold">{plan.name}</h2>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="font-heading text-4xl font-extrabold tracking-tight">{formatAmount(plan.price)}</span>
                <span className={cn("text-sm font-bold", featured ? "text-paper/80" : "text-ink/60")}>{CURRENCY}</span>
              </p>
              <p className={cn("mt-1 text-[13px]", featured ? "text-paper/75" : "text-ink/55")}>{plan.tagline}</p>
              <ul className="mt-5 flex-1 space-y-2.5 text-[15px]">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className={cn("mt-0.5 size-4 shrink-0", featured ? "text-sun" : "text-emerald-700")} aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {features.payments ? (
                  <ActionButton
                    action={startCheckout.bind(null, id, plan.id)}
                    variant={featured ? "sun" : "outline"}
                    pendingLabel="Redirection vers le paiement…"
                    className="[&>button]:w-full"
                  >
                    Payer {formatAmount(plan.price)} {CURRENCY}
                  </ActionButton>
                ) : (
                  <button type="button" disabled className="h-11 w-full rounded-xl border border-current/20 text-[15px] font-bold opacity-60">
                    Bientôt disponible
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col items-center gap-3 text-center text-sm text-ink/60">
        <p className="inline-flex flex-wrap items-center justify-center gap-2 font-bold text-ink">
          <ShieldCheck className="size-4 text-emerald-700" aria-hidden="true" />
          Paiement sécurisé sur la page SasPay :
          <PaymentBadges />
        </p>
        <p>Votre formule s&apos;active automatiquement dès que l&apos;opérateur confirme le paiement.</p>
      </div>
    </>
  );
}
