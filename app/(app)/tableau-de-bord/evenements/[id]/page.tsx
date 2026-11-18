import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Download, Eye, MessageCircle, Pencil, RefreshCw } from "lucide-react";
import { PLANS } from "@/config/plans";
import { getTheme } from "@/config/themes";
import { ButtonLink } from "@/components/button-link";
import { ActionButton } from "@/components/dashboard/action-button";
import { CopyLink } from "@/components/dashboard/copy-link";
import { InvitationCard } from "@/components/invitation-card";
import { RsvpLive } from "@/components/dashboard/rsvp-live";
import { PlanBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { buttonClass } from "@/components/ui/button-class";
import { Notice } from "@/components/ui/notice";
import { requireUser } from "@/lib/auth";
import { features } from "@/lib/env-server";
import { eventTypeLabel } from "@/lib/event-types";
import { getMyEvent, isPlanActive, isPublic, listEventPayments, listRsvps, planOf } from "@/lib/events";
import { formatDate, formatFcfa, formatShortDate } from "@/lib/format";
import { invitationUrl, whatsappMessage, whatsappShareUrl } from "@/lib/share";
import {
  archiveEvent,
  checkPayment,
  deleteRsvp,
  fetchRsvps,
  publishEvent,
  regenerateText,
  unpublishEvent,
} from "./actions";

export const metadata: Metadata = { title: "Mon invitation", robots: { index: false } };

export default function EventPage(props: PageProps<"/tableau-de-bord/evenements/[id]">) {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-5 py-8 lg:px-8 lg:py-10">
      <Link href="/tableau-de-bord" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 hover:text-brand">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Mes invitations
      </Link>
      <Suspense fallback={<div className="mt-6 h-[600px] animate-pulse rounded-2xl bg-mist/60" />}>
        <EventDashboard {...props} />
      </Suspense>
    </section>
  );
}

