import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMyEvent } from "@/lib/events";
import { toLocalInputs } from "@/lib/format";
import { updateEvent } from "../actions";
import { EditForm } from "./edit-form";

export const metadata: Metadata = { title: "Modifier l'invitation", robots: { index: false } };

export default function EditPage(props: PageProps<"/tableau-de-bord/evenements/[id]/modifier">) {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-8 sm:py-10">
      <Suspense fallback={<div className="h-[720px] animate-pulse rounded-2xl bg-mist/60" />}>
        <Edit params={props.params} />
      </Suspense>
    </section>
  );
}

async function Edit({ params }: { params: PageProps<"/tableau-de-bord/evenements/[id]/modifier">["params"] }) {
  const { id } = await params;
  await requireUser(`/tableau-de-bord/evenements/${id}/modifier`);
  const event = await getMyEvent(id);
  const { date, time } = toLocalInputs(event.starts_at);
  return (
    <>
      <Link href={`/tableau-de-bord/evenements/${id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 hover:text-brand">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour à l&apos;invitation
      </Link>
      <h1 className="mt-4 mb-6 text-[28px] leading-tight font-extrabold sm:text-[32px]">Modifier l&apos;invitation</h1>
      <EditForm event={event} action={updateEvent.bind(null, id)} initialDate={date} initialTime={time} />
    </>
  );
}
