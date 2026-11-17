import { getCurrentUser } from "@/lib/auth";
import { isBackendConfigured } from "@/lib/env";
import { createClient } from "@/lib/neon/data";
import type { RsvpRow } from "@/lib/types";

const LABELS = { yes: "Présent", no: "Absent", maybe: "Peut-être" } as const;

/** Export CSV des réponses (ouvrable dans Excel : séparateur « ; », BOM UTF-8). */
export async function GET(_req: Request, { params }: RouteContext<"/tableau-de-bord/evenements/[id]/export">) {
  if (!isBackendConfigured) return new Response("Non configuré", { status: 503 });
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return new Response("Connexion requise", { status: 401 });

  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("id, slug").eq("id", id).maybeSingle<{ id: string; slug: string }>();
  if (!event) return new Response("Introuvable", { status: 404 });

  const { data } = await supabase
    .from("rsvps")
    .select("name, phone, response, guests_count, message, created_at")
    .eq("event_id", id)
    .order("created_at", { ascending: true })
    .returns<RsvpRow[]>();

  const cell = (v: unknown) => {
    let s = String(v ?? "");
    // Évite l'injection de formules dans Excel, sans abîmer les numéros « +226 70 00 00 00 »
    const looksNumeric = /^[+-]?[\d\s().-]+$/.test(s);
    if (/^[=@\t\r]/.test(s) || (/^[+-]/.test(s) && !looksNumeric)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Ouagadougou" });
  const lines = [
    ["Nom", "Téléphone", "Réponse", "Personnes", "Message", "Date de réponse"].map(cell).join(";"),
    ...(data ?? []).map((r) =>
      [r.name, r.phone, LABELS[r.response], r.response === "no" ? 0 : r.guests_count, r.message, dateFmt.format(new Date(r.created_at))]
        .map(cell)
        .join(";"),
    ),
  ];
  return new Response(`﻿${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reponses-${event.slug.slice(0, 40)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
