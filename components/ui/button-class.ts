import { cn } from "@/lib/utils";

/** Styles de boutons de la charte (BRAND.md). Module neutre : utilisable côté serveur et côté navigateur. */
const buttonStyles = {
  primary: "bg-terracotta text-cream hover:bg-terracotta-dark shadow-card",
  forest: "bg-forest text-cream hover:bg-forest-dark",
  outline: "border border-ink/15 bg-white text-ink hover:bg-sand",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  gold: "bg-gold text-forest hover:bg-gold-dark",
};

export type ButtonVariant = keyof typeof buttonStyles;

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4",
    buttonStyles[variant],
    className,
  );
}
