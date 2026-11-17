import Image from "next/image";
import { ArrowRight, Check, CheckCheck, LayoutGrid, MessageCircle, Star } from "lucide-react";
import { heroInvitation } from "@/config/home";
import { PLANS, formatPrice } from "@/config/plans";
import { sampleContent, siteConfig } from "@/config/site";
import { COLORWAYS, STYLES, getTheme } from "@/config/themes";
import { ButtonLink } from "@/components/button-link";
import { InvitationCard } from "@/components/invitation-card";

/** Hero « Nuit de fête » : bloc pleine largeur sur fond nuit, titre géant, téléphone incliné. */
export function Hero({ showSamples }: { showSamples: boolean }) {
  // Faits réels du produit (pas de chiffres d'audience inventés : règle 7).
  const facts = [
    { value: String(STYLES.length * COLORWAYS.length), label: "fonds dessinés chez nous" },
    { value: formatPrice(PLANS.essentiel.price), label: "pour activer une invitation" },
    { value: "0", label: "application à installer" },
  ];

  return (
    <section className="bg-night-glow relative overflow-hidden text-white">
      <div
        aria-hidden="true"
        className="bg-dots absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />

      <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-14 px-5 pt-14 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pt-24 lg:pb-28">
        {/* Texte */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold backdrop-blur">
            <span className="size-2 rounded-full bg-sun" aria-hidden="true" />
            {showSamples ? sampleContent.heroBadge : "Invitations digitales pour l'Afrique de l'Ouest"}
          </span>

          <h1 className="mt-6 text-[42px] leading-[1.02] font-extrabold text-balance sm:text-[56px] lg:text-[64px]">
            Votre invitation prête en <span className="text-gradient whitespace-nowrap">30 secondes</span>
          </h1>

          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-white/70">
            Créez, partagez sur WhatsApp et suivez vos invités en temps réel. Le plus beau moyen d&apos;inviter ceux
            que vous aimez.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href={siteConfig.routes.create} size="lg">
              Créer mon invitation
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/#modeles" variant="ghost" size="lg">
              <LayoutGrid />
              Voir les modèles
            </ButtonLink>
          </div>

          {showSamples ? (
            <div className="mt-9 flex items-center gap-4">
              <div className="flex -space-x-2" aria-hidden="true">
                {[
                  ["A", "bg-brand text-white"],
                  ["M", "bg-white text-night"],
                  ["F", "bg-sun text-night"],
                  ["K", "bg-night-soft text-white"],
                ].map(([letter, tone]) => (
                  <span
                    key={letter}
                    className={`flex size-9 items-center justify-center rounded-full border-2 border-night text-sm font-bold ${tone}`}
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <div className="text-[13px] text-white/65">
                <p className="flex items-center gap-1 font-bold text-white">
                  <span className="flex text-sun" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-current" />
                    ))}
                  </span>
                  {sampleContent.rating}
                </p>
                <p>{sampleContent.eventsCount}</p>
              </div>
            </div>
          ) : (
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/80">
              {["Sans abonnement", "Orange Money & Moov Money", "Partage WhatsApp"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-sun text-night">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Illustration : téléphone incliné, étoffes derrière, pastilles en verre */}
        <PhoneIllustration showSamples={showSamples} />
      </div>

      {/* Bandeau de faits */}
      <div className="relative border-t border-white/10 bg-white/[0.03]">
        <dl className="mx-auto grid w-full max-w-[1200px] grid-cols-1 divide-y divide-white/10 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-baseline gap-3 py-5 sm:px-6 sm:first:pl-0">
              <dt className="order-2 text-sm text-white/70">{fact.label}</dt>
              <dd className="order-1 font-heading text-[28px] leading-none font-extrabold whitespace-nowrap text-white">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function PhoneIllustration({ showSamples }: { showSamples: boolean }) {
  const inv = heroInvitation;

  return (
    <figure
      aria-label={`Exemple d'invitation : ${inv.category.toLowerCase()} de ${inv.names}`}
      className="relative mx-auto w-full max-w-[420px] py-4"
    >
      {/* Halo */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 size-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/50 blur-[90px]"
      />

      {/* Étoffes inclinées derrière le téléphone (profondeur) */}
      <div
        aria-hidden="true"
        className="absolute top-[16%] left-[2%] h-[230px] w-[165px] -rotate-[10deg] overflow-hidden rounded-2xl border border-white/20 shadow-float sm:h-[250px] sm:w-[180px]"
      >
        <Image src={getTheme("wax--origine").image} alt="" fill sizes="190px" className="object-cover" />
      </div>
      <div
        aria-hidden="true"
        className="absolute top-[30%] right-[2%] h-[230px] w-[165px] rotate-[12deg] overflow-hidden rounded-2xl border border-white/20 shadow-float sm:h-[250px] sm:w-[180px]"
      >
        <Image src={getTheme("indigo--origine").image} alt="" fill sizes="190px" className="object-cover" />
      </div>

      {/* Téléphone */}
      <div className="relative mx-auto w-[250px] rotate-[3deg] overflow-hidden rounded-[34px] border-[6px] border-night-soft bg-white text-ink shadow-float ring-1 ring-white/20 sm:w-[270px]">
        <InvitationCard
          theme={inv.theme}
          category={inv.category}
          names={inv.names}
          size="lg"
          sizes="260px"
          eager
          className="h-[290px] sm:h-[310px]"
        />
        <div className="px-4 pt-4 pb-5">
          <p className="inline-flex rounded-md bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand">
            {inv.category}
          </p>
          <p className="mt-1.5 font-heading text-xl leading-tight font-bold text-ink">{inv.names}</p>
          <p className="mt-0.5 text-[11px] text-ink/60">
            {inv.date} • {inv.city}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-bold" aria-hidden="true">
            <span className="rounded-lg bg-brand py-2 text-white">Je viens</span>
            <span className="rounded-lg border border-ink/12 py-2 text-ink">Itinéraire</span>
          </div>
        </div>
      </div>

      {/* Pastilles flottantes en verre */}
      <div className="absolute top-[6%] left-0 flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-md lg:-left-10">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#0E8A66] text-white">
          <MessageCircle className="size-4" aria-hidden="true" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-xs font-bold text-white">Partagé sur WhatsApp</span>
          <span className="block text-[11px] text-white/70">
            {showSamples ? sampleContent.phoneShared : "en un clic"}
          </span>
        </span>
      </div>

      <div className="absolute right-0 bottom-0 flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-md lg:-right-8 lg:bottom-[18%]">
        <span className="flex size-8 items-center justify-center rounded-lg bg-sun text-night">
          <CheckCheck className="size-4" aria-hidden="true" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-xs font-bold text-white">
            {showSamples ? sampleContent.phoneConfirmed : "Confirmations"}
          </span>
          <span className="block text-[11px] text-white/70">en temps réel</span>
        </span>
      </div>
    </figure>
  );
}
