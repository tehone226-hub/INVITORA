import Image from "next/image";
import { getTheme, type ThemeId } from "@/config/themes";
import { cn } from "@/lib/utils";

interface InvitationCardProps {
  theme: ThemeId | string;
  category: string;
  /** « Awa & Moussa » : le « & » est mis en valeur automatiquement */
  names: string;
  date?: string;
  place?: string;
  size?: "sm" | "lg";
  /** Largeurs d'affichage, pour que Next.js serve une image à la bonne taille */
  sizes?: string;
  /** Image visible dès l'arrivée sur la page (hero) : chargement prioritaire */
  eager?: boolean;
  className?: string;
}

/**
 * Aperçu d'invitation : fond illustré SANS texte + textes posés en HTML par-dessus.
 * C'est le principe retenu pour les vraies invitations (règle 2 de CLAUDE.md).
 * La couleur moyenne du fond s'affiche pendant le chargement de l'image.
 */
export function InvitationCard({
  theme,
  category,
  names,
  date,
  place,
  size = "sm",
  sizes = "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw",
  eager = false,
  className,
}: InvitationCardProps) {
  const t = getTheme(theme);
  const [first, second] = names.split(" & ");
  const lg = size === "lg";

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", lg ? "p-6" : "p-5", className)}
      style={{ backgroundColor: t.color }}
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
        className={cn(
          "relative flex w-full flex-col items-center justify-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.22)]",
          lg ? "max-w-[200px] gap-2 rounded-xl px-4 py-7" : "max-w-[190px] gap-1.5 rounded-lg px-3 py-5",
        )}
        style={{
          backgroundColor: t.colors.panel,
          color: t.colors.text,
          outline: `1px solid ${t.colors.accent}`,
          outlineOffset: "-6px",
        }}
      >
        <span
          className="text-[9px] font-bold tracking-[0.2em] uppercase"
          style={{ color: t.colors.accent }}
        >
          {category}
        </span>
        <span
          className={cn(
            "font-heading leading-tight font-semibold text-balance",
            lg ? "text-[22px]" : "text-[17px]",
          )}
        >
          {second !== undefined ? (
            <>
              {first}
              <span className="block italic" style={{ color: t.colors.accent }}>
                &amp;
              </span>
              {second}
            </>
          ) : (
            names
          )}
        </span>
        {date && (
          <span className={cn("font-semibold", lg ? "text-[11px]" : "text-[10px]")}>{date}</span>
        )}
        {place && <span className="text-[9px] opacity-75">{place}</span>}
      </div>
    </div>
  );
}
