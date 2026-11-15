"use client";

import { useActionState } from "react";
import { Field, Input, SubmitButton } from "@/components/ui/form";
import { Notice } from "@/components/ui/notice";
import type { ActionState } from "@/lib/types";
import { updateSettings } from "../actions";

export function SettingsForm({ showSampleContent, maintenanceMessage }: { showSampleContent: boolean; maintenanceMessage: string }) {
  const [state, action] = useActionState<ActionState, FormData>(updateSettings, null);
  return (
    <form action={action} className="space-y-5 rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" name="show_sample_content" defaultChecked={showSampleContent} className="mt-1 size-5 accent-terracotta" />
        <span>
          <span className="block font-bold">Afficher les contenus d&apos;exemple sur l&apos;accueil</span>
          <span className="text-sm text-ink/60">
            Chiffres et témoignages de la maquette (« +12 000 événements », avis…). À laisser désactivé tant qu&apos;ils ne sont pas réels (règle 7).
          </span>
        </span>
      </label>
      <Field id="maintenance_message" label="Bandeau d'information" hint="(vide = aucun bandeau)">
        <Input id="maintenance_message" name="maintenance_message" defaultValue={maintenanceMessage} maxLength={200} placeholder="Ex. : maintenance ce soir de 22 h à 23 h." />
      </Field>
      {state?.message && <Notice tone={state.ok ? "success" : "error"}>{state.message}</Notice>}
      <SubmitButton pendingLabel="Enregistrement…">Enregistrer</SubmitButton>
    </form>
  );
}
