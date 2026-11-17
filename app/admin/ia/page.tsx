import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSkeleton, Pill } from "@/components/admin/ui";
import { listAiUsage } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Usage de l'IA — Administration", robots: { index: false } };

const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Ouagadougou" });

export default function AiUsagePage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AiUsage />
    </Suspense>
  );
}

async function AiUsage() {
  await requireAdmin();
  const rows = await listAiUsage();
  return (
    <div className="space-y-5">
      <h1 className="text-[30px] leading-tight font-semibold">Usage de l&apos;IA</h1>
      <p className="text-sm text-ink/60">
        100 derniers appels à Gemini (textes). Limite : 15 textes par utilisateur et par jour. Les fonds d&apos;invitation ne sont plus générés par IA.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-ink/5 bg-white shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink/10 text-xs text-ink/55 uppercase">
            <tr>
              <th className="px-4 py-3 font-bold">Date</th>
              <th className="px-4 py-3 font-bold">Type</th>
              <th className="px-4 py-3 font-bold">Modèle</th>
              <th className="px-4 py-3 font-bold">Utilisateur · invitation</th>
              <th className="px-4 py-3 font-bold">Résultat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/55">
                  Aucun appel à l&apos;IA pour le moment.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 whitespace-nowrap">{fmt.format(new Date(r.created_at))}</td>
                <td className="px-4 py-3">{r.kind === "text" ? "Texte" : "Image"}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.model}</td>
                <td className="px-4 py-3">
                  <p>{r.profiles?.email ?? "—"}</p>
                  <p className="text-xs text-ink/55">{r.events?.title ?? "—"}</p>
                </td>
                <td className="px-4 py-3">{r.ok ? <Pill tone="good">Réussi</Pill> : <Pill tone="bad">Échec (secours)</Pill>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
