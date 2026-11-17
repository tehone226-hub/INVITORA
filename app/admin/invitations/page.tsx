import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PLANS } from "@/config/plans";
import { AdminSkeleton, FilterBar, Pill } from "@/components/admin/ui";
import { ActionButton } from "@/components/dashboard/action-button";
import { cleanSearch, listAllEvents } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { eventTypeLabel } from "@/lib/event-types";
import { isPlanActive, isPublic } from "@/lib/events";
import { formatShortDate } from "@/lib/format";
import { deleteEvent, grantPlan, setEventStatus } from "../actions";

export const metadata: Metadata = { title: "Invitations — Administration", robots: { index: false } };

const STATUSES = [
  { id: "draft", label: "Brouillons" },
  { id: "published", label: "Publiées" },
  { id: "archived", label: "Archivées" },
];

export default function AdminEventsPage(props: PageProps<"/admin/invitations">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Events searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Events({ searchParams }: { searchParams: PageProps<"/admin/invitations">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = cleanSearch(sp.q);
  const status = typeof sp.statut === "string" ? sp.statut : "";
  const events = await listAllEvents(status, q);

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] leading-tight font-extrabold sm:text-[32px]">Invitations</h1>
      <FilterBar basePath="/admin/invitations" q={q} status={status} statuses={STATUSES} placeholder="Titre de l'invitation" />
      <ul className="space-y-3">
        {events.length === 0 && (
          <li className="rounded-xl border border-ink/10 bg-white px-4 py-8 text-center text-sm text-ink/55">Aucune invitation.</li>
        )}
        {events.map((e) => (
          <li key={e.id} className="rounded-xl border border-ink/10 bg-white p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {isPublic(e) ? (
                    <Pill tone="good">En ligne</Pill>
                  ) : e.status === "archived" ? (
                    <Pill>Archivée</Pill>
                  ) : e.status === "published" ? (
                    <Pill tone="bad">Formule expirée</Pill>
                  ) : (
                    <Pill tone="warn">Brouillon</Pill>
                  )}
                  {e.plan && (
                    <Pill tone={isPlanActive(e) ? "good" : "bad"}>
                      {PLANS[e.plan].name} · {formatShortDate(e.plan_expires_at)}
                    </Pill>
                  )}
                  <span className="text-xs text-ink/55">{eventTypeLabel(e.event_type)}</span>
                </div>
                <Link href={`/tableau-de-bord/evenements/${e.id}`} className="mt-1.5 block truncate font-bold hover:text-brand">
                  {e.title}
                </Link>
                <p className="text-xs text-ink/55">
                  {e.profiles?.email ?? "—"} · créée le {formatShortDate(e.created_at)} · {e.rsvpCount} réponse{e.rsvpCount > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {e.status === "published" ? (
                  <ActionButton action={setEventStatus.bind(null, e.id, "draft")} confirm="Désactiver le lien de cette invitation ?">
                    Dépublier
                  </ActionButton>
                ) : e.status === "draft" && isPlanActive(e) ? (
                  <ActionButton action={setEventStatus.bind(null, e.id, "published")}>Publier</ActionButton>
                ) : null}
                {!isPlanActive(e) && (
                  <ActionButton action={grantPlan.bind(null, e.id, "essentiel")} confirm="Offrir la formule Essentiel (3 mois) à cette invitation ?">
                    Offrir Essentiel
                  </ActionButton>
                )}
                {e.status !== "archived" && (
                  <ActionButton action={setEventStatus.bind(null, e.id, "archived")} confirm="Archiver cette invitation ?">
                    Archiver
                  </ActionButton>
                )}
                <ActionButton
                  variant="danger"
                  action={deleteEvent.bind(null, e.id)}
                  confirm="Supprimer DÉFINITIVEMENT cette invitation et toutes ses réponses ? Cette action est irréversible."
                >
                  Supprimer
                </ActionButton>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
