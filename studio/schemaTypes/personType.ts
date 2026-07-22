import {defineField, defineType} from 'sanity'

export const personType = defineType({
  name: 'person',
  title: 'Personne',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Nom', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'slug',
      title: 'Adresse',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'role', title: 'Rôle ou fonction', type: 'string'}),
    defineField({
      name: 'image',
      title: 'Portrait',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Texte alternatif', type: 'string'})],
    }),
    defineField({name: 'bio', title: 'Biographie', type: 'text', rows: 5}),
  ],
  preview: {select: {title: 'name', subtitle: 'role', media: 'image'}},
})
