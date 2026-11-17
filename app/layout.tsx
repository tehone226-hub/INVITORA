import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import { InfoBanner } from "@/components/info-banner";
import "./globals.css";

// Titres : Bricolage Grotesque (grotesque de caractère). Texte : Plus Jakarta Sans.
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Invitora — Votre invitation digitale en 30 secondes",
    template: "%s — Invitora",
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <InfoBanner />
        {children}
      </body>
    </html>
  );
}
