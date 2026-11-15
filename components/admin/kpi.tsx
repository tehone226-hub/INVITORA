import { cn } from "@/lib/utils";

/** Tuile d'indicateur : un chiffre clé, son libellé et un détail secondaire. */
export function KpiTile({ label, value, detail, className }: { label: string; value: string; detail?: string; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-ink/5 bg-white px-5 py-4 shadow-card", className)}>
      <p className="text-[13px] font-bold text-ink/60">{label}</p>
      <p className="mt-1.5 font-heading text-[32px] leading-none font-semibold text-ink tabular-nums">{value}</p>
      {detail && <p className="mt-2 text-xs text-ink/55">{detail}</p>}
    </div>
  );
}

const dayFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

/**
 * Histogramme d'une seule série (le titre la nomme : pas de légende).
 * Barres fines arrondies en haut, 2 px d'écart, info-bulle au survol / au focus,
 * tableau accessible pour les lecteurs d'écran.
 */
export function MiniBarChart({ title, color, data }: { title: string; color: string; data: { date: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <figure className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-bold text-ink">{title}</span>
        <span className="text-xs text-ink/55">
          {total} sur 14 jours
        </span>
      </figcaption>
      <div className="mt-5 flex h-32 items-end gap-[2px] border-b border-ink/10" aria-hidden="true">
        {data.map((d) => (
          <div key={d.date} tabIndex={0} className="group relative flex h-full flex-1 items-end outline-none">
            <div
              className="w-full rounded-t-[4px] transition-opacity group-hover:opacity-80"
              style={{ height: `${d.value === 0 ? 0 : Math.max(4, (d.value / max) * 100)}%`, backgroundColor: color }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 rounded-lg bg-ink px-2 py-1 text-[11px] font-bold whitespace-nowrap text-cream group-hover:block group-focus:block">
              {dayFmt.format(new Date(`${d.date}T00:00:00Z`))} : {d.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-ink/50" aria-hidden="true">
        <span>{dayFmt.format(new Date(`${data[0]?.date}T00:00:00Z`))}</span>
        <span>{dayFmt.format(new Date(`${data[data.length - 1]?.date}T00:00:00Z`))}</span>
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>Jour</th>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{dayFmt.format(new Date(`${d.date}T00:00:00Z`))}</td>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
