import Image from "next/image";
import { getTheme } from "@/config/themes";
import { ArrowRight, Check, CheckCheck, MessageCircle, Play, Star } from "lucide-react";
import { sampleContent, siteConfig } from "@/config/site";
import { heroInvitation } from "@/config/home";
import { ButtonLink } from "@/components/button-link";
import { InvitationCard } from "@/components/invitation-card";

export function Hero({ showSamples }: { showSamples: boolean }) {

  return (
    <section className="mx-auto grid w-full max-w-[1180px] items-center gap-12 overflow-x-clip px-5 pt-12 pb-16 lg:grid-cols-[1.15fr_1fr] lg:gap-8 lg:pt-20 lg:pb-24">
      {/* Texte */}
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-ink shadow-card">
          <span className="size-2 rounded-full bg-terracotta" aria-hidden="true" />
          {showSamples ? sampleContent.heroBadge : "Invitations digitales pour l'Afrique de l'Ouest"}
        </span>

        <h1 className="mt-6 text-[38px] leading-[1.08] font-bold text-ink sm:text-[50px] xl:text-[54px]">
          Votre invitation prête en{" "}
          <span className="relative inline-block whitespace-nowrap text-terracotta">
            30 secondes
            <svg
              aria-hidden="true"
              viewBox="0 0 300 16"
              preserveAspectRatio="none"
              className="absolute -bottom-2 left-0 h-3 w-full"
            >
              <path
                d="M3 11 C 80 3, 200 3, 297 9"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink/65">
          Créez, partagez sur WhatsApp et suivez vos invités en temps réel. Le plus beau moyen
          d&apos;inviter ceux que vous aimez.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ButtonLink href={siteConfig.routes.create} size="lg">
            Créer mon invitation
            <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/#modeles" variant="outline" size="lg">
            <span className="flex size-6 items-center justify-center rounded-full bg-forest text-cream">
              <Play className="!size-3 fill-current" />
            </span>
            Voir les modèles
          </ButtonLink>
        </div>

        {showSamples ? (
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2" aria-hidden="true">
              {[
                ["A", "bg-sand text-ink"],
                ["M", "bg-forest text-cream"],
                ["F", "bg-gold text-ink"],
                ["K", "bg-terracotta text-cream"],
              ].map(([letter, tone]) => (
                <span
                  key={letter}
                  className={`flex size-9 items-center justify-center rounded-full border-2 border-cream text-sm font-bold ${tone}`}
                >
                  {letter}
                </span>
              ))}
            </div>
            <div className="text-[13px] text-ink/60">
              <p className="flex items-center gap-1 font-bold text-ink">
                <span className="flex text-gold" aria-hidden="true">
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
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink/70">
            {["Sans abonnement", "Orange Money & Moov Money", "Partage WhatsApp"].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-4 text-forest" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Illustration : téléphone sur un soleil */}
      <PhoneIllustration showSamples={showSamples} />
    </section>
  );
}

function PhoneIllustration({ showSamples }: { showSamples: boolean }) {
  const inv = heroInvitation;
  const rays = Array.from({ length: 16 });

  return (
    <figure
      aria-label={`Exemple d'invitation : ${inv.category.toLowerCase()} de ${inv.names}`}
      className="relative mx-auto w-full max-w-[400px]"
    >
      {/* Soleil */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="absolute top-1/2 left-1/2 w-[125%] max-w-[480px] -translate-x-1/2 -translate-y-1/2"
      >
        {rays.map((_, i) => (
          <rect
            key={i}
            x="190"
            y="8"
            width="20"
            height="34"
            rx="3"
            fill="var(--terracotta)"
            opacity="0.18"
            transform={`rotate(${(360 / rays.length) * i} 200 200)`}
          />
        ))}
        <circle cx="200" cy="200" r="140" fill="var(--gold)" opacity="0.28" />
      </svg>

      {/* Cartes inclinées derrière le téléphone (profondeur) */}
      <div
        aria-hidden="true"
        className="absolute top-[20%] left-[3%] h-[230px] w-[170px] -rotate-[9deg] overflow-hidden rounded-2xl border-4 border-white shadow-card-hover sm:left-[1%] sm:h-[250px] sm:w-[185px]"
      >
        <Image src={getTheme("bogolan--origine").image} alt="" fill sizes="190px" className="object-cover" />
      </div>
      <div
        aria-hidden="true"
        className="absolute top-[34%] right-[3%] h-[230px] w-[170px] rotate-[8deg] overflow-hidden rounded-2xl border-4 border-white shadow-card-hover sm:right-[1%] sm:h-[250px] sm:w-[185px]"
      >
        <Image src={getTheme("tiebele--origine").image} alt="" fill sizes="190px" className="object-cover" />
      </div>

      {/* Téléphone */}
      <div className="relative mx-auto w-[250px] overflow-hidden rounded-[38px] border-[7px] border-ink bg-white shadow-float sm:w-[270px]">
        <InvitationCard
          theme={inv.theme}
          category={inv.category}
          names={inv.names}
          size="lg"
          sizes="260px"
          eager
          className="h-[290px] sm:h-[310px]"
        />
        <div className="px-4 pt-4 pb-5 text-center">
          <p className="text-[10px] font-bold tracking-[0.16em] text-terracotta uppercase">
            {inv.category}
          </p>
          <p className="mt-1 font-heading text-xl font-semibold text-ink">{inv.names}</p>
          <p className="mt-0.5 text-[11px] text-ink/60">
            {inv.date} • {inv.city}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold" aria-hidden="true">
            <span className="rounded-lg bg-forest py-2 text-cream">RSVP Oui</span>
            <span className="rounded-lg border border-ink/12 py-2 text-ink">Itinéraire</span>
          </div>
        </div>
      </div>

      {/* Bulles flottantes */}
      <div className="absolute top-[10%] -left-1 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-card-hover lg:-left-12">
        <span className="flex size-8 items-center justify-center rounded-full bg-forest text-cream">
          <MessageCircle className="size-4" aria-hidden="true" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-xs font-bold text-ink">Partagé sur WhatsApp</span>
          <span className="block text-[11px] text-ink/55">
            {showSamples ? sampleContent.phoneShared : "en un clic"}
          </span>
        </span>
      </div>

      <div className="absolute -right-1 -bottom-5 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-card-hover lg:bottom-[26%] lg:-right-12">
        <span className="flex size-8 items-center justify-center rounded-full bg-gold text-ink">
          <CheckCheck className="size-4" aria-hidden="true" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-xs font-bold text-ink">
            {showSamples ? sampleContent.phoneConfirmed : "Confirmations"}
          </span>
          <span className="block text-[11px] text-ink/55">en temps réel</span>
        </span>
      </div>
    </figure>
  );
}
