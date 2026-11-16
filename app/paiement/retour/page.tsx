import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/button-link";
import { Notice } from "@/components/ui/notice";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/neon/data";
import type { PaymentRow } from "@/lib/types";

export const metadata: Metadata = { title: "Paiement", robots: { index: false } };

/**
 * Retour du navigateur après le paiement. Cette page N'ACTIVE RIEN (règle 3) :
 * seule la confirmation du webhook SasPay active la formule.
 */
export default function PaymentReturnPage(props: PageProps<"/paiement/retour">) {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-14">
      <Suspense fallback={<div className="h-48 animate-pulse rounded-3xl bg-sand/60" />}>
        <PaymentStatus searchParams={props.searchParams} />
      </Suspense>
    </section>
  );
}

async function PaymentStatus({ searchParams }: { searchParams: PageProps<"/paiement/retour">["searchParams"] }) {
  const sp = await searchParams;
  const paymentId = typeof sp.paiement === "string" ? sp.paiement : "";
  await requireUser(`/paiement/retour?paiement=${paymentId}`);

  const supabase = await createClient();
  const { data: payment } = /^[0-9a-f-]{36}$/i.test(paymentId)
    ? await supabase.from("payments").select("*").eq("id", paymentId).maybeSingle<PaymentRow>()
    : { data: null };

  if (!payment) {
    return (
      <Notice tone="error" title="Paiement introuvable">
        <p className="mt-1">Retournez à votre espace pour vérifier l&apos;état de votre invitation.</p>
        <ButtonLink href="/tableau-de-bord" variant="outline" className="mt-4">
          Mon espace
        </ButtonLink>
      </Notice>
    );
  }

  const back = `/tableau-de-bord/evenements/${payment.event_id}`;
  return (
    <div className="rounded-[28px] border border-ink/5 bg-white p-7 text-center shadow-card">
      {payment.status === "paid" ? (
        <>
          <h1 className="font-heading text-[28px] font-semibold">Merci, paiement confirmé</h1>
          <p className="mt-2 text-[15px] text-ink/60">Votre formule est active. Vous pouvez publier et partager votre invitation.</p>
        </>
      ) : payment.status === "pending" ? (
        <>
          <h1 className="font-heading text-[28px] font-semibold">Paiement en cours de confirmation</h1>
          <p className="mt-2 text-[15px] text-ink/60">
            Si vous avez validé le paiement sur votre téléphone, la confirmation arrive en général en moins d&apos;une minute.
            Votre formule s&apos;activera automatiquement.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-heading text-[28px] font-semibold">Le paiement n&apos;a pas abouti</h1>
          <p className="mt-2 text-[15px] text-ink/60">Aucun montant n&apos;a été validé. Vous pouvez recommencer quand vous le souhaitez.</p>
        </>
      )}
      <ButtonLink href={back} className="mt-6">
        Retour à mon invitation
      </ButtonLink>
    </div>
  );
}
