import Link from "next/link";
import { Suspense } from "react";
import { Menu } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/button-link";
import { Logo } from "@/components/logo";
import { WovenBand } from "@/components/woven-band";
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

export function SiteHeader() {
  const { nav, routes } = siteConfig;

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/85">
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-4 px-5 lg:h-[72px]">
        <Link href="/" aria-label="Invitora, accueil" className="rounded-xl">
          <Logo />
        </Link>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-8 text-[15px] font-semibold text-ink/80">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-terracotta">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

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
              className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full border border-ink/12 bg-white [&::-webkit-details-marker]:hidden"
            >
              <Menu className="size-5" />
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-card-hover">
              <ul className="flex flex-col text-[15px] font-semibold">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block rounded-xl px-3 py-2.5 hover:bg-sand">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="sm:hidden">
                  <Link href="/tableau-de-bord" className="block rounded-xl px-3 py-2.5 hover:bg-sand">
                    Mon espace / Se connecter
                  </Link>
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>
      <WovenBand />
    </header>
  );
}
