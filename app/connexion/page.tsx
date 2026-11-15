import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Se connecter",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoon
      title="Se connecter"
      text="L'espace organisateur arrive très bientôt. Vous pourrez vous connecter par e-mail ou avec Google."
    />
  );
}
