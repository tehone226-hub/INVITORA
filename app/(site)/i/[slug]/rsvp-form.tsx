"use client";

import { useActionState, useState } from "react";
import { Send } from "lucide-react";
import { Field, Input, SubmitButton, Textarea } from "@/components/ui/form";
import { Notice } from "@/components/ui/notice";
import type { ActionState, RsvpResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { submitRsvp } from "./actions";

const CHOICES: { id: RsvpResponse; label: string }[] = [
  { id: "yes", label: "Je serai présent(e)" },
  { id: "maybe", label: "Peut-être" },
  { id: "no", label: "Je ne pourrai pas venir" },
];

/** En mode démonstration (page /exemple), rien n'est enregistré. */
async function demoSubmit(): Promise<ActionState> {
  return { ok: true, message: "Ceci est un exemple : dans une vraie invitation, l'organisateur reçoit votre réponse en temps réel." };
}

export function RsvpForm({ slug, deadline, demo = false }: { slug: string; deadline?: string; demo?: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(demo ? demoSubmit : submitRsvp, null);
  const [response, setResponse] = useState<RsvpResponse | null>(null);
  const err = state?.fieldErrors ?? {};

  if (state?.ok) {
    return (
      <Notice tone="success" title="Réponse envoyée">
        <p className="mt-1">{state.message}</p>
      </Notice>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-ink/8 bg-white p-5 shadow-card sm:p-7" noValidate>
      <h2 className="text-center font-heading text-2xl font-extrabold">Confirmez votre présence</h2>
      {deadline && <p className="mt-1 text-center text-sm text-ink/55">Merci de répondre avant le {deadline}.</p>}

      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="response" value={response ?? ""} />
      {/* Piège à robots : invisible pour les personnes */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="mt-5 grid gap-2" role="radiogroup" aria-label="Votre réponse">
        {CHOICES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={response === c.id}
            onClick={() => setResponse(c.id)}
            className={cn(
              "h-12 rounded-xl border text-[15px] font-bold transition-colors",
              response === c.id ? "border-brand bg-brand text-white" : "border-ink/12 bg-white text-ink hover:border-brand/40 hover:bg-brand-soft",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      {err.response && <p className="mt-2 text-sm font-semibold text-red-700">{err.response}</p>}

      <div className="mt-5 space-y-4">
        <Field id="name" label="Votre nom" error={err.name}>
          <Input id="name" name="name" autoComplete="name" maxLength={120} required aria-invalid={Boolean(err.name)} />
        </Field>
        {response !== "no" && (
          <Field id="guests_count" label="Nombre de personnes" hint="(vous compris)">
            <Input id="guests_count" name="guests_count" type="number" inputMode="numeric" min={1} max={20} defaultValue={1} />
          </Field>
        )}
        <Field id="phone" label="Téléphone" hint="(facultatif)" error={err.phone}>
          <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+226 70 00 00 00" maxLength={30} />
        </Field>
        <Field id="message" label="Un mot pour l'organisateur" hint="(facultatif)">
          <Textarea id="message" name="message" maxLength={500} className="min-h-20" />
        </Field>
      </div>

      {state?.message && !state.ok && <Notice tone="error" className="mt-4">{state.message}</Notice>}

      <SubmitButton className="mt-5 h-12 w-full" pendingLabel="Envoi…">
        <Send />
        Envoyer ma réponse
      </SubmitButton>
    </form>
  );
}
