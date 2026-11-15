import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Confidentialité",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoon
      title="Confidentialité"
      text="Notre politique de confidentialité sera publiée avant l'ouverture du service."
    />
  );
}
