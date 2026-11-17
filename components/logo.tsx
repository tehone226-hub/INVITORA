import { cn } from "@/lib/utils";

/** Signe seul : carré violet arrondi, « i » blanc dont le point est une étincelle mangue (voir BRAND.md). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("size-9 shrink-0", className)}>
      <rect width="64" height="64" rx="18" fill="var(--brand)" />
      <rect x="27" y="27" width="10" height="24" rx="5" fill="#fff" />
      <path d="M32 9l3.2 6.3 6.3 3.2-6.3 3.2L32 28l-3.2-6.3-6.3-3.2 6.3-3.2z" fill="var(--sun)" />
    </svg>
  );
}

/** Logo complet : signe + « Invitora ». `tone="dark"` : sur fond nuit. */
export function Logo({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className={cn("font-heading text-[22px] font-bold tracking-tight", tone === "dark" ? "text-white" : "text-ink")}>
        Invitora
      </span>
    </span>
  );
}
