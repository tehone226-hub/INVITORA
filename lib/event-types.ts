import type { ThemeId } from "@/config/themes";
import type { EventType, InvitationLanguage } from "@/lib/types";

export const EVENT_TYPES: { id: EventType; label: string; defaultTheme: ThemeId }[] = [
  { id: "mariage", label: "Mariage", defaultTheme: "faso-dan-fani--origine" },
  { id: "dot", label: "Dot", defaultTheme: "senoufo--origine" },
  { id: "bapteme", label: "Baptême", defaultTheme: "coton--origine" },
  { id: "anniversaire", label: "Anniversaire", defaultTheme: "wax--origine" },
  { id: "funerailles", label: "Funérailles", defaultTheme: "adinkra--cendre" },
  { id: "entreprise", label: "Événement d'entreprise", defaultTheme: "ardoise--origine" },
  { id: "soutenance", label: "Soutenance", defaultTheme: "bogolan--origine" },
  { id: "autre", label: "Autre fête", defaultTheme: "faso-dan-fani--origine" },
];

export const eventTypeLabel = (id: EventType) => EVENT_TYPES.find((t) => t.id === id)?.label ?? "Événement";

export const LANGUAGES: { id: InvitationLanguage; label: string }[] = [
  { id: "fr", label: "Français" },
  { id: "mos", label: "Mooré" },
  { id: "dyu", label: "Dioula" },
];

export const isEventType = (v: unknown): v is EventType => EVENT_TYPES.some((t) => t.id === v);
export const isLanguage = (v: unknown): v is InvitationLanguage => LANGUAGES.some((l) => l.id === v);
