"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonClass } from "@/components/ui/form";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <h1 className="text-[28px] font-semibold">Un problème est survenu</h1>
      <p className="mt-2 text-[15px] text-ink/60">
        La page n&apos;a pas pu s&apos;afficher. Vérifiez votre connexion internet puis réessayez.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className={buttonClass("primary")}>
          Réessayer
        </button>
        <Link href="/" className={buttonClass("outline")}>
          Accueil
        </Link>
      </div>
      {error.digest && <p className="mt-6 font-mono text-xs text-ink/40">Référence : {error.digest}</p>}
    </section>
  );
}
