import { ImageResponse } from '@vercel/og';

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    try {
        const { searchParams } = new URL(request.url);

        // Get query parameters
        const title = searchParams.get('title') || 'THE TALK';
        const image = searchParams.get('image');

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000',
                        position: 'relative',
                    }}
                >
                    {/* Background Image */}
                    {image && (
                        <img
                            src={image}
                            alt=""
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.5,
                            }}
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)',
                        }}
                    />

                    {/* Content */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            zIndex: 10,
                            padding: '40px',
                            textAlign: 'center',
                        }}
                    >
                        {/* Logo/Brand */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '30px',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    color: '#007BFF',
                                    letterSpacing: '4px',
                                }}
                            >
                                THE TALK
                            </span>
                        </div>

                        {/* Title */}
                        <h1
                            style={{
                                fontSize: '64px',
                                fontWeight: 'bold',
                                color: '#fff',
                                lineHeight: 1.2,
                                maxWidth: '900px',
                                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            }}
                        >
                            {title}
                        </h1>

                        {/* Tagline */}
                        <p
                            style={{
                                fontSize: '24px',
                                color: '#a0a0a0',
                                marginTop: '20px',
                            }}
                        >
                            Innovation & Creativity Podcast
                        </p>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (error) {
        console.error('OG Image Error:', error);
        return new Response('Failed to generate image', { status: 500 });
    }
}
