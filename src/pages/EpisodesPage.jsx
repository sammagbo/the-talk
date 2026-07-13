import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import {
    Headphones,
    Video,
    Play,
    Search,
    Film,
    X,
    ArrowLeft,
    Clock,
    ChevronRight
} from 'lucide-react';
import LazyImage from '../components/LazyImage';
import Navbar from '../components/Navbar';
import { client } from '../sanity';

const categories = ['Tous', 'Épisodes', 'Interviews', 'Coulisses'];

export default function EpisodesPage({ items, onPlay }) {


    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tous');
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    // Shorts state
    const [shorts, setShorts] = useState([]);
    const [selectedShort, setSelectedShort] = useState(null);
    const [hoveredShort, setHoveredShort] = useState(null);
    const videoRef = useRef(null);

    // Fetch shorts from Sanity
    useEffect(() => {
        const fetchShorts = async () => {
            try {
                const query = `*[_type == "short"] | order(publishedAt desc)[0...10] {
                    _id,
                    title,
                    videoUrl,
                    "thumbnailUrl": thumbnail.asset->url,
                    publishedAt
                }`;
                const data = await client.fetch(query);
                setShorts(data);
            } catch (error) {
                console.error("Error fetching shorts:", error);
            }
        };
        fetchShorts();
    }, []);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Auto-play short when opened
    useEffect(() => {
        if (selectedShort && videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay blocked:", e));
        }
    }, [selectedShort]);

    // Handle video end in shorts modal
    const handleVideoEnded = () => {
        if (!selectedShort || shorts.length === 0) return;
        const currentIndex = shorts.findIndex(s => s._id === selectedShort._id);
        if (currentIndex !== -1 && currentIndex < shorts.length - 1) {
            setSelectedShort(shorts[currentIndex + 1]);
        } else {
            setSelectedShort(shorts[0]);
        }
    };

    // PWA install prompt
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
    };

    // Filter episodes
    const filteredItems = items.filter(item => {
        const matchesCategory = activeCategory === 'Tous' || item.category === activeCategory;
        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Determine if episode has video
    const hasVideo = (item) => !!item.videoUrl;

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-[#007BFF] selection:text-white transition-colors duration-300">
            <Helmet>
                <title>Épisodes | THE TALK</title>
                <meta name="description" content="Tous les épisodes de THE TALK — conversations exclusives sur la mode et le mannequinat. Vidéo et audio réunis." />
                <meta property="og:title" content="Épisodes | THE TALK" />
                <meta property="og:description" content="Découvrez tous les épisodes du podcast THE TALK par Mijean Rochus." />
                <meta property="og:type" content="website" />
            </Helmet>

            {/* Fonts */}
            <style>
                {`
                    .font-creativo { font-family: 'Outfit', sans-serif; }
                    .font-minimal { font-family: 'Inter', sans-serif; }
                `}
            </style>

            {/* Navigation */}
            <Navbar
                onScrollToSection={() => {}}
                deferredPrompt={deferredPrompt}
                onInstallClick={handleInstallClick}
            />

            {/* Page Header */}
            <header className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#6C757D] font-minimal mb-8">
                    <Link to="/" className="hover:text-[#007BFF] transition-colors">Home</Link>
                    <ChevronRight size={14} />
                    <span className="text-black dark:text-white font-bold">Épisodes</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-gradient-to-tr from-[#007BFF] to-[#A9A9F5] p-2.5 rounded-xl text-white">
                                <Headphones size={24} />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-creativo font-black tracking-tight">
                                Épisodes
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-[#6C757D] font-minimal text-lg max-w-xl">
                            Tout le contenu THE TALK en un lieu — vidéo et audio réunis.
                        </p>
                        <div className="h-1.5 w-16 bg-gradient-to-r from-[#007BFF] to-[#A9A9F5] rounded-full mt-4"></div>
                    </div>

                    {/* Episode Count Badge */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#111] rounded-full border border-gray-200 dark:border-[#333]">
                        <span className="w-2 h-2 rounded-full bg-[#007BFF] animate-pulse"></span>
                        <span className="text-sm font-mono text-gray-600 dark:text-[#6C757D]">
                            {items.length} épisode{items.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Search + Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            placeholder="Rechercher un épisode..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-full px-5 py-3 pl-11 text-black dark:text-white focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] transition-all font-minimal"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6C757D] w-4 h-4" />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2.5 rounded-full text-sm font-minimal transition-all border ${activeCategory === cat
                                    ? 'bg-[#007BFF] text-white border-[#007BFF] font-bold shadow-lg shadow-[#007BFF]/20'
                                    : 'bg-transparent text-gray-500 border-gray-300 dark:text-[#6C757D] dark:border-[#6C757D]/30 hover:border-[#007BFF] hover:text-[#007BFF]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main id="main-content">
                {/* SHORTS Strip */}
                {shorts.length > 0 && (
                    <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
                        <div className="flex items-center gap-3 mb-5">
                            <Film className="w-5 h-5 text-[#FF0050]" />
                            <h2 className="text-lg font-creativo font-bold uppercase tracking-wider">Shorts</h2>
                            <div className="h-px flex-1 bg-gray-200 dark:bg-[#333]"></div>
                        </div>

                        <div
                            className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {shorts.map((short) => (
                                <div
                                    key={short._id}
                                    className="snap-start shrink-0 w-32 md:w-40 cursor-pointer group relative"
                                    onMouseEnter={() => setHoveredShort(short._id)}
                                    onMouseLeave={() => setHoveredShort(null)}
                                    onClick={() => setSelectedShort(short)}
                                >
                                    <div className="aspect-[9/16] rounded-xl overflow-hidden bg-gray-900 border border-gray-200 dark:border-[#333] group-hover:border-[#FF0050] transition-all duration-300 relative">
                                        {hoveredShort === short._id && short.videoUrl ? (
                                            <video
                                                src={short.videoUrl}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={short.thumbnailUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80'}
                                                alt={short.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/50 to-transparent">
                                            <p className="text-white text-xs font-bold line-clamp-2">{short.title}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Episodes Grid */}
                <section className="px-4 md:px-8 max-w-7xl mx-auto pb-32">
                    {/* Results info */}
                    {(searchQuery || activeCategory !== 'Tous') && (
                        <div className="mb-6 flex items-center gap-3">
                            <span className="text-sm text-gray-500 dark:text-[#6C757D] font-minimal">
                                {filteredItems.length} résultat{filteredItems.length !== 1 ? 's' : ''}
                                {searchQuery && <> pour "<span className="text-black dark:text-white font-bold">{searchQuery}</span>"</>}
                                {activeCategory !== 'Tous' && <> dans <span className="text-[#007BFF] font-bold">{activeCategory}</span></>}
                            </span>
                            {(searchQuery || activeCategory !== 'Tous') && (
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveCategory('Tous'); }}
                                    className="text-xs text-[#007BFF] hover:underline font-minimal"
                                >
                                    Réinitialiser
                                </button>
                            )}
                        </div>
                    )}

                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#111] flex items-center justify-center mb-6">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-creativo font-bold mb-2">Aucun épisode trouvé</h3>
                            <p className="text-gray-500 dark:text-[#6C757D] font-minimal max-w-md">
                                Essayez de modifier vos filtres ou votre recherche.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="group relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] hover:border-[#007BFF]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#007BFF]/5"
                                >
                                    {/* Thumbnail */}
                                    <Link to={`/episode/${item.id}`} className="block">
                                        <div className="aspect-video overflow-hidden relative">
                                            <LazyImage
                                                src={item.src}
                                                alt={item.title}
                                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                                            />

                                            {/* Dark overlay on hover */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>

                                            {/* Type Badge */}
                                            <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                                hasVideo(item)
                                                    ? 'bg-[#007BFF] text-white'
                                                    : 'bg-[#A9A9F5] text-white'
                                            }`}>
                                                {hasVideo(item) ? (
                                                    <><Video size={10} /> Vidéo</>
                                                ) : (
                                                    <><Headphones size={10} /> Audio</>
                                                )}
                                            </div>

                                            {/* HUD Badge */}
                                            <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
                                                <span className="text-[10px] font-mono text-white/90 tracking-wider">
                                                    EP.{String(index + 1).padStart(3, '0')} // {item.duration || '45:00'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Info + Play */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <Link to={`/episode/${item.id}`} className="block flex-1 min-w-0">
                                                <p className="text-[#007BFF] text-xs font-creativo font-bold uppercase tracking-widest mb-1.5">{item.category}</p>
                                                <h3 className="text-lg font-creativo font-bold text-black dark:text-white group-hover:text-[#007BFF] transition-colors leading-snug line-clamp-2">
                                                    {item.title}
                                                </h3>
                                                {item.date && (
                                                    <p className="text-xs text-gray-400 dark:text-[#6C757D] font-minimal mt-2 flex items-center gap-1.5">
                                                        <Clock size={11} />
                                                        {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                )}
                                            </Link>

                                            {/* Play Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onPlay({ ...item, id: item.id });
                                                }}
                                                className="shrink-0 w-12 h-12 rounded-full bg-[#007BFF] hover:bg-[#0069d9] flex items-center justify-center text-white shadow-lg shadow-[#007BFF]/20 hover:shadow-[#007BFF]/40 transition-all hover:scale-110 active:scale-95"
                                                aria-label={`Écouter ${item.title}`}
                                            >
                                                <Play size={18} fill="currentColor" className="ml-0.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Shorts Full-Screen Modal */}
            {selectedShort && (
                <div
                    className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
                    onClick={() => setSelectedShort(null)}
                >
                    <button
                        onClick={() => setSelectedShort(null)}
                        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    <div
                        className="relative w-full max-w-md h-[90vh] max-h-[800px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {selectedShort.videoUrl?.includes('youtube') || selectedShort.videoUrl?.includes('youtu.be') ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedShort.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || ''}?autoplay=1`}
                                className="w-full h-full rounded-2xl"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video
                                ref={videoRef}
                                src={selectedShort.videoUrl}
                                autoPlay
                                controls
                                playsInline
                                onEnded={handleVideoEnded}
                                className="w-full h-full object-contain rounded-2xl"
                            />
                        )}

                        <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h3 className="text-xl font-bold">{selectedShort.title}</h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
