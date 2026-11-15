import { EventTypes } from "@/components/home/event-types";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Pricing } from "@/components/home/pricing";
import { TemplateGallery } from "@/components/home/template-gallery";
import { Testimonials } from "@/components/home/testimonials";
import { ThemeShowcase } from "@/components/home/theme-showcase";
import { getSiteSettings } from "@/lib/events";
import { cn } from "@/lib/utils";

export default async function Home() {
  // Réglage de l'administration (mis en cache) : contenus d'exemple de la maquette (règle 7)
  const { showSampleContent: showSamples } = await getSiteSettings();

  return (
    <>
      <Hero showSamples={showSamples} />
      <EventTypes showSamples={showSamples} />
      <HowItWorks />
      <ThemeShowcase />
      <TemplateGallery />
      <Pricing showSamples={showSamples} />
      {/* Témoignages d'exemple : seulement si le réglage l'autorise */}
      <div className={cn(showSamples && "bg-sand")}>
        {showSamples && <Testimonials />}
        <FinalCta showSamples={showSamples} />
      </div>
    </>
  );
}
