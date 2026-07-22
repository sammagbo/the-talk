# Préproduction de THE TALK

Date de mise à jour : 16 juillet 2026

Cette étape prépare la nouvelle application sans modifier le domaine principal ni les documents Sanity. Le frontend historique reste le chemin de retour arrière jusqu’à la recette finale.

## 1. Revalidation du contenu

Les lectures Sanity utilisent désormais un cache court de 60 secondes pour les épisodes et articles, un cache d’une heure pour les paramètres globaux, et des tags par domaine. Cette durée courte conserve le comportement des publications programmées ; le webhook signé accélère les créations, modifications et suppressions.

Configuration à appliquer dans le projet Vercel dédié :

1. Générer une valeur aléatoire longue pour `SANITY_REVALIDATE_SECRET` et l’ajouter aux environnements Preview et Production.
2. Dans Sanity Manage, créer un webhook vers `https://<domaine-preview>/api/revalidate`.
3. Utiliser le même secret dans le champ Secret du webhook afin que Sanity produise l’en-tête signé `sanity-webhook-signature`.
4. Filtrer les documents avec `_type in ["episode", "post", "person", "category", "siteSettings"]`.
5. Utiliser la projection `{_type, "slug": slug.current}` et activer création, mise à jour et suppression.

L’endpoint refuse les signatures invalides, ne met jamais sa réponse en cache et ignore sans erreur les types historiques qui n’alimentent pas l’application moderne.

## 2. Mesure réelle

Le layout charge `@vercel/analytics` et `@vercel/speed-insights`. Après le premier déploiement du projet dédié, il reste à activer Web Analytics et Speed Insights dans le tableau de bord Vercel.

Budgets de recette au 75e percentile, sur mobile et bureau :

| Signal | Budget |
|---|---:|
| LCP | ≤ 2,5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0,1 |
| Lighthouse Accessibilité | ≥ 95 |
| Lighthouse SEO | ≥ 95 |

Les trois seuils Core Web Vitals suivent la recommandation publique de Google. Les données terrain de Vercel priment sur une mesure ponctuelle en laboratoire.

## 3. Contrôle automatisé

Playwright ouvre les quatre routes publiques principales, vérifie la structure de page, exécute Axe sur les règles WCAG A/AA, contrôle la politique des épisodes de test et valide le sitemap. Le test couvre également la redirection permanente d’une ancienne URL d’épisode.

```bash
cd apps/web
npm run build
npx playwright install chromium
npm run test:e2e
```

## 4. Inventaire des URLs

| URL historique | Destination moderne | État |
|---|---|---|
| `/` | `/` | Conservée |
| `/episodes` | `/episodes` | Conservée |
| `/episode/:id` | `/episodes/:slug` | Redirection 308 dynamique ajoutée |
| `/about` | `/about` | Conservée |
| `/blog` | `/blog` | Conservée |
| `/blog/:slug` | `/blog/:slug` | Conservée |
| `/store` | — | Fonction historique déjà désactivée ; aucune redirection publique décidée |
| `/admin` | Sanity Studio | Fonction historique déjà masquée ; URL du Studio à confirmer avant bascule |
| `/profile/:uid` | — | Backend historique masqué ; ne fait pas partie du produit moderne |
| `/live` | — | Backend historique masqué ; ne fait pas partie du produit moderne |

Avant la bascule du domaine, les URLs réellement indexées dans Google Search Console devront être comparées à ce tableau. Aucune redirection spéculative n’est ajoutée pour les fonctions déjà masquées.

## 5. Retour arrière

- Le domaine principal reste sur le frontend historique pendant la recette.
- Une revalidation défectueuse peut être neutralisée en désactivant le webhook ; le cache temporel continue de rafraîchir le contenu.
- Analytics et Speed Insights peuvent être désactivés dans Vercel sans modifier les documents Sanity.
- La bascule finale doit conserver l’identifiant du dernier déploiement historique fonctionnel.

## 6. Actions manuelles restantes

- créer ou confirmer le projet Vercel dont le répertoire racine est `apps/web` ;
- renseigner les variables de Preview et Production ;
- activer Analytics et Speed Insights dans Vercel ;
- connecter et tester le webhook Sanity sur le domaine de Preview ;
- contrôler les URLs indexées dans Search Console ;
- valider les budgets sur contenu réel avant toute bascule de domaine.