async function EventDashboard({ params, searchParams }: PageProps<"/tableau-de-bord/evenements/[id]">) {
  const { id } = await params;
  await requireUser(`/tableau-de-bord/evenements/${id}`);
  const sp = await searchParams;
  const event = await getMyEvent(id);
  const [rsvps, payments] = await Promise.all([listRsvps(id), listEventPayments(id)]);

  const plan = planOf(event);
  const active = isPlanActive(event);
  const online = isPublic(event);
  const theme = getTheme(event.theme);
  const url = invitationUrl(event.slug);
  const shareText = whatsappMessage(event);
  const reminder = `Bonjour, petit rappel pour ${event.title}${event.starts_at ? ` le ${formatDate(event.starts_at)}` : ""}. Pouvez-vous confirmer votre présence ici : ${url}`;
  const pendingPayment = payments.find((p) => p.status === "pending");

  return (
    <div className="mt-5 space-y-8">
      {sp.nouveau && (
        <Notice tone="success" title="Votre invitation est prête">
          Relisez le texte, choisissez une formule pour activer le lien, puis partagez-le sur WhatsApp.
        </Notice>
      )}
      {sp.enregistre && <Notice tone="success">Modifications enregistrées.</Notice>}

      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge event={event} />
            <PlanBadge event={event} />
          </div>
          <h1 className="mt-2 text-[28px] leading-tight font-extrabold text-balance sm:text-[34px]">{event.title}</h1>
          <p className="mt-1 text-[15px] text-ink/60">
            {eventTypeLabel(event.event_type)}
            {event.starts_at && ` · ${formatDate(event.starts_at)}`}
            {event.city && ` · ${event.city}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/tableau-de-bord/evenements/${id}/apercu`} variant="outline">
            <Eye />
            Aperçu
          </ButtonLink>
          <ButtonLink href={`/tableau-de-bord/evenements/${id}/modifier`} variant="outline">
            <Pencil />
            Modifier
          </ButtonLink>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Carte + IA image */}
        <div className="space-y-4">
          <InvitationCard
            theme={event.theme}
            category={eventTypeLabel(event.event_type)}
            names={event.hosts || event.title}
            date={event.starts_at ? formatDate(event.starts_at) : undefined}
            place={event.city ?? undefined}
            sizes="360px"
            className="aspect-[9/16] rounded-2xl border border-ink/10"
          />

          <p className="text-center text-sm text-ink/60">
            Fond : <span className="font-bold text-ink">{theme.name}</span>.{" "}
            <Link href={`/tableau-de-bord/evenements/${id}/modifier`} className="font-bold text-brand underline underline-offset-4">
              Changer de fond
            </Link>
          </p>
        </div>

        {/* Étapes */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-xl font-bold">Mise en ligne</h2>
            <ol className="mt-4 space-y-5">
              <StepItem n={1} done title="Texte de l'invitation">
                <p className="line-clamp-3 text-sm text-ink/65">{event.message || "Aucun message pour l'instant."}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ButtonLink href={`/tableau-de-bord/evenements/${id}/modifier`} variant="outline" size="sm">
                    <Pencil />
                    Modifier le texte
                  </ButtonLink>
                  {features.aiText && (
                    <ActionButton
                      action={regenerateText.bind(null, id)}
                      variant="outline"
                      pendingLabel="L'IA réécrit…"
                      confirm="Remplacer le titre, le message et le programme par une nouvelle proposition de l'IA ?"
                    >
                      <RefreshCw />
                      Réécrire avec l&apos;IA
                    </ActionButton>
                  )}
                </div>
              </StepItem>

              <StepItem n={2} done={active} title="Formule">
                {active && plan ? (
                  <p className="text-sm text-ink/70">
                    {plan.name} active jusqu&apos;au {formatShortDate(event.plan_expires_at)} ·{" "}
                    {plan.limits.guests ? `${plan.limits.guests} invités suivis` : "invités illimités"}.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-ink/70">
                      Paiement unique par Orange Money ou Moov Money, à partir de {formatFcfa(PLANS.essentiel.price)}. Le lien reste actif 3 mois.
                    </p>
                    <ButtonLink href={`/tableau-de-bord/evenements/${id}/formule`} size="sm" className="mt-3">
                      Choisir une formule
                    </ButtonLink>
                    {pendingPayment && (
                      <div className="mt-3">
                        <ActionButton action={checkPayment.bind(null, pendingPayment.id)} variant="outline">
                          Vérifier mon paiement en cours
                        </ActionButton>
                      </div>
                    )}
                  </>
                )}
              </StepItem>

              <StepItem n={3} done={online} title="Publication">
                {online ? (
                  <>
                    <p className="text-sm text-ink/70">Votre invitation est en ligne.</p>
                    <div className="mt-3">
                      <ActionButton
                        action={unpublishEvent.bind(null, id)}
                        variant="outline"
                        confirm="Désactiver le lien ? Vos invités ne pourront plus ouvrir l'invitation."
                      >
                        Désactiver le lien
                      </ActionButton>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-ink/70">
                      {active ? "Tout est prêt : publiez pour activer le lien." : "Disponible après le choix d'une formule."}
                    </p>
                    {active && (
                      <div className="mt-3">
                        <ActionButton action={publishEvent.bind(null, id)} variant="dark">
                          Publier l&apos;invitation
                        </ActionButton>
                      </div>
                    )}
                  </>
                )}
              </StepItem>

              <StepItem n={4} done={online && rsvps.length > 0} title="Partage">
                {online ? (
                  <div className="space-y-3">
                    <CopyLink url={url} />
                    <a href={whatsappShareUrl(shareText)} target="_blank" rel="noopener noreferrer" className={buttonClass("dark", "w-full sm:w-auto")}>
                      <MessageCircle />
                      Partager sur WhatsApp
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-ink/70">Le lien à partager apparaîtra ici une fois l&apos;invitation publiée.</p>
                )}
              </StepItem>
            </ol>
          </div>

          {/* Réponses */}
          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-card sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Réponses des invités</h2>
              {rsvps.length > 0 && (
                <a href={`/tableau-de-bord/evenements/${id}/export`} className={buttonClass("outline", "h-9 px-4 text-sm")}>
                  <Download />
                  Exporter (Excel)
                </a>
              )}
            </div>
            <RsvpLive
              initial={rsvps}
              guestLimit={event.guest_limit}
              reminderText={reminder}
              canRemind={Boolean(plan?.limits.autoReminders)}
              onRefresh={fetchRsvps.bind(null, id)}
              onDelete={deleteRsvp.bind(null, id)}
            />
            {!plan?.limits.autoReminders && rsvps.some((r) => r.response === "maybe") && (
              <p className="mt-3 text-xs text-ink/55">Les relances WhatsApp sont incluses dans les formules Célébration et Prestige Pro.</p>
            )}
          </div>

          {payments.length > 0 && (
            <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-card sm:p-6">
              <h2 className="text-lg font-bold">Paiements</h2>
              <ul className="mt-3 divide-y divide-ink/8 text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2.5">
                    <span>
                      {PLANS[p.plan].name} · {formatFcfa(p.amount)}
                    </span>
                    <span className="text-ink/55">
                      {formatShortDate(p.created_at)} ·{" "}
                      {{ pending: "en attente", paid: "payé", failed: "échoué", expired: "expiré", cancelled: "annulé" }[p.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <ActionButton
              action={archiveEvent.bind(null, id)}
              variant="danger"
              confirm="Archiver cette invitation ? Le lien sera désactivé et elle disparaîtra de votre liste."
            >
              Archiver l&apos;invitation
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepItem({ n, done, title, children }: { n: number; done?: boolean; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-heading text-sm font-bold ${done ? "bg-emerald-500 text-white" : "border border-ink/15 bg-paper text-ink/50"}`}
        aria-hidden="true"
      >
        {done ? "✓" : n}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-sans text-[15px] font-bold">{title}</h3>
        <div className="mt-1">{children}</div>
      </div>
    </li>
  );
}
