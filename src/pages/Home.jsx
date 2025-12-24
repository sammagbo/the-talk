import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Newsletter from '../Newsletter';
import { Mic, Instagram, Mail, X, Menu, ChevronRight, Facebook, Twitter, MapPin, ArrowUpRight, Camera, Image as ImageIcon, Upload, BookOpen, BrainCircuit, Sparkles, Bot, Loader2, Search, Coffee, Heart, LogOut, Bell, Download, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { usePushNotifications } from '../hooks/usePushNotifications';
import LazyImage from '../components/LazyImage';
import SubscribeModal from '../components/SubscribeModal';
import ContinueListening from '../components/ContinueListening';

const categories = ['Tous', 'Épisodes', 'Interviews', 'Coulisses'];

export default function Home({ items, favorites, toggleFavorite, onPlay }) {
    const { t } = useTranslation();
    const { user, signInWithGoogle, logout } = useAuth();
    const { requestPermission, notificationPermission } = usePushNotifications();
    const [activeCategory, setActiveCategory] = useState('Tous');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [formStatus, setFormStatus] = useState('');
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

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
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    // États pour l'IA Gemini
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Gestion du scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setFormStatus('success');
        setTimeout(() => setFormStatus(''), 5000);
        setFormData({ name: '', email: '', message: '' });
    };

    const scrollToSection = (id) => {
        setIsMenuOpen(false);
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    // Fonction pour appeler l'API Gemini - Fashion Advice
    const handleFashionAdvice = async (e) => {
        e.preventDefault();
        if (!aiPrompt.trim()) return;

        setIsGenerating(true);
        setAiResponse('');

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

            if (!apiKey) {
                throw new Error("Clé API manquante. Vérifiez le fichier .env");
            }

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are Mijean Rochus, a sophisticated Fashion Director and Podcast Host of THE TALK. The user needs style advice.

User Query: "${aiPrompt}"

Provide a short, elegant, and trendy recommendation (max 3 sentences). Be specific about:
- Specific colors (e.g., "bordeaux", "nude rosé", "bleu pétrole")
- Specific pieces (e.g., "blazer oversize", "pantalon palazzo", "robe midi")
- Concrete styling tips

Tone: Professional, Chic, Visionary.
Language: French only.`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 300
                        }
                    }),
                }
            );

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            setAiResponse(text);
        } catch (error) {
            console.error("Gemini Error:", error);
            setAiResponse(`Erreur: ${error.message}. Assurez-vous d'avoir configuré la clé API.`);
        } finally {
            setIsGenerating(false);
        }
    };

    // Update filtering to use `items` prop
    const filteredItems = items.filter(item => {
        const matchesCategory = activeCategory === 'Tous' || item.category === activeCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-[#007BFF] selection:text-white transition-colors duration-300">
            <Helmet>
                <title>THE TALK | Podcast by Mijean Rochus</title>
                <meta name="description" content="Plongez dans l'univers de la mode et du mannequinat à travers des conversations exclusives. Un podcast mode par Mijean Rochus." />
                <meta property="og:title" content="THE TALK | Podcast by Mijean Rochus" />
                <meta property="og:description" content="Plongez dans l'univers de la mode et du mannequinat à travers des conversations exclusives." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80" />
                <meta property="og:type" content="website" />
            </Helmet>

            {/* Intégration des polices Google Fonts */}
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@400;700;900&display=swap');
          
          .font-creativo { font-family: 'Outfit', sans-serif; }
          .font-minimal { font-family: 'Inter', sans-serif; }
          .animate-fade-in { animation: fadeIn 0.5s ease-out; }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #111; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}
            </style>

            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md border-b border-[#6C757D]/20 py-4' : 'bg-transparent py-6'}`} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                        {/* Logo Icon */}
                        <img src="/logo.png" alt="THE TALK Logo" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex flex-col">
                            <span className="text-xl font-creativo font-bold tracking-tight leading-none">THE TALK</span>
                            <span className="text-[10px] font-minimal text-[#A9A9F5] tracking-widest uppercase">By Mijean Rochus</span>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-minimal font-medium tracking-wide">
                        <button onClick={() => scrollToSection('galerie')} className="hover:text-[#007BFF] transition-colors">{t('nav.episodes')}</button>
                        <button onClick={() => scrollToSection('apropos')} className="hover:text-[#007BFF] transition-colors">{t('nav.about')}</button>
                        <button onClick={() => scrollToSection('contact')} className="hover:text-[#007BFF] transition-colors">{t('nav.contact')}</button>
                        <button onClick={() => scrollToSection('ai-lab')} className="hover:text-[#007BFF] transition-colors flex items-center gap-1"><Sparkles size={14} /> {t('nav.ai_lab')}</button>
                        <Link to="/blog" className="hover:text-[#007BFF] transition-colors flex items-center gap-1"><BookOpen size={14} /> Blog</Link>
                        <Link to="/store" className="hover:text-[#007BFF] transition-colors flex items-center gap-1"><ShoppingBag size={14} /> Boutique</Link>
                        <button
                            onClick={() => setIsSubscribeOpen(true)}
                            className="bg-[#007BFF]/10 text-[#007BFF] px-4 py-2 rounded-full hover:bg-[#007BFF]/20 transition-colors font-bold text-xs flex items-center gap-1"
                        >
                            <Mail size={14} /> {t('subscribe.button')}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-3 ml-2">
                                <Link
                                    to={`/profile/${user.uid}`}
                                    title="View Profile"
                                    className="hover:ring-2 hover:ring-[#007BFF] rounded-full transition-all"
                                >
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName}
                                        className="w-8 h-8 rounded-full border border-[#333]"
                                    />
                                </Link>
                                <button
                                    onClick={logout}
                                    title="Se déconnecter"
                                    className="text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={signInWithGoogle}
                                className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-6 py-2.5 rounded-full transition-all transform hover:scale-105 font-bold shadow-[0_0_15px_rgba(0,123,255,0.3)]"
                            >
                                connexion
                            </button>
                        )}
                        <ThemeToggle />
                        <button
                            onClick={requestPermission}
                            className={`p-2 rounded-full transition-colors ${notificationPermission === 'granted' ? 'text-[#007BFF] bg-[#007BFF]/10' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                            title={notificationPermission === 'granted' ? 'Notifications activées' : 'Activer les notifications'}
                        >
                            <Bell size={20} fill={notificationPermission === 'granted' ? 'currentColor' : 'none'} />
                        </button>
                        {deferredPrompt && (
                            <button
                                onClick={handleInstallClick}
                                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full font-bold transition-transform hover:scale-105 ml-2"
                            >
                                <Download size={16} />
                                Instalar App
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-black border-b border-[#6C757D]/20 p-6 flex flex-col gap-4 text-center font-minimal">
                        <button onClick={() => scrollToSection('galerie')} className="py-2 hover:text-[#007BFF]">{t('nav.episodes')}</button>
                        <button onClick={() => scrollToSection('apropos')} className="py-2 hover:text-[#007BFF]">{t('nav.about')}</button>
                        <button onClick={() => scrollToSection('contact')} className="py-2 hover:text-[#007BFF]">{t('nav.contact')}</button>
                        <button onClick={() => scrollToSection('ai-lab')} className="py-2 hover:text-[#007BFF]">{t('nav.ai_lab')}</button>
                        <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="py-2 hover:text-[#007BFF] flex items-center justify-center gap-2"><BookOpen size={16} /> Blog</Link>
                        <Link to="/store" onClick={() => setIsMenuOpen(false)} className="py-2 hover:text-[#007BFF] flex items-center justify-center gap-2"><ShoppingBag size={16} /> Boutique</Link>
                        <div className="flex justify-center pt-4 gap-4">
                            <ThemeToggle />
                            {deferredPrompt && (
                                <button
                                    onClick={handleInstallClick}
                                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold transition-transform hover:scale-105"
                                >
                                    <Download size={16} />
                                    Instalar App
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <header className="relative h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black">
                {/* Abstract Digital Background */}
                <div className="absolute inset-0 z-0 bg-white dark:bg-black">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#007BFF]/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A9A9F5]/20 rounded-full blur-[100px]"></div>
                    <img
                        src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=2000&q=80"
                        alt="Digital Abstract"
                        className="w-full h-full object-cover opacity-10 dark:opacity-20 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/50 dark:from-black dark:via-transparent dark:to-black/50"></div>
                </div>

                <div className="relative z-10 text-center px-4 animate-fade-in-up max-w-4xl mx-auto">
                    <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#007BFF]/30 bg-[#007BFF]/10 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-[#007BFF] animate-pulse"></span>
                        <span className="text-xs font-minimal text-[#A9A9F5] tracking-widest uppercase">Nouvel Épisode Disponible</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-creativo font-black mb-6 tracking-tight leading-tight">
                        THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007BFF] to-[#A9A9F5]">TALK</span>
                    </h1>

                    <p className="text-xl md:text-2xl font-minimal text-gray-600 dark:text-[#6C757D] mb-4 max-w-2xl mx-auto font-light">
                        A Podcast by <span className="text-black dark:text-white font-medium">Mijean Rochus</span>
                    </p>

                    <p className="text-lg text-gray-800 dark:text-white/80 mb-10 max-w-xl mx-auto font-minimal">
                        Plongez dans l'univers de la mode et du mannequinat à travers des conversations exclusives.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => scrollToSection('galerie')}
                            className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-8 py-4 rounded-lg transition-all duration-300 flex items-center gap-2 font-creativo font-bold text-lg hover:shadow-[0_0_20px_rgba(0,123,255,0.4)]"
                        >
                            Écouter Maintenant
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scrollToSection('apropos')}
                            className="px-8 py-4 rounded-lg border border-gray-400 dark:border-[#6C757D] text-black dark:text-white hover:border-black dark:hover:border-white transition-all font-minimal"
                        >
                            {t('hero.about_host')}
                        </button>
                    </div>
                </div>
            </header>

            {/* Continue Listening Section */}
            <ContinueListening onPlay={onPlay} />

            {/* Gallery Section (Episodes) */}
            <section id="galerie" className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-creativo font-bold mb-4">Épisodes Récents</h2>
                        <div className="h-1.5 w-24 bg-gradient-to-r from-[#007BFF] to-[#A9A9F5] rounded-full"></div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher un épisode..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-full px-5 py-2.5 pl-10 text-black dark:text-white focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] transition-all font-minimal w-full md:w-64"
                            />
                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#6C757D] w-4 h-4" />
                        </div>

                        {/* Categories Filter */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-minimal transition-all duration-300 border ${activeCategory === cat
                                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white font-bold'
                                        : 'bg-transparent text-gray-500 border-gray-300 dark:text-[#6C757D] dark:border-[#6C757D]/30 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="group relative overflow-hidden rounded-2xl cursor-pointer bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] hover:border-[#007BFF]/50 transition-all duration-300 block"
                        >
                            <Link to={`/episode/${item.id}`} className="block">
                                <div className="aspect-[4/3] overflow-hidden">
                                    <LazyImage
                                        src={item.src}
                                        alt={item.title}
                                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                    />
                                </div>
                            </Link>
                            <div className="p-6 relative">
                                <Link to={`/episode/${item.id}`} className="block">
                                    <div className="absolute -top-6 right-6 bg-[#007BFF] p-3 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 pointer-events-none">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <p className="text-[#007BFF] text-xs font-creativo font-bold uppercase tracking-widest mb-2">{item.category}</p>
                                    <h3 className="text-xl font-creativo font-bold text-black dark:text-white mb-1 group-hover:text-[#007BFF] dark:group-hover:text-[#A9A9F5] transition-colors">{item.title}</h3>
                                    <p className="text-gray-500 dark:text-[#6C757D] text-sm font-minimal">{t('gallery.available_now')}</p>
                                </Link>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleFavorite(item.id);
                                    }}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:scale-110 transition-transform z-10"
                                >
                                    <Heart
                                        size={20}
                                        fill={favorites.includes(item.id) ? "red" : "none"}
                                        className={favorites.includes(item.id) ? "text-red-500" : "text-white"}
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* About Section */}
            <section id="apropos" className="py-24 bg-white dark:bg-[#020202] border-t border-gray-200 dark:border-[#333]">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="w-full md:w-1/2 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#007BFF] to-[#A9A9F5] rounded-2xl transform rotate-3 blur-sm opacity-30"></div>
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full rounded-2xl relative z-10 object-cover aspect-[3/4]"
                                poster="https://images.pexels.com/videos/9512045/pexels-photo-9512045.jpeg?auto=compress&cs=tinysrgb&w=800"
                            >
                                <source src="https://videos.pexels.com/video-files/9512045/9512045-uhd_2560_1440_25fps.mp4" type="video/mp4" />
                                {/* Fallback image if video doesn't load */}
                                <img
                                    src="https://images.pexels.com/videos/9512045/pexels-photo-9512045.jpeg?auto=compress&cs=tinysrgb&w=800"
                                    alt="Fashion Runway"
                                    className="w-full rounded-2xl object-cover"
                                />
                            </video>
                        </div>

                        <div className="w-full md:w-1/2 space-y-8">
                            <div>
                                <h4 className="text-[#007BFF] font-creativo font-bold text-lg mb-2">{t('about.title')}</h4>
                                <h2 className="text-4xl md:text-5xl font-creativo font-bold text-black dark:text-white mb-4">Mijean Rochus</h2>
                                <p className="text-[#007BFF] dark:text-[#A9A9F5] font-minimal text-xl">{t('about.role')}</p>
                            </div>

                            <p className="text-gray-600 dark:text-[#6C757D] leading-relaxed text-lg font-minimal">
                                {t('about.description')}
                            </p>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-100 dark:bg-[#111] p-2 rounded text-black dark:text-white"><ShoppingBag size={20} /></div>
                                    <div>
                                        <h5 className="text-black dark:text-white font-bold font-creativo">{t('about.curated')}</h5>
                                        <p className="text-sm text-gray-500 dark:text-[#6C757D]">{t('about.curated_sub')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-100 dark:bg-[#111] p-2 rounded text-black dark:text-white"><Mic size={20} /></div>
                                    <div>
                                        <h5 className="text-black dark:text-white font-bold font-creativo">{t('about.storytelling')}</h5>
                                        <p className="text-sm text-gray-500 dark:text-[#6C757D]">{t('about.storytelling_sub')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <LazyImage
                                    src="https://fakeimg.pl/200x60/000000/ffffff/?text=Mijea+Rochi&font=lobster"
                                    alt="Signature"
                                    className="h-12 opacity-50 invert"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 relative overflow-hidden bg-white dark:bg-black border-t border-gray-200 dark:border-[#333]">
                <div className="container mx-auto px-6 max-w-5xl relative z-10">

                    {/* New Contact Header Card based on references */}
                    <div className="bg-gray-50 dark:bg-[#020202] p-10 rounded-3xl border border-gray-200 dark:border-[#333] mb-12 flex flex-col md:flex-row items-center justify-between group hover:border-[#007BFF]/50 transition-all duration-500 shadow-2xl">
                        <div className="mb-6 md:mb-0">
                            <h2 className="text-4xl md:text-5xl font-creativo font-black text-black dark:text-white mb-3">{t('contact.title')}</h2>
                            <p className="text-gray-600 dark:text-[#6C757D] text-lg font-minimal">{t('contact.subtitle')}</p>
                        </div>
                        {/* The Icon Circle */}
                        <div className="bg-gradient-to-tr from-[#007BFF] to-[#0056b3] p-6 rounded-full group-hover:scale-110 group-hover:rotate-45 transition-all duration-500 shadow-lg shadow-[#007BFF]/30 cursor-pointer">
                            <ArrowUpRight className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">

                        {/* Contact Info */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-5 group cursor-pointer">
                                    <div className="bg-gray-100 dark:bg-[#111] p-4 rounded-xl text-[#007BFF] group-hover:bg-[#007BFF] group-hover:text-white transition-colors">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-black dark:text-white font-creativo font-bold text-lg">Email</h4>
                                        <p className="text-gray-500 dark:text-[#6C757D]">contact@mijearochi.com</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 group cursor-pointer">
                                    <div className="bg-gray-100 dark:bg-[#111] p-4 rounded-xl text-[#007BFF] group-hover:bg-[#007BFF] group-hover:text-white transition-colors">
                                        <Instagram className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-black dark:text-white font-creativo font-bold text-lg">Social</h4>
                                        <p className="text-gray-500 dark:text-[#6C757D]">@thetalk_podcast</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 group cursor-pointer">
                                    <div className="bg-gray-100 dark:bg-[#111] p-4 rounded-xl text-[#007BFF] group-hover:bg-[#007BFF] group-hover:text-white transition-colors">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-black dark:text-white font-creativo font-bold text-lg">Studio</h4>
                                        <p className="text-gray-500 dark:text-[#6C757D]">Paris, France</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleFormSubmit} className="bg-gray-50 dark:bg-[#020202] p-8 rounded-2xl border border-gray-200 dark:border-[#333] space-y-5">
                            {formStatus === 'success' && (
                                <div className="bg-[#007BFF]/10 text-[#007BFF] p-4 rounded-lg text-sm font-minimal border border-[#007BFF]/20">
                                    Message envoyé. Merci de nous contacter.
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs text-[#6C757D] uppercase tracking-wider font-bold ml-1">Nom</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-lg px-4 py-3.5 text-black dark:text-white focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] transition-all font-minimal"
                                    placeholder="Mijea..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-[#6C757D] uppercase tracking-wider font-bold ml-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-lg px-4 py-3.5 text-black dark:text-white focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] transition-all font-minimal"
                                    placeholder="hello@exemple.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-[#6C757D] uppercase tracking-wider font-bold ml-1">Message</label>
                                <textarea
                                    rows="4"
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-lg px-4 py-3.5 text-black dark:text-white focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] transition-all resize-none font-minimal"
                                    placeholder="Votre message..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#007BFF] hover:bg-[#0069d9] text-white font-creativo font-bold py-4 rounded-lg transition-all shadow-lg shadow-[#007BFF]/20 mt-2"
                            >
                                ENVOYER LE MESSAGE
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Fashion Consultant AI Section */}
            <section id="ai-lab" className="py-24 bg-gray-50 dark:bg-[#020202] border-t border-gray-200 dark:border-[#333]">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-[#007BFF]/10 text-[#007BFF] px-4 py-1 rounded-full mb-4 border border-[#007BFF]/20">
                            <Sparkles size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest font-minimal">Consultante de Mode</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-creativo font-bold mb-4 text-black dark:text-white">Conseil de Style & Tendances</h2>
                        <p className="text-gray-600 dark:text-[#6C757D] font-minimal text-lg max-w-2xl mx-auto">
                            Une question de style ? Un doute sur une tenue ? Demandez l'avis de notre IA experte en mode.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-[#333] p-1 overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#007BFF]/10 rounded-full blur-[80px]"></div>

                        <div className="grid md:grid-cols-5 gap-0">
                            {/* Input Area */}
                            <div className="md:col-span-2 p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-[#333] flex flex-col justify-center">
                                <div className="mb-6">
                                    <Sparkles className="w-10 h-10 text-[#007BFF] dark:text-[#A9A9F5] mb-4" />
                                    <h3 className="text-2xl font-creativo font-bold text-black dark:text-white mb-2">Posez votre question</h3>
                                    <p className="text-gray-500 dark:text-[#6C757D] text-sm">Décrivez votre défi mode ou look.</p>
                                </div>

                                <form onSubmit={handleFashionAdvice} className="space-y-4">
                                    <input
                                        type="text"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="Ex: Quelle tenue pour un vernissage ?"
                                        className="w-full bg-gray-50 dark:bg-[#020202] border border-gray-200 dark:border-[#333] rounded-xl px-4 py-4 text-black dark:text-white focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] transition-all font-minimal placeholder:text-gray-400 dark:placeholder:text-[#444]"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isGenerating || !aiPrompt.trim()}
                                        className="w-full bg-gradient-to-r from-[#007BFF] to-[#0056b3] text-white font-creativo font-bold py-4 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,123,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} /> Génération...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={18} /> Obtenir Conseil
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Output Area */}
                            <div className="md:col-span-3 p-8 bg-gray-50/50 dark:bg-[#020202]/50 min-h-[400px] flex flex-col relative">
                                {aiResponse ? (
                                    <div className="animate-fade-in h-full overflow-y-auto custom-scrollbar">
                                        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-[#333] pb-4">
                                            <BrainCircuit className="text-[#007BFF]" size={20} />
                                            <span className="text-sm font-bold text-gray-500 dark:text-[#6C757D] uppercase tracking-wider">Conseil de Mijean</span>
                                        </div>
                                        <div className="prose prose-invert prose-p:text-gray-700 dark:prose-p:text-[#A0A0A0] prose-headings:text-black dark:prose-headings:text-white max-w-none font-minimal whitespace-pre-wrap leading-relaxed">
                                            {aiResponse}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-[#333] text-center p-8">
                                        <Sparkles className="w-16 h-16 mb-4 opacity-20" />
                                        <p className="font-creativo text-xl font-bold opacity-30">En attente de votre question...</p>
                                        <p className="font-minimal text-sm opacity-30 mt-2">Le conseil de mode apparaîtra ici.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-24 bg-gray-50 dark:bg-[#050505] border-t border-gray-200 dark:border-[#333]">
                <div className="container mx-auto px-6 text-center max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-creativo font-bold text-black dark:text-white mb-4">Restez Inspiré</h2>
                    <p className="text-gray-600 dark:text-[#6C757D] font-minimal text-lg mb-10">
                        Rejoignez notre communauté de créatifs et recevez les derniers épisodes et insights directement dans votre boîte mail.
                    </p>
                    <Newsletter />
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-[#020202] py-10 border-t border-gray-200 dark:border-[#222]">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-2">
                            <Mic className="w-5 h-5 text-[#007BFF]" />
                            <span className="text-black dark:text-white font-creativo font-bold tracking-tight">THE TALK</span>
                        </div>
                        <p className="text-gray-500 dark:text-[#6C757D] text-xs font-minimal">A Podcast by Mijean Rochus. Innovation & Creativity.</p>
                        <div className="mt-4">
                            <LanguageSwitcher />
                        </div>
                    </div>

                    <div className="flex gap-6 items-center">
                        <a href="https://www.buymeacoffee.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#FFD700] hover:text-[#FFC107] transition-colors font-minimal text-sm font-bold mr-4">
                            <Coffee size={18} />
                            <span>{t('footer.support')}</span>
                        </a>
                        <a href="#" className="text-[#6C757D] hover:text-[#007BFF] transition-colors"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="text-[#6C757D] hover:text-[#007BFF] transition-colors"><Facebook className="w-5 h-5" /></a>
                        <a href="#" className="text-[#6C757D] hover:text-[#007BFF] transition-colors"><Instagram className="w-5 h-5" /></a>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-[#6C757D] text-xs font-minimal opacity-50">© 2025 Mijean Rochus. All Rights Reserved.</p>
                        <p className="text-[#6C757D] text-xs font-minimal opacity-40 mt-1 flex items-center justify-center md:justify-end gap-1">
                            Developed with <span className="text-red-500">♥</span> by{' '}
                            <a
                                href="https://www.linkedin.com/in/sam-magbo-02086555/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#007BFF] hover:text-[#A9A9F5] transition-colors font-medium"
                            >
                                Magbo Studio
                            </a>
                        </p>
                    </div>
                </div>
            </footer>

            {/* Subscribe Modal */}
            <SubscribeModal
                isOpen={isSubscribeOpen}
                onClose={() => setIsSubscribeOpen(false)}
            />
        </div>
    );
}

