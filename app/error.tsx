"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { buttonClass } from "@/components/ui/button-class";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <TriangleAlert className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-[28px] font-extrabold">Un problème est survenu</h1>
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
    </main>
  );
}
