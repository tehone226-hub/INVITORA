import type { Metadata } from "next";
import { Suspense } from "react";
import { SetupRequired } from "@/components/setup-required";
import { requireUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { features } from "@/lib/env-server";
import { CreateForm } from "./create-form";

export const metadata: Metadata = {
  title: "Créer mon invitation",
  robots: { index: false },
};

export default function CreatePage() {
  if (!isSupabaseConfigured) return <SetupRequired what="la création d'invitation" />;
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      <p className="text-xs font-bold tracking-[0.12em] text-terracotta uppercase">Nouvelle invitation</p>
      <h1 className="mt-2 text-[32px] leading-tight font-semibold sm:text-4xl">Créez votre invitation</h1>
      <p className="mt-2 max-w-xl text-[15px] text-ink/60">
        Trois petites étapes. Aperçu gratuit : vous ne payez que pour partager l&apos;invitation avec vos invités.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-[640px] animate-pulse rounded-3xl bg-sand/60" />}>
          <CreateContent />
        </Suspense>
      </div>
    </section>
  );
}

async function CreateContent() {
  await requireUser("/creer");
  return <CreateForm aiEnabled={features.aiText} />;
}
