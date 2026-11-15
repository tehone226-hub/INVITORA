import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Centre d'aide",
  robots: { index: false },
};

export default function Page() {
  return (
    <ComingSoon
      title="Centre d'aide"
      text="Le centre d'aide et le contact WhatsApp arrivent très bientôt."
    />
  );
}
