export default {
    name: 'short',
    title: 'Short',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: Rule => Rule.required()
        },
        {
            name: 'videoUrl',
            title: 'Video URL',
            type: 'url',
            description: 'Direct video link (MP4) or YouTube Shorts URL',
            validation: Rule => Rule.required()
        },
        {
            name: 'thumbnail',
            title: 'Thumbnail',
            type: 'image',
            options: {
                hotspot: true,
            },
            description: 'Preview image for the short (9:16 vertical format recommended)'
        },
        {
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
            initialValue: () => new Date().toISOString()
        }
    ],
    preview: {
        select: {
            title: 'title',
            media: 'thumbnail'
        }
    }
}
