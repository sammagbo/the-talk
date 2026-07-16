import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Paramètres du site',
  type: 'document',
  initialValue: {
    title: 'THE TALK',
    description: 'Le podcast mode et culture de Mijean Rochus — des conversations directes sur les idées, les parcours et les mouvements qui façonnent notre époque.',
    canonicalUrl: 'https://thetalkfashion.com',
    defaultSeo: {
      metaTitle: 'THE TALK',
      metaDescription: 'Le podcast mode et culture de Mijean Rochus — des conversations directes avec celles et ceux qui façonnent notre époque.',
      noIndex: false,
    },
  },
  fields: [
    defineField({name: 'title', title: 'Nom du site', type: 'string', initialValue: 'THE TALK', validation: (Rule) => Rule.required()}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 4, validation: (Rule) => Rule.required().max(320)}),
    defineField({name: 'canonicalUrl', title: 'Adresse principale', type: 'url', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'socialLinks',
      title: 'Réseaux sociaux',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({name: 'label', title: 'Réseau', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'url', title: 'Adresse', type: 'url', validation: (Rule) => Rule.required()}),
          ],
          preview: {select: {title: 'label', subtitle: 'url'}},
        }),
      ],
    }),
    defineField({name: 'defaultSeo', title: 'Référencement par défaut', type: 'seo', validation: (Rule) => Rule.required().warning('Recommandé pour les pages sans SEO spécifique.')}),
  ],
  preview: {prepare: () => ({title: 'Paramètres du site'})},
})
