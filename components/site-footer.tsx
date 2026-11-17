import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/button-link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  const { routes } = siteConfig;

  const columns = [
    {
      title: "Produit",
      links: [
        { label: "Modèles", href: "/#modeles" },
        { label: "Tarifs", href: "/#tarifs" },
        { label: "Créer une invitation", href: routes.create },
      ],
    },
    {
      title: "Aide",
      links: [
        { label: "Comment ça marche", href: "/#comment-ca-marche" },
        { label: "Centre d'aide WhatsApp", href: routes.help },
        { label: "Nous contacter", href: routes.help },
      ],
    },
  ];

  return (
    <footer className="bg-night text-white/70">
      <div className="mx-auto w-full max-w-[1200px] px-5 pt-14 pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <Logo tone="dark" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              De belles invitations digitales pour l&apos;Afrique de l&apos;Ouest, créées avec l&apos;IA et partagées
              sur WhatsApp.
            </p>
            <ButtonLink href={routes.create} variant="ghost" size="sm" className="mt-5">
              Créer mon invitation
            </ButtonLink>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-bold text-white">{col.title}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-sm font-bold text-white">Paiements</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-white">
                Orange Money
              </span>
              <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-white">
                Moov Money
              </span>
            </div>
            <p className="mt-4 text-sm">Burkina Faso • Afrique de l&apos;Ouest</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {siteConfig.copyrightYear} Invitora — Fait avec amour à {siteConfig.city}
          </p>
          <div className="flex gap-5">
            <Link href={routes.privacy} className="transition-colors hover:text-white">
              Confidentialité
            </Link>
            <Link href={routes.terms} className="transition-colors hover:text-white">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
