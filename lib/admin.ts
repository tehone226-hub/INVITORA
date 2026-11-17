import "server-only";
import { createClient } from "@/lib/neon/data";
import type { EventRow, PaymentRow, ProfileRow } from "@/lib/types";

/**
 * Lectures de l'administration : client utilisateur + politiques RLS « admin »
 * (is_admin()). Les écritures sensibles passent par app/admin/actions.ts.
 */

const DAY = 24 * 3600_000;

function dailySeries(dates: string[], days: number) {
  const buckets = new Map<string, number>();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) buckets.set(new Date(today.getTime() - i * DAY).toISOString().slice(0, 10), 0);
  for (const d of dates) {
    const k = d.slice(0, 10);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([date, value]) => ({ date, value }));
}

export async function getAdminOverview() {
  const supabase = await createClient();
  const since14 = new Date(Date.now() - 14 * DAY).toISOString();
  const since30 = new Date(Date.now() - 30 * DAY).toISOString();
  const nowIso = new Date().toISOString();
  const count = { count: "exact" as const, head: true };

  const [users, events, online, rsvps, pending, paid, newUsers, newRsvps, aiText, recentPayments, recentUsers] =
    await Promise.all([
      supabase.from("profiles").select("id", count),
      supabase.from("events").select("id", count).neq("status", "archived"),
      supabase.from("events").select("id", count).eq("status", "published").gt("plan_expires_at", nowIso),
      supabase.from("rsvps").select("id", count),
      supabase.from("payments").select("id", count).eq("status", "pending"),
      supabase.from("payments").select("amount, paid_at").eq("status", "paid").limit(10000),
      supabase.from("profiles").select("created_at").gte("created_at", since14).limit(10000),
      supabase.from("rsvps").select("created_at").gte("created_at", since14).limit(20000),
      supabase.from("ai_usage").select("id", count).eq("kind", "text").gte("created_at", since30),
      supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(6).returns<PaymentRow[]>(),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(6).returns<ProfileRow[]>(),
    ]);

  const paidRows = (paid.data ?? []) as { amount: string; paid_at: string | null }[];
  const revenue = paidRows.reduce((s, p) => s + Number.parseFloat(p.amount), 0);
  const revenue30 = paidRows
    .filter((p) => p.paid_at && p.paid_at >= since30)
    .reduce((s, p) => s + Number.parseFloat(p.amount), 0);

  return {
    users: users.count ?? 0,
    events: events.count ?? 0,
    online: online.count ?? 0,
    rsvps: rsvps.count ?? 0,
    pendingPayments: pending.count ?? 0,
    paidPayments: paidRows.length,
    revenue,
    revenue30,
    aiText30: aiText.count ?? 0,
    signupsSeries: dailySeries(((newUsers.data ?? []) as { created_at: string }[]).map((r) => r.created_at), 14),
    rsvpSeries: dailySeries(((newRsvps.data ?? []) as { created_at: string }[]).map((r) => r.created_at), 14),
    recentPayments: recentPayments.data ?? [],
    recentUsers: recentUsers.data ?? [],
  };
}

export async function listUsers(q: string) {
  const supabase = await createClient();
  let query = supabase.from("profiles").select("*, events(count)").order("created_at", { ascending: false }).limit(200);
  if (q) query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
  const { data } = await query.returns<(ProfileRow & { events: { count: number }[] })[]>();
  return (data ?? []).map((u) => ({ ...u, eventCount: u.events?.[0]?.count ?? 0 }));
}

export async function listAllEvents(status: string, q: string) {
  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select("*, profiles!events_owner_id_fkey(email, full_name), rsvps(count)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (["draft", "published", "archived"].includes(status)) query = query.eq("status", status);
  if (q) query = query.ilike("title", `%${q}%`);
  const { data } = await query.returns<
    (EventRow & { profiles: { email: string | null; full_name: string | null } | null; rsvps: { count: number }[] })[]
  >();
  return (data ?? []).map((e) => ({ ...e, rsvpCount: e.rsvps?.[0]?.count ?? 0 }));
}

export async function listPayments(status: string) {
  const supabase = await createClient();
  let query = supabase
    .from("payments")
    .select("*, events(title), profiles(email)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (["pending", "paid", "failed", "expired", "cancelled"].includes(status)) query = query.eq("status", status);
  const { data } = await query.returns<
    (PaymentRow & { events: { title: string } | null; profiles: { email: string | null } | null })[]
  >();
  return data ?? [];
}

export async function listAiUsage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_usage")
    .select("*, profiles(email), events(title)")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<
      {
        id: string;
        kind: "text" | "image";
        model: string;
        ok: boolean;
        created_at: string;
        profiles: { email: string | null } | null;
        events: { title: string } | null;
      }[]
    >();
  return data ?? [];
}

/** Échappe la saisie pour les filtres PostgREST (évite de casser la requête). */
export const cleanSearch = (v: unknown) =>
  typeof v === "string" ? v.replace(/[%,()*\\]/g, " ").trim().slice(0, 60) : "";
