import Link from "next/link";
import { BarChart3, CreditCard, Mail, Settings, Sparkles, Users } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Vue d'ensemble", icon: BarChart3 },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/invitations", label: "Invitations", icon: Mail },
  { href: "/admin/paiements", label: "Paiements", icon: CreditCard },
  { href: "/admin/ia", label: "Usage de l'IA", icon: Sparkles },
  { href: "/admin/reglages", label: "Réglages", icon: Settings },
];

/** Coque statique de l'administration ; chaque page vérifie le rôle admin. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-5 py-8 lg:grid-cols-[220px_1fr]">
      <aside>
        <p className="mb-3 text-xs font-bold tracking-[0.12em] text-terracotta uppercase">Administration</p>
        <nav aria-label="Administration">
          <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {NAV.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold whitespace-nowrap text-ink/75 hover:bg-white hover:text-ink"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
