import Link from "next/link";
import { siteConfig } from "@/config/site";
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
    <footer className="bg-forest text-cream">
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tone="dark" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/75">
            De belles invitations digitales pour l&apos;Afrique de l&apos;Ouest, créées avec l&apos;IA.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-bold tracking-[0.12em] text-gold uppercase">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-cream/90 hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-gold uppercase">Paiements</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ink">Orange Money</span>
            <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ink">Moov Money</span>
          </div>
          <p className="mt-4 text-sm text-cream/75">Burkina Faso • Afrique de l&apos;Ouest</p>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-5 py-5 text-[13px] text-cream/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {siteConfig.copyrightYear} Invitora — Fait avec amour à {siteConfig.city}
          </p>
          <div className="flex gap-5">
            <Link href={routes.privacy} className="hover:text-gold">
              Confidentialité
            </Link>
            <Link href={routes.terms} className="hover:text-gold">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
