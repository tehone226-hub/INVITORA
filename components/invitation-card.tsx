import Image from "next/image";
import { useId } from "react";
import { getTheme, type ThemeId } from "@/config/themes";
import { cn } from "@/lib/utils";

interface InvitationCardProps {
  theme: ThemeId | string;
  category: string;
  /** « Awa & Moussa » : le « & » est mis en valeur automatiquement */
  names: string;
  date?: string;
  /** Heure, affichée sous la date */
  time?: string;
  place?: string;
  /** Conservé pour compatibilité : la typographie suit la zone de texte du fond. */
  size?: "sm" | "lg";
  /** Largeurs d'affichage, pour que Next.js serve une image à la bonne taille */
  sizes?: string;
  /** Image visible dès l'arrivée sur la page : chargement prioritaire */
  eager?: boolean;
  /** Balise des prénoms : `h1` sur la page de l'invité */
  heading?: "span" | "h1";
  /** Affiche d'abord l'enveloppe scellée du fond : l'invité la touche pour l'ouvrir (sans JavaScript). */
  sealed?: boolean;
  className?: string;
}

/** Longueur relative à la zone de texte (voir `--u` plus bas). */
const u = (n: number) => `calc(var(--u) * ${n})`;

/**
 * Invitation : fond SANS texte + textes posés en HTML dans la zone libre du fond (règle 2 de CLAUDE.md).
 * Les fonds sont au format 9:16 : donnez à la carte la classe `aspect-[9/16]`.
 * La typographie se cale sur la zone : mêmes proportions de la vignette à la page de l'invité.
 */
export function InvitationCard({
  theme,
  category,
  names,
  date,
  time,
  place,
  sizes = "(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw",
  eager = false,
  heading = "span",
  sealed = false,
  className,
}: InvitationCardProps) {
  const t = getTheme(theme);
  const toggleId = useId();
  const [top, right, bottom, left] = t.zone;
  const [first, second] = names.split(" & ");
  const couple = second !== undefined;
  const longest = Math.max(...names.split(couple ? " & " : "\n").map((s) => s.length));
  const nameSize = couple ? (longest > 11 ? 10 : 12) : longest > 22 ? 7.6 : longest > 14 ? 8.8 : 10.5;

  // Zone en % de la largeur de la carte (format 9:16). Petite zone : on ne garde que l'essentiel.
  const zoneW = 100 - left - right;
  const zoneH = ((100 - top - bottom) * 16) / 9;
  const compact = Math.min(zoneW / 62, zoneH / 76) < 0.62;
  // 1 unité : la composition fait 62 unités de large et 76 de haut (54 en version courte).
  const unit = `min(${(100 / 62).toFixed(3)}cqw, ${(100 / (compact ? 54 : 76)).toFixed(3)}cqh)`;
  const Names = heading;

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ backgroundColor: t.color, color: t.colors.text }}>
      <Image
        src={t.image}
        alt=""
        fill
        sizes={sizes}
        className="object-cover"
        {...(eager && !sealed ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
      />
      <div className="absolute [container-type:size]" style={{ top: `${top}%`, right: `${right}%`, bottom: `${bottom}%`, left: `${left}%` }}>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{ "--u": unit } as React.CSSProperties}
        >
          <span
            className="font-sans font-semibold uppercase"
            style={{ color: t.colors.accent, fontSize: u(3.8), letterSpacing: "0.3em", marginRight: "-0.3em" }}
          >
            {category}
          </span>
          {!compact && <span aria-hidden="true" className="block h-px opacity-60" style={{ backgroundColor: t.colors.accent, width: u(9), marginTop: u(3.5) }} />}
          <Names className="font-invite font-medium text-balance italic" style={{ fontSize: u(nameSize), lineHeight: 1.04, marginTop: u(compact ? 3 : 4) }}>
            {couple ? (
              <>
                {first}
                <span className="block not-italic" style={{ color: t.colors.accent, fontSize: "0.5em", lineHeight: 1.4 }}>
                  &amp;
                </span>
                {second}
              </>
            ) : (
              names
            )}
          </Names>
          {!compact && (date || place) && (
            <span aria-hidden="true" className="block h-px opacity-60" style={{ backgroundColor: t.colors.accent, width: u(9), marginTop: u(4.5) }} />
          )}
          {date && (
            <span className="font-sans font-semibold" style={{ fontSize: u(4.4), lineHeight: 1.4, marginTop: u(3.5) }}>
              {date}
              {time && !compact && <span className="block">{time}</span>}
            </span>
          )}
          {place && !compact && (
            <span className="font-sans text-balance opacity-80" style={{ fontSize: u(3.8), lineHeight: 1.35, marginTop: u(1.2) }}>
              {place}
            </span>
          )}
        </div>
      </div>

      {sealed && (
        <>
          {/* Enveloppe scellée : une case à cocher invisible, donc l'ouverture marche sans JavaScript (voir globals.css). */}
          <input id={toggleId} type="checkbox" className="envelope-toggle sr-only" aria-label="Ouvrir l'invitation" />
          <label htmlFor={toggleId} className="envelope absolute inset-0 z-10 cursor-pointer overflow-hidden">
            <span className="envelope-left" style={{ backgroundImage: `url(${t.cover.image})` }} />
            <span className="envelope-right" style={{ backgroundImage: `url(${t.cover.image})` }} />
            <span className="envelope-hint absolute inset-x-0 bottom-[7%] mx-auto w-fit rounded-full bg-white/90 px-5 py-2.5 font-sans text-sm font-bold text-ink shadow-card-hover">
              Touchez pour ouvrir
            </span>
          </label>
        </>
      )}
    </div>
  );
}
