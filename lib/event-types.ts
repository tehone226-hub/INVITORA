import type { ThemeId } from "@/config/themes";
import type { EventType, InvitationLanguage } from "@/lib/types";

export const EVENT_TYPES: { id: EventType; label: string; defaultTheme: ThemeId }[] = [
  { id: "mariage", label: "Mariage", defaultTheme: "jardin--ivoire" },
  { id: "dot", label: "Dot", defaultTheme: "vannerie--zebu" },
  { id: "bapteme", label: "Baptême", defaultTheme: "arche--florale" },
  { id: "anniversaire", label: "Anniversaire", defaultTheme: "vannerie--indigo" },
  { id: "funerailles", label: "Funérailles", defaultTheme: "vannerie--sable" },
  { id: "entreprise", label: "Événement d'entreprise", defaultTheme: "vannerie--cacao" },
  { id: "soutenance", label: "Soutenance", defaultTheme: "shweshwe--marmites" },
  { id: "autre", label: "Autre fête", defaultTheme: "dentelle--grenat" },
];

export const eventTypeLabel = (id: EventType) => EVENT_TYPES.find((t) => t.id === id)?.label ?? "Événement";

export const LANGUAGES: { id: InvitationLanguage; label: string }[] = [
  { id: "fr", label: "Français" },
  { id: "mos", label: "Mooré" },
  { id: "dyu", label: "Dioula" },
];

export const isEventType = (v: unknown): v is EventType => EVENT_TYPES.some((t) => t.id === v);
export const isLanguage = (v: unknown): v is InvitationLanguage => LANGUAGES.some((l) => l.id === v);
