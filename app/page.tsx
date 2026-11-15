import { siteConfig } from "@/config/site";
import { EventTypes } from "@/components/home/event-types";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Pricing } from "@/components/home/pricing";
import { TemplateGallery } from "@/components/home/template-gallery";
import { Testimonials } from "@/components/home/testimonials";
import { cn } from "@/lib/utils";

export default function Home() {
  const showSamples = siteConfig.showSampleContent;

  return (
    <>
      <Hero />
      <EventTypes />
      <HowItWorks />
      <TemplateGallery />
      <Pricing />
      {/* Témoignages d'exemple : seulement si le réglage l'autorise (règle 7) */}
      <div className={cn(showSamples && "bg-sand")}>
        {showSamples && <Testimonials />}
        <FinalCta />
      </div>
    </>
  );
}
