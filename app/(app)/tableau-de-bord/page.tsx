import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { ButtonLink } from "@/components/button-link";
import { PlanBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { InvitationCard } from "@/components/invitation-card";
import { SetupRequired } from "@/components/setup-required";
import { Notice } from "@/components/ui/notice";
import { requireUser } from "@/lib/auth";
import { isBackendConfigured } from "@/lib/env";
import { eventTypeLabel } from "@/lib/event-types";
import { isPublic, listMyEvents } from "@/lib/events";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Mes invitations", robots: { index: false } };

export default function DashboardPage(props: PageProps<"/tableau-de-bord">) {
  if (!isBackendConfigured) return <SetupRequired what="votre espace" />;
  return (
    <section className="mx-auto w-full max-w-[1240px] px-5 py-8 lg:px-8 lg:py-10">
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
  const online = events.filter((e) => isPublic(e)).length;
  const answers = events.reduce((sum, e) => sum + e.rsvpCount, 0);

  return (
    <>
      <PageHeader
        eyebrow="Mon espace"
        title={firstName ? `Bonjour ${firstName}` : "Mes invitations"}
        description="Créez vos invitations, partagez-les sur WhatsApp et suivez les réponses de vos invités."
        actions={
          <ButtonLink href="/creer">
            <Plus />
            Nouvelle invitation
          </ButtonLink>
        }
      />

      {events.length > 0 && (
        <dl className="mt-7 grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Invitations", value: events.length },
            { label: "En ligne", value: online },
            { label: "Réponses reçues", value: answers },
          ].map((s, i) => (
            <div key={s.label} className={i === 0 ? "rounded-xl bg-night-glow p-4 text-white sm:p-5" : "rounded-xl border border-ink/10 bg-white p-4 sm:p-5"}>
              <dt className={i === 0 ? "text-xs font-semibold text-white/70 sm:text-[13px]" : "text-xs font-semibold text-ink/60 sm:text-[13px]"}>{s.label}</dt>
              <dd className="mt-2 font-heading text-[28px] leading-none font-extrabold tabular-nums sm:text-[32px]">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {sp.archive && <Notice tone="success" className="mt-6">L&apos;invitation a été archivée.</Notice>}
      {sp.erreur === "acces-admin" && <Notice tone="error" className="mt-6">Cette page est réservée aux administrateurs.</Notice>}

      {events.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-brand/30 bg-brand-soft/50 px-6 py-16 text-center">
          <h2 className="text-2xl font-extrabold">Votre première invitation vous attend</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-ink/60">
            Choisissez l&apos;événement, l&apos;IA rédige le texte, puis partagez le lien sur WhatsApp.
          </p>
          <ButtonLink href="/creer" size="lg" className="mt-6">
            <Plus />
            Créer mon invitation
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={`/tableau-de-bord/evenements/${e.id}`}
                className="group block overflow-hidden rounded-2xl border border-ink/10 bg-white p-2 transition hover:border-brand/40 hover:shadow-card-hover"
              >
                <InvitationCard theme={e.theme} category={eventTypeLabel(e.event_type)} names={e.hosts || e.title} className="aspect-[9/16] rounded-xl" />
                <div className="px-3 pt-4 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge event={e} />
                    <span className="flex items-center gap-1 text-xs font-bold text-ink/60">
                      <Users className="size-3.5" aria-hidden="true" />
                      {e.rsvpCount} réponse{e.rsvpCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  <h2 className="mt-2.5 flex items-center justify-between gap-2 text-lg font-bold group-hover:text-brand">
                    <span className="truncate">{e.title}</span>
                    <ArrowUpRight className="size-4 shrink-0 text-ink/30 group-hover:text-brand" aria-hidden="true" />
                  </h2>
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
        <div key={i} className="h-72 animate-pulse rounded-2xl bg-mist/60" />
      ))}
    </div>
  );
}
