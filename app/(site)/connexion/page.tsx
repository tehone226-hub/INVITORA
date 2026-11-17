import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CheckCheck, MessageCircle, Sparkles } from "lucide-react";
import { SetupRequired } from "@/components/setup-required";
import { Notice } from "@/components/ui/notice";
import { getCurrentUser, safeNextPath } from "@/lib/auth";
import { isBackendConfigured } from "@/lib/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Se connecter",
  robots: { index: false },
};

const ERRORS: Record<string, string> = {
  lien: "Ce lien de connexion n'est plus valide (il a expiré ou a déjà servi). Demandez-en un nouveau.",
  google: "La connexion avec Google n'a pas abouti. Réessayez ou utilisez votre e-mail.",
  configuration: "La connexion n'est pas encore configurée.",
  session: "Votre session a expiré. Reconnectez-vous pour continuer.",
};

const POINTS = [
  { icon: Sparkles, title: "L'IA rédige pour vous", text: "Titre, message et programme en quelques secondes." },
  { icon: MessageCircle, title: "Un lien pour WhatsApp", text: "Vos invités ouvrent l'invitation sans rien installer." },
  { icon: CheckCheck, title: "Les réponses en direct", text: "Vous voyez qui vient, sans appeler un par un." },
];

export default function LoginPage(props: PageProps<"/connexion">) {
  if (!isBackendConfigured) return <SetupRequired what="la connexion" />;
  return (
    <section className="mx-auto grid w-full max-w-[1200px] flex-1 items-stretch gap-6 px-5 py-8 lg:grid-cols-2 lg:py-12">
      {/* Panneau nuit : accroche */}
      <div className="bg-night-glow relative hidden overflow-hidden rounded-3xl p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="bg-dots absolute inset-0 opacity-50" />
        <div className="relative">
          <p className="inline-flex rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold text-sun">Votre espace</p>
          <p className="mt-5 max-w-md font-heading text-[40px] leading-[1.05] font-extrabold text-balance">
            Vos invitations, vos invités, <span className="text-gradient">au même endroit</span>.
          </p>
        </div>
        <ul className="relative mt-12 space-y-3">
          {POINTS.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sun text-night">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="leading-snug">
                <span className="block text-sm font-bold">{title}</span>
                <span className="block text-[13px] text-white/70">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-ink/8 bg-white p-7 shadow-card sm:p-9">
          <p className="inline-flex rounded-md bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">Connexion</p>
          <h1 className="mt-4 text-[32px] leading-tight font-extrabold">Bienvenue</h1>
          <p className="mt-2 text-[15px] text-ink/60">
            Connectez-vous pour créer vos invitations et suivre les réponses de vos invités.
          </p>
          <div className="mt-7">
            <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-mist/60" />}>
              <LoginContent searchParams={props.searchParams} />
            </Suspense>
          </div>
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
