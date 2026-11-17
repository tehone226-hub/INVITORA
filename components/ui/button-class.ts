import { cn } from "@/lib/utils";

/** Styles de boutons de la charte (BRAND.md). Module neutre : utilisable côté serveur et côté navigateur. */
const buttonStyles = {
  primary: "bg-brand text-white hover:bg-brand-dark shadow-glow",
  dark: "bg-night text-white hover:bg-night-soft",
  outline: "border border-ink/12 bg-white text-ink hover:border-brand/40 hover:bg-brand-soft",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  sun: "bg-sun text-night hover:bg-sun-dark",
};

export type ButtonVariant = keyof typeof buttonStyles;

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4",
    buttonStyles[variant],
    className,
  );
}
