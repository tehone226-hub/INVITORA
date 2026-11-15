/**
 * Textes et exemples de la page d'accueil.
 * Les exemples de cartes sont des modèles fictifs (pas des clients réels).
 */
import type { ThemeId } from "./themes";

export type EventIcon = "heart" | "cake" | "baby" | "flower" | "briefcase";

export const eventTypes: {
  title: string;
  subtitle: string;
  icon: EventIcon;
  /** Classe Tailwind de la pastille d'icône */
  tone: string;
}[] = [
  { title: "Mariages", subtitle: "Liens & RSVP élégants", icon: "heart", tone: "bg-terracotta text-cream" },
  { title: "Anniversaires", subtitle: "Festif & coloré", icon: "cake", tone: "bg-gold text-ink" },
  { title: "Baptêmes", subtitle: "Doux & lumineux", icon: "baby", tone: "bg-forest text-cream" },
  { title: "Funérailles", subtitle: "Sobre & respectueux", icon: "flower", tone: "bg-[#7A3A22] text-cream" },
  { title: "Entreprise", subtitle: "Pro & moderne", icon: "briefcase", tone: "bg-ink text-cream" },
];

export const steps: { title: string; text: string; icon: "layout" | "pen" | "send" }[] = [
  {
    title: "Choisissez l'événement",
    text: "Mariage, baptême, anniversaire… Choisissez un modèle inspiré du Faso Dan Fani et du bogolan.",
    icon: "layout",
  },
  {
    title: "Remplissez le formulaire",
    text: "L'IA rédige vos textes en français, ajoute photos, lieu, date et programme en un instant.",
    icon: "pen",
  },
  {
    title: "Partagez le lien",
    text: "Envoyez sur WhatsApp, suivez les confirmations et relancez vos invités en temps réel.",
    icon: "send",
  },
];

export interface TemplateExample {
  id: string;
  category: string;
  title: string;
  /** Prénoms ou titre posés sur la carte */
  names: string;
  date: string;
  place: string;
  theme: ThemeId;
}

export const templateExamples: TemplateExample[] = [
  {
    id: "mariage-awa-moussa",
    category: "Mariage",
    title: "Awa & Moussa",
    names: "Awa & Moussa",
    date: "samedi 12 décembre 2026",
    place: "Jardin des Manguiers • Ouagadougou",
    theme: "faso-dan-fani",
  },
  {
    id: "anniversaire-fatou",
    category: "Anniversaire",
    title: "Les 30 ans de Fatou",
    names: "Fatou a 30 ans",
    date: "samedi 19 décembre 2026",
    place: "Terrasse Le Baobab • Bobo-Dioulasso",
    theme: "tiebele",
  },
  {
    id: "bapteme-nafissa",
    category: "Baptême",
    title: "Bienvenue bébé Nafissa",
    names: "Bienvenue Nafissa",
    date: "dimanche 10 janvier 2027",
    place: "Cour familiale • Koudougou",
    theme: "bogolan",
  },
  {
    id: "funerailles-kone",
    category: "Funérailles",
    title: "Hommage à Papa Koné",
    names: "Hommage à Papa Koné",
    date: "samedi 16 janvier 2027",
    place: "Cérémonie • Ouahigouya",
    theme: "indigo",
  },
  {
    id: "entreprise-gala",
    category: "Entreprise",
    title: "Gala de fin d'année",
    names: "Gala de fin d'année",
    date: "vendredi 18 décembre 2026",
    place: "Salle des fêtes • Ouagadougou",
    theme: "indigo",
  },
  {
    id: "dot-mariam-seydou",
    category: "Dot",
    title: "Mariam & Seydou",
    names: "Mariam & Seydou",
    date: "samedi 9 janvier 2027",
    place: "Cour familiale • Bamako",
    theme: "tiebele",
  },
];

/** Invitation affichée dans le téléphone du hero */
export const heroInvitation = {
  category: "Mariage",
  names: "Aminata & Ibrahim",
  date: "samedi 12 décembre 2026",
  city: "Ouagadougou",
  theme: "faso-dan-fani" as ThemeId,
};
