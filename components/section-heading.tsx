import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  /** `dark` : sur fond vert */
  tone?: "light" | "dark";
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "light",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "mx-auto max-w-xl text-center", className)}>
      <p
        className={cn(
          "text-xs font-bold tracking-[0.12em] uppercase",
          tone === "dark" ? "text-gold" : "text-terracotta",
        )}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          "mt-2 text-[28px] leading-tight font-semibold sm:text-4xl",
          tone === "dark" ? "text-cream" : "text-ink",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-3 text-[15px] leading-relaxed",
            tone === "dark" ? "text-cream/80" : "text-ink/60",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
