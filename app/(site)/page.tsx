import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Pricing } from "@/components/home/pricing";
import { TemplateGallery } from "@/components/home/template-gallery";
import { Testimonials } from "@/components/home/testimonials";
import { getSiteSettings } from "@/lib/events";

export default async function Home() {
  // Réglage de l'administration (mis en cache) : contenus d'exemple de la maquette (règle 7)
  const { showSampleContent: showSamples } = await getSiteSettings();

  // Le hero est la première étape de la création ; viennent ensuite les modèles, le mode d'emploi et les tarifs.
  return (
    <>
      <Hero showSamples={showSamples} />
      <TemplateGallery />
      <HowItWorks />
      <Pricing showSamples={showSamples} />
      {/* Témoignages d'exemple : seulement si le réglage l'autorise */}
      {showSamples && <Testimonials />}
      <FinalCta showSamples={showSamples} />
    </>
  );
}
