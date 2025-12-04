import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Calendar, Share2, Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function EpisodePage({ items, onPlay, currentEpisode, isPlaying }) {
    const { id } = useParams();
    const episode = items.find(item => item.id.toString() === id);
    const [aiSummary, setAiSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

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
                                Utilise des emojis pour chaque point. Sois concis et inspirant.
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
                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">

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

                            {/* Description Placeholder */}
                            <div className="prose prose-lg max-w-none font-minimal text-gray-600 dark:text-[#A0A0A0] prose-headings:text-black dark:prose-headings:text-white prose-strong:text-black dark:prose-strong:text-white mb-12">
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
                    </div>
                </div>
            </div>
        </div>
    );
}
