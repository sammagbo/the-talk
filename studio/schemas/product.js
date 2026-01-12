export default {
    name: 'product',
    title: 'Product',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: Rule => Rule.required()
        },
        {
            name: 'price',
            title: 'Price',
            type: 'number',
            description: 'Price in EUR (e.g., 25.00)',
            validation: Rule => Rule.required().positive()
        },
        {
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            }
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3
        },
        {
            name: 'stripePriceId',
            title: 'Stripe Price ID',
            type: 'string',
            description: 'The Stripe Price ID (e.g., price_1234567890)'
        }
    ],
    preview: {
        select: {
            title: 'title',
            price: 'price',
            media: 'image'
        },
        prepare({ title, price, media }) {
            return {
                title,
                subtitle: price ? `${price.toFixed(2)}€` : 'No price',
                media
            };
        }
    }
}
