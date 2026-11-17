# Mise en route d'Invitora (Neon + Vercel)

## Où en est le projet

| Élément | État |
| --- | --- |
| Base de données Neon `invitora` (Francfort) | ✅ créée, schéma appliqué, sécurité par ligne active |
| Connexion Neon Auth (code par e-mail + Google) | ✅ active |
| Site en ligne sur Vercel | ✅ https://invitora-theta.vercel.app |
| 100 fonds d'invitation (10 styles × 10 coloris) | ✅ dessinés par nous, dans le site |
| Textes par l'IA (Gemini) | ✅ clé en place, modèle `gemini-3.5-flash-lite` |
| Images par l'IA | ⛔ abandonnées : on choisit parmi les 100 fonds |
| Paiement SasPay | ⏳ clés à ajouter (voir `docs/saspay.md`) |
| Envoi des e-mails de connexion | ⚠️ expéditeur partagé de Neon : à remplacer avant l'ouverture au public |

Le site fonctionne sans les clés « à ajouter » : textes types si Gemini est indisponible, pas de paiement.

---

## 1. Les variables d'environnement

Elles sont dans deux endroits, qui doivent rester identiques :
- **chez vous** : fichier `.env.local` (jamais envoyé sur GitHub) ;
- **en production** : Vercel → projet `invitora` → Settings → Environment Variables.

Pour ajouter une clé en production depuis le terminal du projet (remplacez `NOM`) :
```
npx vercel@latest env add NOM production
```
Collez la valeur quand elle est demandée, puis redéployez : `npx vercel@latest deploy --prod --yes`.

| Variable | Rôle | Où la trouver |
| --- | --- | --- |
| `DATABASE_URL` | Connexion SQL serveur (secret) | Neon → projet → Connect |
| `NEON_DATA_API_URL` | API de données (sécurité par ligne) | Neon → Data API |
| `NEON_AUTH_BASE_URL` | Serveur de connexion | Neon → Auth |
| `NEON_AUTH_COOKIE_SECRET` | Signature des sessions (secret, ≥ 32 caractères) | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | Adresse publique du site | `https://invitora-theta.vercel.app` |
| `ADMIN_EMAILS` | E-mails administrateurs | vous |
| `GEMINI_API_KEY` | Textes Gemini | aistudio.google.com/apikey |
| `SASPAY_SECRET_KEY`, `SASPAY_WEBHOOK_SECRET` | Paiement | tableau de bord SasPay |

---

## 2. Base de données (Neon)

Le schéma est dans `db/migrations/`. Pour l'appliquer sur une autre base (ou après l'ajout d'un fichier de migration) :
```
npm run db:migrate
```
Il lit `DATABASE_URL` dans `.env.local` et n'applique chaque fichier qu'une seule fois.

**Sécurité** : chaque table a la sécurité par ligne (RLS). L'organisateur ne lit que ses données ; les invités passent par deux fonctions SQL ciblées (`get_public_event`, `submit_rsvp`) exécutées par le serveur uniquement.

---

## 3. Connexion

- **Par e-mail** : l'utilisateur saisit son adresse, reçoit un code à 6 chiffres, le saisit. Pas de mot de passe.
- **Avec Google** : fonctionne avec les identifiants partagés de Neon. Pour afficher votre propre nom d'application sur l'écran Google, créez vos identifiants dans la console Google Cloud puis renseignez-les dans Neon → Auth → Google.
- **Administrateur** : mettez votre e-mail dans `ADMIN_EMAILS` ; à votre prochaine connexion, le bouton « Administration » apparaît dans « Mon espace ».

⚠️ **Avant l'ouverture au public** : les e-mails de code partent d'un expéditeur partagé de Neon (limité et peu fiable pour la livraison). Dans Neon → Auth → Email provider, branchez votre propre SMTP (par exemple Brevo ou Resend avec un domaine à vous).

---

## 4. Textes par l'IA (Gemini) et fonds d'invitation

- **Textes** : Gemini rédige le titre, le message et le programme (`gemini-3.5-flash-lite`, puis `gemini-3.1-flash-lite` en secours, puis des textes types). Limite : 15 textes par utilisateur et par jour. La clé est dans `GEMINI_API_KEY` (locale et production).
- **Fonds** : 100 fonds prêts (10 styles × 10 coloris), sans texte. Pour en refaire ou en ajouter : modifiez `scripts/art-styles-*.mjs` puis `npm run art`. Aucune clé n'est nécessaire.
- Il n'y a plus de génération d'images par IA. L'espace Vercel Blob `invitora-images` créé plus tôt n'est plus utilisé : vous pouvez le supprimer (Vercel → Storage).

---

## 5. Paiement (SasPay)

> ⚠️ **Règle 4** : SasPay n'a pas de mode test fiable. Même avec une clé de test, **un vrai paiement peut être débité**. Avant tout essai, mettez `SASPAY_TEST_AMOUNT_XOF=100` dans `.env.local` (et en production pour tester là-bas) : tous les paiements coûtent alors 100 FCFA. Retirez cette variable ensuite.

1. Dans le tableau de bord SasPay (https://app.saspay.me), créez une clé API avec le droit **PAYIN** → `SASPAY_SECRET_KEY`.
2. Créez un webhook :
   - URL : `https://invitora-theta.vercel.app/api/saspay/webhook`
   - Événement : **transaction.success**
   - Copiez le secret de signature (affiché **une seule fois**) → `SASPAY_WEBHOOK_SECRET`.
3. Ajoutez les deux variables en production et redéployez.

La formule ne s'active jamais au retour du navigateur : seulement par le webhook signé, après confirmation de l'API SasPay (voir `docs/saspay.md`).

---

## 6. Déploiement

Le projet est déployé depuis cet ordinateur avec la ligne de commande Vercel :
```
npx vercel@latest deploy --prod --yes
```
Le lien automatique avec GitHub (un déploiement à chaque `git push`) n'est pas encore actif : Vercel demande d'abord d'ajouter une **connexion GitHub** à votre compte (vercel.com → Account Settings → Authentication → Connect GitHub). Une fois fait : `npx vercel@latest git connect`.

Pour utiliser votre propre nom de domaine : Vercel → projet → Settings → Domains, puis mettez à jour `NEXT_PUBLIC_SITE_URL` et ajoutez le domaine dans Neon → Auth → Domains (domaines de confiance).

---

## 7. Vérifications

- `npm test` : 64 tests automatiques (sécurité de la base, signatures de paiement, formats).
- `npm run build` : doit se terminer sans erreur.
- Parcours à tester dans le navigateur :
  1. Se connecter → créer une invitation → l'aperçu s'affiche.
  2. Administration → Invitations → **Offrir Essentiel** sur votre invitation (pour tester sans payer).
  3. Publier → copier le lien → l'ouvrir dans une fenêtre privée → répondre « Je serai présent(e) ».
  4. Revenir sur votre espace : la réponse apparaît en quelques secondes, sans recharger la page.
