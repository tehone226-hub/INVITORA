import { EventTypes } from "@/components/home/event-types";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Pricing } from "@/components/home/pricing";
import { TemplateGallery } from "@/components/home/template-gallery";
import { Testimonials } from "@/components/home/testimonials";
import { ThemeShowcase } from "@/components/home/theme-showcase";
import { getSiteSettings } from "@/lib/events";

export default async function Home() {
  // Réglage de l'administration (mis en cache) : contenus d'exemple de la maquette (règle 7)
  const { showSampleContent: showSamples } = await getSiteSettings();

  // Chaque section porte sa propre bande de fond (nuit, blanc, papier en alternance).
  return (
    <>
      <Hero showSamples={showSamples} />
      <EventTypes showSamples={showSamples} />
      <HowItWorks />
      <ThemeShowcase />
      <TemplateGallery />
      <Pricing showSamples={showSamples} />
      {/* Témoignages d'exemple : seulement si le réglage l'autorise */}
      {showSamples && <Testimonials />}
      <FinalCta showSamples={showSamples} />
    </>
  );
}
