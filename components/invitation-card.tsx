import Image from "next/image";
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
  /** Conservé pour compatibilité : la typographie suit maintenant la taille de la carte. */
  size?: "sm" | "lg";
  /** Largeurs d'affichage, pour que Next.js serve une image à la bonne taille */
  sizes?: string;
  /** Image visible dès l'arrivée sur la page : chargement prioritaire */
  eager?: boolean;
  /** Balise des prénoms : `h1` sur la page de l'invité */
  heading?: "span" | "h1";
  className?: string;
}

/** Longueur calculée sur la carte : 1 unité = 1 % de sa largeur (ou 0,8 % de sa hauteur si elle est plus large que 4:5). */
const u = (n: number) => `calc(var(--u) * ${n})`;

/**
 * Invitation : fond illustré SANS texte + textes posés en HTML directement dessus (règle 2 de CLAUDE.md).
 * Le centre de chaque fond est calme : aucun panneau n'est nécessaire. La typographie se cale sur la
 * taille de la carte, pour garder les mêmes proportions de la vignette à la page de l'invité.
 * Donnez à la carte une taille définie (par exemple `aspect-[4/5]`).
 */
export function InvitationCard({
  theme,
  category,
  names,
  date,
  time,
  place,
  sizes = "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw",
  eager = false,
  heading = "span",
  className,
}: InvitationCardProps) {
  const t = getTheme(theme);
  const [first, second] = names.split(" & ");
  const couple = second !== undefined;
  const longest = Math.max(...names.split(couple ? " & " : "\n").map((s) => s.length));
  // Prénoms courts en grand ; titres longs (« Gala de fin d'année ») un peu plus petits pour tenir sur 2 ou 3 lignes.
  const nameSize = couple ? (longest > 11 ? 10.5 : 13) : longest > 22 ? 8.2 : longest > 14 ? 9.4 : 11.5;
  const Names = heading;

  return (
    <div
      className={cn("relative overflow-hidden [container-type:size]", className)}
      style={{ backgroundColor: t.color, color: t.colors.text }}
    >
      <Image
        src={t.image}
        alt=""
        fill
        sizes={sizes}
        className="object-cover"
        {...(eager ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
      />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center [--u:min(1cqw,0.8cqh)]"
        style={{ paddingInline: u(15), paddingBlock: u(20) }}
      >
        <span
          className="font-sans font-semibold uppercase"
          style={{ color: t.colors.accent, fontSize: u(3), letterSpacing: "0.34em", marginRight: "-0.34em" }}
        >
          {category}
        </span>
        <span aria-hidden="true" className="block h-px opacity-60" style={{ backgroundColor: t.colors.accent, width: u(8), marginTop: u(4.5) }} />
        <Names
          className="font-invite font-medium text-balance italic"
          style={{ fontSize: u(nameSize), lineHeight: 1.04, marginTop: u(5), letterSpacing: "-0.005em" }}
        >
          {couple ? (
            <>
              {first}
              <span className="block not-italic" style={{ color: t.colors.accent, fontSize: "0.5em", lineHeight: 1.5 }}>
                &amp;
              </span>
              {second}
            </>
          ) : (
            names
          )}
        </Names>
        {(date || place) && (
          <span aria-hidden="true" className="block h-px opacity-60" style={{ backgroundColor: t.colors.accent, width: u(8), marginTop: u(5.5) }} />
        )}
        {date && (
          <span className="font-sans font-medium" style={{ fontSize: u(3.5), lineHeight: 1.45, marginTop: u(4.5), letterSpacing: "0.04em" }}>
            {date}
            {time && <span className="block">{time}</span>}
          </span>
        )}
        {place && (
          <span className="font-sans opacity-75" style={{ fontSize: u(3), lineHeight: 1.4, marginTop: u(1.6), letterSpacing: "0.03em" }}>
            {place}
          </span>
        )}
      </div>
    </div>
  );
}
