import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Styles de boutons de la charte (BRAND.md, section 5), appliqués à des liens. */
export const buttonLinkVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-terracotta/40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-terracotta text-cream shadow-card hover:bg-terracotta-dark",
        outline: "border border-ink/12 bg-white text-ink hover:bg-sand",
        gold: "bg-gold text-forest hover:bg-gold-dark",
        white: "bg-white text-ink hover:bg-cream",
        soft: "rounded-xl bg-sand text-ink hover:bg-[#EADCC2]",
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
