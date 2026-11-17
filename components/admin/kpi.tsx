import { cn } from "@/lib/utils";

/**
 * Tuile d'indicateur : une icône, un chiffre clé, son libellé et un détail secondaire.
 * `tone="night"` : tuile sombre, pour l'indicateur principal de la page.
 */
export function KpiTile({
  label,
  value,
  detail,
  icon,
  tone = "light",
  className,
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: React.ReactNode;
  tone?: "light" | "night";
  className?: string;
}) {
  const night = tone === "night";
  return (
    <div className={cn("rounded-xl border p-5", night ? "bg-night-glow border-transparent text-white" : "border-ink/10 bg-white", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className={cn("text-[13px] font-semibold", night ? "text-white/70" : "text-ink/60")}>{label}</p>
        {icon && (
          <span
            className={cn("flex size-8 items-center justify-center rounded-lg [&_svg]:size-4", night ? "bg-white/10 text-sun" : "bg-brand-soft text-brand")}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 font-heading text-[30px] leading-none font-extrabold tracking-tight tabular-nums">{value}</p>
      {detail && <p className={cn("mt-2 text-xs", night ? "text-white/60" : "text-ink/55")}>{detail}</p>}
    </div>
  );
}

const dayFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

/**
 * Histogramme d'une seule série (le titre la nomme : pas de légende).
 * Barres arrondies en haut, 3 px d'écart, info-bulle au survol / au focus,
 * tableau accessible pour les lecteurs d'écran.
 */
export function MiniBarChart({ title, color, data }: { title: string; color: string; data: { date: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <figure className="rounded-xl border border-ink/10 bg-white p-5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-bold text-ink">{title}</span>
        <span className="rounded-md bg-mist px-2 py-0.5 text-xs font-semibold text-ink/65">{total} sur 14 jours</span>
      </figcaption>
      <div className="mt-5 flex h-36 items-end gap-[3px] border-b border-ink/10" aria-hidden="true">
        {data.map((d) => (
          <div key={d.date} tabIndex={0} className="group relative flex h-full flex-1 items-end rounded-t-md outline-none hover:bg-mist/60 focus:bg-mist/60">
            <div
              className="w-full rounded-t-md"
              style={{ height: `${d.value === 0 ? 0 : Math.max(4, (d.value / max) * 100)}%`, backgroundColor: color }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 rounded-md bg-night px-2 py-1 text-[11px] font-bold whitespace-nowrap text-white group-hover:block group-focus:block">
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
