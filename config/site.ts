/**
 * Réglages généraux du site.
 *
 * RÈGLE 7 de CLAUDE.md : pas de faux chiffres ni de faux témoignages en production.
 * Les statistiques et avis de la maquette sont des EXEMPLES. Ils ne s'affichent
 * que si `showSampleContent` vaut `true` (par exemple pour une démonstration).
 * Laisser à `false` tant qu'on n'a pas de vrais chiffres et de vrais avis.
 */
export const siteConfig = {
  name: "Invitora",
  description:
    "Créez votre invitation digitale en 30 secondes, partagez-la sur WhatsApp et suivez vos invités en temps réel.",
  copyrightYear: 2026,
  city: "Ouagadougou",

  /** Afficher les chiffres et témoignages d'exemple de la maquette */
  showSampleContent: false,

  nav: [
    { label: "Modèles", href: "/#modeles" },
    { label: "Tarifs", href: "/#tarifs" },
    { label: "Comment ça marche", href: "/#comment-ca-marche" },
  ],

  routes: {
    create: "/creer",
    login: "/connexion",
    help: "/aide",
    privacy: "/confidentialite",
    terms: "/conditions",
  },
} as const;

/**
 * Contenus d'EXEMPLE (maquette). Affichés uniquement si
 * `siteConfig.showSampleContent` est `true`. Ce ne sont pas de vrais chiffres.
 */
export const sampleContent = {
  heroBadge: "N°1 des invitations digitales en Afrique de l'Ouest",
  rating: "4,9/5",
  eventsCount: "+12 000 événements créés à Ouaga, Abidjan & Dakar",
  templatesCount: 120,
  organizersCount: "12 000",
  phoneShared: "128 invités touchés",
  phoneConfirmed: "87 confirmés",
  testimonials: [
    {
      quote:
        "J'ai créé notre carte de mariage un soir à 23 h. Le lendemain, tout le quartier l'avait reçue sur WhatsApp. Les mamans ont adoré les motifs !",
      name: "Aïcha Traoré",
      detail: "Ouagadougou • Mariage",
    },
    {
      quote:
        "Le suivi des invités m'a sauvé : 214 confirmés en temps réel, plus besoin d'appeler un par un. Le prix en FCFA via Orange Money, parfait.",
      name: "Koffi Mensah",
      detail: "Abidjan • Anniversaire",
    },
    {
      quote:
        "Sobre, élégant, et respectueux de nos traditions. Même ma grand-mère a su ouvrir le lien et confirmer sa venue toute seule.",
      name: "Fatou Diallo",
      detail: "Dakar • Baptême",
    },
  ],
} as const;
