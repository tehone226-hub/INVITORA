"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Actif seulement sur cette adresse exacte (sinon : aussi sur ses sous-pages). */
  exact?: boolean;
}

const linkBase =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors [&_svg]:size-[18px] [&_svg]:shrink-0";

function Links({ items, pathname }: { items: NavItem[]; pathname: string | null }) {
  return (
    <ul className="flex gap-1 lg:flex-col">
      {items.map((item) => {
        const active =
          pathname !== null && (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(linkBase, active ? "bg-brand text-white shadow-glow" : "text-white/65 hover:bg-white/10 hover:text-white")}
            >
              {item.icon}
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Liens de la barre latérale, avec la page en cours mise en avant. */
export function NavLinks({ items }: { items: NavItem[] }) {
  return <Links items={items} pathname={usePathname()} />;
}

/** Même rendu sans page active : affiché pendant la préparation de la page. */
export function NavLinksFallback({ items }: { items: NavItem[] }) {
  return <Links items={items} pathname={null} />;
}
