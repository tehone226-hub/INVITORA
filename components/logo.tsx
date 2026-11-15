import { cn } from "@/lib/utils";

/** Signe seul : carré vert arrondi avec un « I » crème (voir BRAND.md). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[12px] bg-forest font-heading text-xl leading-none font-bold text-cream",
        className,
      )}
    >
      I
    </span>
  );
}

/** Logo complet : signe + « Invitora » en serif. `tone="dark"` : sur fond vert. */
export function Logo({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={tone === "dark" ? "bg-cream text-forest" : undefined} />
      <span
        className={cn(
          "font-heading text-[22px] font-semibold",
          tone === "dark" ? "text-cream" : "text-ink",
        )}
      >
        Invitora
      </span>
    </span>
  );
}
