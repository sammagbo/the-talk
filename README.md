# THE TALK

Plateforme éditoriale mode et culture de Mijean Rochus. Le dépôt contient le site public actuellement en production, la nouvelle application web et le Sanity Studio partagé.

## Organisation

| Dossier | Rôle | Statut |
|---|---|---|
| `/src` | Site React/Vite historique | Production actuelle |
| `/apps/web` | Nouvelle expérience Next.js/TypeScript | Fondation prête à déployer séparément |
| `/studio` | Back-office éditorial Sanity | Source de vérité du contenu |
| `/api` | Fonctions serveur historiques | Maintenues pendant la transition |
| `/docs` | Architecture, décisions et plan de migration | Documentation active |

Le site historique reste intact pendant la migration. La bascule vers `apps/web` se fera uniquement après validation éditoriale, configuration Vercel et contrôle des URLs.

## Démarrage rapide

Site historique :

```bash
npm install
cp .env.example .env
npm run dev
```

Nouvelle application :

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

Back-office :

```bash
cd studio
npm install
cp .env.example .env.local
npm run dev
```

## Validation

```bash
npm run modern:check
npm run studio:check
```

Ces commandes exécutent lint, vérification TypeScript, tests de l’application web et builds de production.

## Publication

Sanity reste l’unique source de vérité. Un épisode ou un article doit avoir une adresse (`slug`), un état éditorial et, pour une publication programmée, une date. Le frontend accepte les documents historiques et les nouveaux champs afin de permettre une migration progressive sans duplication de contenu.

La vision cible, le workflow éditorial et le plan par étapes sont détaillés dans [`docs/architecture.md`](docs/architecture.md).
