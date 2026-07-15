import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Article',
  type: 'document',
  groups: [
    {name: 'editorial', title: 'Éditorial', default: true},
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
    defineField({name: 'excerpt', title: 'Chapô', type: 'text', rows: 4, group: 'editorial', validation: (Rule) => Rule.max(320)}),
    defineField({
      name: 'coverImage',
      title: 'Image de couverture',
      type: 'image',
      options: {hotspot: true},
      group: 'editorial',
      fields: [
        defineField({name: 'alt', title: 'Texte alternatif', type: 'string', validation: (Rule) => Rule.required()}),
        defineField({name: 'caption', title: 'Légende', type: 'string'}),
      ],
    }),
    defineField({name: 'mainImage', title: 'Image de couverture (historique)', type: 'image', options: {hotspot: true}, group: 'editorial'}),
    defineField({name: 'author', title: 'Auteur', type: 'reference', to: [{type: 'person'}], group: 'editorial'}),
    defineField({
      name: 'categories',
      title: 'Catégories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
      group: 'editorial',
    }),
    defineField({name: 'body', title: 'Article', type: 'blockContent', group: 'editorial', validation: (Rule) => Rule.required()}),
    defineField({name: 'featured', title: 'Mettre en avant', type: 'boolean', initialValue: false, group: 'editorial'}),
    defineField({
      name: 'publicationStatus',
      title: 'État éditorial',
      type: 'string',
      group: 'publication',
      initialValue: 'draft',
      options: {
        list: [
          {title: 'Brouillon éditorial', value: 'draft'},
          {title: 'Programmé', value: 'scheduled'},
          {title: 'Publié', value: 'published'},
        ],
        layout: 'radio',
      },
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
    defineField({name: 'seo', title: 'Référencement', type: 'seo', group: 'seo'}),
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
