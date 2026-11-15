/**
 * Formules Invitora : source unique des prix et des limites.
 * Ne jamais écrire ces valeurs en dur dans les composants : les importer d'ici.
 * Paiement unique, formule active 3 mois, sans abonnement.
 */

export type PlanId = "essentiel" | "celebration" | "prestige";

/** `null` = illimité */
export type Limit = number | null;

export interface PlanLimits {
  /** Nombre de cartes d'invitation */
  cards: Limit;
  /** Nombre d'invités suivis (RSVP) */
  guests: Limit;
  /** Vidéo d'invitation incluse */
  video: boolean;
  /** Tableau de bord de suivi */
  dashboard: boolean;
  /** Relances automatiques des invités */
  autoReminders: boolean;
  /** Textes générés par l'IA */
  aiTexts: boolean;
  /** Nom de domaine personnalisé */
  customDomain: boolean;
  /** Support WhatsApp prioritaire */
  prioritySupport: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  /** Prix en FCFA (nombre entier) */
  price: number;
  /** Phrase d'accroche sous le nom */
  tagline: string;
  /** Lignes affichées dans la carte de tarif */
  features: string[];
  limits: PlanLimits;
  /** Formule mise en avant (« Le plus choisi ») */
  highlighted?: boolean;
}

export const CURRENCY = "FCFA";
/** Durée d'activation après paiement, en mois */
export const PLAN_DURATION_MONTHS = 3;

export const PLANS: Record<PlanId, Plan> = {
  essentiel: {
    id: "essentiel",
    name: "Essentiel",
    price: 1900,
    tagline: "Pour un petit événement",
    features: [
      "1 carte digitale",
      "Partage WhatsApp illimité",
      "50 invités suivis",
    ],
    limits: {
      cards: 1,
      guests: 50,
      video: false,
      dashboard: false,
      autoReminders: false,
      aiTexts: false,
      customDomain: false,
      prioritySupport: false,
    },
  },
  celebration: {
    id: "celebration",
    name: "Célébration",
    price: 4900,
    tagline: "Pour mariages & grands events",
    features: [
      "3 cartes + vidéo d'invitation",
      "RSVP & relances auto",
      "500 invités + tableau de bord",
      "Textes IA en français",
    ],
    limits: {
      cards: 3,
      guests: 500,
      video: true,
      dashboard: true,
      autoReminders: true,
      aiTexts: true,
      customDomain: false,
      prioritySupport: false,
    },
    highlighted: true,
  },
  prestige: {
    id: "prestige",
    name: "Prestige Pro",
    price: 14900,
    tagline: "Pour entreprises & wedding planners",
    features: [
      "Invitations illimitées",
      "Nom de domaine perso",
      "Support WhatsApp prioritaire",
    ],
    limits: {
      cards: null,
      guests: null,
      video: true,
      dashboard: true,
      autoReminders: true,
      aiTexts: true,
      customDomain: true,
      prioritySupport: true,
    },
  },
};

/** Formules dans l'ordre d'affichage */
export const PLAN_LIST: Plan[] = [
  PLANS.essentiel,
  PLANS.celebration,
  PLANS.prestige,
];

/** « 4 900 FCFA » (espace insécable entre les milliers et avant la devise) */
export function formatPrice(amount: number): string {
  const digits = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${digits} ${CURRENCY}`;
}

/** Montant en chaîne décimale pour SasPay : 4900 -> "4900.00" */
export function toSaspayAmount(amount: number): string {
  return amount.toFixed(2);
}
