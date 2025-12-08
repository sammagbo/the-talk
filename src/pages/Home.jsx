import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Newsletter from '../Newsletter';
import { Mic, Instagram, Mail, X, Menu, ChevronRight, Facebook, Twitter, MapPin, ArrowUpRight, Camera, Image as ImageIcon, Upload, BookOpen, BrainCircuit, Sparkles, Bot, Loader2, Search, Coffee, Heart, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { usePushNotifications } from '../hooks/usePushNotifications';

const categories = ['Tous', 'Épisodes', 'Interviews', 'Coulisses'];

export default function Home({ items, onPlay, favorites, toggleFavorite }) {
    const { user, signInWithGoogle, logout } = useAuth();
    const { requestPermission, notificationPermission } = usePushNotifications();
    const [activeCategory, setActiveCategory] = useState('Tous');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [formStatus, setFormStatus] = useState('');

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

    // Fonction pour appeler l'API Gemini
    const generateEpisodeIdea = async (e) => {
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
                                text: `Tu es l'assistant de production IA pour le podcast "THE TALK" de Mijea Rochi. 
                Le ton est : Créatif, Visionnaire, Digital, Sophistiqué.
                L'utilisateur te donne un thème : "${aiPrompt}".
                
                Génère un concept d'épisode structuré ainsi :
                1. Titre de l'Épisode (accrocheur)
                2. Synopsis (court, intriguant, style éditorial)
                3. Trois "Talking Points" (sujets clés à aborder)
                
                Utilise des emojis pertinents. Formatte la réponse proprement.`
                            }]
                        }]
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
                <title>THE TALK | Podcast by Mijea Rochi</title>
                <meta name="description" content="Explorer la créativité et l'innovation digitale à travers des conversations authentiques. Un podcast visionnaire par Mijea Rochi." />
                <meta property="og:title" content="THE TALK | Podcast by Mijea Rochi" />
                <meta property="og:description" content="Explorer la créativité et l'innovation digitale à travers des conversations authentiques." />
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
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md border-b border-[#6C757D]/20 py-4' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                        {/* Logo Icon */}
                        <div className="bg-[#007BFF] p-2 rounded-lg">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-creativo font-bold tracking-tight leading-none">THE TALK</span>
                            <span className="text-[10px] font-minimal text-[#A9A9F5] tracking-widest uppercase">By Mijea Rochi</span>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-minimal font-medium tracking-wide">
                        <button onClick={() => scrollToSection('galerie')} className="hover:text-[#007BFF] transition-colors">ÉPISODES</button>
                        <button onClick={() => scrollToSection('ai-lab')} className="hover:text-[#007BFF] transition-colors flex items-center gap-1"><Sparkles size={14} /> AI LAB</button>
                        <button onClick={() => scrollToSection('apropos')} className="hover:text-[#007BFF] transition-colors">À PROPOS</button>
                        <button onClick={() => scrollToSection('contact')} className="hover:text-[#007BFF] transition-colors">CONTACT</button>

                        {user ? (
                            <div className="flex items-center gap-3 ml-2">
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName}
                                    className="w-8 h-8 rounded-full border border-[#333]"
                                />
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
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-black border-b border-[#6C757D]/20 p-6 flex flex-col gap-4 text-center font-minimal">
                        <button onClick={() => scrollToSection('galerie')} className="py-2 hover:text-[#007BFF]">Épisodes</button>
                        <button onClick={() => scrollToSection('ai-lab')} className="py-2 hover:text-[#007BFF]">AI Lab</button>
                        <button onClick={() => scrollToSection('apropos')} className="py-2 hover:text-[#007BFF]">À propos</button>
                        <button onClick={() => scrollToSection('contact')} className="py-2 hover:text-[#007BFF]">Contact</button>
                        <div className="flex justify-center pt-4">
                            <ThemeToggle />
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
                        A Podcast by <span className="text-black dark:text-white font-medium">Mijea Rochi</span>
                    </p>

                    <p className="text-lg text-gray-800 dark:text-white/80 mb-10 max-w-xl mx-auto font-minimal">
                        Explorer la créativité et l'innovation digitale à travers des conversations authentiques.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => scrollToSection('galerie')}
                            className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-8 py-4 rounded-lg transition-all duration-300 flex items-center gap-2 font-creativo font-bold text-lg hover:shadow-[0_0_20px_rgba(0,123,255,0.4)]"
                        >
                            Écouter Maintenant
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button className="px-8 py-4 rounded-lg border border-gray-400 dark:border-[#6C757D] text-black dark:text-white hover:border-black dark:hover:border-white transition-all font-minimal">
                            Voir le Portfolio
                        </button>
                    </div>
                </div>
            </header>

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
                                    <img
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
                                    <p className="text-gray-500 dark:text-[#6C757D] text-sm font-minimal">Disponible maintenant</p>
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

            {/* NEW: AI Creative Lab Section */}
            <section id="ai-lab" className="py-24 bg-gray-50 dark:bg-[#020202] border-t border-gray-200 dark:border-[#333]">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-[#007BFF]/10 text-[#007BFF] px-4 py-1 rounded-full mb-4 border border-[#007BFF]/20">
                            <Sparkles size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest font-minimal">Gemini AI Powered</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-creativo font-bold mb-4 text-black dark:text-white">Laboratoire Créatif</h2>
                        <p className="text-gray-600 dark:text-[#6C757D] font-minimal text-lg max-w-2xl mx-auto">
                            Utilisez notre assistant IA pour générer instantanément des concepts d'épisodes inspirés par le style éditorial de Mijea Rochi.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-[#333] p-1 overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#007BFF]/10 rounded-full blur-[80px]"></div>

                        <div className="grid md:grid-cols-5 gap-0">
                            {/* Input Area */}
                            <div className="md:col-span-2 p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-[#333] flex flex-col justify-center">
                                <div className="mb-6">
                                    <Bot className="w-10 h-10 text-[#007BFF] dark:text-[#A9A9F5] mb-4" />
                                    <h3 className="text-2xl font-creativo font-bold text-black dark:text-white mb-2">Générateur</h3>
                                    <p className="text-gray-500 dark:text-[#6C757D] text-sm">Entrez un thème, un mot-clé ou une émotion.</p>
                                </div>

                                <form onSubmit={generateEpisodeIdea} className="space-y-4">
                                    <input
                                        type="text"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="Ex: Futur de la Mode, IA et Art..."
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
                                                Générer le Concept ✨
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
                                            <span className="text-sm font-bold text-gray-500 dark:text-[#6C757D] uppercase tracking-wider">Résultat généré par l'IA</span>
                                        </div>
                                        <div className="prose prose-invert prose-p:text-gray-700 dark:prose-p:text-[#A0A0A0] prose-headings:text-black dark:prose-headings:text-white max-w-none font-minimal whitespace-pre-wrap leading-relaxed">
                                            {aiResponse}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-[#333] text-center p-8">
                                        <Sparkles className="w-16 h-16 mb-4 opacity-20" />
                                        <p className="font-creativo text-xl font-bold opacity-30">En attente d'inspiration...</p>
                                        <p className="font-minimal text-sm opacity-30 mt-2">Le résultat apparaîtra ici.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section - Updated with Mijea Rochi Identity */}
            <section id="apropos" className="py-24 bg-white dark:bg-[#020202] border-t border-gray-200 dark:border-[#333]">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="w-full md:w-1/2 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#007BFF] to-[#A9A9F5] rounded-2xl transform rotate-3 blur-sm opacity-30"></div>
                            <img
                                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
                                alt="Mijea Rochi"
                                className="w-full rounded-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-700 object-cover"
                            />

                            {/* Floating Icons */}
                            <div className="absolute -left-6 top-10 bg-white dark:bg-black border border-gray-200 dark:border-[#333] p-4 rounded-xl shadow-xl z-20">
                                <Camera className="w-6 h-6 text-[#007BFF]" />
                            </div>
                            <div className="absolute -right-6 bottom-10 bg-white dark:bg-black border border-gray-200 dark:border-[#333] p-4 rounded-xl shadow-xl z-20">
                                <BrainCircuit className="w-6 h-6 text-[#A9A9F5]" />
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 space-y-8">
                            <div>
                                <h4 className="text-[#007BFF] font-creativo font-bold text-lg mb-2">À PROPOS</h4>
                                <h2 className="text-4xl md:text-5xl font-creativo font-bold text-black dark:text-white mb-4">Mijea Rochi</h2>
                                <p className="text-[#007BFF] dark:text-[#A9A9F5] font-minimal text-xl">Creative Director & Photographer</p>
                            </div>

                            <p className="text-gray-600 dark:text-[#6C757D] leading-relaxed text-lg font-minimal">
                                THE TALK est plus qu'un podcast ; c'est un espace d'exploration. En tant que créatrice visuelle, je cherche à déconstruire les processus derrière l'innovation digitale et l'art.
                            </p>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-100 dark:bg-[#111] p-2 rounded text-black dark:text-white"><ImageIcon size={20} /></div>
                                    <div>
                                        <h5 className="text-black dark:text-white font-bold font-creativo">Curated</h5>
                                        <p className="text-sm text-gray-500 dark:text-[#6C757D]">Contenu sélectionné</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-100 dark:bg-[#111] p-2 rounded text-black dark:text-white"><BookOpen size={20} /></div>
                                    <div>
                                        <h5 className="text-black dark:text-white font-bold font-creativo">Storytelling</h5>
                                        <p className="text-sm text-gray-500 dark:text-[#6C757D]">Narrations profondes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <img
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
                            <h2 className="text-4xl md:text-5xl font-creativo font-black text-black dark:text-white mb-3">Travaillons Ensemble</h2>
                            <p className="text-gray-600 dark:text-[#6C757D] text-lg font-minimal">Vous avez un projet ou une histoire à partager ?</p>
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
                        <p className="text-gray-500 dark:text-[#6C757D] text-xs font-minimal">A Podcast by Mijea Rochi. Innovation & Creativity.</p>
                    </div>

                    <div className="flex gap-6 items-center">
                        <a href="https://www.buymeacoffee.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#FFD700] hover:text-[#FFC107] transition-colors font-minimal text-sm font-bold mr-4">
                            <Coffee size={18} />
                            <span>Soutenir</span>
                        </a>
                        <a href="#" className="text-[#6C757D] hover:text-[#007BFF] transition-colors"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="text-[#6C757D] hover:text-[#007BFF] transition-colors"><Facebook className="w-5 h-5" /></a>
                        <a href="#" className="text-[#6C757D] hover:text-[#007BFF] transition-colors"><Instagram className="w-5 h-5" /></a>
                    </div>

                    <p className="text-[#6C757D] text-xs font-minimal opacity-50">© 2025 Mijea Rochi. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
