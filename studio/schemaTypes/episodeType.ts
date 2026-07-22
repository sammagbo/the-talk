import {defineArrayMember, defineField, defineType} from 'sanity'

const publicationOptions = [
  {title: 'Brouillon éditorial', value: 'draft'},
  {title: 'Programmé', value: 'scheduled'},
  {title: 'Publié', value: 'published'},
]

export const episodeType = defineType({
  name: 'episode',
  title: 'Épisode',
  type: 'document',
  groups: [
    {name: 'editorial', title: 'Éditorial', default: true},
    {name: 'media', title: 'Médias'},
    {name: 'publication', title: 'Publication'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', title: 'Titre', type: 'string', group: 'editorial', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'slug',
      title: 'Adresse',
      type: 'slug',
      group: 'editorial',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Résumé',
      type: 'text',
      rows: 4,
      group: 'editorial',
      validation: (Rule) => Rule.max(320).custom((value, context) => value || context.document?.description ? true : 'Un résumé est nécessaire.'),
    }),
    defineField({
      name: 'description',
      title: 'Description (champ historique)',
      type: 'text',
      rows: 4,
      group: 'editorial',
      hidden: ({document}) => Boolean(document?.excerpt),
    }),
    defineField({name: 'showNotes', title: 'Notes de l’épisode', type: 'blockContent', group: 'editorial'}),
    defineField({name: 'category', title: 'Catégorie', type: 'reference', to: [{type: 'category'}], group: 'editorial'}),
    defineField({
      name: 'guests',
      title: 'Invités',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'person'}]})],
      group: 'editorial',
    }),
    defineField({name: 'seasonNumber', title: 'Saison', type: 'number', group: 'editorial', validation: (Rule) => Rule.integer().min(1)}),
    defineField({name: 'episodeNumber', title: 'Numéro', type: 'number', group: 'editorial', validation: (Rule) => Rule.integer().min(1)}),
    defineField({name: 'featured', title: 'Mettre en avant', type: 'boolean', initialValue: false, group: 'editorial'}),
    defineField({
      name: 'coverImage',
      title: 'Image de couverture',
      type: 'image',
      options: {hotspot: true},
      group: 'media',
      fields: [
        defineField({name: 'alt', title: 'Texte alternatif', type: 'string', validation: (Rule) => Rule.required()}),
        defineField({name: 'caption', title: 'Légende', type: 'string'}),
      ],
    }),
    defineField({
      name: 'mainImage',
      title: 'Image de couverture (historique)',
      type: 'image',
      options: {hotspot: true},
      group: 'media',
      description: 'Conservé pour les épisodes existants. Utilisez désormais “Image de couverture”.',
      hidden: ({document}) => Boolean(document?.coverImage),
      fields: [
        defineField({name: 'alt', title: 'Texte alternatif', type: 'string'}),
        defineField({name: 'caption', title: 'Légende', type: 'string'}),
      ],
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'Lien YouTube',
      type: 'url',
      group: 'media',
      validation: (Rule) => Rule.custom((value) => !value || /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\//i.test(value) || 'Utilisez une adresse YouTube valide.'),
    }),
    defineField({name: 'videoUrl', title: 'Lien vidéo (historique)', type: 'url', group: 'media', hidden: ({document}) => Boolean(document?.youtubeUrl)}),
    defineField({name: 'audioUrl', title: 'Fichier audio MP3', type: 'url', group: 'media'}),
    defineField({
      name: 'spotifyEmbedUrl',
      title: 'Lien Spotify de l’épisode',
      type: 'url',
      group: 'media',
      validation: (Rule) => Rule.custom((value) => !value || /open\.spotify\.com\/(?:intl-[a-z]{2}\/)?episode\//i.test(value) || 'Le lien doit pointer vers un épisode Spotify, pas vers une chanson.'),
    }),
    defineField({name: 'durationLabel', title: 'Durée affichée', type: 'string', group: 'media', description: 'Exemple : 52 min'}),
    defineField({name: 'duration', title: 'Durée (champ historique)', type: 'string', group: 'media', hidden: ({document}) => Boolean(document?.durationLabel)}),
    defineField({
      name: 'publicationStatus',
      title: 'État éditorial',
      type: 'string',
      group: 'publication',
      initialValue: 'draft',
      options: {list: publicationOptions, layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      group: 'publication',
      description: 'Pour programmer : choisissez “Programmé”, fixez une date future, puis publiez le document.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const status = context.document?.publicationStatus
          if ((status === 'published' || status === 'scheduled') && !value) {
            return 'Une date est nécessaire pour publier ou programmer.'
          }
          return true
        }),
    }),
    defineField({name: 'date', title: 'Date (champ historique)', type: 'datetime', group: 'publication', hidden: ({document}) => Boolean(document?.publishedAt)}),
    defineField({name: 'seo', title: 'Référencement', type: 'seo', group: 'seo', validation: (Rule) => Rule.required().warning('Recommandé avant publication.')}),
  ],
  orderings: [
    {title: 'Date de publication, récente', name: 'publishedAtDesc', by: [{field: 'publishedAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', media: 'coverImage', legacyMedia: 'mainImage', status: 'publicationStatus', date: 'publishedAt'},
    prepare({title, media, legacyMedia, status, date}) {
      const label = status === 'scheduled' ? 'Programmé' : status === 'published' ? 'Publié' : 'Brouillon'
      return {title, media: media || legacyMedia, subtitle: [label, date ? new Date(date).toLocaleDateString('fr-BE') : null].filter(Boolean).join(' · ')}
    },
  },
})
