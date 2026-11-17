import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PLANS } from "@/config/plans";
import { KpiTile, MiniBarChart } from "@/components/admin/kpi";
import { AdminSkeleton } from "@/components/admin/ui";
import { SetupRequired } from "@/components/setup-required";
import { Notice } from "@/components/ui/notice";
import { getAdminOverview } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { isBackendConfigured } from "@/lib/env";
import { features } from "@/lib/env-server";
import { formatFcfa, formatShortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };

const n = (v: number) => v.toLocaleString("fr-FR");
const PAYMENT_LABEL: Record<string, string> = { pending: "en attente", paid: "payé", failed: "échoué", expired: "expiré", cancelled: "annulé" };

export default function AdminHome() {
  if (!isBackendConfigured) return <SetupRequired what="l'administration" />;
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  await requireAdmin();
  const o = await getAdminOverview();
  const missing = [
    !features.database && "clé service Supabase",
    !features.aiText && "Gemini (textes)",
    !features.payments && "SasPay (paiement)",
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <h1 className="text-[30px] leading-tight font-semibold">Vue d&apos;ensemble</h1>

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

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiTile label="Utilisateurs" value={n(o.users)} />
        <KpiTile label="Invitations" value={n(o.events)} detail={`${n(o.online)} en ligne`} />
        <KpiTile label="Réponses des invités" value={n(o.rsvps)} />
        <KpiTile label="Revenus encaissés" value={formatFcfa(o.revenue)} detail={`${formatFcfa(o.revenue30)} sur 30 jours · ${n(o.paidPayments)} paiements`} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <MiniBarChart title="Inscriptions par jour" color="#C0572B" data={o.signupsSeries} />
        <MiniBarChart title="Réponses d'invités par jour" color="#2E8058" data={o.rsvpSeries} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <KpiTile label="Paiements en attente" value={n(o.pendingPayments)} />
        <KpiTile label="Textes IA (30 j)" value={n(o.aiText30)} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-[15px] font-bold">Derniers paiements</h2>
            <Link href="/admin/paiements" className="text-sm font-bold text-terracotta">
              Tout voir
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-ink/5 text-sm">
            {o.recentPayments.length === 0 && <li className="py-3 text-ink/55">Aucun paiement pour le moment.</li>}
            {o.recentPayments.map((p) => (
              <li key={p.id} className="flex justify-between gap-2 py-2.5">
                <span>
                  {PLANS[p.plan].name} · {formatFcfa(p.amount)}
                </span>
                <span className="text-ink/55">
                  {formatShortDate(p.created_at)} · {PAYMENT_LABEL[p.status] ?? p.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-[15px] font-bold">Dernières inscriptions</h2>
            <Link href="/admin/utilisateurs" className="text-sm font-bold text-terracotta">
              Tout voir
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-ink/5 text-sm">
            {o.recentUsers.map((u) => (
              <li key={u.id} className="flex justify-between gap-2 py-2.5">
                <span className="truncate">{u.full_name || u.email}</span>
                <span className="shrink-0 text-ink/55">{formatShortDate(u.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
