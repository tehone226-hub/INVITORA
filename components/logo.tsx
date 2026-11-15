import { cn } from "@/lib/utils";

/** Signe seul : carré vert arrondi avec un « I » crème (voir BRAND.md). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-[14px] bg-forest font-heading text-2xl font-bold leading-none text-cream",
        className,
      )}
    >
      I
    </span>
  );
}

/** Logo complet : signe + « Invitora » en serif. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label="Invitora"
    >
      <LogoMark />
      <span className="font-heading text-2xl font-semibold text-ink">
        Invitora
      </span>
    </span>
  );
}
