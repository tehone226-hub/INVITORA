import { THEMES, type ThemeId } from "@/config/themes";
import { cn } from "@/lib/utils";

interface InvitationCardProps {
  theme: ThemeId;
  category: string;
  /** « Awa & Moussa » : le « & » est mis en valeur automatiquement */
  names: string;
  date?: string;
  place?: string;
  size?: "sm" | "lg";
  className?: string;
}

/**
 * Aperçu d'invitation : fond à motif (sans texte) + textes posés en HTML par-dessus.
 * C'est le principe retenu pour les vraies invitations (règle 2 de CLAUDE.md).
 */
export function InvitationCard({
  theme,
  category,
  names,
  date,
  place,
  size = "sm",
  className,
}: InvitationCardProps) {
  const t = THEMES[theme];
  const [first, second] = names.split(" & ");
  const lg = size === "lg";

  return (
    <div
      className={cn("flex items-center justify-center", lg ? "p-5" : "p-4", className)}
      style={{
        backgroundImage: t.pattern,
        backgroundSize: `${t.tileSize}px ${t.tileSize}px`,
      }}
    >
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center text-center shadow-[0_6px_20px_rgba(0,0,0,0.18)]",
          lg ? "max-w-[220px] gap-2 rounded-xl px-4 py-7" : "max-w-[180px] gap-1.5 rounded-lg px-3 py-5",
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
            lg ? "text-[22px]" : "text-base",
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
