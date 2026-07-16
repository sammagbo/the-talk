# Audit éditorial du dataset Sanity

Date de contrôle : 16 juillet 2026

Source : projet `9y73r1va`, dataset public `production`

Méthode : lecture seule ; aucun document Sanity n’a été modifié.

## Verdict

Le contenu actuel n’est pas prêt pour la recette publique de la nouvelle application. L’architecture fonctionne avec les documents historiques, mais le dataset contient surtout des essais et n’utilise pas encore le workflow éditorial moderne.

| Inventaire public | Quantité |
|---|---:|
| Épisodes | 3 |
| Articles | 1 |
| Catégories | 4 |
| Personnes/auteurs | 0 |
| Paramètres du site | 0 |
| Shorts historiques | 3 |
| Événements live historiques | 1 |

Le contrôle automatisé relève **17 blocages**, **33 avertissements** et **4 informations**.

## Constats importants

### Épisodes

- `Ep Test` et `Episodio teste` sont explicitement des contenus d’essai.
- `Mode Fashion` possède une description plus complète, mais partage la même vidéo YouTube que les deux épisodes d’essai.
- Les trois liens Spotify pointent vers des chansons (`/track/`) et non vers des épisodes de podcast.
- Les trois épisodes utilisent uniquement les anciens champs : `description`, `date`, `duration`, `mainImage` et `videoUrl`.
- Aucun épisode ne possède d’état éditorial moderne, de date `publishedAt`, de texte alternatif, de SEO, d’invité structuré ou de numérotation saison/épisode.
- Aucun fichier audio n’est renseigné.

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
| P0 | Retirer de la publication ou supprimer les épisodes explicitement marqués comme tests | Aucun faux épisode visible |
| P0 | Décider si `Mode Fashion` devient une bande-annonce réelle ou doit aussi être retiré | Catalogue cohérent |
| P0 | Remplacer les liens Spotify de chansons par les vrais épisodes, ou les laisser vides | Aucun média trompeur |
| P1 | Créer `siteSettings` avec identité, description, URL canonique, réseaux et SEO | Métadonnées globales pilotées par le Studio |
| P1 | Créer Mijean Rochus comme `person` et l’associer à l’article | Auteur structuré |
| P1 | Migrer l’article existant vers les champs modernes | Premier contenu prêt pour recette |
| P1 | Nettoyer les catégories et générer leurs slugs | Taxonomie stable |
| P2 | Saisir le premier véritable épisode avec image 16:9, alt, invité, médias, notes et SEO | Validation complète du workflow |
| P2 | Archiver les shorts/live historiques après sauvegarde | Dataset simplifié |

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
