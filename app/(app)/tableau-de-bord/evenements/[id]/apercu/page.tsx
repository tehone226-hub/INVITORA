import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { InvitationView } from "@/components/invitation/invitation-view";
import { Notice } from "@/components/ui/notice";
import { requireUser } from "@/lib/auth";
import { getMyEvent, isPublic } from "@/lib/events";

export const metadata: Metadata = { title: "Aperçu", robots: { index: false } };

export default function PreviewPage(props: PageProps<"/tableau-de-bord/evenements/[id]/apercu">) {
  return (
    <section className="w-full px-4 py-8">
      <Suspense fallback={<div className="mx-auto aspect-[3/4] w-full max-w-md animate-pulse rounded-2xl bg-mist/70" />}>
        <Preview params={props.params} />
      </Suspense>
    </section>
  );
}

async function Preview({ params }: { params: PageProps<"/tableau-de-bord/evenements/[id]/apercu">["params"] }) {
  const { id } = await params;
  await requireUser(`/tableau-de-bord/evenements/${id}/apercu`);
  const event = await getMyEvent(id);
  return (
    <div className="mx-auto max-w-md">
      <Link href={`/tableau-de-bord/evenements/${id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 hover:text-brand">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour
      </Link>
      {!isPublic(event) && (
        <Notice tone="warning" className="mb-4">
          Aperçu privé : vos invités ne voient pas encore cette page.
        </Notice>
      )}
      <InvitationView event={event}>
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink/55">
          Ici, vos invités confirmeront leur présence.
        </div>
      </InvitationView>
    </div>
  );
}
