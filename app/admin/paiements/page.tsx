import type { Metadata } from "next";
import { Suspense } from "react";
import { PLANS } from "@/config/plans";
import { AdminSkeleton, FilterBar, Pill } from "@/components/admin/ui";
import { ActionButton } from "@/components/dashboard/action-button";
import { Notice } from "@/components/ui/notice";
import { listPayments } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { features } from "@/lib/env-server";
import { formatFcfa, formatShortDate } from "@/lib/format";
import { adminActivatePayment, adminRefreshPayment } from "../actions";

export const metadata: Metadata = { title: "Paiements — Administration", robots: { index: false } };

const STATUSES = [
  { id: "pending", label: "En attente" },
  { id: "paid", label: "Payés" },
  { id: "failed", label: "Échoués" },
  { id: "expired", label: "Expirés" },
  { id: "cancelled", label: "Annulés" },
];
const LABEL: Record<string, string> = { pending: "En attente", paid: "Payé", failed: "Échoué", expired: "Expiré", cancelled: "Annulé" };
const TONE = { pending: "warn", paid: "good", failed: "bad", expired: "neutral", cancelled: "neutral" } as const;

export default function AdminPaymentsPage(props: PageProps<"/admin/paiements">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Payments searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Payments({ searchParams }: { searchParams: PageProps<"/admin/paiements">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = typeof sp.statut === "string" ? sp.statut : "";
  const payments = await listPayments(status);

  return (
    <div className="space-y-5">
      <h1 className="text-[30px] leading-tight font-semibold">Paiements</h1>
      <Notice tone="info">
        Les formules s&apos;activent automatiquement par le webhook SasPay signé. « Activer » ne sert qu&apos;en cas de webhook perdu :
        l&apos;activation n&apos;a lieu que si l&apos;API SasPay confirme le paiement.
      </Notice>
      {!features.payments && <Notice tone="warning">SasPay n&apos;est pas configuré (clés absentes).</Notice>}
      <FilterBar basePath="/admin/paiements" status={status} statuses={STATUSES} placeholder="—" />
      <div className="overflow-x-auto rounded-2xl border border-ink/5 bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink/10 text-xs text-ink/55 uppercase">
            <tr>
              <th className="px-4 py-3 font-bold">Date</th>
              <th className="px-4 py-3 font-bold">Client · invitation</th>
              <th className="px-4 py-3 font-bold">Formule</th>
              <th className="px-4 py-3 text-right font-bold">Montant</th>
              <th className="px-4 py-3 font-bold">Statut</th>
              <th className="px-4 py-3 font-bold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/55">
                  Aucun paiement.
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="align-top">
                <td className="px-4 py-3 whitespace-nowrap">{formatShortDate(p.created_at)}</td>
                <td className="px-4 py-3">
                  <p className="font-bold">{p.profiles?.email ?? "—"}</p>
                  <p className="text-xs text-ink/55">{p.events?.title ?? "—"}</p>
                </td>
                <td className="px-4 py-3">{PLANS[p.plan].name}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatFcfa(p.amount)}</td>
                <td className="px-4 py-3">
                  <Pill tone={TONE[p.status]}>{LABEL[p.status]}</Pill>
                </td>
                <td className="px-4 py-3">
                  {p.status === "pending" && features.payments && (
                    <div className="flex flex-wrap justify-end gap-2">
                      <ActionButton action={adminRefreshPayment.bind(null, p.id)}>Vérifier</ActionButton>
                      <ActionButton
                        action={adminActivatePayment.bind(null, p.id)}
                        variant="forest"
                        confirm="Activer la formule si SasPay confirme le paiement ?"
                      >
                        Activer
                      </ActionButton>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
