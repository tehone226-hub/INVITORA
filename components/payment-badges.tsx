import { cn } from "@/lib/utils";

/** Pastilles des moyens de paiement acceptés. */
export function PaymentBadges({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-2", className)}>
      <span className="rounded-md bg-night px-2.5 py-1.5 text-xs font-bold text-white">Orange Money</span>
      <span className="rounded-md bg-brand px-2.5 py-1.5 text-xs font-bold text-white">Moov Money</span>
    </span>
  );
}
