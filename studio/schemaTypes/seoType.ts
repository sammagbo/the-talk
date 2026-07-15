import {defineField, defineType} from 'sanity'

export const seoType = defineType({
  name: 'seo',
  title: 'Référencement',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Titre SEO',
      type: 'string',
      description: 'Laissez vide pour reprendre le titre éditorial.',
      validation: (Rule) => Rule.max(60).warning('Idéalement 60 caractères maximum.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Description SEO',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(160).warning('Idéalement 160 caractères maximum.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Image de partage',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Texte alternatif', type: 'string'})],
    }),
    defineField({name: 'noIndex', title: 'Masquer des moteurs de recherche', type: 'boolean', initialValue: false}),
  ],
})
