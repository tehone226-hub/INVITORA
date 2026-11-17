# Invitora — instructions pour Claude Code

## Le produit
Invitora est un SaaS qui crée par IA des invitations web d'événements (mariage, dot, baptême, anniversaire, funérailles, entreprise, soutenance) en 30 secondes. L'organisateur partage le lien sur WhatsApp, les invités répondent (RSVP) et l'organisateur suit les réponses en temps réel.
Marché : Burkina Faso d'abord (Ouagadougou), puis Afrique de l'Ouest francophone et diaspora. Monnaie : FCFA (XOF).

Le porteur du projet débute en programmation : explique simplement ce que tu fais, donne les commandes exactes à taper, et dis-lui quoi tester dans le navigateur à la fin de chaque étape.

## Langue
- Interface, textes et messages d'erreur en français. On vouvoie l'utilisateur.
- Dates : « samedi 14 décembre 2026 ». Montants : « 4 900 FCFA ». Fuseau : Africa/Ouagadougou.
- Les textes d'invitation peuvent aussi être générés en mooré et en dioula.

## Stack
- Next.js (App Router, TypeScript), Tailwind CSS, shadcn/ui.
- Neon : base PostgreSQL avec RLS (API de données Neon, rôle authenticated + auth.uid()), Neon Auth (Better Auth : code à 6 chiffres par e-mail + Google), actualisation automatique des réponses RSVP (toutes les 8 s). Opérations de confiance côté serveur par connexion SQL directe (DATABASE_URL). Images générées : Vercel Blob.
- Texte IA : API Gemini via `@google/genai`, modèle `gemini-3.5-flash-lite` (secours : `gemini-3.1-flash-lite`), sortie JSON validée par Zod, côté serveur uniquement. Textes types intégrés si Gemini est indisponible.
- Images : AUCUNE génération par IA. Les fonds d'invitation sont 100 images dessinées par nous (10 styles × 10 coloris : `config/themes.ts`, `scripts/generate-theme-art.mjs`, `public/demo/themes/`), légères et sans texte.
- Paiement : SasPay (https://docs.saspay.me/), Orange Money `orange_bf`, Moov Money `moov_bf`, carte. Page de paiement hébergée (checkout session).
- Hébergement : Vercel. Code : GitHub.

## Design (référence obligatoire)
La maquette validée est `design/InvitoraAccueil.png`. Toute page reprend sa charte, décrite dans `BRAND.md`.
- Terre cuite #C0572B (action principale), vert profond #1F4D3A, or #D9A441, crème #FAF5EC (fond), sable #F2E8D5, texte #211915.
- Titres en serif élégant (proche de Fraunces), texte en sans-serif arrondie (proche de Nunito).
- Cartes blanches très arrondies, ombres légères, boutons pleins arrondis.
- Mobile d'abord : la plupart des visiteurs sont sur un Android d'entrée de gamme en 3G/4G. Page invité sous 500 Ko et affichée en moins de 3 s.

## Formules (paiement unique, active 3 mois, sans abonnement)
| Formule | Prix | Inclus |
| --- | --- | --- |
| Essentiel | 1 900 FCFA | 1 carte, partage WhatsApp illimité, 50 invités suivis |
| Célébration | 4 900 FCFA | 3 cartes + vidéo, RSVP et relances auto, 500 invités + tableau de bord, textes IA |
| Prestige Pro | 14 900 FCFA | Invitations illimitées, nom de domaine perso, support WhatsApp prioritaire |
Les prix et limites vivent dans un seul fichier de configuration (`config/plans.ts`), jamais en dur dans les composants.

## Règles impératives
1. Aucune clé secrète dans le code ni dans Git : tout va dans `.env.local` (et `.env.example` sans valeurs). Les appels Gemini et SasPay se font uniquement côté serveur.
2. Fonds d'invitation : uniquement des fonds et ornements, SANS AUCUN TEXTE dans l'image. Prénoms, dates et lieux sont posés par-dessus en HTML/CSS. Pas de génération d'images par IA : on choisit parmi les 100 fonds prédessinés (style puis coloris).
3. Paiement : une formule ne s'active que si le webhook SasPay est valide (signature HMAC-SHA256 de `${X-Webhook-Timestamp}.${corpsBrut}` avec `SASPAY_WEBHOOK_SECRET`, comparaison en temps constant, horodatage de moins de 5 min), traité une seule fois par `data.id`, ET si l'API SasPay confirme le statut `SUCCESS`. Jamais sur le seul retour du navigateur. Montants en chaînes décimales (`"4900.00"`).
4. SasPay n'a pas de mode test fiable : les clés de test peuvent débiter de l'argent réel. Prévenir avant tout test de paiement et utiliser 100 à 200 FCFA.
5. Sécurité par ligne (RLS) sur toutes les tables : un organisateur ne voit que ses événements ; le public peut seulement lire un événement publié et créer une réponse RSVP.
6. Pages d'invitation : slug non devinable, `noindex`.
7. Pas de faux chiffres ni de faux témoignages en production : les statistiques et avis de la maquette sont des exemples, affichés seulement si un réglage l'autorise.
8. Tout est original : ne jamais copier textes, logos ou visuels d'un concurrent (notamment Invitiz).

## Façon de travailler
- Une étape à la fois. Avant de coder, annonce ton plan en quelques lignes.
- À la fin de chaque étape : `npm run build` sans erreur, liste de ce qu'il faut tester, puis propose un commit Git avec un message clair.
- Préfère des composants petits et réutilisables (`components/`), la logique serveur dans `lib/` et les routes API dans `app/api/`.
- Si une information manque (clé, choix produit), pose la question au lieu d'inventer.

## Feuille de route
1. Préparation (fait par le porteur)  2. Charte BRAND.md  3. Création du projet  4. Page d'accueil fidèle à la maquette  5. Base Neon et connexion  6. Création d'invitation (Claude + Gemini)  7. Page invité et partage WhatsApp  8. RSVP et tableau de bord  9. Paiement SasPay  10. Mise en ligne Vercel
