import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Play, Clock, Calendar, Share2, Sparkles, Loader2, BrainCircuit, Lock, Check, Link as LinkIcon, Video, Headphones } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import LazyImage from '../components/LazyImage';
import CommentsSection from '../components/CommentsSection';
import PollComponent from '../components/PollComponent';
import Rating from '../components/Rating';
import { useAuth } from '../context/AuthContext';
import { client, urlFor } from '../sanity';
import { useTranslation } from 'react-i18next';
import { shareContent, getEpisodeShareUrl } from '../utils/share';
import AIAssistant from '../components/AI/AIAssistant';

export default function EpisodePage({ onPlay, onPause, currentEpisode, isPlaying }) {
    const { id } = useParams();
    const { t } = useTranslation();

    const { user } = useAuth();
    const [episode, setEpisode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const [aiSummary, setAiSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [shareToast, setShareToast] = useState(null);

    const [relatedEpisodes, setRelatedEpisodes] = useState([]);
    const [mediaMode, setMediaMode] = useState('audio'); // 'video' | 'audio'

    useEffect(() => {
        // Function to convert Spotify URL to embed format
        const convertToSpotifyEmbed = (url) => {
            if (!url) return null;

            // If already in embed format, return as is
            if (url.includes('/embed/')) {
                return url;
            }

            // Convert normal Spotify URLs to embed format
            // Supports: /intl-xx/, episode, show, track, playlist, album
            const spotifyRegex = /https:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(episode|show|track|playlist|album)\/([a-zA-Z0-9]+)/;
            const match = url.match(spotifyRegex);

            if (match) {
                return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
            }

            return null;
        };

        const fetchEpisode = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch directly from Sanity by ID with category expansion and related episodes
                const query = `*[_type == "episode" && _id == $id][0]{ 
                    _id, 
                    title, 
                    description, 
                    "category": category->title, 
                    date, 
                    duration, 
                    "src": mainImage.asset->url, 
                    "fullSrc": mainImage.asset->url, 
                    audioUrl,
                    spotifyEmbedUrl,
                    videoUrl,
                    transcript,
                    slug,
                    isPremium,
                    poll,
                    "related": *[_type == "episode" && category->title == ^.category->title && _id != ^._id][0...3]{
                        _id, 
                        title, 
                        duration, 
                        date, 
                        "category": category->title, 
                        "src": mainImage.asset->url 
                    }
                }`;
                const result = await client.fetch(query, { id });

                if (result) {
                    setEpisode({
                        id: result._id,
                        title: result.title,
                        category: result.category || 'Épisodes',
                        description: result.description,
                        date: result.date,
                        duration: result.duration,
                        audioUrl: result.audioUrl,
                        spotifyEmbedUrl: convertToSpotifyEmbed(result.spotifyEmbedUrl),
                        videoUrl: result.videoUrl,
                        mainImage: result.src,
                        src: result.src ? urlFor(result.src).width(800).url() : 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=800&q=80',
                        fullSrc: result.fullSrc ? urlFor(result.fullSrc).width(1600).url() : 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=1600&q=80',
                        transcript: result.transcript,
                        slug: result.slug?.current,
                        isPremium: result.isPremium || false,
                        poll: result.poll || null
                    });

                    // Set default media mode to 'video' if videoUrl exists
                    if (result.videoUrl) {
                        setMediaMode('video');
                    }

                    // Set related episodes from the same query result
                    if (result.related) {
                        const mappedRelated = result.related.map(item => ({
                            id: item._id,
                            title: item.title,
                            category: item.category,
                            date: item.date,
                            duration: item.duration,
                            fullSrc: item.src ? urlFor(item.src).width(600).url() : 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=600&q=80'
                        }));
                        setRelatedEpisodes(mappedRelated);
                    }
                } else {
                    setError(t('episode.not_found'));
                }
            } catch (err) {
                console.error("Error fetching episode:", err);
                setError(t('episode.not_found'));
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEpisode();
        }
    }, [id, retryCount, t]);

    const generateSummary = async () => {
        setIsGenerating(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
            if (!apiKey) throw new Error("Clé API manquante");

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Tu es un assistant intelligent pour le podcast "THE TALK".
                                Analyse le titre et le contexte suivant de l'épisode :
                                Titre: "${episode.title}"
                                Catégorie: "${episode.category}"
                                
                                Génère une liste structurée de 3 à 5 "Key Takeaways" (Points Clés) que l'auditeur doit retenir.
                                Utilisez des emojis pour chaque point. Sois concis et inspirant.
                                Formatte la réponse en Markdown.`
                            }]
                        }]
                    }),
                }
            );

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            setAiSummary(text);
        } catch (error) {
            console.error("Gemini Error:", error);
            setAiSummary("Impossible de générer le résumé pour le moment.");
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <Loader2 className="animate-spin w-10 h-10 text-[#007BFF]" />
            </div>
        );
    }

    if (error || !episode) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                <h2 className="text-3xl font-creativo font-bold mb-4">{error || t('episode.not_found')}</h2>
                <div className="flex gap-4 items-center">
                    <Link to="/" className="text-[#007BFF] hover:underline flex items-center gap-2">
                        <ArrowLeft size={20} /> {t('episode.back_home')}
                    </Link>
                    <button
                        onClick={() => setRetryCount(c => c + 1)}
                        className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-6 py-2 rounded-full font-bold transition-all"
                    >
                        {t('episode.retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-[#007BFF] selection:text-white pb-20 transition-colors duration-300">
            <Helmet>
                <title>{episode.title} | THE TALK</title>
                <meta name="description" content={`Écoutez ${episode.title} - ${episode.category}. Une conversation exclusive sur THE TALK.`} />
                <meta property="og:title" content={`${episode.title} | THE TALK`} />
                <meta property="og:description" content={`Découvrez les coulisses et l'innovation derrière cet épisode spécial : ${episode.title}.`} />
                <meta property="og:image" content={`${window.location.origin}/api/og?title=${encodeURIComponent(episode.title)}&image=${encodeURIComponent(episode.fullSrc)}`} />
                <meta property="og:type" content="article" />
            </Helmet>
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-[#333] py-4">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-[#6C757D] hover:text-[#007BFF] dark:hover:text-white transition-colors font-minimal text-sm uppercase tracking-wider">
                        <ArrowLeft size={16} /> {t('nav.back_gallery')}
                    </Link>
                    <ThemeToggle />
                </div>
            </nav>

            {/* Hero Content */}
            <div className="relative pt-32 pb-12 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>

                        {/* Media Mode Toggle (only show if episode has video) */}
                        <div className="w-full md:w-1/3 shrink-0">
                            {episode.videoUrl && (
                                <div className="flex mb-4 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl p-1 border border-gray-200 dark:border-[#333]">
                                    <button
                                        onClick={() => setMediaMode('audio')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${mediaMode === 'audio'
                                            ? 'bg-[#A9A9F5] text-white shadow-lg'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                                            }`}
                                    >
                                        🎧 {t('episode.listen', 'Ouvir')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMediaMode('video');
                                            // Pause the audio player when switching to video
                                            if (isPlaying && onPause) {
                                                onPause();
                                            }
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${mediaMode === 'video'
                                            ? 'bg-[#007BFF] text-white shadow-lg'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                                            }`}
                                    >
                                        👁️ {t('episode.watch', 'Assistir')}
                                    </button>
                                </div>
                            )}

                            {/* Media Display */}
                            {episode.videoUrl && mediaMode === 'video' ? (
                                /* YouTube Embed */
                                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-[#007BFF]/20 border border-gray-200 dark:border-[#333]">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${episode.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || ''}`}
                                        title={episode.title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                /* Cover Image */
                                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-[#007BFF]/20 border border-gray-200 dark:border-[#333]">
                                    <img
                                        src={episode.fullSrc}
                                        alt={episode.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="w-full md:w-2/3">
                            <span className="inline-block px-3 py-1 bg-[#007BFF]/20 text-[#007BFF] text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                                {episode.category}
                            </span>

                            <h1 className="text-4xl md:text-5xl font-creativo font-bold mb-6 leading-tight">
                                {episode.title}
                            </h1>

                            <div className="mb-6">
                                <Rating episodeId={episode.id} user={user} />
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-[#6C757D] text-sm font-minimal mb-8">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>{t('episode.published_recently')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span>45 min</span>
                                </div>
                                <button
                                    onClick={async () => {
                                        const shareUrl = getEpisodeShareUrl(episode.id);
                                        const result = await shareContent({
                                            title: `${episode.title} | THE TALK`,
                                            text: `Écoute cet épisode de THE TALK: ${episode.title}`,
                                            url: shareUrl
                                        });
                                        if (result.success && result.method === 'clipboard') {
                                            setShareToast('Link Copied!');
                                            setTimeout(() => setShareToast(null), 3000);
                                        }
                                    }}
                                    className="flex items-center gap-2 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    <Share2 size={16} />
                                    <span>{t('episode.share')}</span>
                                </button>
                            </div>

                            {/* Player Action */}
                            <div className="mb-12">
                                {/* Locked Content Banner */}
                                {episode.isPremium && !user ? (
                                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-8 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-full mb-4">
                                            <Lock className="w-8 h-8 text-amber-500" />
                                        </div>
                                        <h3 className="text-2xl font-creativo font-bold text-black dark:text-white mb-2">
                                            {t('episode.locked_title', 'Contenu Premium')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-[#A0A0A0] font-minimal mb-6">
                                            {t('episode.locked_description', 'Ce contenu est réservé aux membres. Connectez-vous ou passez au premium pour y accéder.')}
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <button
                                                onClick={() => window.location.href = '/'}
                                                className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-8 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2"
                                            >
                                                {t('episode.login_button', 'Se Connecter')}
                                            </button>
                                            <Link
                                                to="/store"
                                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                            >
                                                {t('episode.upgrade_button', 'Passer au Premium')}
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                setMediaMode('audio');
                                                onPlay({ ...episode, id: episode.id });
                                            }}
                                            className="w-full md:w-auto bg-[#007BFF] hover:bg-[#0069d9] text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(0,123,255,0.3)] hover:shadow-[0_0_30px_rgba(0,123,255,0.5)] transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                                        >
                                            {currentEpisode?.id === episode.id && isPlaying ? (
                                                <>
                                                    <div className="relative">
                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                                                        <Play className="relative inline-flex" fill="currentColor" />
                                                    </div>
                                                    {t('episode.playing')}
                                                </>
                                            ) : (
                                                <>
                                                    <Play fill="currentColor" />
                                                    {t('episode.play')}
                                                </>
                                            )}
                                        </button>
                                        <p className="mt-4 text-sm text-gray-500 dark:text-[#6C757D] italic">
                                            {t('episode.play_hint')}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* TABS Navigation */}
                            <div className="flex border-b border-gray-200 dark:border-[#333] mb-8">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`pb-4 px-4 font-bold text-sm uppercase tracking-wider text-center transition-colors border-b-2 ${activeTab === 'description'
                                        ? 'border-[#007BFF] text-[#007BFF]'
                                        : 'border-transparent text-gray-500 dark:text-[#6C757D] hover:text-black dark:hover:text-white'
                                        }`}
                                >
                                    {t('episode.tabs.description')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('transcript')}
                                    className={`pb-4 px-4 font-bold text-sm uppercase tracking-wider text-center transition-colors border-b-2 ${activeTab === 'transcript'
                                        ? 'border-[#007BFF] text-[#007BFF]'
                                        : 'border-transparent text-gray-500 dark:text-[#6C757D] hover:text-black dark:hover:text-white'
                                        }`}
                                >
                                    {t('episode.tabs.transcript')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('comments')}
                                    className={`pb-4 px-4 font-bold text-sm uppercase tracking-wider text-center transition-colors border-b-2 ${activeTab === 'comments'
                                        ? 'border-[#007BFF] text-[#007BFF]'
                                        : 'border-transparent text-gray-500 dark:text-[#6C757D] hover:text-black dark:hover:text-white'
                                        }`}
                                >
                                    {t('episode.tabs.comments')}
                                </button>
                            </div>

                            {/* TAB CONTENT */}
                            <div className="min-h-[300px]">
                                {activeTab === 'description' && (
                                    <div className="animate-fade-in">
                                        {/* Description */}
                                        <div className="prose prose-lg max-w-none font-minimal text-gray-600 dark:text-[#A0A0A0] prose-headings:text-black dark:prose-headings:text-white prose-strong:text-black dark:prose-strong:text-white mb-12 leading-relaxed">
                                            <p>
                                                {episode.description}
                                            </p>
                                        </div>

                                        {/* AI Summary Section */}
                                        {/* AI Summary Section */}
                                        <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-2xl p-8">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <Sparkles className="text-[#007BFF]" />
                                                    <h3 className="font-creativo font-bold text-xl dark:text-white">
                                                        {t('episode.ai_takeaways')}
                                                    </h3>
                                                </div>
                                                <span className="text-xs font-mono bg-[#007BFF]/10 text-[#007BFF] px-2 py-1 rounded">
                                                    BETA
                                                </span>
                                            </div>

                                            <div className="text-center py-8">
                                                <BrainCircuit className="w-12 h-12 text-gray-300 dark:text-[#333] mx-auto mb-4" />
                                                <p className="text-gray-500 dark:text-[#6C757D] font-minimal mb-6">
                                                    {t('episode.summary_hint')}
                                                </p>
                                                <button
                                                    onClick={() => setIsGenerating(true)}
                                                    className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-6 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 mx-auto"
                                                >
                                                    <Sparkles size={18} />
                                                    {t('episode.generate_summary')}
                                                </button>
                                            </div>

                                            {/* AI Component */}
                                            <AIAssistant
                                                isOpen={isGenerating}
                                                onClose={() => setIsGenerating(false)}
                                                contextText={episode.transcript || episode.description}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'transcript' && (
                                    <div className="animate-fade-in prose prose-lg max-w-none font-minimal text-gray-600 dark:text-[#A0A0A0] leading-loose">
                                        {episode.transcript ? (
                                            <div className="whitespace-pre-wrap">{episode.transcript}</div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-[#111] rounded-2xl border border-dashed border-gray-300 dark:border-[#333]">
                                                <p className="text-gray-500 dark:text-[#666] italic mb-2">{t('episode.transcript_unavailable')}</p>
                                                <span className="text-xs text-gray-400">{t('episode.come_back_later')}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'comments' && (
                                    <div className="animate-fade-in space-y-8">
                                        {/* Poll Section */}
                                        {episode.poll && (
                                            <PollComponent
                                                episodeId={episode.id}
                                                poll={episode.poll}
                                            />
                                        )}

                                        {/* Comments */}
                                        <CommentsSection episodeId={episode.id} user={user} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Related Episodes Section */}
                    {relatedEpisodes.length > 0 && (
                        <div className="mt-20 border-t border-gray-200 dark:border-[#333] pt-12">
                            <h2 className="text-3xl font-creativo font-bold mb-8 text-black dark:text-white">
                                {t('episode.similar_episodes')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedEpisodes.map(item => (
                                    <Link to={`/episode/${item.id}`} key={item.id} className="group block" onClick={() => window.scrollTo(0, 0)}>
                                        <div className="aspect-square rounded-xl overflow-hidden mb-4 border border-gray-200 dark:border-[#333]">
                                            <LazyImage
                                                src={item.fullSrc}
                                                alt={item.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight group-hover:text-[#007BFF] transition-colors text-black dark:text-white">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-[#6C757D] mt-1 font-minimal">
                                            {item.category}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Share Toast Notification */}
            {shareToast && (
                <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[200] animate-fade-in-up">
                    <div className="flex items-center gap-3 px-5 py-3 bg-[#007BFF] text-white rounded-xl shadow-lg">
                        <Check size={18} />
                        <span className="font-minimal text-sm">{shareToast}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
