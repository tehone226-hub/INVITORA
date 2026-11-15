import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/button-link";

/** Page d'attente pour les fonctionnalités des prochaines étapes. */
export function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold shadow-card">
        <span className="size-2 rounded-full bg-terracotta" aria-hidden="true" />
        Bientôt disponible
      </span>
      <h1 className="mt-6 text-[32px] leading-tight font-semibold text-ink sm:text-4xl">{title}</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-ink/65">{text}</p>
      <ButtonLink href="/" variant="outline" className="mt-8">
        <ArrowLeft />
        Retour à l&apos;accueil
      </ButtonLink>
    </section>
  );
}
