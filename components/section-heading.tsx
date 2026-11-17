import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  /** Par défaut à gauche (charte « Nuit de fête ») */
  align?: "left" | "center";
  /** `dark` : sur fond nuit */
  tone?: "light" | "dark";
  id?: string;
  className?: string;
}

/** Titre de section : grand titre et sous-titre, sans étiquette au-dessus. */
export function SectionHeading({ title, subtitle, align = "left", tone = "light", id, className }: SectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <h2
        id={id}
        className={cn("text-[30px] leading-[1.08] font-extrabold text-balance sm:text-[42px]", dark ? "text-white" : "text-ink")}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-base leading-relaxed", dark ? "text-white/70" : "text-ink/60")}>{subtitle}</p>
      )}
    </div>
  );
}
