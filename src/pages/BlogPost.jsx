import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { PortableText } from '@portabletext/react';
import ThemeToggle from '../components/ThemeToggle';
import { client, urlFor } from '../sanity';

// Custom components for Portable Text rendering
const portableTextComponents = {
    types: {
        image: ({ value }) => {
            if (!value?.asset?._ref) return null;
            return (
                <figure className="my-8">
                    <img
                        src={urlFor(value).width(1200).url()}
                        alt={value.alt || ''}
                        className="w-full rounded-xl"
                    />
                    {value.caption && (
                        <figcaption className="text-center text-gray-500 dark:text-[#6C757D] mt-2 text-sm">
                            {value.caption}
                        </figcaption>
                    )}
                </figure>
            );
        },
    },
    block: {
        h1: ({ children }) => <h1 className="text-4xl font-creativo font-bold mt-12 mb-6">{children}</h1>,
        h2: ({ children }) => <h2 className="text-3xl font-creativo font-bold mt-10 mb-4">{children}</h2>,
        h3: ({ children }) => <h3 className="text-2xl font-creativo font-bold mt-8 mb-3">{children}</h3>,
        normal: ({ children }) => <p className="text-lg leading-relaxed mb-6 text-gray-700 dark:text-gray-300">{children}</p>,
        blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#007BFF] pl-6 my-8 italic text-xl text-gray-600 dark:text-gray-400">
                {children}
            </blockquote>
        ),
    },
    marks: {
        link: ({ children, value }) => (
            <a
                href={value?.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#007BFF] hover:underline"
            >
                {children}
            </a>
        ),
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
    },
    list: {
        bullet: ({ children }) => <ul className="list-disc list-inside mb-6 space-y-2">{children}</ul>,
        number: ({ children }) => <ol className="list-decimal list-inside mb-6 space-y-2">{children}</ol>,
    },
    listItem: {
        bullet: ({ children }) => <li className="text-lg text-gray-700 dark:text-gray-300">{children}</li>,
        number: ({ children }) => <li className="text-lg text-gray-700 dark:text-gray-300">{children}</li>,
    },
};

export default function BlogPost() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const query = `*[_type == "post" && slug.current == $slug][0] {
                    _id,
                    title,
                    slug,
                    mainImage,
                    publishedAt,
                    body
                }`;
                const data = await client.fetch(query, { slug });
                setPost(data);
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#007BFF] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-creativo font-bold mb-4">Article non trouvé</h1>
                <Link to="/blog" className="text-[#007BFF] hover:underline">
                    Retour au blog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-[#007BFF] selection:text-white transition-colors duration-300">
            <Helmet>
                <title>{post.title} | THE TALK Blog</title>
                <meta name="description" content={`Lisez ${post.title} sur THE TALK Blog.`} />
            </Helmet>

            <nav className="fixed w-full z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-[#333] py-4">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 dark:text-[#6C757D] hover:text-[#007BFF] dark:hover:text-white transition-colors font-minimal text-sm uppercase tracking-wider">
                        <ArrowLeft size={16} /> Retour au blog
                    </Link>
                    <ThemeToggle />
                </div>
            </nav>

            <article className="pt-24 pb-24">
                {/* Hero Image */}
                {post.mainImage && (
                    <div className="w-full h-[50vh] md:h-[60vh] relative overflow-hidden">
                        <img
                            src={urlFor(post.mainImage).width(1920).url()}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                )}

                <div className="container mx-auto px-6 max-w-3xl">
                    {/* Title & Meta */}
                    <header className={post.mainImage ? "-mt-32 relative z-10" : "mt-16"}>
                        <h1 className={`text-4xl md:text-5xl font-creativo font-bold mb-6 ${post.mainImage ? 'text-white' : ''}`}>
                            {post.title}
                        </h1>
                        {post.publishedAt && (
                            <div className={`flex items-center gap-4 ${post.mainImage ? 'text-white/80' : 'text-gray-500 dark:text-[#6C757D]'}`}>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>{formatDate(post.publishedAt)}</span>
                                </div>
                            </div>
                        )}
                    </header>

                    {/* Content */}
                    <div className="mt-12 prose prose-lg dark:prose-invert max-w-none">
                        {post.body && <PortableText value={post.body} components={portableTextComponents} />}
                    </div>

                    {/* Back Link */}
                    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-[#333]">
                        <Link
                            to="/blog"
                            className="inline-flex items-center gap-2 text-[#007BFF] hover:underline font-minimal uppercase tracking-wider"
                        >
                            <ArrowLeft size={16} /> Voir tous les articles
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
