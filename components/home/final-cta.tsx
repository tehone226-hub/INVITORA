import Image from "next/image";
import { sampleContent, siteConfig } from "@/config/site";
import { THEMES } from "@/config/themes";
import { ButtonLink } from "@/components/button-link";

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-[1180px] px-5 py-16 lg:py-20">
      <div className="relative mx-auto max-w-[900px] overflow-hidden rounded-[32px] bg-terracotta text-cream shadow-card-hover">
        {/* Lisière tissée à droite */}
        <div aria-hidden="true" className="absolute inset-y-0 right-0 w-24 sm:w-44">
          <Image
            src={THEMES["faso-dan-fani"].image}
            alt=""
            fill
            sizes="180px"
            className="scale-x-[-1] object-cover object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-terracotta via-terracotta/40 to-transparent" />
        </div>

        <div className="relative flex flex-col items-start gap-6 px-7 py-10 pr-28 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:pr-48">
          <div>
            <h2 className="text-2xl font-semibold sm:text-[30px]">Prêt à inviter en 30 secondes ?</h2>
            <p className="mt-2 max-w-md text-[15px] text-cream/85">
              {siteConfig.showSampleContent
                ? `Rejoignez ${sampleContent.organizersCount} organisateurs conquis en Afrique de l'Ouest.`
                : "Créez votre invitation, partagez-la sur WhatsApp et suivez vos invités."}
            </p>
          </div>
          <ButtonLink href={siteConfig.routes.create} variant="white" size="lg">
            Créer mon invitation
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
