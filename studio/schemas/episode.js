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
            validation: (Rule) => Rule.required(),
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
            name: 'videoUrl',
            title: 'YouTube Link',
            type: 'url',
            description: 'Cole o link do YouTube para exibir o vídeo no lugar da imagem de capa',
        },
    ],
}
