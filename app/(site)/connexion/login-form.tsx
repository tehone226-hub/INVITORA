"use client";

import { useActionState } from "react";
import { KeyRound, Mail } from "lucide-react";
import { Field, Input, SubmitButton } from "@/components/ui/form";
import { Notice } from "@/components/ui/notice";
import { sendLoginCode, signInWithGoogle, verifyLoginCode, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [sent, sendAction] = useActionState<LoginState, FormData>(sendLoginCode, null);
  const [checked, verifyAction] = useActionState<LoginState, FormData>(verifyLoginCode, null);

  // Le dernier résultat « code » prime ; une erreur de vérification renvoie à l'étape voulue.
  const state: LoginState = checked ?? sent;
  const onCodeStep = state?.step === "code";
  const email = onCodeStep ? state.email : "";

  return (
    <div className="space-y-6">
      {!onCodeStep ? (
        <form action={sendAction} className="space-y-4" noValidate>
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
          {state?.message && <Notice tone="error">{state.message}</Notice>}
          <SubmitButton className="w-full" pendingLabel="Envoi du code…">
            <Mail />
            Recevoir mon code par e-mail
          </SubmitButton>
          <p className="text-center text-[13px] text-ink/55">Pas de mot de passe : un code à 6 chiffres vous est envoyé.</p>
        </form>
      ) : (
        <form action={verifyAction} className="space-y-4" noValidate>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="suivant" value={next} />
          {state?.message && <Notice tone={state.fieldErrors || checked ? "error" : "success"}>{state.message}</Notice>}
          <Field id="code" label="Code reçu par e-mail" error={state?.fieldErrors?.code}>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="123456"
              className="text-center font-heading text-2xl tracking-[0.4em]"
              required
              autoFocus
              aria-invalid={Boolean(state?.fieldErrors?.code)}
            />
          </Field>
          <SubmitButton className="w-full" pendingLabel="Vérification…">
            <KeyRound />
            Me connecter
          </SubmitButton>
          <a href="/connexion" className="block text-center text-sm font-bold text-brand hover:text-brand-dark">
            Changer d&apos;adresse e-mail
          </a>
        </form>
      )}

      <div className="flex items-center gap-3 text-xs font-bold text-ink/45">
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
