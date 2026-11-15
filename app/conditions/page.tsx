import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoon
      title="Conditions d'utilisation"
      text="Nos conditions d'utilisation seront publiées avant l'ouverture du service."
    />
  );
}
