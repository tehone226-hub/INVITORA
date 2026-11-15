import { sampleContent, siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/button-link";

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-[1180px] px-5 py-16 lg:py-20">
      <div className="mx-auto flex max-w-[860px] flex-col items-start gap-6 rounded-[32px] bg-terracotta px-7 py-9 text-cream sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div>
          <h2 className="text-2xl font-semibold sm:text-[28px]">Prêt à inviter en 30 secondes ?</h2>
          <p className="mt-2 text-[15px] text-cream/85">
            {siteConfig.showSampleContent
              ? `Rejoignez ${sampleContent.organizersCount} organisateurs conquis en Afrique de l'Ouest.`
              : "Créez votre invitation, partagez-la sur WhatsApp et suivez vos invités."}
          </p>
        </div>
        <ButtonLink href={siteConfig.routes.create} variant="white" size="lg">
          Créer mon invitation
        </ButtonLink>
      </div>
    </section>
  );
}
