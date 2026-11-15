/** Formats français (CLAUDE.md) : « samedi 14 décembre 2026 », fuseau Africa/Ouagadougou. */
export const TIME_ZONE = "Africa/Ouagadougou";

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(new Date(iso));
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE })
    .format(new Date(iso))
    .replace(":", " h ");
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return `${formatDate(iso)} à ${formatTime(iso)}`;
}

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", timeZone: TIME_ZONE }).format(
    new Date(iso),
  );
}

/**
 * Convertit la saisie d'un formulaire (« 2026-12-12 » + « 16:00 », heure de Ouagadougou)
 * en date ISO. Ouagadougou est en UTC+0 toute l'année (pas d'heure d'été).
 */
export function toIsoFromLocal(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const t = /^\d{2}:\d{2}$/.test(time) ? time : "12:00";
  const d = new Date(`${date}T${t}:00Z`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Inverse : ISO → valeurs pour <input type="date"> et <input type="time"> */
export function toLocalInputs(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  return { date: d.toISOString().slice(0, 10), time: d.toISOString().slice(11, 16) };
}

/** « 4 900 FCFA » */
export function formatFcfa(amount: number | string): string {
  const n = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  return `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}
