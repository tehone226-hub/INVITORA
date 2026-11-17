# Invitora — Charte graphique

Référence visuelle : `design/InvitoraAccueil.png`. Cette charte décrit ce qui s'y voit, pour qu'on la reproduise partout de la même façon.

## 1. Esprit
Chaleureux, élégant, simple. On pense « belle étoffe tissée et fête de famille », pas « logiciel froid ». Beaucoup d'air, des cartes douces, des couleurs de terre.

## 2. Palette

| Nom Tailwind | Hex | Usage |
| --- | --- | --- |
| `terracotta` | `#C0572B` | Action principale (boutons pleins, liens importants, étiquettes de catégorie) |
| `forest` | `#1F4D3A` | Vert profond : blocs sombres (« Comment ça marche », formule mise en avant, pied de page), boutons secondaires pleins |
| `gold` | `#D9A441` | Accent : mot clé souligné du titre, pastille « Le plus choisi », bouton sur fond vert, étoiles |
| `cream` | `#FAF5EC` | Fond de page |
| `sand` | `#F2E8D5` | Sections alternées (témoignages), soleil du hero, boutons discrets |
| `ink` | `#211915` | Texte principal, fond du bouton « Orange Money » |

Teintes dérivées (à utiliser avec parcimonie) :
- Texte secondaire : `ink` à 60 % d'opacité (sur fond crème).
- Texte sur fond vert : `cream` à 80 %.
- Bordures : `ink` à 10 %.
- Terre cuite au survol : `#A94A22`. Or au survol : `#C8932F`. Vert au survol : `#183D2E`.
- Blanc des cartes : `#FFFFFF`.

Règles :
- Contraste : le texte `ink` sur `cream`/blanc est conforme. Le texte blanc ou crème est réservé à `terracotta` et `forest`. Sur `gold`, le texte est `forest` ou `ink`, jamais blanc.
- Une seule couleur d'action par écran : `terracotta`. L'or et le vert accompagnent.

## 3. Typographie (Google Fonts via `next/font`)

| Rôle | Police | Graisses |
| --- | --- | --- |
| Titres | **Fraunces** (serif élégante) | 600, 700 |
| Texte, boutons, interface | **Nunito** (sans-serif arrondie) | 400, 600, 700, 800 |

Échelle (mobile → bureau) :
- Titre du hero (h1) : 40 px → 56 px, interligne 1,05, Fraunces 700.
- Titre de section (h2) : 28 px → 36 px, Fraunces 600.
- Titre de carte (h3) : 20 px → 22 px, Fraunces 600.
- Texte courant : 16 px, interligne 1,6, Nunito 400.
- Texte secondaire : 14 px.
- Étiquette (« POUR CHAQUE MOMENT DE VIE ») : 12 px, Nunito 700, majuscules, espacement des lettres 0,12 em, couleur `terracotta` (ou `gold` sur fond vert).

Mot clé mis en valeur dans un titre (ex. « 30 secondes ») : même police, couleur `terracotta`, souligné d'un trait courbe `gold` dessiné en SVG.

## 4. Formes

**Arrondis**
- Boutons, badges, étiquettes : pleinement arrondis (`rounded-full`) ou 14 px pour les petits boutons.
- Cartes : 24 px (`rounded-3xl`).
- Grands blocs de section (« Comment ça marche », bandeau final) : 32 px.
- Images dans les cartes : 24 px en haut, bord plat en bas.
- Icônes dans une pastille : carré arrondi de 16 px.

**Ombres** (légères et chaudes, jamais noires)
- Carte : `0 2px 12px rgba(33, 25, 21, 0.06)`.
- Carte survolée / mise en avant : `0 10px 30px rgba(33, 25, 21, 0.12)`.
- Téléphone / éléments flottants : `0 20px 50px rgba(33, 25, 21, 0.18)`.

**Espacement** : sections séparées de 64 px (mobile) à 96 px (bureau). Largeur maximale du contenu : 1180 px, marges de 20 px sur mobile.

## 5. Composants

**Boutons** (hauteur 44 px minimum pour le tactile, texte Nunito 700)
- Principal : fond `terracotta`, texte `cream`, arrondi complet, ombre légère. Survol : terre cuite foncée.
- Secondaire (contour) : fond blanc, bordure `ink` à 12 %, texte `ink`.
- Sur fond vert : fond `gold`, texte `forest`.
- Sur bandeau terre cuite : fond blanc, texte `ink`.
- Discret (« Utiliser ») : fond `sand`, texte `ink`, petit arrondi.

