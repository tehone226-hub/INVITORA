"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { Field, Input, SubmitButton } from "@/components/ui/form";
import { Notice } from "@/components/ui/notice";
import type { ActionState } from "@/lib/types";
import { sendMagicLink, signInWithGoogle } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<ActionState, FormData>(sendMagicLink, null);

  if (state?.ok) {
    return (
      <Notice tone="success" title="Vérifiez votre boîte e-mail">
        <p className="mt-1">{state.message}</p>
      </Notice>
    );
  }

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4" noValidate>
        <input type="hidden" name="suivant" value={next} />
        <Field id="email" label="Votre adresse e-mail" error={state?.fieldErrors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="awa@gmail.com"
            required
            aria-invalid={Boolean(state?.fieldErrors?.email)}
          />
        </Field>
        {state?.message && !state.ok && <Notice tone="error">{state.message}</Notice>}
        <SubmitButton className="w-full" pendingLabel="Envoi du lien…">
          <Mail />
          Recevoir mon lien de connexion
        </SubmitButton>
        <p className="text-center text-[13px] text-ink/55">Pas de mot de passe : un lien sécurisé vous est envoyé par e-mail.</p>
      </form>

      <div className="flex items-center gap-3 text-xs font-bold tracking-wider text-ink/40 uppercase">
        <span className="h-px flex-1 bg-ink/10" />
        ou
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      <form action={signInWithGoogle}>
        <input type="hidden" name="suivant" value={next} />
        <SubmitButton variant="outline" className="w-full" pendingLabel="Redirection vers Google…">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12Z" />
          </svg>
          Continuer avec Google
        </SubmitButton>
      </form>
    </div>
  );
}
