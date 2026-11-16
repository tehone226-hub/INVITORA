import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus, Users } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { PlanBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { InvitationCard } from "@/components/invitation-card";
import { SetupRequired } from "@/components/setup-required";
import { Notice } from "@/components/ui/notice";
import { requireUser } from "@/lib/auth";
import { isBackendConfigured } from "@/lib/env";
import { eventTypeLabel } from "@/lib/event-types";
import { listMyEvents } from "@/lib/events";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Mes invitations", robots: { index: false } };

export default function DashboardPage(props: PageProps<"/tableau-de-bord">) {
  if (!isBackendConfigured) return <SetupRequired what="votre espace" />;
  return (
    <section className="mx-auto w-full max-w-[1180px] px-5 py-10">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard searchParams={props.searchParams} />
      </Suspense>
    </section>
  );
}

async function Dashboard({ searchParams }: { searchParams: PageProps<"/tableau-de-bord">["searchParams"] }) {
  const user = await requireUser("/tableau-de-bord");
  const sp = await searchParams;
  const events = await listMyEvents(user.id);
  const firstName = user.profile?.full_name?.split(" ")[0];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-terracotta uppercase">Mon espace</p>
          <h1 className="mt-1 text-[32px] leading-tight font-semibold">{firstName ? `Bonjour ${firstName}` : "Mes invitations"}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.isAdmin && (
            <ButtonLink href="/admin" variant="outline">
              Administration
            </ButtonLink>
          )}
          <ButtonLink href="/creer">
            <Plus />
            Nouvelle invitation
          </ButtonLink>
        </div>
      </div>

      {sp.archive && <Notice tone="success" className="mt-6">L&apos;invitation a été archivée.</Notice>}
      {sp.erreur === "acces-admin" && <Notice tone="error" className="mt-6">Cette page est réservée aux administrateurs.</Notice>}

      {events.length === 0 ? (
        <div className="mt-10 rounded-[28px] border border-dashed border-ink/15 bg-white px-6 py-14 text-center">
          <h2 className="text-2xl font-semibold">Votre première invitation vous attend</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-ink/60">
            Choisissez l&apos;événement, l&apos;IA rédige le texte, puis partagez le lien sur WhatsApp.
          </p>
          <ButtonLink href="/creer" size="lg" className="mt-6">
            <Plus />
            Créer mon invitation
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={`/tableau-de-bord/evenements/${e.id}`}
                className="group block overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-card transition-shadow hover:shadow-card-hover"
              >
                <InvitationCard theme={e.theme} category={eventTypeLabel(e.event_type)} names={e.hosts || e.title} className="aspect-[4/3]" />
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge event={e} />
                    <span className="flex items-center gap-1 text-xs font-bold text-ink/60">
                      <Users className="size-3.5" aria-hidden="true" />
                      {e.rsvpCount} réponse{e.rsvpCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  <h2 className="mt-2.5 truncate text-lg font-semibold group-hover:text-terracotta">{e.title}</h2>
                  <p className="truncate text-[13px] text-ink/55">{e.starts_at ? formatDate(e.starts_at) : "Date à préciser"}</p>
                  <div className="mt-2">
                    <PlanBadge event={e} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-72 animate-pulse rounded-3xl bg-sand/60" />
      ))}
    </div>
  );
}
