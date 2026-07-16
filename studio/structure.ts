import type {StructureBuilder, StructureResolver} from 'sanity/structure'

const incompleteEpisodeFilter = `_type == "episode" && (
  !defined(slug.current) ||
  !defined(publicationStatus) ||
  !defined(publishedAt) ||
  !defined(coverImage.asset) ||
  !defined(excerpt) ||
  !(defined(youtubeUrl) || defined(audioUrl) || defined(spotifyEmbedUrl))
)`

const incompletePostFilter = `_type == "post" && (
  !defined(slug.current) ||
  !defined(publicationStatus) ||
  !defined(publishedAt) ||
  !defined(coverImage.asset) ||
  !defined(excerpt) ||
  !defined(body) ||
  !defined(author) ||
  count(categories) == 0
)`

function qualityDesk(S: StructureBuilder) {
  return S.listItem()
    .title('Qualité éditoriale')
    .child(
      S.list()
        .title('Documents à compléter')
        .items([
          S.listItem()
            .title('Épisodes à compléter')
            .child(S.documentList().title('Épisodes à compléter').schemaType('episode').filter(incompleteEpisodeFilter)),
          S.listItem()
            .title('Articles à compléter')
            .child(S.documentList().title('Articles à compléter').schemaType('post').filter(incompletePostFilter)),
        ]),
    )
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('THE TALK')
    .items([
      qualityDesk(S),
      S.divider(),
      S.documentTypeListItem('episode').title('Épisodes'),
      S.documentTypeListItem('post').title('Journal'),
      S.divider(),
      S.documentTypeListItem('person').title('Personnes'),
      S.documentTypeListItem('category').title('Catégories'),
      S.divider(),
      S.listItem()
        .title('Paramètres du site')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
