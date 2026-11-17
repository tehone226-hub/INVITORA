import { ArrowLeft, BarChart3, CreditCard, Mail, Settings, Sparkles, Users } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";

const NAV = [
  { href: "/admin", label: "Vue d'ensemble", icon: <BarChart3 aria-hidden="true" />, exact: true },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: <Users aria-hidden="true" /> },
  { href: "/admin/invitations", label: "Invitations", icon: <Mail aria-hidden="true" /> },
  { href: "/admin/paiements", label: "Paiements", icon: <CreditCard aria-hidden="true" /> },
  { href: "/admin/ia", label: "Usage de l'IA", icon: <Sparkles aria-hidden="true" /> },
  { href: "/admin/reglages", label: "Réglages", icon: <Settings aria-hidden="true" /> },
];

/** Coque statique de l'administration ; chaque page vérifie le rôle admin. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AppShell
      items={NAV}
      label="Administration"
      footerLink={{ href: "/tableau-de-bord", label: "Retour à mon espace", icon: <ArrowLeft aria-hidden="true" /> }}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 py-8 lg:px-8 lg:py-10">{children}</div>
    </AppShell>
  );
}
