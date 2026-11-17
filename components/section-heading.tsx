import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Par défaut à gauche (charte « Nuit de fête ») */
  align?: "left" | "center";
  /** `dark` : sur fond nuit */
  tone?: "light" | "dark";
  id?: string;
  className?: string;
}

/** Titre de section : petite puce violette, grand titre, sous-titre. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "light",
  id,
  className,
}: SectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p
        className={cn(
          "inline-flex rounded-md px-2.5 py-1 text-xs font-bold",
          dark ? "bg-white/10 text-sun" : "bg-brand-soft text-brand",
        )}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          "mt-4 text-[30px] leading-[1.1] font-extrabold text-balance sm:text-[40px]",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-base leading-relaxed", dark ? "text-white/70" : "text-ink/60")}>{subtitle}</p>
      )}
    </div>
  );
}
