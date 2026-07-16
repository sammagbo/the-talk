import {defineArrayMember, defineField, defineType} from 'sanity'

export const blockContentType = defineType({
  name: 'blockContent',
  title: 'Contenu éditorial',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Titre 2', value: 'h2'},
        {title: 'Titre 3', value: 'h3'},
        {title: 'Citation', value: 'blockquote'},
      ],
      marks: {
        decorators: [
          {title: 'Gras', value: 'strong'},
          {title: 'Italique', value: 'em'},
        ],
        annotations: [
          {
            name: 'link',
            title: 'Lien',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'Adresse',
                type: 'url',
                validation: (Rule) => Rule.uri({allowRelative: true, scheme: ['http', 'https', 'mailto']}),
              }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({name: 'alt', title: 'Texte alternatif', type: 'string', validation: (Rule) => Rule.required()}),
        defineField({name: 'caption', title: 'Légende', type: 'string'}),
      ],
    }),
  ],
})
