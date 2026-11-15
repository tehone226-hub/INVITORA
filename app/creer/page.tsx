import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Créer mon invitation",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoon
      title="Créer mon invitation"
      text="La création d'invitation arrive très bientôt. Vous pourrez choisir un modèle, laisser l'IA rédiger vos textes et partager le lien sur WhatsApp."
    />
  );
}
