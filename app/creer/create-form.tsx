"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { Sparkles } from "lucide-react";
import { THEMES, type ThemeId } from "@/config/themes";
import { Field, Input, Select, SubmitButton, Textarea } from "@/components/ui/form";
import { Notice } from "@/components/ui/notice";
import { EVENT_TYPES, LANGUAGES } from "@/lib/event-types";
import type { ActionState, EventType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createInvitation } from "./actions";

const TONES = [
  { id: "chaleureux", label: "Chaleureux" },
  { id: "solennel", label: "Solennel" },
  { id: "festif", label: "Festif" },
  { id: "sobre", label: "Sobre" },
];

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-3xl border border-ink/5 bg-white p-5 shadow-card sm:p-7">
      <legend className="sr-only">{title}</legend>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-forest font-heading text-sm font-bold text-cream">{n}</span>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </fieldset>
  );
}

export function CreateForm({ aiEnabled }: { aiEnabled: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(createInvitation, null);
  const [eventType, setEventType] = useState<EventType>("mariage");
  const [theme, setTheme] = useState<ThemeId>("faso-dan-fani");
  const err = state?.fieldErrors ?? {};

  const onTypeChange = (value: EventType) => {
    setEventType(value);
    const def = EVENT_TYPES.find((t) => t.id === value)?.defaultTheme;
    if (def) setTheme(def);
  };

  const hostsLabel =
    eventType === "mariage" || eventType === "dot"
      ? "Prénoms des mariés"
      : eventType === "entreprise"
        ? "Nom de l'entreprise ou de l'organisateur"
        : eventType === "funerailles"
          ? "Nom de la personne honorée"
          : "Qui célèbre-t-on ?";

  return (
    <form action={action} className="space-y-5" noValidate>
      <Step n={1} title="L'événement">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="eventType" label="Type d'événement" error={err.eventType}>
            <Select id="eventType" name="eventType" value={eventType} onChange={(e) => onTypeChange(e.target.value as EventType)}>
              {EVENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="hosts" label={hostsLabel} error={err.hosts}>
            <Input
              id="hosts"
              name="hosts"
              placeholder={eventType === "mariage" ? "Awa & Moussa" : "Fatou"}
              maxLength={160}
              required
              aria-invalid={Boolean(err.hosts)}
            />
          </Field>
          <Field id="date" label="Date" error={err.date}>
            <Input id="date" name="date" type="date" required aria-invalid={Boolean(err.date)} />
          </Field>
          <Field id="time" label="Heure de début" hint="(facultatif)" error={err.time}>
            <Input id="time" name="time" type="time" defaultValue="16:00" />
          </Field>
        </div>
      </Step>

      <Step n={2} title="Le lieu">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="venue" label="Lieu" hint="(salle, cour, église, mosquée…)" error={err.venue}>
            <Input id="venue" name="venue" placeholder="Jardin des Manguiers" maxLength={160} />
          </Field>
          <Field id="city" label="Ville" error={err.city}>
            <Input id="city" name="city" placeholder="Ouagadougou" defaultValue="Ouagadougou" maxLength={80} required aria-invalid={Boolean(err.city)} />
          </Field>
        </div>
      </Step>

      <Step n={3} title="Le style">
        <p className="mb-3 text-sm font-bold">Étoffe de l&apos;invitation</p>
        <input type="hidden" name="theme" value={theme} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Étoffe de l'invitation">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={theme === t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "group relative aspect-[4/5] overflow-hidden rounded-2xl text-left ring-offset-2 ring-offset-white transition",
                theme === t.id ? "ring-3 ring-terracotta" : "ring-1 ring-ink/10 hover:ring-ink/30",
              )}
            >
              <Image src={t.image} alt="" fill sizes="(min-width: 640px) 160px, 45vw" className="object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent px-3 pt-8 pb-2.5 text-sm font-bold text-cream">
                {t.name}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field id="language" label="Langue du texte">
            <Select id="language" name="language" defaultValue="fr">
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="tone" label="Ton">
            <Select id="tone" name="tone" defaultValue="chaleureux">
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="details" label="Précisions pour le texte" hint="(facultatif)" className="sm:col-span-2">
            <Textarea
              id="details"
              name="details"
              maxLength={600}
              placeholder="Ex. : cérémonie religieuse puis réception ; tenue en Faso Dan Fani souhaitée ; prière de confirmer avant le 1er décembre."
            />
          </Field>
        </div>
      </Step>

      {state?.message && !state.ok && <Notice tone="error">{state.message}</Notice>}

      <div className="flex flex-col items-center gap-3 pt-2">
        <SubmitButton className="h-12 w-full px-8 text-base sm:w-auto" pendingLabel={aiEnabled ? "L'IA rédige votre invitation…" : "Création de votre invitation…"}>
          <Sparkles />
          Créer mon invitation
        </SubmitButton>
        <p className="text-center text-[13px] text-ink/55">
          {aiEnabled
            ? "L'IA rédige le titre, le message et le programme. Vous pourrez tout modifier ensuite."
            : "Un texte d'invitation est proposé automatiquement. Vous pourrez tout modifier ensuite."}
        </p>
      </div>
    </form>
  );
}
