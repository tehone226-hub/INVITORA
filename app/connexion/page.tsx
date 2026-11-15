import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { SetupRequired } from "@/components/setup-required";
import { Notice } from "@/components/ui/notice";
import { getCurrentUser, safeNextPath } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Se connecter",
  robots: { index: false },
};

const ERRORS: Record<string, string> = {
  lien: "Ce lien de connexion n'est plus valide (il a expiré ou a déjà servi). Demandez-en un nouveau.",
  google: "La connexion avec Google n'a pas abouti. Réessayez ou utilisez votre e-mail.",
  configuration: "La connexion n'est pas encore configurée.",
};

export default function LoginPage(props: PageProps<"/connexion">) {
  if (!isSupabaseConfigured) return <SetupRequired what="la connexion" />;
  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-14">
      <div className="rounded-[28px] border border-ink/5 bg-white p-7 shadow-card sm:p-9">
        <Logo />
        <h1 className="mt-6 text-[28px] leading-tight font-semibold">Bienvenue</h1>
        <p className="mt-2 text-[15px] text-ink/60">
          Connectez-vous pour créer vos invitations et suivre les réponses de vos invités.
        </p>
        <div className="mt-7">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-sand/60" />}>
            <LoginContent searchParams={props.searchParams} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

async function LoginContent({ searchParams }: { searchParams: PageProps<"/connexion">["searchParams"] }) {
  const sp = await searchParams;
  const next = safeNextPath(sp.suivant);
  const user = await getCurrentUser();
  if (user) redirect(next);
  const error = typeof sp.erreur === "string" ? ERRORS[sp.erreur] : undefined;
  return (
    <div className="space-y-5">
      {error && <Notice tone="error">{error}</Notice>}
      <LoginForm next={next} />
    </div>
  );
}
