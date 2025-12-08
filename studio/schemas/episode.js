export default {
    name: 'episode',
    title: 'Episode',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text',
        },
        {
            name: 'date',
            title: 'Date',
            type: 'datetime',
        },
        {
            name: 'duration',
            title: 'Duration',
            type: 'string',
            description: 'Example: 45 min',
        },
        {
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: { type: 'category' },
        },
        {
            name: 'mainImage',
            title: 'Main image',
            type: 'image',
            options: {
                hotspot: true,
            },
        },
        {
            name: 'audioUrl',
            title: 'Link do MP3/Spotify',
            type: 'url',
        },
    ],
}
