import { LayoutGrid, LifeBuoy, PlusCircle } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";

const NAV = [
  { href: "/tableau-de-bord", label: "Mes invitations", icon: <LayoutGrid aria-hidden="true" /> },
  { href: "/creer", label: "Nouvelle invitation", icon: <PlusCircle aria-hidden="true" /> },
  { href: "/aide", label: "Aide", icon: <LifeBuoy aria-hidden="true" /> },
];

/** Espace de l'organisateur ; chaque page vérifie la connexion. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell items={NAV} label="Mon espace" adminLink>
      {children}
    </AppShell>
  );
}
