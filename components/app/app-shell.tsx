import Link from "next/link";
import { Suspense } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";
import { NavLinks, NavLinksFallback, type NavItem } from "./nav-links";

/** Compte connecté : nom, accès à l'administration, déconnexion (zone dynamique). */
async function AccountBox({ adminLink }: { adminLink: boolean }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const name = user.profile?.full_name || user.email?.split("@")[0] || "Mon compte";
  return (
    <div className="space-y-2">
      {adminLink && user.isAdmin && (
        <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-sun hover:bg-white/10">
          <ShieldCheck className="size-[18px]" aria-hidden="true" />
          Administration
        </Link>
      )}
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand font-heading text-sm font-bold text-white uppercase"
          aria-hidden="true"
        >
          {name.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{name}</p>
          {user.email && <p className="truncate text-xs text-white/50">{user.email}</p>}
        </div>
        <form action="/auth/deconnexion" method="post">
          <button
            aria-label="Se déconnecter"
            title="Se déconnecter"
            className="flex size-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Coque de l'espace connecté : barre latérale « nuit » sur ordinateur,
 * bandeau et onglets défilants sur téléphone (sans JavaScript).
 */
export function AppShell({
  items,
  label,
  footerLink,
  adminLink = false,
  children,
}: {
  items: NavItem[];
  /** Nom de la zone, annoncé aux lecteurs d'écran et affiché au-dessus des liens */
  label: string;
  footerLink?: { href: string; label: string; icon: React.ReactNode };
  adminLink?: boolean;
  children: React.ReactNode;
}) {
  const nav = (
    <Suspense fallback={<NavLinksFallback items={items} />}>
      <NavLinks items={items} />
    </Suspense>
  );
  return (
    <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      {/* Téléphone */}
      <header className="sticky top-0 z-40 bg-night lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" aria-label="Invitora, accueil">
            <Logo tone="dark" />
          </Link>
          <form action="/auth/deconnexion" method="post">
            <button className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white">
              <LogOut className="size-4" aria-hidden="true" />
              Quitter
            </button>
          </form>
        </div>
        <nav aria-label={label} className="overflow-x-auto px-3 pb-2.5">
          {nav}
        </nav>
      </header>

      {/* Ordinateur */}
      <aside className="sticky top-0 hidden h-dvh flex-col bg-night bg-dots px-4 py-5 lg:flex">
        <Link href="/" aria-label="Invitora, accueil" className="px-2">
          <Logo tone="dark" />
        </Link>
        <p className="mt-8 mb-2 px-3 text-[11px] font-bold tracking-[0.14em] text-white/40 uppercase">{label}</p>
        <nav aria-label={label} className="flex-1 overflow-y-auto">
          {nav}
          {footerLink && (
            <Link
              href={footerLink.href}
              className="mt-4 flex items-center gap-3 border-t border-white/10 px-3 pt-5 pb-2.5 text-sm font-semibold text-white/65 hover:text-white [&_svg]:size-[18px]"
            >
              {footerLink.icon}
              {footerLink.label}
            </Link>
          )}
        </nav>
        <Suspense fallback={<div className="h-16 animate-pulse rounded-xl bg-white/5" />}>
          <AccountBox adminLink={adminLink} />
        </Suspense>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

/** En-tête de page de l'espace connecté : puce, titre, texte d'aide et actions à droite. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <span className="inline-flex rounded-md bg-brand-soft px-2 py-1 text-xs font-bold text-brand">{eyebrow}</span>}
        <h1 className="mt-2 text-[28px] leading-tight font-extrabold text-balance sm:text-[34px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[15px] text-ink/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
