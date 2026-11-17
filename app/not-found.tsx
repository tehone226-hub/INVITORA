import { ButtonLink } from "@/components/button-link";
import { Logo } from "@/components/logo";

/** Page 404 : hors des groupes de routes, donc sans en-tête de site (plein écran nuit). */
export default function NotFound() {
  return (
    <main className="bg-night-glow flex flex-1 flex-col items-center justify-center px-5 py-20 text-center text-white">
      <Logo tone="dark" />
      <p className="text-gradient mt-10 font-heading text-[96px] leading-none font-extrabold">404</p>
      <h1 className="mt-4 text-[28px] font-extrabold">Page introuvable</h1>
      <p className="mt-2 max-w-sm text-[15px] text-white/70">
        Le lien est peut-être incomplet ou la page n&apos;existe plus.
      </p>
      <ButtonLink href="/" variant="sun" className="mt-8">
        Retour à l&apos;accueil
      </ButtonLink>
    </main>
  );
}