**Cartes** : fond blanc, arrondi 24 px, ombre légère, remplissage 20 à 24 px. Sur fond vert, les cartes restent blanches/crème pour la lisibilité.

**Badges et étiquettes**
- Badge du hero : pastille blanche, point `terracotta`, texte 13 px.
- « Le plus choisi » : pastille `gold`, texte `forest`, posée à cheval sur le bord supérieur de la carte.
- Catégorie d'une carte d'exemple : majuscules, 11 px, `terracotta`, espacement 0,1 em.
- Moyens de paiement : petites pastilles pleines (`ink` pour Orange Money, `terracotta` pour Moov Money).

**Bande tissée** : sous l'en-tête, une bande de 4 px alternant `terracotta`, `forest`, `gold` en segments réguliers (rappel d'un tissage).

**Icônes** : style trait fin arrondi (bibliothèque `lucide-react`, déjà fournie avec shadcn/ui), 20 à 24 px.

## 6. Ton de voix
- Vouvoiement, toujours. Phrases courtes, mots simples, pas de jargon.
- Chaleureux et rassurant : « Votre invitation est prête », « Vos invités vous attendent ».
- Concret : on dit ce qui va se passer (« Partagez le lien sur WhatsApp »).
- Pas d'excès : pas de majuscules criardes, pas de points d'exclamation en série.
- Dates : « samedi 14 décembre 2026 ». Montants : « 4 900 FCFA » (espace insécable).
- Messages d'erreur : expliquer et proposer une solution (« Le lien n'a pas pu être envoyé. Vérifiez votre connexion et réessayez. »).

## 7. Les fonds d'invitation : 10 styles × 10 coloris

Chaque fond est une étoffe dessinée par nous (philosophie « Trame Vivante » : `design/art/philosophie-visuelle.md`), **sans aucun texte** : les noms, dates et lieux sont toujours posés par-dessus en HTML/CSS, sur un panneau crème. Il n'y a pas de génération d'images par IA.

**Les 10 styles** : Faso Dan Fani (bandes tissées), Bogolan (symboles sur écru), Tiébélé (murs peints), Indigo de Ouaga (teinture à la réserve), Wax (éventails et cercles), Sénoufo (tissu peint de Korhogo), Adinkra (symboles estampés), Savane (épis de mil), Coton brodé (fleurs et festons), Ardoise (filets d'or sur vert profond).

**Les 10 coloris** de chaque style : Couleurs d'origine, Braise, Ocre, Olive, Forêt, Lagune, Nuit, Prune, Grenade, Cendre (sobre, pour les cérémonies de deuil).

**Fabrication** : `npm run art` (scripts/generate-theme-art.mjs). Les styles sont du dessin vectoriel programmé ; les coloris sont des rotations de teinte. Résultat : `public/demo/themes/<style>--<coloris>.webp` (≈ 70 Ko chacun) et `config/theme-colors.json`.

**Choix par défaut selon l'événement** : mariage → Faso Dan Fani ; dot → Sénoufo ; baptême → Coton brodé ; anniversaire → Wax ; funérailles → Adinkra (Cendre) ; entreprise → Ardoise ; soutenance → Bogolan.

## 8. Logo
- Signe : carré vert profond (`forest`) aux angles arrondis, avec un « I » crème en Fraunces au centre.
- Logotype : « Invitora » en Fraunces 600, couleur `ink`, à droite du signe.
- Fichiers : `public/logo.svg` (signe + texte), `public/logo-mark.svg` (signe seul, pour favicon et réseaux).
- Zone de protection : au moins la moitié de la hauteur du signe autour du logo.
- Taille minimale : signe 24 px, logo complet 96 px de large.
- Interdits : déformer, changer les couleurs, ajouter une ombre portée.

## 9. Images et performance
- Fonds : uniquement fonds et ornements, jamais de texte dans l'image.
- Formats légers (WebP), 800 px de large maximum pour la page invité, chargement différé.
- Page invité : moins de 500 Ko, affichée en moins de 3 s sur une connexion 3G/4G.

## 10. Points de la maquette à ne pas reprendre tels quels
- Statistiques (« +12 000 événements », « 4,9/5 », « 87 confirmés »), mention « N°1 » et témoignages : exemples seulement, affichés uniquement si un réglage l'autorise (règle 7 de `CLAUDE.md`).
- Visuels d'exemple avec du texte intégré, en anglais ou avec des noms occidentaux : à remplacer par des fonds sans texte et des noms locaux.
