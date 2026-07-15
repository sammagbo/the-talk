import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('THE TALK')
    .items([
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
