"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { THEMES } from "@/config/themes";
import { Field, Input, Select, SubmitButton, Textarea } from "@/components/ui/form";
import { Notice } from "@/components/ui/notice";
import { EVENT_TYPES, LANGUAGES } from "@/lib/event-types";
import type { ActionState, EventRow } from "@/lib/types";

export function EditForm({
  event,
  action,
  initialDate,
  initialTime,
}: {
  event: EventRow;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initialDate: string;
  initialTime: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);
  const err = state?.fieldErrors ?? {};
  const program = (event.program ?? []).map((p) => (p.time ? `${p.time} — ${p.label}` : p.label)).join("\n");

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="rounded-3xl border border-ink/5 bg-white p-5 shadow-card sm:p-7">
        <h2 className="mb-4 text-xl font-semibold">Texte</h2>
        <div className="grid gap-4">
          <Field id="title" label="Titre" error={err.title}>
            <Input id="title" name="title" defaultValue={event.title} maxLength={160} required />
          </Field>
          <Field id="hosts" label="Prénoms ou noms mis en avant" hint="(ex. : Awa & Moussa)">
            <Input id="hosts" name="hosts" defaultValue={event.hosts ?? ""} maxLength={160} />
          </Field>
          <Field id="message" label="Message d'invitation" error={err.message}>
            <Textarea id="message" name="message" defaultValue={event.message ?? ""} maxLength={2000} className="min-h-36" />
          </Field>
          <Field id="program" label="Programme" hint="(une ligne par moment : « 16 h 00 — Accueil »)">
            <Textarea id="program" name="program" defaultValue={program} className="min-h-32 font-mono text-sm" />
          </Field>
        </div>
      </div>

      <div className="rounded-3xl border border-ink/5 bg-white p-5 shadow-card sm:p-7">
        <h2 className="mb-4 text-xl font-semibold">Informations pratiques</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="eventType" label="Type d'événement">
            <Select id="eventType" name="eventType" defaultValue={event.event_type}>
              {EVENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="language" label="Langue">
            <Select id="language" name="language" defaultValue={event.language}>
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="date" label="Date" error={err.date}>
            <Input id="date" name="date" type="date" defaultValue={initialDate} />
          </Field>
          <Field id="time" label="Heure">
            <Input id="time" name="time" type="time" defaultValue={initialTime} />
          </Field>
          <Field id="venue" label="Lieu">
            <Input id="venue" name="venue" defaultValue={event.venue ?? ""} maxLength={160} />
          </Field>
          <Field id="city" label="Ville">
            <Input id="city" name="city" defaultValue={event.city ?? ""} maxLength={80} />
          </Field>
          <Field id="address" label="Adresse ou repère" hint="(ex. : derrière la pharmacie…)" className="sm:col-span-2">
            <Input id="address" name="address" defaultValue={event.address ?? ""} maxLength={240} />
          </Field>
          <Field id="maps_url" label="Lien Google Maps" hint="(facultatif)" error={err.maps_url} className="sm:col-span-2">
            <Input id="maps_url" name="maps_url" type="url" inputMode="url" defaultValue={event.maps_url ?? ""} placeholder="https://maps.app.goo.gl/…" maxLength={500} />
          </Field>
          <Field id="dress_code" label="Tenue souhaitée" hint="(facultatif)">
            <Input id="dress_code" name="dress_code" defaultValue={event.dress_code ?? ""} placeholder="Faso Dan Fani" maxLength={160} />
          </Field>
          <Field id="contact_phone" label="Téléphone de contact" hint="(facultatif)" error={err.contact_phone}>
            <Input id="contact_phone" name="contact_phone" type="tel" defaultValue={event.contact_phone ?? ""} placeholder="+226 70 00 00 00" maxLength={30} />
          </Field>
          <Field id="rsvp_deadline" label="Date limite de réponse" hint="(facultatif)">
            <Input id="rsvp_deadline" name="rsvp_deadline" type="date" defaultValue={event.rsvp_deadline ?? ""} />
          </Field>
          <Field id="theme" label="Étoffe">
            <Select id="theme" name="theme" defaultValue={event.theme}>
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      {state?.message && !state.ok && <Notice tone="error">{state.message}</Notice>}
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Enregistrement…" className="w-full sm:w-auto">
          <Save />
          Enregistrer
        </SubmitButton>
      </div>
    </form>
  );
}
