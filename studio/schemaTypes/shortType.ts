import {defineField, defineType} from 'sanity'

export const shortType = defineType({
  name: 'short',
  title: 'Short',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Titre', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'videoUrl',
      title: 'Lien vidéo',
      type: 'url',
      description: 'Direct MP4 link or YouTube Shorts URL',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Miniature',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {title: 'title', media: 'thumbnail'},
  },
})
