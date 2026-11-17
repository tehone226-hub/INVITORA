import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Clock, Mail, MessageSquareText, Sparkles, Users, Wallet } from "lucide-react";
import { PLANS } from "@/config/plans";
import { KpiTile, MiniBarChart } from "@/components/admin/kpi";
import { AdminSkeleton, AdminTitle, Panel, Pill } from "@/components/admin/ui";
import { SetupRequired } from "@/components/setup-required";
import { Notice } from "@/components/ui/notice";
import { getAdminOverview } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { isBackendConfigured } from "@/lib/env";
import { features } from "@/lib/env-server";
import { formatFcfa, formatShortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };

const n = (v: number) => v.toLocaleString("fr-FR");
const PAYMENT_LABEL: Record<string, string> = { pending: "En attente", paid: "Payé", failed: "Échoué", expired: "Expiré", cancelled: "Annulé" };
const PAYMENT_TONE = { pending: "warn", paid: "good", failed: "bad", expired: "neutral", cancelled: "neutral" } as const;

export default function AdminHome() {
  if (!isBackendConfigured) return <SetupRequired what="l'administration" />;
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Overview />
    </Suspense>
  );
}

function ListHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3.5">
      <h2 className="font-sans text-[15px] font-bold tracking-normal">{title}</h2>
      <Link href={href} className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-dark">
        Tout voir
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

async function Overview() {
  await requireAdmin();
  const o = await getAdminOverview();
  const missing = [
    !features.database && "connexion SQL serveur (Neon)",
    !features.aiText && "Gemini (textes)",
    !features.payments && "SasPay (paiement)",
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <AdminTitle title="Vue d'ensemble">Ce qui se passe sur Invitora : inscriptions, invitations, réponses et paiements.</AdminTitle>

      {process.env.SASPAY_TEST_AMOUNT_XOF && (
        <Notice tone="error" title="Mode test de paiement actif">
          Tous les paiements sont facturés {process.env.SASPAY_TEST_AMOUNT_XOF} FCFA (variable SASPAY_TEST_AMOUNT_XOF). Retirez-la avant d&apos;ouvrir au public.
        </Notice>
      )}

      {missing.length > 0 && (
        <Notice tone="warning" title="Services non configurés">
          {missing.join(", ")}. Voir <Link href="/admin/reglages" className="font-bold underline">Réglages</Link>.
        </Notice>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          tone="night"
          label="Revenus encaissés"
          value={formatFcfa(o.revenue)}
          detail={`${formatFcfa(o.revenue30)} sur 30 jours · ${n(o.paidPayments)} paiement${o.paidPayments > 1 ? "s" : ""}`}
          icon={<Wallet />}
        />
        <KpiTile label="Utilisateurs" value={n(o.users)} icon={<Users />} />
        <KpiTile label="Invitations" value={n(o.events)} detail={`${n(o.online)} en ligne`} icon={<Mail />} />
        <KpiTile label="Réponses des invités" value={n(o.rsvps)} icon={<MessageSquareText />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MiniBarChart title="Inscriptions par jour" color="#6D3BF5" data={o.signupsSeries} />
        <MiniBarChart title="Réponses d'invités par jour" color="#12A37A" data={o.rsvpSeries} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <KpiTile label="Paiements en attente" value={n(o.pendingPayments)} icon={<Clock />} />
        <KpiTile label="Textes IA (30 j)" value={n(o.aiText30)} icon={<Sparkles />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <ListHeader title="Derniers paiements" href="/admin/paiements" />
          <ul className="divide-y divide-ink/8 px-5 text-sm">
            {o.recentPayments.length === 0 && <li className="py-6 text-center text-ink/55">Aucun paiement pour le moment.</li>}
            {o.recentPayments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block font-bold">{formatFcfa(p.amount)}</span>
                  <span className="text-xs text-ink/55">
                    {PLANS[p.plan].name} · {formatShortDate(p.created_at)}
                  </span>
                </span>
                <Pill tone={PAYMENT_TONE[p.status as keyof typeof PAYMENT_TONE] ?? "neutral"}>{PAYMENT_LABEL[p.status] ?? p.status}</Pill>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <ListHeader title="Dernières inscriptions" href="/admin/utilisateurs" />
          <ul className="divide-y divide-ink/8 px-5 text-sm">
            {o.recentUsers.length === 0 && <li className="py-6 text-center text-ink/55">Aucune inscription pour le moment.</li>}
            {o.recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft font-heading text-sm font-bold text-brand uppercase"
                    aria-hidden="true"
                  >
                    {(u.full_name || u.email || "?").slice(0, 1)}
                  </span>
                  <span className="truncate font-semibold">{u.full_name || u.email}</span>
                </span>
                <span className="shrink-0 text-xs text-ink/55">{formatShortDate(u.created_at)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
