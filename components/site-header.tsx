import Link from "next/link";
import { Suspense } from "react";
import { Menu } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/button-link";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";

/** Bouton de compte : lit la session (zone dynamique, le reste de l'en-tête est statique). */
async function AccountButton() {
  const user = await getCurrentUser();
  if (!user) return <LoginButton />;
  return (
    <ButtonLink href="/tableau-de-bord" variant="outline" size="sm" className="hidden sm:inline-flex">
      Mon espace
    </ButtonLink>
  );
}

function LoginButton() {
  return (
    <ButtonLink href={siteConfig.routes.login} variant="outline" size="sm" className="hidden sm:inline-flex">
      Se connecter
    </ButtonLink>
  );
}

/** En-tête blanc collant, bordure basse fine : lisible au-dessus du hero « nuit » comme des pages claires. */
export function SiteHeader() {
  const { nav, routes } = siteConfig;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-5">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="Invitora, accueil" className="rounded-lg">
            <Logo />
          </Link>

          <nav aria-label="Navigation principale" className="hidden md:block">
            <ul className="flex items-center gap-1 text-sm font-semibold text-ink/70">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-lg px-3 py-2 transition-colors hover:bg-brand-soft hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Suspense fallback={<LoginButton />}>
            <AccountButton />
          </Suspense>
          <ButtonLink href={routes.create} size="sm">
            Créer mon invitation
          </ButtonLink>

          {/* Menu mobile : fonctionne sans JavaScript */}
          <details className="group relative md:hidden">
            <summary
              aria-label="Ouvrir le menu"
              className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg border border-ink/12 bg-white text-ink [&::-webkit-details-marker]:hidden"
            >
              <Menu className="size-5" />
            </summary>
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-ink/8 bg-white p-1.5 shadow-card-hover">
              <ul className="flex flex-col text-[15px] font-semibold">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block rounded-lg px-3 py-2.5 hover:bg-brand-soft hover:text-brand">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="sm:hidden">
                  <Link href="/tableau-de-bord" className="block rounded-lg px-3 py-2.5 hover:bg-brand-soft hover:text-brand">
                    Mon espace / Se connecter
                  </Link>
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
