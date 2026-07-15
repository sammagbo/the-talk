# @the-talk/studio

Back-office éditorial Sanity de THE TALK.

## Démarrage

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Workflow éditorial

1. Créer ou ouvrir un épisode/article.
2. Renseigner le titre, l’adresse, le résumé, les médias et le SEO.
3. Choisir l’état `Brouillon éditorial`, `Programmé` ou `Publié`.
4. Pour programmer, définir une date future, choisir `Programmé`, puis publier le document Sanity. Le site le masque jusqu’à cette date.
5. Pour publier immédiatement, choisir `Publié`, renseigner la date actuelle et publier le document Sanity.

Le bouton de publication Sanity contrôle la présence dans le dataset public ; l’état éditorial et la date contrôlent la visibilité sur le site.

## Configuration

```env
SANITY_STUDIO_PROJECT_ID=9y73r1va
SANITY_STUDIO_DATASET=production
```

## Validation

```bash
npm run check
```

Les schémas TypeScript actifs se trouvent dans `schemaTypes/`. Les anciens schémas JavaScript dans `schemas/` sont conservés temporairement comme référence d’audit, mais ne sont plus chargés par le Studio.
