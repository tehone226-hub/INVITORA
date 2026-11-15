import type { PlanId } from "@/config/plans";
import type { ThemeId } from "@/config/themes";

export type EventType =
  | "mariage"
  | "dot"
  | "bapteme"
  | "anniversaire"
  | "funerailles"
  | "entreprise"
  | "soutenance"
  | "autre";

export type EventStatus = "draft" | "published" | "archived";
export type InvitationLanguage = "fr" | "mos" | "dyu";
export type RsvpResponse = "yes" | "no" | "maybe";

export interface ProgramItem {
  time: string;
  label: string;
}

export interface EventRow {
  id: string;
  owner_id: string;
  slug: string;
  event_type: EventType;
  title: string;
  hosts: string | null;
  starts_at: string | null;
  venue: string | null;
  city: string | null;
  address: string | null;
  maps_url: string | null;
  message: string | null;
  program: ProgramItem[];
  dress_code: string | null;
  rsvp_deadline: string | null;
  contact_phone: string | null;
  language: InvitationLanguage;
  theme: ThemeId;
  cover_image_url: string | null;
  status: EventStatus;
  plan: PlanId | null;
  plan_expires_at: string | null;
  guest_limit: number | null;
  image_generations: number;
  blocked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RsvpRow {
  id: string;
  event_id: string;
  name: string;
  phone: string | null;
  response: RsvpResponse;
  guests_count: number;
  message: string | null;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: "user" | "admin";
  created_at: string;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "cancelled";

export interface PaymentRow {
  id: string;
  event_id: string;
  user_id: string;
  plan: PlanId;
  amount: string;
  currency: string;
  status: PaymentStatus;
  saspay_session_id: string | null;
  saspay_transaction_id: string | null;
  checkout_url: string | null;
  created_at: string;
  paid_at: string | null;
}

/** Résultat d'une action de formulaire (affiché à l'utilisateur, en français). */
export type ActionState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> } | null;
