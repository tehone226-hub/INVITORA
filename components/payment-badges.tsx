import { cn } from "@/lib/utils";

/** Pastilles des moyens de paiement acceptés. */
export function PaymentBadges({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-2", className)}>
      <span className="rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-cream">Orange Money</span>
      <span className="rounded-lg bg-terracotta px-3 py-1.5 text-xs font-bold text-cream">Moov Money</span>
    </span>
  );
}
