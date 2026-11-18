# Invitora — Charte graphique « Nuit de fête »

En vigueur depuis le 17 novembre 2026. Elle remplace l'ancienne charte crème et terre cuite : la maquette `design/InvitoraAccueil.png` n'est plus la référence.

## 1. Esprit
Une soirée de fête : la nuit profonde, des lumières violettes, une touche de mangue. Moderne, net et joyeux. Les pages claires restent calmes et lisibles ; la couleur se concentre dans les blocs sombres (hero, barre latérale, bandeau final) et dans les actions.

## 2. Palette

| Nom Tailwind | Hex | Usage |
| --- | --- | --- |
| `brand` | `#6D3BF5` | Violet : action principale (boutons pleins, liens importants, page en cours dans le menu) |
| `brand-dark` | `#5527D9` | Violet au survol |
| `brand-soft` | `#EFE9FF` | Fond violet très clair : puces, icônes, survol des boutons contour |
| `night` | `#130F2A` | Nuit : hero, barre latérale, pied de page, formule mise en avant |
| `night-soft` | `#221C45` | Cartes posées sur la nuit, survol des boutons sombres |
| `sun` | `#FFB020` | Mangue : accent (pastille « Recommandé », bouton sur fond nuit, étincelle du logo) |
| `sun-dark` | `#F09A00` | Mangue au survol |
| `paper` | `#F6F5FB` | Fond de page |
| `mist` | `#EBE8F7` | Fond doux : onglets, étiquettes neutres, squelettes de chargement |
| `ink` | `#15122B` | Texte principal |

Teintes dérivées :
- Texte secondaire : `ink` à 60 %. Texte sur la nuit : blanc à 70 %.
- Bordures : `ink` à 10 % sur fond clair, blanc à 10 % sur la nuit.
- Réussite : vert émeraude (`emerald-700` sur fond `#E3F6EE`). Attention : `#8A5300` sur `#FFF3D6`. Erreur : rouge (`red-700` sur `red-50`).
- Graphiques : violet `#6D3BF5`, émeraude `#12A37A`, mangue `#FFB020`.

Règles :
- Le texte blanc est réservé à `brand` et `night`. Sur `sun`, le texte est `night`, jamais blanc.
- Une seule couleur d'action par écran : `brand`. La mangue reste un accent rare.
- Utilitaires prêts à l'emploi (`app/globals.css`) : `bg-night-glow` (nuit avec halos violet et mangue), `bg-dots` (trame de points sur la nuit), `text-gradient` (dégradé lavande → mangue pour un mot clé sur la nuit).

## 3. Typographie (Google Fonts via `next/font`)

| Rôle | Police | Graisses |
| --- | --- | --- |
| Titres | **Bricolage Grotesque** (grotesque de caractère) | 700, 800 |
| Texte, boutons, interface | **Plus Jakarta Sans** | 400, 600, 700 |

Échelle (mobile → bureau) :
- Titre du hero (h1) : 40 px → 64 px, interligne 1,05, graisse 800, approche serrée.
- Titre de page (espace connecté, administration) : 28 px → 34 px, graisse 800.
- Titre de section (h2) : 28 px → 40 px, graisse 800.
- Titre de carte (h3) : 18 px → 20 px, graisse 700.
- Texte courant : 15 à 16 px, interligne 1,6. Texte secondaire : 13 à 14 px.
- Étiquette : petite puce `rounded-md bg-brand-soft text-brand`, 12 px, graisse 700 (plus de majuscules espacées).
- Chiffres clés : Bricolage 800, chiffres tabulaires.

## 4. Formes

**Arrondis**
- Boutons et champs : 12 px (`rounded-xl`, `rounded-lg` pour les champs).
- Cartes : 12 à 16 px (`rounded-xl`, `rounded-2xl`). Grands blocs de section : 24 px (`rounded-3xl`).
- Puces, étiquettes d'état, onglets : 6 px (`rounded-md`). Les formes en pilule sont réservées aux points d'état.

**Bordures plutôt qu'ombres**
- Carte : fond blanc, bordure 1 px `ink` à 10 %, sans ombre.
- Carte survolée : bordure `brand` à 40 % et `shadow-card-hover`.
- Bouton principal : halo violet `shadow-glow`. Éléments flottants du hero : `shadow-float`.

**Espacement** : sections séparées de 64 px (mobile) à 96 px (bureau). Largeur maximale : 1180 px sur le site, 1240 px dans l'espace connecté.

## 5. Composants

**Boutons** (hauteur 44 px minimum pour le tactile, texte en graisse 700)
- Principal : fond `brand`, texte blanc, halo violet.
- Contour : fond blanc, bordure fine ; au survol, fond `brand-soft` et bordure violette.
- Sombre : fond `night`, texte blanc. Sur la nuit : `sun` (texte `night`) ou `ghost` (verre, bordure blanche à 20 %).
- Doux : fond `brand-soft`, texte `brand`. Danger : contour rouge.

**Coque de l'espace connecté** (`components/app/app-shell.tsx`) : barre latérale `night` de 264 px sur ordinateur (logo, liens, compte et déconnexion en bas) ; sur téléphone, bandeau `night` et onglets défilants. La page en cours est un bouton `brand`.

