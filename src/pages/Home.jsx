import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Newsletter from '../Newsletter';
import { Mic, Instagram, Mail, ChevronRight, Facebook, Twitter, MapPin, ArrowUpRight, ArrowRight, Camera, Image as ImageIcon, Upload, BookOpen, BrainCircuit, Sparkles, Bot, Loader2, Search, Coffee, Heart, Calendar, Video, Headphones, Play, Film, X, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import LazyImage from '../components/LazyImage';
import SubscribeModal from '../components/SubscribeModal';
import ContinueListening from '../components/ContinueListening';
import Navbar from '../components/Navbar';
import { client, urlFor } from '../sanity';
import { handleBuy } from '../lib/stripe';
import { useGSAP, gsap, ScrollTrigger } from '../hooks/useGSAP';
import MagneticButton from '../components/MagneticButton';


const categories = ['Tous', 'Épisodes', 'Interviews', 'Coulisses'];

// Video Carousel Component for Hero Background
const videoSources = [
    {
        src: "/videos/Carrousel.mp4",
        poster: "" // Local video, should load fast enough to not need poster
    },
    {
        src: "https://cdn.pixabay.com/video/2019/07/14/25245-348376973_large.mp4",
        poster: "https://i.vimeocdn.com/video/799899087-5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e?mw=1920"
    }
];

function VideoCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % videoSources.length);
        }, 8000); // Switch every 8 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {videoSources.map((video, index) => (
                <video
                    key={index}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={video.poster}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === activeIndex
                        ? 'opacity-30 dark:opacity-40'
                        : 'opacity-0'
                        }`}
                    style={{ zIndex: index === activeIndex ? 1 : 0 }}
                >
                    <source src={video.src} type="video/mp4" />
                </video>
            ))}
            {/* Video Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
                {videoSources.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex
                            ? 'bg-[#007BFF] w-6'
                            : 'bg-white/30 hover:bg-white/50'
                            }`}
                        aria-label={`Video ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}


export default function Home({ items, favorites, toggleFavorite, onPlay }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [activeCategory, setActiveCategory] = useState('Tous');
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [formStatus, setFormStatus] = useState('');
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
    const [blogPosts, setBlogPosts] = useState([]);

    // Shorts state
    const [shorts, setShorts] = useState([]);
    const [selectedShort, setSelectedShort] = useState(null);
    const [hoveredShort, setHoveredShort] = useState(null);
    const videoRef = useRef(null);
    const heroRef = useRef(null);

    // GSAP Animations
    useGSAP(() => {
        // Hero section animations
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        heroTl
            .from('.gsap-hero-badge', { y: -30, opacity: 0, duration: 0.8 })
            .from('.gsap-hero-title', { y: 80, opacity: 0, duration: 1.2 }, '-=0.4')
            .from('.gsap-hero-subtitle', { y: 40, opacity: 0, duration: 0.8 }, '-=0.6')
            .from('.gsap-hero-description', { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
            .from('.gsap-hero-ctas button', { y: 30, opacity: 0, duration: 0.6, stagger: 0.15 }, '-=0.4')
            .from('.gsap-hero-stats > div', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.3');

        // Scroll-triggered section animations
        const sections = gsap.utils.toArray('.gsap-section');
        sections.forEach((section) => {
            gsap.from(section, {
                y: 60,
                opacity: 0,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
            });
        });

        // Card stagger animations
        gsap.utils.toArray('.gsap-cards').forEach((container) => {
            gsap.from(container.querySelectorAll('.gsap-card'), {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: container,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
            });
        });

        // Parallax effect for About section
        gsap.utils.toArray('.gsap-parallax').forEach((element) => {
            gsap.to(element, {
                yPercent: -20,
                ease: 'none',
                scrollTrigger: {
                    trigger: element,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });
        });

    }, []);


    // Handle video end - Auto advance
    const handleVideoEnded = () => {
        if (!selectedShort || shorts.length === 0) return;

        const currentIndex = shorts.findIndex(s => s._id === selectedShort._id);
        if (currentIndex !== -1 && currentIndex < shorts.length - 1) {
            // Play next
            setSelectedShort(shorts[currentIndex + 1]);
        } else if (currentIndex === shorts.length - 1) {
            // Loop back to start or close? Let's loop.
            setSelectedShort(shorts[0]);
        }
    };

    // Auto-play short when opened
    useEffect(() => {
        if (selectedShort && videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay blocked:", e));
        }
    }, [selectedShort]);

    // Fetch latest blog posts for homepage preview
    useEffect(() => {
        const fetchBlogPosts = async () => {
            try {
                const query = `*[_type == "post"] | order(publishedAt desc)[0...3] {
                    _id,
                    title,
                    slug,
                    excerpt,
                    mainImage,
                    publishedAt,
                    "imageUrl": mainImage.asset->url
                }`;
                const data = await client.fetch(query);
                setBlogPosts(data);
            } catch (error) {
                console.error("Error fetching blog posts:", error);
            }
        };
        fetchBlogPosts();
    }, []);

    // Fetch shorts
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

    // États pour le Store Preview
    const [products, setProducts] = useState([]);

    // Fetch limited products for Home
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const query = `*[_type == "product"] | order(_createdAt desc)[0..2] {
                    _id,
                    title,
                    price,
                    description,
                    stripePriceId,
                    "imageUrl": image.asset->url
                }`;
                const data = await client.fetch(query);
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setFormStatus('success');
        setTimeout(() => setFormStatus(''), 5000);
        setFormData({ name: '', email: '', message: '' });
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };



    // Update filtering to use `items` prop
    const filteredItems = items.filter(item => {
        const matchesCategory = activeCategory === 'Tous' || item.category === activeCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Separate video and audio content
    const videoCategories = ['Coulisses', 'Interviews', 'Vidéos'];
    const audioCategories = ['Épisodes'];

    const videoItems = items.filter(item =>
        videoCategories.some(cat => item.category?.toLowerCase().includes(cat.toLowerCase()))
    );

    const audioItems = items.filter(item =>
        audioCategories.some(cat => item.category?.toLowerCase().includes(cat.toLowerCase())) ||
        !videoCategories.some(cat => item.category?.toLowerCase().includes(cat.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-[#007BFF] selection:text-white transition-colors duration-300">
            <Helmet>
                <title>THE TALK | Podcast by Mijean Rochus</title>
                <meta name="description" content="Plongez dans l'univers de la mode et du mannequinat à travers des conversations exclusives. Un podcast mode par Mijean Rochus." />
                <meta property="og:title" content="THE TALK | Podcast by Mijean Rochus" />
                <meta property="og:description" content="Plongez dans l'univers de la mode et du mannequinat à travers des conversations exclusives." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80" />
                <meta property="og:type" content="website" />
                {/* Schema.org Structured Data for Podcast */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "PodcastSeries",
                        "name": "THE TALK",
                        "description": "Plongez dans l'univers de la mode et du mannequinat à travers des conversations exclusives.",
                        "url": "https://the-talk-podcast.vercel.app",
                        "author": {
                            "@type": "Person",
                            "name": "Mijean Rochus",
                            "jobTitle": "Fashion Photographer & Podcast Host"
                        },
                        "image": "https://the-talk-podcast.vercel.app/logo.png",
                        "inLanguage": "fr-FR",
                        "genre": ["Fashion", "Lifestyle", "Mode"],
                        "publisher": {
                            "@type": "Organization",
                            "name": "THE TALK Podcast",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://the-talk-podcast.vercel.app/logo.png"
                            }
                        }
                    })}
                </script>
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
            <Navbar
                onScrollToSection={scrollToSection}
                onOpenSubscribe={() => setIsSubscribeOpen(true)}
                deferredPrompt={deferredPrompt}
                onInstallClick={handleInstallClick}
            />


            {/* Hero Section */}
            <header className="relative h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black">
                {/* Abstract Digital Background */}
                <div className="absolute inset-0 z-0 bg-white dark:bg-black">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#007BFF]/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A9A9F5]/20 rounded-full blur-[100px]"></div>
                    {/* Video Carousel - Crossfade between fashion videos */}
                    <VideoCarousel />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/50 dark:from-black dark:via-transparent dark:to-black/50"></div>
                    {/* Film Grain Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>
                    {/* Edge Glow Effect */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-[#007BFF]/20 blur-[120px]"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#A9A9F5]/20 blur-[120px]"></div>
                    </div>

                    {/* Vogue Pixel Decoration - EMMPO/VOGUE Glitch */}
                    <div className="absolute top-32 right-4 md:right-10 hidden md:block opacity-60 text-[#007BFF] animate-pulse z-20">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="currentColor">
                            <rect x="0" y="0" width="20" height="20" />
                            <rect x="20" y="20" width="20" height="20" />
                            <rect x="40" y="0" width="20" height="20" />
                            <rect x="0" y="40" width="20" height="20" />
                            <rect x="40" y="40" width="20" height="20" />
                        </svg>
                    </div>
                    <div className="absolute bottom-32 left-4 md:left-10 hidden md:block opacity-60 text-[#A9A9F5] z-20">
                        <svg width="40" height="40" viewBox="0 0 60 40" fill="currentColor">
                            <rect x="0" y="20" width="20" height="20" />
                            <rect x="20" y="0" width="20" height="20" />
                            <rect x="40" y="20" width="20" height="20" />
                        </svg>
                    </div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <div className="gsap-hero-badge mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#007BFF]/30 bg-[#007BFF]/10 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-[#007BFF] animate-pulse"></span>
                        <span className="text-xs font-minimal text-[#A9A9F5] tracking-widest uppercase">{t('hero.new_episode')}</span>
                    </div>

                    <h1 className="gsap-hero-title text-6xl md:text-8xl font-creativo font-black mb-6 tracking-[0.08em] leading-tight uppercase">
                        THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007BFF] to-[#A9A9F5]">TALK</span>
                    </h1>

                    <p className="gsap-hero-subtitle text-xl md:text-2xl font-minimal text-gray-600 dark:text-[#6C757D] mb-4 max-w-2xl mx-auto font-light flex items-center justify-center gap-2">
                        A Podcast by <span className="font-editorial italic text-3xl text-black dark:text-white">Mijean Rochus</span>
                    </p>

                    <p className="gsap-hero-description text-lg text-gray-800 dark:text-white/80 mb-10 max-w-xl mx-auto font-minimal leading-relaxed">
                        {t('hero.description')}
                    </p>

                    <div className="gsap-hero-ctas flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <MagneticButton
                            onClick={() => scrollToSection('galerie')}
                            className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-8 py-4 rounded-lg transition-all duration-300 flex items-center gap-2 font-mono font-bold text-sm tracking-wider hover:shadow-[0_0_20px_rgba(0,123,255,0.4)] w-full sm:w-auto justify-center uppercase"
                        >
                            [ {t('hero.listen_now', 'ÉCOUTER')} ]
                            <ChevronRight className="w-4 h-4" />
                        </MagneticButton>
                        <MagneticButton
                            onClick={() => setIsSubscribeOpen(true)}
                            className="bg-gradient-to-r from-[#A9A9F5] to-[#007BFF] hover:opacity-90 text-white px-8 py-4 rounded-lg transition-all duration-300 flex items-center gap-2 font-mono font-bold text-sm tracking-wider w-full sm:w-auto justify-center uppercase"
                        >
                            <Mail className="w-4 h-4" />
                            [ {t('subscribe.button', "S'ABONNER")} ]
                        </MagneticButton>
                    </div>

                    {/* Quick Stats */}
                    <div className="gsap-hero-stats flex flex-wrap justify-center gap-8 mt-10 text-center">
                        <div>
                            <p className="text-3xl font-creativo font-bold text-[#007BFF]">50+</p>
                            <p className="text-sm text-gray-500 dark:text-[#6C757D] font-minimal">{t('hero.episodes', 'Épisodes')}</p>
                        </div>
                        <div>
                            <p className="text-3xl font-creativo font-bold text-[#A9A9F5]">10K+</p>
                            <p className="text-sm text-gray-500 dark:text-[#6C757D] font-minimal">{t('hero.listeners', 'Auditeurs')}</p>
                        </div>
                        <div>
                            <p className="text-3xl font-creativo font-bold text-[#007BFF]">5★</p>
                            <p className="text-sm text-gray-500 dark:text-[#6C757D] font-minimal">Évaluation</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Continue Listening Section */}
            <ContinueListening onPlay={onPlay} />

            {/* Main Content - Skip Link Target */}
            <main id="main-content">
                {/* VIDÉOS Section - Combined with Featured */}
                <section id="videos" className="gsap-section py-16 px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Video className="w-8 h-8 text-[#007BFF]" />
                            <h2 className="text-3xl md:text-4xl font-creativo font-bold">En Vedette</h2>
                        </div>
                        <p className="text-gray-600 dark:text-[#6C757D] font-minimal max-w-xl">
                            Découvrez nos derniers épisodes vidéo et contenus exclusifs.
                        </p>
                        <div className="h-1.5 w-16 bg-gradient-to-r from-[#007BFF] to-[#A9A9F5] rounded-full mt-4"></div>
                    </div>

                    {/* Horizontal Carousel */}
                    <div
                        className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* Featured Episode - First Card (Larger) */}
                        {items.length > 0 && (
                            <Link
                                to={`/episode/${items[0].id}`}
                                className="snap-start shrink-0 w-[85vw] md:w-[500px] group"
                            >
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#007BFF]/10 to-[#A9A9F5]/10 border-2 border-[#007BFF] hover:shadow-xl hover:shadow-[#007BFF]/20 transition-all h-full">
                                    <div className="aspect-video overflow-hidden relative">
                                        <LazyImage
                                            src={items[0].src}
                                            alt={items[0].title}
                                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <div className="w-20 h-20 rounded-full bg-[#007BFF] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                                <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
                                            </div>
                                        </div>
                                        {/* Featured Badge */}
                                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#007BFF] rounded-full">
                                            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                                En Vedette
                                            </span>
                                        </div>
                                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
                                            <span className="text-[10px] font-mono text-white/90 tracking-wider">
                                                EP.{String(items[0].id).padStart(3, '0')} // {items[0].duration || '45:00'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <span className="text-[#007BFF] text-xs font-bold uppercase tracking-wider">{items[0].category}</span>
                                        <h3 className="text-xl font-creativo font-bold mt-2 group-hover:text-[#007BFF] transition-colors">{items[0].title}</h3>
                                        <p className="text-gray-500 dark:text-[#6C757D] text-sm mt-2 line-clamp-2">Découvrez notre dernier épisode exclusif.</p>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* Video Items */}
                        {videoItems.slice(0, 6).map((item) => (
                            <Link
                                key={item.id}
                                to={`/episode/${item.id}`}
                                state={{ mediaMode: 'video' }}
                                className="snap-start shrink-0 w-[75vw] md:w-[380px] group"
                            >
                                <div className="relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] hover:border-[#007BFF] transition-all h-full">
                                    <div className="aspect-video overflow-hidden relative">
                                        <LazyImage
                                            src={item.src}
                                            alt={item.title}
                                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
                                            </div>
                                        </div>
                                        <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
                                            <span className="text-[10px] font-mono text-white/90 tracking-wider">
                                                VID.{String(videoItems.indexOf(item) + 1).padStart(3, '0')} // {item.duration || '12:30'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <span className="text-[#007BFF] text-xs font-bold uppercase tracking-wider">{item.category}</span>
                                        <h3 className="text-lg font-creativo font-bold mt-2 group-hover:text-[#007BFF] transition-colors">{item.title}</h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
                {/* SHORTS Section */}
                {shorts.length > 0 && (
                    <section className="gsap-section py-20 px-4 md:px-8 max-w-7xl mx-auto">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Film className="w-8 h-8 text-[#FF0050]" />
                                <h2 className="text-3xl md:text-4xl font-creativo font-bold">{t('shorts.title')}</h2>
                            </div>
                            <p className="text-gray-600 dark:text-[#6C757D] font-minimal max-w-xl">
                                {t('shorts.description')}
                            </p>
                            <div className="h-1.5 w-16 bg-gradient-to-r from-[#FF0050] to-[#FF4500] rounded-full mt-4"></div>
                        </div>

                        {/* Horizontal Snap Scroll Container */}
                        <div
                            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {shorts.map((short) => (
                                <div
                                    key={short._id}
                                    className="snap-start shrink-0 w-44 md:w-52 cursor-pointer group relative"
                                    onMouseEnter={() => setHoveredShort(short._id)}
                                    onMouseLeave={() => setHoveredShort(null)}
                                    onClick={() => setSelectedShort(short)}
                                >
                                    {/* 9:16 Vertical Video Card */}
                                    <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 dark:border-[#333] group-hover:border-[#FF0050] transition-all duration-300 relative">
                                        {/* Thumbnail or Hover Video */}
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

                                        {/* Play Icon Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                                            </div>
                                        </div>

                                        {/* Title Gradient */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/50 to-transparent">
                                            <p className="text-white text-sm font-bold line-clamp-2">{short.title}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Shorts Full-Screen Modal */}
                {selectedShort && (
                    <div
                        className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
                        onClick={() => setSelectedShort(null)}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedShort(null)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* Video Container */}
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

                            {/* Title Overlay */}
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h3 className="text-xl font-bold">{selectedShort.title}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* ÉPISODES AUDIO Section */}
                <section id="galerie" className="gsap-section py-20 px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Headphones className="w-8 h-8 text-[#A9A9F5]" />
                            <h2 className="text-3xl md:text-4xl font-creativo font-bold">Épisodes Audio</h2>
                        </div>
                        <p className="text-gray-600 dark:text-[#6C757D] font-minimal max-w-xl">
                            Conversations exclusives sur la mode et le mannequinat.
                        </p>
                        <div className="h-1.5 w-16 bg-gradient-to-r from-[#A9A9F5] to-[#007BFF] rounded-full mt-4"></div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-10">
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
                                    className={`px-4 py-2 rounded-full text-sm font-minimal transition-all border ${activeCategory === cat
                                        ? 'bg-[#A9A9F5] text-white border-[#A9A9F5] font-bold'
                                        : 'bg-transparent text-gray-500 border-gray-300 dark:text-[#6C757D] dark:border-[#6C757D]/30 hover:border-[#A9A9F5] hover:text-[#A9A9F5]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Audio Episodes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="group relative overflow-hidden rounded-2xl cursor-pointer bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] hover:border-[#A9A9F5]/50 transition-all duration-300"
                            >
                                <Link to={`/episode/${item.id}`} className="block">
                                    <div className="aspect-square overflow-hidden relative">
                                        <LazyImage
                                            src={item.src}
                                            alt={item.title}
                                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                        />
                                        <div className="absolute bottom-4 left-4">
                                            <div className="w-12 h-12 rounded-full bg-[#A9A9F5] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <Headphones className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        {/* HUD Data Badge */}
                                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
                                            <span className="text-[10px] font-mono text-white/90 tracking-wider">
                                                EP.{String(items.indexOf(item) + 1).padStart(3, '0')} // {item.duration || '45:00'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                <div className="p-5 relative">
                                    <Link to={`/episode/${item.id}`} className="block">
                                        <p className="text-[#A9A9F5] text-xs font-creativo font-bold uppercase tracking-widest mb-2">{item.category}</p>
                                        <h3 className="text-lg font-creativo font-bold text-black dark:text-white mb-1 group-hover:text-[#A9A9F5] transition-colors">{item.title}</h3>
                                        <p className="text-gray-500 dark:text-[#6C757D] text-sm font-minimal">{t('gallery.available_now')}</p>
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleFavorite(item.id);
                                        }}
                                        className="absolute top-5 right-5 p-2 rounded-full bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] hover:scale-110 transition-transform z-10"
                                    >
                                        <Heart
                                            size={18}
                                            fill={favorites.includes(item.id) ? "#A9A9F5" : "none"}
                                            className={favorites.includes(item.id) ? "text-[#A9A9F5]" : "text-gray-400"}
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>


                {/* Blog Preview Section */}
                {blogPosts.length > 0 && (
                    <section className="gsap-section py-24 px-4 md:px-8 bg-gray-50 dark:bg-[#111]">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                                <div>
                                    <span className="text-[#007BFF] text-sm font-bold uppercase tracking-wider mb-2 block">Blog</span>
                                    <h2 className="text-3xl md:text-4xl font-creativo font-bold">Derniers Articles</h2>
                                </div>
                                <Link
                                    to="/blog"
                                    className="inline-flex items-center gap-2 text-[#007BFF] hover:underline font-medium"
                                >
                                    Voir tous les articles
                                    <ArrowRight size={16} />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {blogPosts.map((post) => (
                                    <Link
                                        key={post._id}
                                        to={`/blog/${post.slug?.current}`}
                                        className="group bg-white dark:bg-[#0a0a0a] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#333] hover:border-[#007BFF] transition-all hover:shadow-lg"
                                    >
                                        <div className="aspect-video overflow-hidden">
                                            {post.mainImage ? (
                                                <LazyImage
                                                    src={urlFor(post.mainImage).width(600).url()}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#007BFF] to-[#A9A9F5] flex items-center justify-center">
                                                    <BookOpen className="w-12 h-12 text-white/50" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            {post.publishedAt && (
                                                <div className="flex items-center gap-2 text-gray-500 dark:text-[#6C757D] text-sm mb-3">
                                                    <Calendar size={14} />
                                                    <span>{new Date(post.publishedAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                            )}
                                            <h3 className="text-lg font-creativo font-bold mb-2 group-hover:text-[#007BFF] transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="text-gray-600 dark:text-[#6C757D] text-sm line-clamp-2 mb-4">
                                                    {post.excerpt}
                                                </p>
                                            )}
                                            <span className="inline-flex items-center gap-1 text-[#007BFF] text-sm font-medium">
                                                Lire l'article
                                                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* About Section - Complete Biography */}
                <section id="apropos" className="gsap-section py-24 bg-white dark:bg-[#020202] border-t border-gray-200 dark:border-[#333]">

                    <div className="container mx-auto px-6 max-w-6xl">
                        {/* Hero Section */}
                        <div className="flex flex-col md:flex-row items-center gap-16 mb-24">
                            <div className="gsap-parallax w-full md:w-1/2 relative">
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
                                    <p className="text-[#007BFF] dark:text-[#A9A9F5] font-minimal text-xl">Fashion Photographer | Podcast Host | Creative Visionary</p>
                                </div>

                                <p className="text-gray-600 dark:text-[#6C757D] leading-relaxed text-lg font-minimal">
                                    Mijean Rochus is a Brussels-based fashion photographer specializing in conceptual fashion, reportage, editorial, and runway photography. Through a distinctive lens, he captures the essence of fashion in all its vibrant diversity, documenting the industry's multifaceted beauty across the globe.
                                </p>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-gray-100 dark:bg-[#111] p-2 rounded text-black dark:text-white"><Camera size={20} /></div>
                                        <div>
                                            <h5 className="text-black dark:text-white font-bold font-creativo">Fashion Photography</h5>
                                            <p className="text-sm text-gray-500 dark:text-[#6C757D]">Runway & Editorial</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-gray-100 dark:bg-[#111] p-2 rounded text-black dark:text-white"><Mic size={20} /></div>
                                        <div>
                                            <h5 className="text-black dark:text-white font-bold font-creativo">The Talk Podcast</h5>
                                            <p className="text-sm text-gray-500 dark:text-[#6C757D]">Fashion & Lifestyle</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <LazyImage
                                        src="https://fakeimg.pl/200x60/000000/ffffff/?text=Mijean+Rochus&font=lobster"
                                        alt="Signature"
                                        className="h-12 opacity-50 dark:invert"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Biography Timeline Header */}
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 bg-[#007BFF]/10 text-[#007BFF] px-4 py-1 rounded-full mb-4 border border-[#007BFF]/20">
                                <BookOpen size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest font-minimal">Biography</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-creativo font-bold mb-4 text-black dark:text-white">The Journey of Mijean Rochus</h2>
                            <p className="text-gray-600 dark:text-[#6C757D] font-minimal text-lg max-w-2xl mx-auto">
                                From model to photographer, TV presenter to podcast host — a story of passion, creativity, and transformation.
                            </p>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-12 max-w-5xl mx-auto">
                            {/* Early Influences */}
                            <div className="bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-[#333] p-8 md:p-10 relative overflow-hidden group hover:border-[#007BFF]/50 transition-all duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#007BFF]/10 rounded-full blur-[60px] group-hover:w-48 group-hover:h-48 transition-all duration-500"></div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-gradient-to-tr from-[#007BFF] to-[#A9A9F5] p-3 rounded-xl text-white">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-creativo font-bold text-black dark:text-white">Early Influences</h3>
                                        <p className="text-[#007BFF] text-sm font-minimal">Where it all began</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-[#6C757D] leading-relaxed font-minimal text-lg">
                                    Mijean's journey into the world of photography began with an unexpected twist. At the age of 19, while seeking assistance with a school project at a local Photoshop, Mijean caught the eye of a seasoned photographer who also happened to be a former model for Flair Magazine. Intrigued by Mijean's presence, this photographer turned the camera towards him, capturing captivating images. This encounter sparked a dialogue that would change the course of Mijean's life.
                                </p>
                            </div>

                            {/* Modeling Career */}
                            <div className="bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-[#333] p-8 md:p-10 relative overflow-hidden group hover:border-[#A9A9F5]/50 transition-all duration-300">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-[#A9A9F5]/10 rounded-full blur-[60px] group-hover:w-48 group-hover:h-48 transition-all duration-500"></div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-gradient-to-tr from-[#A9A9F5] to-[#007BFF] p-3 rounded-xl text-white">
                                        <ArrowUpRight size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-creativo font-bold text-black dark:text-white">The Modeling Years</h3>
                                        <p className="text-[#A9A9F5] text-sm font-minimal">A decade on the runway</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-[#6C757D] leading-relaxed font-minimal text-lg">
                                    Months later, Mijean gave modeling a try. For over a decade he booked jobs in Belgium and on occasions more international jobs. He did not only grace runways but he also did commercial work. At Models Inc. International, one of his agencies, Mijean could also been seen passing his expertise to aspiring models. His commitment to excellence and a deep understanding of the modeling world were evident in his dedication to maintaining his body as a precision tool for his craft.
                                </p>
                            </div>

                            {/* The Shift to Photography */}
                            <div className="bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-[#333] p-8 md:p-10 relative overflow-hidden group hover:border-[#007BFF]/50 transition-all duration-300">
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#007BFF]/10 rounded-full blur-[60px] group-hover:w-48 group-hover:h-48 transition-all duration-500"></div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-gradient-to-tr from-[#007BFF] to-[#A9A9F5] p-3 rounded-xl text-white">
                                        <Camera size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-creativo font-bold text-black dark:text-white">The Shift to the Creative Lens</h3>
                                        <p className="text-[#007BFF] text-sm font-minimal">Transformation into a photographer</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-[#6C757D] leading-relaxed font-minimal text-lg mb-4">
                                    Behind the allure of the camera, Mijean's curiosity about the mechanics of photography began to grow. He longed to be part of the creative process, learning the intricate details of image selection, lighting, and more. As more people sought his expertise in photo selection, they encouraged him to consider formal study in photography.
                                </p>
                                <p className="text-gray-600 dark:text-[#6C757D] leading-relaxed font-minimal text-lg">
                                    Life took Mijean on a different path, leading him to obtain a professional bachelor's degree in social cultural studies. However, the spark for photography remained ignited.
                                </p>
                            </div>

                            {/* Television & MI Casting */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-[#333] p-8 relative overflow-hidden group hover:border-[#A9A9F5]/50 transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-gradient-to-tr from-[#A9A9F5] to-[#007BFF] p-3 rounded-xl text-white">
                                            <Mic size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-creativo font-bold text-black dark:text-white">Television Career</h3>
                                            <p className="text-[#A9A9F5] text-sm font-minimal">2008 - Bel'Afrika TV</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-[#6C757D] leading-relaxed font-minimal">
                                        In 2008, Mijean became a television presenter for Bel'Afrika TV on TV Brussels, reigniting his passion for photography as he conducted research, wrote articles, conducted interviews, and captured striking images of guests. He interviewed Belgian singer Kate Ryan who represented Belgium at the Eurosong contest, and footballers of African descent for the Ebbenhouten Schoen awards.
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-[#333] p-8 relative overflow-hidden group hover:border-[#007BFF]/50 transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-gradient-to-tr from-[#007BFF] to-[#A9A9F5] p-3 rounded-xl text-white">
                                            <BrainCircuit size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-creativo font-bold text-black dark:text-white">MI Casting</h3>
                                            <p className="text-[#007BFF] text-sm font-minimal">2011 - Multicultural Identity</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-[#6C757D] leading-relaxed font-minimal">
                                        In 2011, Mijean co-founded the MI Casting (Multicultural Identity Casting) association. The platform became a nurturing ground for diverse talent, fostering collaborations with industry icons such as Romain Brau, Walter Van Beirendonck, Mientus, and Label M UK. Under his guidance, several models went on to walk the runways of London, Milan, and Paris Fashion Weeks.
                                    </p>
                                </div>
                            </div>

                            {/* MIRO 4 You Magazine */}
                            <div className="bg-gradient-to-br from-[#007BFF]/5 to-[#A9A9F5]/5 dark:from-[#007BFF]/10 dark:to-[#A9A9F5]/10 rounded-3xl border border-gray-200 dark:border-[#333] p-8 md:p-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#007BFF]/10 rounded-full blur-[100px]"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#A9A9F5]/10 rounded-full blur-[100px]"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-gradient-to-tr from-[#007BFF] to-[#A9A9F5] p-3 rounded-xl text-white">
                                            <ImageIcon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-creativo font-bold text-black dark:text-white">MIRO 4 You Magazine</h3>
                                            <p className="text-[#007BFF] text-sm font-minimal">2019 - Present | Global Fashion Coverage</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-[#6C757D] leading-relaxed font-minimal text-lg mb-6">
                                        Out of these diverse experiences, MIRO for You Magazine by Marc Vanderbiesen & Mijean Rochus was born. Under this banner, Mijean captures fashion's multifaceted beauty and diversity. Since 2019, he has embarked on a journey across Europe, documenting the glamour and innovation of fashion weeks in London, Pitti Uomo, Milan, Alta Roma, Paris, Amsterdam, Maastricht and Copenhagen fashion week.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {['London', 'Milan', 'Paris', 'Amsterdam', 'Copenhagen', 'Alta Roma', 'Pitti Uomo', 'Maastricht'].map((city) => (
                                            <span key={city} className="bg-white dark:bg-[#050505] px-4 py-2 rounded-full text-sm font-minimal text-gray-600 dark:text-[#6C757D] border border-gray-200 dark:border-[#333]">
                                                {city}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* The Talk Podcast */}
                            <div className="bg-black dark:bg-[#111] rounded-3xl border border-[#333] p-8 md:p-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#007BFF]/20 rounded-full blur-[100px]"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#A9A9F5]/20 rounded-full blur-[100px]"></div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 bg-[#007BFF]/20 text-[#007BFF] px-4 py-1 rounded-full mb-6 border border-[#007BFF]/30">
                                        <span className="w-2 h-2 rounded-full bg-[#007BFF] animate-pulse"></span>
                                        <span className="text-xs font-bold uppercase tracking-widest font-minimal">New Chapter • 2025</span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-creativo font-bold text-white mb-4">The Talk Podcast</h3>
                                    <p className="text-[#6C757D] leading-relaxed font-minimal text-lg mb-6">
                                        In 2025, Mijean expanded his creative reach into the audio-visual space. While hosting fashion conversations at Galeries Lafayette, he met his future colleague, Gleid. Their immediate dynamic led to the creation of "The Talk," a fashion and lifestyle audio-video podcast.
                                    </p>
                                    <p className="text-white/80 leading-relaxed font-minimal text-lg italic border-l-4 border-[#007BFF] pl-6">
                                        "As a passport to cutting-edge fashion and cultural shifts, The Talk brings the world of high fashion and city secrets directly to the audience. With no filters and a sharp lens, Mijean continues to illuminate the narratives and emotions that define modern lifestyle and culture."
                                    </p>
                                </div>
                            </div>

                            {/* Legacy Quote */}
                            <div className="text-center py-12">
                                <p className="text-2xl md:text-3xl font-creativo font-bold text-black dark:text-white max-w-3xl mx-auto leading-relaxed">
                                    "Mijean Rochus's photographic journey is a testament to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007BFF] to-[#A9A9F5]">transformative power of passion and dedication</span>. With every click of the shutter, he illuminates and captures not just images but the emotions and narratives that lie within them."
                                </p>
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



                {/* Newsletter Section */}
                <section className="py-24 bg-gray-50 dark:bg-[#050505] border-t border-gray-200 dark:border-[#333]">
                    <div className="container mx-auto px-6 text-center max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-creativo font-bold text-black dark:text-white mb-4">{t('newsletter.title')}</h2>
                        <p className="text-gray-600 dark:text-[#6C757D] font-minimal text-lg mb-10">
                            {t('newsletter.description')}
                        </p>
                        <Newsletter />
                    </div>
                </section>

                {/* Footer */}
            </main>
            <footer className="bg-white dark:bg-[#020202] py-10 border-t border-gray-200 dark:border-[#222]">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-2">
                            <Mic className="w-5 h-5 text-[#007BFF]" />
                            <span className="text-black dark:text-white font-creativo font-bold tracking-tight">THE TALK</span>
                        </div>
                        <p className="text-gray-500 dark:text-[#6C757D] text-xs font-minimal">A Podcast by Mijean Rochus. Innovation & Creativity.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <LanguageSwitcher />
                        <div className="h-4 w-[1px] bg-gray-300 dark:bg-[#333] hidden md:block"></div>
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

            {/* Pinned Corner Links - EMMPO Style */}
            <div className="fixed bottom-6 left-6 z-40 hidden md:block">
                <button
                    onClick={() => scrollToSection('galerie')}
                    className="group flex items-center gap-2 px-4 py-2 bg-black/80 dark:bg-white/10 backdrop-blur-sm rounded-full border border-white/10 hover:border-[#007BFF] transition-all"
                >
                    <span className="w-2 h-2 rounded-full bg-[#007BFF] animate-pulse"></span>
                    <span className="text-xs font-mono text-white/80 tracking-wider uppercase group-hover:text-[#007BFF] transition-colors">
                        [NEW EPISODE]
                    </span>
                </button>
            </div>
            <div className="fixed bottom-6 right-6 z-40 hidden md:block">
                <button
                    onClick={() => setIsSubscribeOpen(true)}
                    className="group flex items-center gap-2 px-4 py-2 bg-black/80 dark:bg-white/10 backdrop-blur-sm rounded-full border border-white/10 hover:border-[#A9A9F5] transition-all"
                >
                    <span className="text-xs font-mono text-white/80 tracking-wider uppercase group-hover:text-[#A9A9F5] transition-colors">
                        [SUBSCRIBE]
                    </span>
                    <Mail className="w-3 h-3 text-white/60 group-hover:text-[#A9A9F5] transition-colors" />
                </button>
            </div>
        </div>

    );
}

