import "server-only";
import { notFound } from "next/navigation";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { PLANS } from "@/config/plans";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { EventRow, PaymentRow, RsvpRow } from "@/lib/types";

export const EVENT_COLUMNS =
  "id, owner_id, slug, event_type, title, hosts, starts_at, venue, city, address, maps_url, message, program, dress_code, rsvp_deadline, contact_phone, language, theme, cover_image_url, status, plan, plan_expires_at, guest_limit, image_generations, blocked_at, created_at, updated_at";

/** Formule active (payée et non expirée) */
export const isPlanActive = (e: Pick<EventRow, "plan" | "plan_expires_at">) =>
  Boolean(e.plan && e.plan_expires_at && new Date(e.plan_expires_at) > new Date());

/** Visible par les invités : publié ET formule active */
export const isPublic = (e: Pick<EventRow, "status" | "plan" | "plan_expires_at"> & { blocked_at?: string | null }) =>
  e.status === "published" && !e.blocked_at && isPlanActive(e);

export const planOf = (e: Pick<EventRow, "plan" | "plan_expires_at">) => (isPlanActive(e) && e.plan ? PLANS[e.plan] : null);

/* ---------------- Organisateur (RLS : ses propres données) ---------------- */

export async function listMyEvents(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`${EVENT_COLUMNS}, rsvps(count)`)
    .eq("owner_id", userId)
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .returns<(EventRow & { rsvps: { count: number }[] })[]>();
  if (error) throw error;
  return (data ?? []).map((e) => ({ ...e, rsvpCount: e.rsvps?.[0]?.count ?? 0 }));
}

/** Événement de l'utilisateur (ou n'importe lequel pour un admin) ; 404 sinon. */
export async function getMyEvent(id: string): Promise<EventRow> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const user = await getCurrentUser();
  if (!user) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("events").select(EVENT_COLUMNS).eq("id", id).maybeSingle<EventRow>();
  // Défense en profondeur : la RLS filtre déjà, on revérifie le propriétaire côté serveur.
  if (!data || (data.owner_id !== user.id && !user.isAdmin)) notFound();
  return data;
}

export async function listRsvps(eventId: string): Promise<RsvpRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rsvps")
    .select("id, event_id, name, phone, response, guests_count, message, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .returns<RsvpRow[]>();
  if (error) throw error;
  return data ?? [];
}

export async function listEventPayments(eventId: string): Promise<PaymentRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .returns<PaymentRow[]>();
  return data ?? [];
}

export function rsvpStats(rsvps: RsvpRow[]) {
  const yes = rsvps.filter((r) => r.response === "yes");
  return {
    total: rsvps.length,
    yes: yes.length,
    no: rsvps.filter((r) => r.response === "no").length,
    maybe: rsvps.filter((r) => r.response === "maybe").length,
    people: yes.reduce((sum, r) => sum + r.guests_count, 0),
  };
}

/* ---------------- Public (page invité, sans cookies, mis en cache) ---------------- */

function anonClient() {
  return createAnonClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const eventTag = (slug: string) => `event-${slug}`;

/**
 * Invitation publique (publiée, payée, non suspendue), par son adresse exacte.
 * Passe par la fonction SQL get_public_event : aucune liste d'invitations n'est exposée.
 */
export async function getPublicEvent(slug: string): Promise<EventRow | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(eventTag(slug));
  if (!isSupabaseConfigured || !/^[a-z0-9-]{10,80}$/.test(slug)) return null;
  const { data } = await anonClient().rpc("get_public_event", { p_slug: slug });
  const row = (data as Omit<EventRow, "owner_id" | "image_generations" | "blocked_at" | "created_at" | "updated_at">[] | null)?.[0];
  if (!row) return null;
  return { ...row, owner_id: "", image_generations: 0, blocked_at: null, created_at: "", updated_at: "" };
}

/** Réglages du site (lecture publique), mis en cache. */
export async function getSiteSettings(): Promise<{ showSampleContent: boolean; maintenanceMessage: string }> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  const fallback = { showSampleContent: false, maintenanceMessage: "" };
  if (!isSupabaseConfigured) return fallback;
  try {
    const { data } = await anonClient().from("app_settings").select("key, value");
    const map = new Map((data ?? []).map((r: { key: string; value: unknown }) => [r.key, r.value]));
    return {
      showSampleContent: map.get("show_sample_content") === true,
      maintenanceMessage: typeof map.get("maintenance_message") === "string" ? (map.get("maintenance_message") as string) : "",
    };
  } catch {
    return fallback;
  }
}
