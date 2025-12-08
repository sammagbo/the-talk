import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Play, Clock, Calendar, Share2, Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import CommentsSection from '../components/CommentsSection';
import Rating from '../components/Rating';
import { useAuth } from '../context/AuthContext';

export default function EpisodePage({ items, onPlay, currentEpisode, isPlaying }) {
    const { id } = useParams();
    const episode = items.find(item => item.id.toString() === id);
    const { user } = useAuth();
    const [aiSummary, setAiSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    const relatedEpisodes = items
        .filter(item => item.category === episode?.category && item.id !== episode?.id)
        .slice(0, 3);

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

    if (!episode) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                <h2 className="text-3xl font-creativo font-bold mb-4">Épisode non trouvé</h2>
                <Link to="/" className="text-[#007BFF] hover:underline flex items-center gap-2">
                    <ArrowLeft size={20} /> Retour à l'accueil
                </Link>
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
                <meta property="og:image" content={episode.fullSrc} />
                <meta property="og:type" content="article" />
            </Helmet>
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-[#333] py-4">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-[#6C757D] hover:text-[#007BFF] dark:hover:text-white transition-colors font-minimal text-sm uppercase tracking-wider">
                        <ArrowLeft size={16} /> Retour à la galerie
                    </Link>
                    <ThemeToggle />
                </div>
            </nav>

            {/* Hero Content */}
            <div className="relative pt-32 pb-12 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>

                        {/* Cover Image */}
                        <div className="w-full md:w-1/3 shrink-0">
                            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-[#007BFF]/20 border border-gray-200 dark:border-[#333]">
                                <img
                                    src={episode.fullSrc}
                                    alt={episode.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
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
                                    <span>Publié récemment</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span>45 min</span>
                                </div>
                                <button className="flex items-center gap-2 hover:text-black dark:hover:text-white transition-colors">
                                    <Share2 size={16} />
                                    <span>Partager</span>
                                </button>
                            </div>

                            {/* Player Action */}
                            <div className="mb-12">
                                <button
                                    onClick={() => onPlay(episode)}
                                    className="w-full md:w-auto bg-[#007BFF] hover:bg-[#0069d9] text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(0,123,255,0.3)] hover:shadow-[0_0_30px_rgba(0,123,255,0.5)] transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                                >
                                    {currentEpisode?.id === episode.id && isPlaying ? (
                                        <>
                                            <div className="relative">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                                                <Play className="relative inline-flex" fill="currentColor" />
                                            </div>
                                            En cours de lecture...
                                        </>
                                    ) : (
                                        <>
                                            <Play fill="currentColor" />
                                            Écouter l'épisode
                                        </>
                                    )}
                                </button>
                                <p className="mt-4 text-sm text-gray-500 dark:text-[#6C757D] italic">
                                    * La lecture continuera en bas de page pendant votre navigation.
                                </p>
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
                                    Description
                                </button>
                                <button
                                    onClick={() => setActiveTab('transcript')}
                                    className={`pb-4 px-4 font-bold text-sm uppercase tracking-wider text-center transition-colors border-b-2 ${activeTab === 'transcript'
                                        ? 'border-[#007BFF] text-[#007BFF]'
                                        : 'border-transparent text-gray-500 dark:text-[#6C757D] hover:text-black dark:hover:text-white'
                                        }`}
                                >
                                    Transcription
                                </button>
                                <button
                                    onClick={() => setActiveTab('comments')}
                                    className={`pb-4 px-4 font-bold text-sm uppercase tracking-wider text-center transition-colors border-b-2 ${activeTab === 'comments'
                                        ? 'border-[#007BFF] text-[#007BFF]'
                                        : 'border-transparent text-gray-500 dark:text-[#6C757D] hover:text-black dark:hover:text-white'
                                        }`}
                                >
                                    Commentaires
                                </button>
                            </div>

                            {/* TAB CONTENT */}
                            <div className="min-h-[300px]">
                                {activeTab === 'description' && (
                                    <div className="animate-fade-in">
                                        {/* Description */}
                                        <div className="prose prose-lg max-w-none font-minimal text-gray-600 dark:text-[#A0A0A0] prose-headings:text-black dark:prose-headings:text-white prose-strong:text-black dark:prose-strong:text-white mb-12 leading-relaxed">
                                            <p>
                                                Découvrez les coulisses de cet épisode exclusif. Nous plongeons dans les détails de la création,
                                                l'inspiration et les défis rencontrés. Une conversation authentique et sans filtre.
                                            </p>
                                            <p className="mt-4">
                                                Rejoignez-nous pour explorer comment l'innovation et la créativité façonnent notre monde numérique.
                                            </p>
                                        </div>

                                        {/* AI Summary Section */}
                                        <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-2xl p-8">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <Sparkles className="text-[#007BFF]" />
                                                    <h3 className="text-xl font-creativo font-bold text-black dark:text-white">AI Key Takeaways</h3>
                                                </div>
                                                {!aiSummary && (
                                                    <button
                                                        onClick={generateSummary}
                                                        disabled={isGenerating}
                                                        className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
                                                        {isGenerating ? 'Analyse...' : 'Générer le Résumé'}
                                                    </button>
                                                )}
                                            </div>

                                            {aiSummary ? (
                                                <div className="animate-fade-in prose prose-invert prose-p:text-gray-600 dark:prose-p:text-[#A0A0A0] prose-headings:text-black dark:prose-headings:text-white max-w-none font-minimal">
                                                    <div className="whitespace-pre-wrap">{aiSummary}</div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 dark:text-[#6C757D] text-sm italic">
                                                    Cliquez sur le bouton pour générer les points clés de cet épisode grâce à l'IA.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'transcript' && (
                                    <div className="animate-fade-in prose prose-lg max-w-none font-minimal text-gray-600 dark:text-[#A0A0A0] leading-loose">
                                        {episode.transcript ? (
                                            <div className="whitespace-pre-wrap">{episode.transcript}</div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-[#111] rounded-2xl border border-dashed border-gray-300 dark:border-[#333]">
                                                <p className="text-gray-500 dark:text-[#666] italic mb-2">Transcription non disponible pour le moment.</p>
                                                <span className="text-xs text-gray-400">Revenez plus tard !</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'comments' && (
                                    <div className="animate-fade-in">
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
                                Épisodes Similaires
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedEpisodes.map(item => (
                                    <Link to={`/episode/${item.id}`} key={item.id} className="group block" onClick={() => window.scrollTo(0, 0)}>
                                        <div className="aspect-square rounded-xl overflow-hidden mb-4 border border-gray-200 dark:border-[#333]">
                                            <img
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
        </div>
    );
}
