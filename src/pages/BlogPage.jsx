import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ThemeToggle from '../components/ThemeToggle';
import LazyImage from '../components/LazyImage';
import { client, urlFor } from '../sanity';

export default function BlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const query = `*[_type == "post"] | order(publishedAt desc) {
                    _id,
                    title,
                    slug,
                    excerpt,
                    mainImage,
                    publishedAt,
                    "imageUrl": mainImage.asset->url
                }`;
                const data = await client.fetch(query);
                setPosts(data);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-[#007BFF] selection:text-white transition-colors duration-300">
            <Helmet>
                <title>Blog | THE TALK</title>
                <meta name="description" content="Articles et insights sur la créativité, l'innovation et le digital." />
            </Helmet>

            <nav className="fixed w-full z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-[#333] py-4">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-[#6C757D] hover:text-[#007BFF] dark:hover:text-white transition-colors font-minimal text-sm uppercase tracking-wider">
                        <ArrowLeft size={16} /> Retour à l'accueil
                    </Link>
                    <ThemeToggle />
                </div>
            </nav>

            <div className="pt-32 pb-24 px-6 container mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-creativo font-bold mb-4">Blog</h1>
                    <p className="text-xl text-gray-500 dark:text-[#6C757D] font-minimal">
                        Insights, tendances et réflexions
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center">
                        <div className="w-10 h-10 border-4 border-[#007BFF] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-[#6C757D]">
                        <p className="text-xl">Aucun article pour le moment.</p>
                        <p className="mt-2">Revenez bientôt !</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {posts.map((post) => (
                            <Link
                                key={post._id}
                                to={`/blog/${post.slug?.current}`}
                                className="group bg-gray-50 dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#333] hover:border-[#007BFF] transition-all hover:shadow-[0_0_20px_rgba(0,123,255,0.2)]"
                            >
                                <div className="aspect-video overflow-hidden">
                                    {post.mainImage ? (
                                        <LazyImage
                                            item={{
                                                src: urlFor(post.mainImage).width(600).url(),
                                                title: post.title
                                            }}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#007BFF] to-[#00d4ff] flex items-center justify-center">
                                            <span className="text-white text-4xl font-creativo font-bold">T</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    {post.publishedAt && (
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-[#6C757D] text-sm mb-3">
                                            <Calendar size={14} />
                                            <span>{formatDate(post.publishedAt)}</span>
                                        </div>
                                    )}
                                    <h2 className="text-xl font-creativo font-bold mb-3 group-hover:text-[#007BFF] transition-colors">
                                        {post.title}
                                    </h2>
                                    {post.excerpt && (
                                        <p className="text-gray-600 dark:text-[#6C757D] text-sm mb-4 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 text-[#007BFF] font-minimal text-sm uppercase tracking-wider">
                                        <span>Lire l'article</span>
                                        <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
