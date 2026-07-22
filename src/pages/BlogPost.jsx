import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Play, Pause, Square, Volume2, RotateCcw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { PortableText } from '@portabletext/react';
import ThemeToggle from '../components/ThemeToggle';
import { client, urlFor } from '../sanity';

// Helper to convert PortableText blocks to plain text for speech
function blocksToText(blocks) {
    if (!blocks || !Array.isArray(blocks)) return '';
    return blocks
        .map(block => {
            if (block._type !== 'block' || !block.children) return '';
            return block.children.map(child => child.text).join('');
        })
        .join('. ');
}

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
            <blockquote className="border-l-4 border-black dark:border-white pl-6 my-8 italic text-xl text-gray-600 dark:text-gray-400">
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
                className="text-black dark:text-white hover:underline"
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

    // TTS State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const speechRef = useRef(null);

    useEffect(() => {
        setSpeechSupported('speechSynthesis' in window);

        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

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

    const handleSpeak = () => {
        if (!post?.body) return;

        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            setIsSpeaking(true);
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.pause();
            setIsPaused(true);
            setIsSpeaking(false);
            return;
        }

        const text = `${post.title}. ${blocksToText(post.body)}`;
        const utterance = new SpeechSynthesisUtterance(text);

        // Try to select a good voice
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(v => v.lang.includes('fr') && v.name.includes('Google')) ||
            voices.find(v => v.lang.includes('fr'));

        if (frenchVoice) {
            utterance.voice = frenchVoice;
        }

        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        speechRef.current = utterance;
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

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
                <div className="w-10 h-10 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-creativo font-bold mb-4">Article non trouvé</h1>
                <Link to="/blog" className="text-black dark:text-white hover:underline">
                    Retour au blog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-black selection:text-white transition-colors duration-300">
            <Helmet>
                <title>{post.title} | THE TALK Blog</title>
                <meta name="description" content={`Lisez ${post.title} sur THE TALK Blog.`} />
            </Helmet>

            <nav className="fixed w-full z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-[#333] py-4">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 dark:text-[#6C757D] hover:text-black hover:dark:text-white dark:hover:text-white transition-colors font-minimal text-sm uppercase tracking-wider">
                        <ArrowLeft size={16} /> Retour au blog
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* Audio Player Controls - Top Bar */}
                        {speechSupported && (
                            <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-white/10 rounded-full px-3 py-1.5 border border-gray-200 dark:border-white/10">
                                <button
                                    onClick={handleSpeak}
                                    className="p-1.5 rounded-full hover:bg-white dark:hover:bg-black/20 text-black dark:text-white transition-colors"
                                    title={isSpeaking ? "Pause" : "Lire l'article"}
                                >
                                    {isSpeaking ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                </button>
                                {(isSpeaking || isPaused) && (
                                    <button
                                        onClick={handleStop}
                                        className="p-1.5 rounded-full hover:bg-white dark:hover:bg-black/20 text-red-500 transition-colors"
                                        title="Arrêter"
                                    >
                                        <Square size={14} fill="currentColor" />
                                    </button>
                                )}
                                <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 uppercase">
                                    {isSpeaking ? 'Lecture en cours...' : 'Écouter'}
                                </span>
                            </div>
                        )}
                        <ThemeToggle />
                    </div>
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
                    {/* Floating Audio Player (Mobile/Sticky) */}
                    {speechSupported && (isSpeaking || isPaused) && (
                        <div className="fixed bottom-6 right-6 z-40 md:hidden">
                            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-5">
                                <div className="p-3 bg-black/10 dark:bg-white/10 rounded-full text-black dark:text-white animate-pulse">
                                    <Volume2 size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-mono text-gray-500 uppercase mb-1">Lecture en cours</p>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleSpeak}
                                            className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:scale-105 transition-transform"
                                        >
                                            {isSpeaking ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                                        </button>
                                        <button
                                            onClick={handleStop}
                                            className="p-2 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            <Square size={16} fill="currentColor" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Title & Meta */}
                    <header className={post.mainImage ? "-mt-32 relative z-10" : "mt-16"}>
                        <h1 className={`text-4xl md:text-5xl font-creativo font-bold mb-6 ${post.mainImage ? 'text-white' : ''}`}>
                            {post.title}
                        </h1>
                        {post.publishedAt && (
                            <div className={`flex flex-wrap items-center gap-6 ${post.mainImage ? 'text-white/80' : 'text-gray-500 dark:text-[#6C757D]'}`}>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>{formatDate(post.publishedAt)}</span>
                                </div>
                                <button
                                    onClick={handleSpeak}
                                    className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full backdrop-blur-md transition-all ${post.mainImage
                                            ? 'bg-white/10 hover:bg-white/20 text-white'
                                            : 'bg-black/10 dark:bg-white/10 text-black dark:text-white hover:bg-black/20 hover:dark:bg-white/20'
                                        }`}
                                >
                                    {isSpeaking ? <Pause size={16} /> : <Play size={16} />}
                                    {isSpeaking ? 'Pause' : 'Écouter l\'article'}
                                </button>
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
                            className="inline-flex items-center gap-2 text-black dark:text-white hover:underline font-minimal uppercase tracking-wider"
                        >
                            <ArrowLeft size={16} /> Voir tous les articles
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
