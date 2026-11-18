# Invitora

Invitations digitales générées par IA pour l'Afrique de l'Ouest : création en 30 secondes, partage WhatsApp, réponses des invités en temps réel, paiement Orange Money / Moov Money.

- Instructions du projet : [CLAUDE.md](CLAUDE.md)
- Charte graphique : [BRAND.md](BRAND.md)
- **Brancher les services et mettre en ligne : [docs/MISE-EN-ROUTE.md](docs/MISE-EN-ROUTE.md)**
- Paiement : [docs/saspay.md](docs/saspay.md)

## Commandes

```bash
npm install      # installer les dépendances
npm run dev      # lancer le site en local → http://localhost:3000
npm run db:migrate  # appliquer le schéma sur la base Neon
npm test         # 77 tests (sécurité de la base, paiement, formats)
npm run build    # vérifier que tout compile
npm run fonds    # préparer les fonds d'invitation à partir de design/fonds-sources/ (scripts/prepare-fonds.mjs)
```

## Organisation

| Dossier | Contenu |
| --- | --- |
| `app/` | Pages : accueil, `/creer`, `/i/[slug]` (invité), `/tableau-de-bord`, `/admin`, `/api/saspay/webhook` |
| `components/` | Composants d'interface (accueil, invitation, tableau de bord, admin) |
| `lib/` | Logique serveur : Neon (SQL, auth, API de données), IA (Gemini pour les textes), SasPay, formats |
| `config/` | Formules et prix (`plans.ts`), thèmes, textes de l'accueil, réglages |
| `db/migrations/` | Schéma de la base Neon (tables + sécurité RLS), appliqué par `npm run db:migrate` |
| `tests/` | Tests automatiques (vitest + PostgreSQL local PGlite) |
| `design/` | Maquettes et visuels sources |
