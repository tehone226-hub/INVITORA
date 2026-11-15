import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-sand/70" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-sand/60" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-sand/50" />
    </div>
  );
}

/** Barre de filtres d'une liste : recherche + onglets de statut (liens GET). */
export function FilterBar({
  basePath,
  q,
  status,
  statuses,
  placeholder = "Rechercher…",
}: {
  basePath: string;
  q?: string;
  status?: string;
  statuses?: { id: string; label: string }[];
  placeholder?: string;
}) {
  const href = (s: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (s) params.set("statut", s);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <form action={basePath} className="flex min-w-0 flex-1 gap-2">
        {status && <input type="hidden" name="statut" value={status} />}
        <input
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-10 min-w-0 flex-1 rounded-xl border border-ink/15 bg-white px-3.5 text-sm outline-none focus:border-terracotta"
        />
        <button className="h-10 rounded-xl bg-ink px-4 text-sm font-bold text-cream">Rechercher</button>
      </form>
      {statuses && (
        <div className="flex flex-wrap gap-1.5">
          {[{ id: "", label: "Tous" }, ...statuses].map((s) => (
            <Link
              key={s.id || "tous"}
              href={href(s.id)}
              className={cn(
                "flex h-8 items-center rounded-full px-3 text-xs font-bold",
                (status ?? "") === s.id ? "bg-ink text-cream" : "bg-white text-ink hover:bg-sand",
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "good" | "warn" | "bad" | "neutral"; children: React.ReactNode }) {
  const tones = {
    good: "bg-[#E7F1EA] text-forest",
    warn: "bg-[#FBF1DC] text-[#8A5A12]",
    bad: "bg-red-50 text-red-700",
    neutral: "bg-sand text-ink/70",
  };
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap", tones[tone])}>{children}</span>;
}
