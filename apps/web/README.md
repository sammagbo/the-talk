# @the-talk/web

Nouvelle application publique de THE TALK, construite avec Next.js, React, TypeScript et Tailwind CSS.

## Commandes

```bash
npm install
cp .env.example .env.local
npm run dev
npm run check
```

`npm run check` exécute ESLint, TypeScript, Vitest et le build de production.

## Variables

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL canonique du site |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Projet Sanity |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset publié |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Version d’API explicite |

Les valeurs publiques de développement sont documentées dans `.env.example`. Aucun secret d’écriture Sanity n’est requis par le site public.

## Déploiement

Créer un projet Vercel séparé avec `apps/web` comme **Root Directory**. Ne pas remplacer le projet de production historique avant la recette fonctionnelle et le contrôle des redirections.
