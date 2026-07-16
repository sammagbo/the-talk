# Audit éditorial du dataset Sanity

Date de contrôle : 16 juillet 2026

Source : projet `9y73r1va`, dataset public `production`

Méthode : lecture seule ; aucun document Sanity n’a été modifié.

## Verdict

Le contenu éditorial officiel n’est pas encore prêt pour la recette publique de la nouvelle application. L’architecture fonctionne avec les documents historiques, et les deux épisodes de test sont désormais reconnus comme des démonstrations techniques intentionnelles plutôt que comme des contenus à supprimer.

| Inventaire public | Quantité |
|---|---:|
| Épisodes | 3 |
| Articles | 1 |
| Catégories | 4 |
| Personnes/auteurs | 0 |
| Paramètres du site | 0 |
| Shorts historiques | 3 |
| Événements live historiques | 1 |

Le contrôle automatisé relève **7 blocages**, **41 avertissements** et **7 informations**. La hausse des avertissements n’est pas une régression : les exigences incomplètes des deux démonstrations ont été reclassées depuis le niveau bloquant.

## Décisions éditoriales intégrées

| Contenu | Rôle | Comportement dans le site moderne |
|---|---|---|
| `Ep Test` | Test technique | Conservé, accessible dans la section « Laboratoire », absent de l’accueil et du sitemap, balisé `noindex` |
| `Episodio teste` | Test technique | Conservé, accessible dans la section « Laboratoire », absent de l’accueil et du sitemap, balisé `noindex` |
| `Mode Fashion` | Présentation officielle | Conservé dans le catalogue éditorial, visible sur l’accueil et indexable |

Cette classification est centralisée dans `apps/web/src/config/content-policy.json` et partagée par l’interface, le SEO et l’audit. Aucun document Sanity n’a été supprimé ou modifié.

## Constats importants

### Épisodes

- `Ep Test` et `Episodio teste` sont volontairement conservés comme contenus d’essai. Leurs lacunes restent visibles dans l’audit sous forme d’avertissements, mais ne bloquent plus la recette du catalogue éditorial.
- `Mode Fashion` est une présentation officielle. Elle possède une description plus complète, mais partage la même vidéo YouTube que les deux épisodes d’essai.
- Les trois liens Spotify pointent vers des chansons (`/track/`) et non vers des épisodes de podcast.
- Les trois épisodes utilisent uniquement les anciens champs : `description`, `date`, `duration`, `mainImage` et `videoUrl`.
- Aucun épisode ne possède d’état éditorial moderne, de date `publishedAt`, de texte alternatif, de SEO, d’invité structuré ou de numérotation saison/épisode.
- Aucun fichier audio n’est renseigné.

Les quatre blocages encore associés à `Mode Fashion` sont l’état éditorial, la date moderne de publication, le texte alternatif de l’image et le lien Spotify de type chanson. Les mêmes lacunes sur les deux tests restent à améliorer si utile, sans exiger leur retrait.

### Journal

L’article « À propos de Mijean Rochus — La voix derrière THE TALK » contient un texte exploitable et un slug stable. Il reste à :

- définir son état éditorial ;
- renseigner le texte alternatif de l’image ;
- migrer `mainImage` vers `coverImage` ;
- créer et associer l’auteur Mijean Rochus ;
- associer une catégorie ;
- compléter le SEO.

### Taxonomie et réglages

- Les quatre catégories n’ont pas de slug et plusieurs descriptions contiennent encore du texte d’essai.
- La catégorie « Épisodes » est redondante avec le type de contenu épisode.
- Aucun document `person` n’existe.
- Le document unique `siteSettings` n’existe pas encore.
- Les anciens shorts et l’événement live restent dans le dataset, mais ne sont plus chargés par le Studio moderne.

## Ordre de correction recommandé

| Priorité | Action | Résultat attendu |
|---|---|---|
| P0 | Normaliser `Mode Fashion` comme présentation : état, date, alt et média Spotify valide ou vide | Première présentation officielle prête pour recette |
| P1 | Créer `siteSettings` avec identité, description, URL canonique, réseaux et SEO | Métadonnées globales pilotées par le Studio |
| P1 | Créer Mijean Rochus comme `person` et l’associer à l’article | Auteur structuré |
| P1 | Migrer l’article existant vers les champs modernes | Premier contenu prêt pour recette |
| P1 | Nettoyer les catégories et générer leurs slugs | Taxonomie stable |
| P2 | Saisir le premier véritable épisode avec image 16:9, alt, invité, médias, notes et SEO | Validation complète du workflow |
| P2 | Améliorer progressivement les champs des deux tests, sans les supprimer | Démonstrations techniques plus accessibles et fiables |
| P3 | Documenter les shorts et live historiques avant toute décision future | Historique préservé et réversible |

## Contrôle reproductible

```bash
npm run content:audit
npm run content:audit:test
```

Pour qu’un pipeline échoue tant qu’il existe un blocage éditorial :

```bash
npm run content:audit:strict
```

L’audit public ne voit que les documents publiés. Les brouillons doivent être contrôlés directement dans le Sanity Studio, qui dispose désormais d’une file « Qualité éditoriale ».