**Cartes d'indicateur** : libellé, icône dans un carré `brand-soft`, grand chiffre. L'indicateur principal de la page est sur `bg-night-glow`.

**Tableaux** : conteneur blanc à bordure fine, en-tête sur fond `paper` en petites majuscules, lignes séparées par un filet.

**Étiquettes d'état** : rectangle arrondi 6 px avec un point de couleur (émeraude, mangue, rouge, gris).

**Icônes** : `lucide-react`, trait fin, 16 à 20 px.

## 6. Ton de voix
- Vouvoiement, toujours. Phrases courtes, mots simples, pas de jargon.
- Chaleureux et rassurant : « Votre invitation est prête », « Vos invités vous attendent ».
- Concret : on dit ce qui va se passer (« Partagez le lien sur WhatsApp »).
- Pas d'excès : pas de majuscules criardes, pas de points d'exclamation en série.
- Dates : « samedi 14 décembre 2026 ». Montants : « 4 900 FCFA » (espace insécable).
- Messages d'erreur : expliquer et proposer une solution (« Le lien n'a pas pu être envoyé. Vérifiez votre connexion et réessayez. »).

## 7. Les invitations : 11 fonds et 4 enveloppes

Depuis le 17 novembre 2026, les fonds sont les images choisies par le porteur du projet (sources : `design/fonds-sources/`). Elles remplacent les collections dessinées auparavant (étoffes, puis papeterie), supprimées.

**Les 11 fonds** (`config/themes.ts`) : Jardin ivoire, Arche florale, Dentelle grenat, Satin bordeaux, Broderie rouge, Vannerie sable, Vannerie cacao, Vannerie indigo, Vannerie et zébu, Indigo et marmites, Indigo et zébu. Format 9:16 (720 × 1280, WebP).

**Les 4 enveloppes** : chaque fond a une enveloppe scellée (sceau rouge, sceau doré, portes aux arums, cygnes). L'invité la voit d'abord et la touche pour l'ouvrir : les deux moitiés s'écartent et découvrent l'invitation. L'ouverture est en CSS pur (elle marche sans JavaScript).

**Règles**
- Aucun texte dans l'image (règle 2 de `CLAUDE.md`) : les images reçues qui portaient un texte ou un filigrane n'ont pas été retenues.
- Le texte est posé en HTML dans la **zone libre** de chaque fond (`zone`, en % : haut, droite, bas, gauche), sans panneau. La typographie se cale sur la taille de la zone ; dans une petite zone, seuls la catégorie, les prénoms et la date sont affichés.
- Typographie de l'invitation (`components/invitation-card.tsx`) : catégorie en petites capitales espacées (couleur d'accent), prénoms en **Cormorant Garamond** italique (`font-invite`), date et lieu en Plus Jakarta Sans.
- Un test vérifie que chaque image existe, pèse moins de 200 Ko, et que le texte reste lisible sur la zone (contraste).

**Ajouter ou remplacer un fond** : déposez l'image dans `design/fonds-sources/`, déclarez-la dans `scripts/prepare-fonds.mjs` et dans `config/themes.ts` (même identifiant, même zone), puis lancez `npm run fonds`. La commande affiche la couleur de la zone de texte à reporter dans `config/themes.ts`.

**Droits d'auteur** : ces images viennent de Pinterest. Avant l'ouverture au public, il faut vérifier pour chacune qu'on a le droit de l'utiliser dans un service payant, ou la remplacer par une image achetée, sous licence libre ou créée pour Invitora.

**Choix par défaut selon l'événement** : mariage → Jardin ivoire ; dot → Vannerie et zébu ; baptême → Arche florale ; anniversaire → Vannerie indigo ; funérailles → Vannerie sable ; entreprise → Vannerie cacao ; soutenance → Indigo et marmites.

## 8. Logo
- Signe : carré violet (`brand`) aux angles arrondis, avec un « i » blanc dont le point est une étincelle mangue à quatre branches.
- Logotype : « Invitora » en Bricolage Grotesque 700, couleur `ink` (blanc sur la nuit), à droite du signe.
- Fichiers : `public/logo.svg` (signe + texte), `public/logo-mark.svg` et `app/icon.svg` (signe seul), composant `components/logo.tsx`.
- Zone de protection : au moins la moitié de la hauteur du signe autour du logo.
- Taille minimale : signe 24 px, logo complet 96 px de large.
- Interdits : déformer, changer les couleurs, ajouter une ombre portée.

## 9. Images et performance
- Fonds : uniquement fonds et ornements, jamais de texte dans l'image.
- Formats légers (WebP), 800 px de large maximum pour la page invité, chargement différé.
- Page invité : moins de 500 Ko, affichée en moins de 3 s sur une connexion 3G/4G.
- Les halos et trames du site sont en CSS (dégradés), sans image.

## 10. Contenus d'exemple
Statistiques (« +12 000 événements », « 4,9/5 »), mention « N°1 » et témoignages : exemples seulement, affichés uniquement si le réglage de l'administration l'autorise (règle 7 de `CLAUDE.md`). Les visuels d'exemple n'ont jamais de texte intégré et utilisent des noms locaux.
