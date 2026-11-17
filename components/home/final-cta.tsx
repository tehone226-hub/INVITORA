import { ArrowRight } from "lucide-react";
import { sampleContent, siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/button-link";

export function FinalCta({ showSamples }: { showSamples: boolean }) {
  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 lg:py-24">
        <div className="bg-night-glow relative overflow-hidden rounded-3xl text-white shadow-float">
          <div aria-hidden="true" className="bg-dots absolute inset-0 opacity-50" />
          <div className="relative flex flex-col items-start gap-8 px-7 py-12 sm:px-12 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="max-w-xl text-[32px] leading-[1.08] font-extrabold text-balance sm:text-[44px]">
                Prêt à inviter en <span className="text-gradient">30 secondes</span> ?
              </h2>
              <p className="mt-4 max-w-md text-base text-white/70">
                {showSamples
                  ? `Rejoignez ${sampleContent.organizersCount} organisateurs conquis en Afrique de l'Ouest.`
                  : "Créez votre invitation, partagez-la sur WhatsApp et suivez vos invités."}
              </p>
            </div>
            <ButtonLink href={siteConfig.routes.create} variant="sun" size="lg" className="shrink-0">
              Créer mon invitation
              <ArrowRight />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
