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
            title: 'Link do MP3 (arquivo de áudio)',
            type: 'url',
            description: 'URL direta do arquivo MP3 para reprodução nativa',
        },
        {
            name: 'spotifyEmbedUrl',
            title: 'Link do Spotify (Embed)',
            type: 'url',
            description: 'Cole o link do Spotify. Ex: https://open.spotify.com/episode/xxx ou https://open.spotify.com/embed/episode/xxx',
        },
        {
            name: 'poll',
            title: 'Episode Poll',
            type: 'object',
            description: 'Add a poll question for listeners to vote on',
            fields: [
                {
                    name: 'isActive',
                    title: 'Poll Active',
                    type: 'boolean',
                    description: 'Enable or disable the poll',
                    initialValue: true,
                },
                {
                    name: 'question',
                    title: 'Question',
                    type: 'string',
                    description: 'The poll question to ask listeners',
                },
                {
                    name: 'options',
                    title: 'Options',
                    type: 'array',
                    of: [
                        {
                            type: 'object',
                            name: 'pollOption',
                            fields: [
                                {
                                    name: 'id',
                                    title: 'Option ID',
                                    type: 'string',
                                    description: 'Unique identifier (e.g., option_1)',
                                },
                                {
                                    name: 'text',
                                    title: 'Option Text',
                                    type: 'string',
                                    description: 'The answer option text',
                                },
                            ],
                            preview: {
                                select: {
                                    title: 'text',
                                    subtitle: 'id',
                                },
                            },
                        },
                    ],
                    validation: Rule => Rule.max(6).error('Maximum 6 options allowed'),
                },
            ],
        },
    ],
}
