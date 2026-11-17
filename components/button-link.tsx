import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Styles de boutons de la charte (BRAND.md, section 5), appliqués à des liens. */
export const buttonLinkVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-bold whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-brand/40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white shadow-glow hover:bg-brand-dark",
        outline: "border border-ink/12 bg-white text-ink hover:border-brand/40 hover:bg-brand-soft",
        sun: "bg-sun text-night hover:bg-sun-dark",
        dark: "bg-night text-white hover:bg-night-soft",
        ghost: "border border-white/20 bg-white/5 text-white hover:bg-white/15",
        white: "bg-white text-ink hover:bg-brand-soft",
        soft: "bg-brand-soft text-brand hover:bg-[#DDD8F0]",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonLinkProps = React.ComponentProps<typeof Link> &
  VariantProps<typeof buttonLinkVariants>;

export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonLinkVariants({ variant, size }), className)} {...props} />
  );
}
