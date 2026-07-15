import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Paramètres du site',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Nom du site', type: 'string', initialValue: 'THE TALK', validation: (Rule) => Rule.required()}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 4}),
    defineField({name: 'canonicalUrl', title: 'Adresse principale', type: 'url'}),
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
    defineField({name: 'defaultSeo', title: 'Référencement par défaut', type: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Paramètres du site'})},
})
