/**
 * Textes et exemples de la page d'accueil.
 * Les exemples de cartes sont des modèles fictifs (pas des clients réels).
 */
import type { EventType } from "@/lib/types";
import type { ThemeId } from "./themes";

/** Les trois étapes de « Comment ça marche » (une vraie séquence : l'ordre compte). */
export const steps: { title: string; text: string }[] = [
  {
    title: "Choisissez l'événement",
    text: "Mariage, baptême, anniversaire, funérailles… puis un style et un coloris parmi les modèles.",
  },
  {
    title: "Indiquez l'essentiel",
    text: "Les prénoms, la date et le lieu. L'IA rédige le titre, le message et le programme ; vous pouvez tout modifier.",
  },
  {
    title: "Partagez le lien",
    text: "Envoyez-le sur WhatsApp. Vos invités répondent en un geste et vous suivez les confirmations.",
  },
];

/** Type d'événement d'un exemple, pour ouvrir le formulaire de création déjà réglé. */
const TYPE_BY_CATEGORY: Record<string, EventType> = {
  Mariage: "mariage",
  Anniversaire: "anniversaire",
  Baptême: "bapteme",
  Funérailles: "funerailles",
  Entreprise: "entreprise",
  Dot: "dot",
};
export const eventTypeOfCategory = (category: string): EventType => TYPE_BY_CATEGORY[category] ?? "autre";

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
    theme: "feuillage--ivoire",
  },
  {
    id: "anniversaire-fatou",
    category: "Anniversaire",
    title: "Les 30 ans de Fatou",
    names: "Fatou a 30 ans",
    date: "samedi 19 décembre 2026",
    place: "Terrasse Le Baobab • Bobo-Dioulasso",
    theme: "confettis--rose",
  },
  {
    id: "bapteme-nafissa",
    category: "Baptême",
    title: "Bienvenue bébé Nafissa",
    names: "Bienvenue Nafissa",
    date: "dimanche 10 janvier 2027",
    place: "Cour familiale • Koudougou",
    theme: "aura--azur",
  },
  {
    id: "funerailles-kone",
    category: "Funérailles",
    title: "Hommage à Papa Koné",
    names: "Hommage à Papa Koné",
    date: "samedi 16 janvier 2027",
    place: "Cérémonie • Ouahigouya",
    theme: "epure--cendre",
  },
  {
    id: "entreprise-gala",
    category: "Entreprise",
    title: "Gala de fin d'année",
    names: "Gala de fin d'année",
    date: "vendredi 18 décembre 2026",
    place: "Salle des fêtes • Ouagadougou",
    theme: "deco--nuit",
  },
  {
    id: "dot-mariam-seydou",
    category: "Dot",
    title: "Mariam & Seydou",
    names: "Mariam & Seydou",
    date: "samedi 9 janvier 2027",
    place: "Cour familiale • Bamako",
    theme: "arche--argile",
  },
];

/** Invitation d'exemple de référence (aperçus, tests) */
export const heroInvitation = {
  category: "Mariage",
  names: "Aminata & Ibrahim",
  date: "samedi 12 décembre 2026",
  city: "Ouagadougou",
  theme: "feuillage--ivoire" as ThemeId,
};
