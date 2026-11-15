import { ButtonLink } from "@/components/button-link";

export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <p className="font-heading text-6xl font-semibold text-terracotta">404</p>
      <h1 className="mt-4 text-[28px] font-semibold">Page introuvable</h1>
      <p className="mt-2 text-[15px] text-ink/60">Le lien est peut-être incomplet ou la page n&apos;existe plus.</p>
      <ButtonLink href="/" className="mt-7">
        Retour à l&apos;accueil
      </ButtonLink>
    </section>
  );
}
