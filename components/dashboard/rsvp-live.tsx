"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ActionState, RsvpRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS = { yes: "Présent", no: "Absent", maybe: "Peut-être" } as const;
const TONES = {
  yes: "bg-[#E7F1EA] text-forest",
  no: "bg-red-50 text-red-700",
  maybe: "bg-[#FBF1DC] text-[#8A5A12]",
} as const;

function stats(rows: RsvpRow[]) {
  const yes = rows.filter((r) => r.response === "yes");
  return {
    total: rows.length,
    yes: yes.length,
    no: rows.filter((r) => r.response === "no").length,
    maybe: rows.filter((r) => r.response === "maybe").length,
    people: yes.reduce((s, r) => s + r.guests_count, 0),
  };
}

const timeFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Ouagadougou",
});

/**
 * Réponses des invités, mises à jour en temps réel (Supabase Realtime,
 * filtré par la sécurité RLS : l'organisateur ne reçoit que ses réponses).
 */
export function RsvpLive({
  eventId,
  initial,
  guestLimit,
  reminderText,
  canRemind,
  onDelete,
}: {
  eventId: string;
  initial: RsvpRow[];
  guestLimit: number | null;
  reminderText: string;
  canRemind: boolean;
  onDelete: (rsvpId: string) => Promise<ActionState>;
}) {
  const [rows, setRows] = useState<RsvpRow[]>(initial);
  const [live, setLive] = useState(false);
  const [filter, setFilter] = useState<"all" | "yes" | "no" | "maybe">("all");

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`rsvps-${eventId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "rsvps", filter: `event_id=eq.${eventId}` }, (payload) => {
        const row = payload.new as RsvpRow;
        setRows((prev) => (prev.some((r) => r.id === row.id) ? prev : [row, ...prev]));
      })
      // Les suppressions ne peuvent pas être filtrées par Realtime : on retire par identifiant
      // (sans effet si la ligne n'est pas dans la liste affichée).
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "rsvps" }, (payload) => {
        const old = payload.old as Partial<RsvpRow>;
        setRows((prev) => prev.filter((r) => r.id !== old.id));
      })
      .subscribe((status) => setLive(status === "SUBSCRIBED"));
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventId]);

  const s = useMemo(() => stats(rows), [rows]);
  const shown = filter === "all" ? rows : rows.filter((r) => r.response === filter);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Personnes attendues" value={s.people} accent />
        <Stat label="Présents" value={s.yes} />
        <Stat label="Peut-être" value={s.maybe} />
        <Stat label="Absents" value={s.no} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-ink/60">
          <span className={cn("size-2 rounded-full", live ? "bg-forest" : "bg-ink/30")} aria-hidden="true" />
          {live ? "Mise à jour en temps réel" : "Connexion au temps réel…"}
          {guestLimit && (
            <span className="ml-1">
              · {s.total} / {guestLimit} invités suivis
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtrer les réponses">
          {(["all", "yes", "maybe", "no"] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-8 rounded-full px-3 text-xs font-bold",
                filter === f ? "bg-ink text-cream" : "bg-sand text-ink hover:bg-[#EADCC2]",
              )}
            >
              {f === "all" ? `Toutes (${s.total})` : `${LABELS[f]} (${s[f]})`}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-ink/15 px-4 py-8 text-center text-[15px] text-ink/55">
          {rows.length === 0 ? "Aucune réponse pour le moment. Partagez le lien sur WhatsApp pour recevoir les premières confirmations." : "Aucune réponse dans ce filtre."}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-ink/5 rounded-2xl border border-ink/5 bg-white">
          {shown.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-bold">
                  {r.name}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", TONES[r.response])}>{LABELS[r.response]}</span>
                  {r.response !== "no" && r.guests_count > 1 && <span className="text-xs font-semibold text-ink/55">{r.guests_count} pers.</span>}
                </p>
                {r.message && <p className="mt-1 text-sm text-ink/70">« {r.message} »</p>}
                <p className="mt-1 text-xs text-ink/45">
                  {timeFmt.format(new Date(r.created_at))}
                  {r.phone && ` · ${r.phone}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {canRemind && r.response === "maybe" && r.phone && (
                  <a
                    href={`https://wa.me/${r.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(reminderText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 items-center gap-1 rounded-full bg-forest px-3 text-xs font-bold text-cream"
                  >
                    <MessageCircle className="size-3.5" aria-hidden="true" />
                    Relancer
                  </a>
                )}
                <button
                  type="button"
                  aria-label={`Supprimer la réponse de ${r.name}`}
                  className="flex size-8 items-center justify-center rounded-full text-ink/40 hover:bg-red-50 hover:text-red-700"
                  onClick={async () => {
                    if (!window.confirm(`Supprimer la réponse de ${r.name} ?`)) return;
                    const res = await onDelete(r.id);
                    if (res?.ok) setRows((prev) => prev.filter((x) => x.id !== r.id));
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl px-4 py-3.5", accent ? "bg-forest text-cream" : "border border-ink/5 bg-white")}>
      <p className="font-heading text-3xl leading-none font-semibold">{value}</p>
      <p className={cn("mt-1.5 text-xs font-bold", accent ? "text-cream/80" : "text-ink/55")}>{label}</p>
    </div>
  );
}
