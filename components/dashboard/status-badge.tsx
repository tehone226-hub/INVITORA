import { PLANS } from "@/config/plans";
import { isPlanActive, isPublic } from "@/lib/events";
import { formatShortDate } from "@/lib/format";
import type { EventRow } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ event, className }: { event: EventRow; className?: string }) {
  const [label, tone] = isPublic(event)
    ? ["En ligne", "bg-[#E3F6EE] text-emerald-700"]
    : event.status === "published"
      ? ["Formule expirée", "bg-red-50 text-red-700"]
      : event.status === "archived"
        ? ["Archivée", "bg-mist text-ink/60"]
        : ["Brouillon", "bg-mist text-ink/70"];
  return <span className={cn("inline-flex rounded-md px-2.5 py-1 text-xs font-bold", tone, className)}>{label}</span>;
}

export function PlanBadge({ event }: { event: EventRow }) {
  if (!event.plan) return <span className="text-xs font-semibold text-ink/50">Aucune formule</span>;
  const active = isPlanActive(event);
  return (
    <span className={cn("text-xs font-semibold", active ? "text-emerald-700" : "text-red-700")}>
      {PLANS[event.plan].name} · {active ? `jusqu'au ${formatShortDate(event.plan_expires_at)}` : "expirée"}
    </span>
  );
}
