# Notes d'intégration SasPay

Source : https://docs.saspay.me/ (pages lues le 15 novembre 2026 : introduction, payments, checkout-create, checkout-status, verify, webhooks, networks, quickstart, openapi.json).

## API
- Base : `https://api.saspay.me/api/v1`. Il n'y a pas d'hôte séparé pour le test : c'est le préfixe de la clé qui fait la différence (`sk_test_` ou `sk_live_`).
- Authentification : `Authorization: Bearer sk_live_...`. La clé doit avoir le droit `PAYIN` ou `BOTH`.
- Enveloppe des réponses : `{ success: true, data, code }` en cas de succès, `{ success: false, error: { message, code }, code }` en cas d'erreur.
- Limite : 300 requêtes par minute (erreur 429 au-delà).

## Session de paiement (page hébergée)
`POST /checkout-sessions/` avec `amount` (chaîne, ex. `"4900.00"`), `currency` (`"XOF"`), `customer_email`, `customer_name` (obligatoires), `description`, `country` (`"BF"`), `customer_phone`, `return_url` et `metadata` (facultatifs).
La réponse 201 contient `data.id` (UUID), `data.checkout_url` et `status: "PENDING"`.
Il n'y a pas de champ pour choisir le réseau : le client choisit Orange Money ou Moov Money sur la page SasPay.

## Statut
`GET /checkout-sessions/{id}/status/` renvoie `status` (`PENDING`, `PAID`, `EXPIRED` ou `CANCELLED`), `transaction_id` et `transaction_status` (`SUCCESS`, `PENDING`, `FAILED` ou `CANCELLED`). SasPay revérifie auprès de l'opérateur avant de répondre.

## Webhooks
- Ils se configurent uniquement dans le tableau de bord SasPay. Le secret de signature n'est affiché qu'une fois.
- En-têtes : `X-Webhook-Signature` (HMAC-SHA256 en hexadécimal minuscule, sans préfixe), `X-Webhook-Timestamp` (secondes Unix), `X-Webhook-Event`.
- Signature : `hex(HMAC_SHA256(secret, timestamp + "." + corpsBrut))`. Il faut la calculer sur le corps **brut**.
- Rejet si l'écart d'horloge dépasse 300 s. La comparaison se fait en temps constant.
- Corps : `{ event: "transaction.success", data: { id, reference, status, amount, currency, network, msisdn, ... } }`.
- **`data.id` est l'identifiant de la transaction, pas celui de la session.** La documentation ne précise pas si les `metadata` de la session figurent dans le webhook.
- Nouvelles tentatives : 5 essais (tout de suite, puis après 30 s, 5 min, 30 min et 2 h), avec 15 s de délai maximal par essai.

## Choix d'implémentation (lib/saspay.ts, lib/billing.ts)
1. Le webhook est d'abord authentifié (signature HMAC et horodatage à moins de 5 minutes). Seul `transaction.success` est traité : les autres événements sont ignorés et n'occupent pas l'identifiant de la transaction.
2. `data.id` est réservé dans `webhook_events` avec un état `processing`, puis `done`. Une nouvelle tentative de SasPay pendant un traitement en cours reçoit une erreur 500 (SasPay réessaiera) et jamais « déjà traité ». Un traitement interrompu depuis plus de 90 s est repris.
3. Rapprochement : si le webhook contient nos métadonnées (`payment_id`), on l'utilise directement. Sinon on parcourt les paiements `pending` des 6 dernières heures, ceux du même montant d'abord, par lots de 8 en parallèle avec un délai de 4 s (SasPay attend 15 s au maximum).
4. On n'active que si l'API SasPay renvoie `PAID` + `SUCCESS` **et** un `transaction_id` égal à `data.id`.
5. L'activation est une seule transaction SQL (`activate_payment`) : paiement `paid`, formule posée, durée prolongée de 3 mois. Elle est idempotente.
6. Les sessions SasPay expirent après 2 h. Un paiement déjà ouvert pour la même invitation et la même formule est repris, pas dupliqué ; au plus 5 paiements ouverts par heure et par utilisateur.
7. Le retour du navigateur (`/paiement/retour`) n'active jamais rien.
8. Montant de test : `SASPAY_TEST_AMOUNT_XOF` force un petit montant (règle 4). Un bandeau rouge s'affiche dans l'administration tant qu'il est défini.

## Points à confirmer avec SasPay
- Les codes réseau `orange_bf` et `moov_bf` (non cités dans les pages lues ; à vérifier avec `GET /networks/`).
- La présence ou non des `metadata` de la session dans le webhook. Si elles sont présentes, on pourra relier directement le paiement sans parcourir les sessions en attente.
- Le comportement du mode test (`sk_test_`) : peut-il vraiment débiter ?
