# Mise en route d'Invitora

Ce guide explique, pas à pas, comment brancher les services pour que tout fonctionne : connexion, création d'invitations, réponses des invités, IA et paiement. Comptez environ une heure.

Le site fonctionne déjà sans ces réglages (page d'accueil, exemples d'invitations). Chaque service ajouté active une partie du site.

| Service | Ce qu'il active | Obligatoire ? |
| --- | --- | --- |
| Supabase | Comptes, invitations, réponses des invités, administration | Oui |
| Anthropic (Claude) | Textes rédigés par l'IA | Non : sans clé, des textes types sont proposés |
| Google Gemini | Fonds d'invitation créés par l'IA | Non : sans clé, les 4 étoffes sont utilisées |
| SasPay | Paiement Orange Money / Moov Money | Oui pour encaisser |

---

## 1. Créer le fichier `.env.local`

1. Dans VS Code, à la racine du projet, faites un clic droit sur `.env.example` → **Copier**, puis **Coller**.
2. Renommez la copie en `.env.local` (exactement ce nom).
3. Vous allez remplir ce fichier au fil des étapes. **Ne l'envoyez jamais sur GitHub** : il est déjà ignoré par Git.

Après chaque modification de `.env.local`, arrêtez le site (`Ctrl + C` dans le terminal) et relancez `npm run dev`.

---

## 2. Supabase (base de données et connexion)

Votre compte Supabase gratuit est limité à 2 projets actifs, et vous en avez déjà 2 (« TECH ONE GEST » et « drametextil »). Pour créer Invitora, il faut d'abord **mettre en pause** un de ces projets (Dashboard Supabase → le projet → Settings → General → Pause project), ou passer au plan payant.

1. Allez sur https://supabase.com/dashboard → **New project**.
2. Nom : `invitora`. Mot de passe : générez-en un et gardez-le. Région : **West EU (Paris)** (`eu-west-3`).
3. Quand le projet est prêt : **Project Settings → API**. Copiez dans `.env.local` :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL=`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
   - `service_role` (cliquez sur « Reveal ») → `SUPABASE_SERVICE_ROLE_KEY=`. **Cette clé est secrète** : elle donne tous les droits.
4. Créez les tables : menu **SQL Editor** → **New query**. Ouvrez le fichier `supabase/migrations/20261115000000_init.sql` dans VS Code, copiez **tout** son contenu, collez-le dans Supabase, puis cliquez sur **Run**. Le message attendu est « Success. No rows returned ».
5. Connexion par e-mail : **Authentication → URL Configuration** :
   - Site URL : `http://localhost:3000` (puis votre adresse finale après la mise en ligne)
   - Redirect URLs : ajoutez `http://localhost:3000/auth/callback` (et plus tard `https://VOTRE-DOMAINE/auth/callback`)
6. Mettez votre e-mail dans `.env.local` pour devenir administrateur : `ADMIN_EMAILS=votre@email.com`
7. Relancez `npm run dev`, ouvrez http://localhost:3000/connexion et connectez-vous. Vous recevez un e-mail : cliquez sur le lien. Vous arrivez dans **Mon espace**, et le bouton **Administration** apparaît.

> Le service d'e-mail intégré à Supabase est limité à quelques e-mails par heure. Avant l'ouverture au public, branchez un service d'envoi (Authentication → Emails → SMTP Settings), par exemple Resend ou Brevo.

### Connexion avec Google (facultatif)

1. Sur https://console.cloud.google.com → APIs & Services → Credentials → **Create credentials → OAuth client ID** (type « Web application »).
2. « Authorized redirect URIs » : collez l'adresse indiquée par Supabase dans **Authentication → Providers → Google** (elle se termine par `/auth/v1/callback`).
3. Copiez le Client ID et le Client Secret dans Supabase (Providers → Google), puis activez Google.

---

## 3. Textes par l'IA (Claude)

1. Créez une clé sur https://console.anthropic.com → **API Keys → Create Key**.
2. Dans `.env.local` : `ANTHROPIC_API_KEY=sk-ant-...`
3. Ajoutez un peu de crédit (Billing). Une invitation coûte une fraction de centime.

Le modèle utilisé est `claude-sonnet-5-5`, comme demandé dans `CLAUDE.md`. Il y a une limite de 15 textes par utilisateur et par jour.

---

## 4. Images par l'IA (Gemini)

1. Créez une clé sur https://aistudio.google.com/apikey.
2. Dans `.env.local` : `GEMINI_API_KEY=...`

Les images ne contiennent jamais de texte : les prénoms et les dates sont posés par-dessus (règle 2). La limite est de 3 images par invitation. Le modèle `gemini-3.1-flash-lite-image` sert pour les aperçus gratuits, et `gemini-nano-banana-2.1` une fois la formule payée.

---

## 5. Paiement (SasPay)

> ⚠️ **Règle 4** : SasPay n'a pas de mode test fiable. Même avec une clé de test, **un vrai paiement peut être débité**. Avant tout essai, mettez `SASPAY_TEST_AMOUNT_XOF=100` dans `.env.local` : tous les paiements coûteront alors 100 FCFA. Retirez cette ligne en production.

1. Dans le tableau de bord SasPay (https://app.saspay.me), créez une clé API avec le droit **PAYIN** → `SASPAY_SECRET_KEY=sk_live_...`
2. Créez un webhook :
   - URL : `https://VOTRE-DOMAINE/api/saspay/webhook` (il faut un site en ligne, voir l'étape 6)
   - Événement : **transaction.success**
   - Copiez le secret de signature, affiché **une seule fois** → `SASPAY_WEBHOOK_SECRET=...`
3. Vérifiez dans SasPay que les réseaux `orange_bf` et `moov_bf` sont actifs sur votre compte.

**Comment l'activation fonctionne** (règle 3) : la formule ne s'active jamais au retour du navigateur. Elle s'active seulement quand SasPay envoie un webhook signé. La signature est vérifiée, chaque transaction n'est traitée qu'une fois, et l'API SasPay doit confirmer le statut `SUCCESS`. Si un webhook se perd, l'administrateur peut cliquer sur **Activer** dans Administration → Paiements : l'activation n'a lieu que si SasPay confirme le paiement.

---

## 6. Mise en ligne (Vercel)

1. Sur https://vercel.com, connectez-vous avec GitHub → **Add New → Project** → importez le dépôt `INVITORA`.
2. Avant de cliquer sur Deploy, ouvrez **Environment Variables** et ajoutez **toutes** les lignes de votre `.env.local`, sauf `SASPAY_TEST_AMOUNT_XOF`. Mettez `NEXT_PUBLIC_SITE_URL=https://votre-adresse.vercel.app`, ou votre nom de domaine.
3. Cliquez sur **Deploy**.
4. Retournez dans Supabase (Authentication → URL Configuration) et ajoutez l'adresse Vercel : Site URL, et Redirect URL `/auth/callback`.
5. Dans SasPay, mettez l'URL du webhook avec l'adresse Vercel.

---

## 7. Vérifications

- `npm test` : 65 tests automatiques (sécurité de la base, signatures de paiement, formats).
- `npm run build` : doit se terminer sans erreur.
- Parcours à tester dans le navigateur :
  1. Se connecter → créer une invitation → l'aperçu s'affiche.
  2. Administration → Invitations → **Offrir Essentiel** sur votre invitation (pour tester sans payer).
  3. Publier → copier le lien → l'ouvrir dans une fenêtre privée → répondre « Je serai présent(e) ».
  4. Revenir sur votre espace : la réponse apparaît sans recharger la page.
