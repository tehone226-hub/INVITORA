import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-mist" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-mist" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-mist/70" />
    </div>
  );
}

/** Titre d'une page d'administration, avec un texte d'aide facultatif. */
export function AdminTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-[28px] leading-tight font-extrabold sm:text-[32px]">{title}</h1>
      {children && <p className="mt-1.5 max-w-3xl text-sm text-ink/60">{children}</p>}
    </div>
  );
}

/** Carte blanche à bordure fine : le conteneur de base de l'administration. */
export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-xl border border-ink/10 bg-white", className)}>{children}</section>;
}

/** Classes communes des tableaux d'administration. */
export const tableClass = {
  wrap: "overflow-x-auto rounded-xl border border-ink/10 bg-white",
  head: "border-b border-ink/10 bg-paper text-[11px] tracking-wider text-ink/55 uppercase",
  th: "px-4 py-3 font-bold",
  body: "divide-y divide-ink/8",
  td: "px-4 py-3.5",
};

/** Barre de filtres d'une liste : recherche + onglets de statut (liens GET). */
export function FilterBar({
  basePath,
  q,
  status,
  statuses,
  placeholder = "Rechercher…",
  search = true,
}: {
  basePath: string;
  q?: string;
  status?: string;
  statuses?: { id: string; label: string }[];
  placeholder?: string;
  /** `false` : seulement les onglets de statut */
  search?: boolean;
}) {
  const href = (s: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (s) params.set("statut", s);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {statuses && (
        <div className="flex flex-wrap gap-1 rounded-lg bg-mist p-1">
          {[{ id: "", label: "Tous" }, ...statuses].map((s) => (
            <Link
              key={s.id || "tous"}
              href={href(s.id)}
              aria-current={(status ?? "") === s.id ? "true" : undefined}
              className={cn(
                "flex h-8 items-center rounded-md px-3 text-xs font-bold transition-colors",
                (status ?? "") === s.id ? "bg-white text-brand shadow-card" : "text-ink/60 hover:text-ink",
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}
      {search && (
        <form action={basePath} className="flex min-w-0 flex-1 gap-2 sm:max-w-md">
          {status && <input type="hidden" name="statut" value={status} />}
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
            <input
              name="q"
              defaultValue={q}
              placeholder={placeholder}
              aria-label={placeholder}
              className="h-10 w-full rounded-lg border border-ink/15 bg-white pr-3 pl-9 text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/15"
            />
          </div>
          <button className="h-10 rounded-lg bg-night px-4 text-sm font-bold text-white hover:bg-night-soft">Rechercher</button>
        </form>
      )}
    </div>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "good" | "warn" | "bad" | "neutral"; children: React.ReactNode }) {
  const tones = {
    good: "bg-[#E3F6EE] text-emerald-700",
    warn: "bg-[#FFF3D6] text-[#8A5300]",
    bad: "bg-red-50 text-red-700",
    neutral: "bg-mist text-ink/70",
  };
  const dots = { good: "bg-emerald-500", warn: "bg-sun-dark", bad: "bg-red-500", neutral: "bg-ink/30" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold whitespace-nowrap", tones[tone])}>
      <span className={cn("size-1.5 rounded-full", dots[tone])} aria-hidden="true" />
      {children}
    </span>
  );
}
