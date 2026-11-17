import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { AdminSkeleton } from "@/components/admin/ui";
import { TEXT_MODELS } from "@/lib/ai/invitation-text";
import { requireAdmin } from "@/lib/auth";
import { isBackendConfigured, publicEnv } from "@/lib/env";
import { features } from "@/lib/env-server";
import { createClient } from "@/lib/neon/data";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Réglages — Administration", robots: { index: false } };

export default function SettingsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("key, value");
  const map = new Map((data ?? []).map((r: { key: string; value: unknown }) => [r.key, r.value]));

  // Seulement « configuré / non configuré » : jamais la valeur des clés.
  const services = [
    { name: "Base de données et connexion Neon", ok: isBackendConfigured, help: "NEON_DATA_API_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET" },
    { name: "Connexion SQL serveur (Neon)", ok: features.database, help: "DATABASE_URL" },
    { name: `Textes IA — ${TEXT_MODELS.join(" puis ")}`, ok: features.aiText, help: "GEMINI_API_KEY" },
    { name: "Paiement SasPay", ok: features.payments, help: "SASPAY_SECRET_KEY, SASPAY_WEBHOOK_SECRET" },
    { name: `Adresse du site : ${publicEnv.siteUrl}`, ok: !publicEnv.siteUrl.includes("localhost"), help: "NEXT_PUBLIC_SITE_URL (adresse publique en production)" },
  ];
  const testAmount = process.env.SASPAY_TEST_AMOUNT_XOF;

  return (
    <div className="space-y-6">
      <h1 className="text-[30px] leading-tight font-semibold">Réglages</h1>

      <SettingsForm
        showSampleContent={map.get("show_sample_content") === true}
        maintenanceMessage={typeof map.get("maintenance_message") === "string" ? (map.get("maintenance_message") as string) : ""}
      />

      <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-sans text-[15px] font-bold">État des services</h2>
        <ul className="mt-3 divide-y divide-ink/5">
          {services.map((s) => (
            <li key={s.name} className="flex items-start gap-3 py-3 text-sm">
              {s.ok ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-forest" aria-label="Configuré" />
              ) : (
                <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-label="Non configuré" />
              )}
              <span>
                <span className="block font-bold">{s.name}</span>
                <span className="font-mono text-xs text-ink/55">{s.help}</span>
              </span>
            </li>
          ))}
        </ul>
        {testAmount && (
          <p className="mt-3 rounded-xl bg-[#FBF1DC] px-3 py-2 text-sm font-bold">
            Mode test de paiement actif : tous les paiements sont facturés {testAmount} FCFA (SASPAY_TEST_AMOUNT_XOF). À retirer en production.
          </p>
        )}
      </section>
    </div>
  );
}
