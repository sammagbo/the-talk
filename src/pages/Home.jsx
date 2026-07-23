import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Newsletter from '../Newsletter';
import { Mic, Instagram, Mail, ChevronRight, Facebook, Twitter, MapPin, ArrowUpRight, ArrowRight, Upload, Bot, Loader2, Search, Coffee, Heart, Calendar, Video, Headphones, Play, X, ShoppingBag, Code, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

import LazyImage from '../components/LazyImage';
import SubscribeModal from '../components/SubscribeModal';
import Navbar from '../components/Navbar';
import { client } from '../sanity';
import { useGSAP, gsap, ScrollTrigger } from '../hooks/useGSAP';
import MagneticButton from '../components/MagneticButton';
import Marquee from '../components/Marquee';
import TiltCard from '../components/TiltCard';
import useSmoothScroll from '../hooks/useSmoothScroll';



// Hero background video (single local source).
// A multi-clip carousel can return once real THE TALK footage exists.
function HeroVideo() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster="/videos/hero-poster.jpg"
                className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-40"
            >
                <source src="/videos/Carrousel.mp4" type="video/mp4" />
            </video>
        </div>
    );
}


export default function Home({ items }) {
    const { t } = useTranslation();


    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [formStatus, setFormStatus] = useState('');
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);


    // Shorts state
    const [shorts, setShorts] = useState([]);
    const [selectedShort, setSelectedShort] = useState(null);
    const [hoveredShort, setHoveredShort] = useState(null);
    const videoRef = useRef(null);


    // Enable smooth scroll
    useSmoothScroll(true);

    // GSAP Animations
    useGSAP(() => {
        // Hero section animations
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        heroTl
            .from('.gsap-hero-badge', { y: -30, opacity: 0, duration: 0.8 })
            .from('.gsap-hero-title', { y: 80, opacity: 0, duration: 1.2 }, '-=0.4')
            .from('.gsap-hero-subtitle', { y: 40, opacity: 0, duration: 0.8 }, '-=0.6')
            .from('.gsap-hero-description', { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
            .from('.gsap-hero-ctas a', { y: 30, opacity: 0, duration: 0.6, stagger: 0.15 }, '-=0.4');

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




    const handleFormSubmit = (e) => {
        e.preventDefault();
        const subject = encodeURIComponent(`Contact THE TALK — ${formData.name}`);
        const body = encodeURIComponent(`${formData.message}\n\nNom: ${formData.name}\nEmail: ${formData.email}`);
        setFormStatus('email-client');
        window.location.href = `mailto:contact@thetalkfashion.com?subject=${subject}&body=${body}`;
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };





    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-black selection:text-white transition-colors duration-300">
            <Helmet>
                <title>THE TALK | Podcast by Mijean Rochus</title>
                <meta name="description" content="Plongez dans l'univers de la mode et du mannequinat à travers des conversations exclusives. Un podcast mode par Mijean Rochus." />
                <meta property="og:title" content="THE TALK | Podcast by Mijean Rochus" />
                <meta property="og:description" content="Plongez dans l'univers de la mode et du mannequinat à travers des conversations exclusives." />
                <meta property="og:image" content="https://www.thetalkfashion.com/og-image.png" />
                <meta property="og:type" content="website" />
                {/* Schema.org Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "THE TALK",
                        "description": "Plateforme de médias mode, lifestyle et culture par Mijean Rochus & Gleid.",
                        "url": "https://www.thetalkfashion.com",
                        "inLanguage": "fr-FR",
                        "publisher": {
                            "@type": "Organization",
                            "name": "THE TALK",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://www.thetalkfashion.com/logo.png"
                            }
                        }
                    })}
                </script>
            </Helmet>

            {/* Intégration des polices Google Fonts */}
            <style>
                {`
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
                    {/* Video Carousel - Crossfade between fashion videos */}
                    <HeroVideo />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/50 dark:from-black dark:via-transparent dark:to-black/50"></div>
                    {/* Clean Minimalist Fashion Background */}
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <div className="gsap-hero-badge mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-none border border-black/30 dark:border-white/30 bg-black/10 dark:bg-white/10 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-none bg-black dark:bg-white animate-pulse"></span>
                        <span className="text-xs font-minimal text-black dark:text-white tracking-widest uppercase">{t('hero.new_episode')}</span>
                    </div>

                    <h1 className="gsap-hero-title text-6xl md:text-8xl font-creativo font-black mb-6 tracking-[0.08em] leading-tight uppercase">
                        THE <span className="text-black dark:text-white">TALK</span>
                    </h1>

                    <p className="gsap-hero-subtitle text-xl md:text-2xl font-minimal text-gray-600 dark:text-[#6C757D] mb-4 max-w-2xl mx-auto font-light flex items-center justify-center gap-2">
                        A Podcast by <span className="font-editorial italic text-3xl text-black dark:text-white">Mijean Rochus &amp; Gleid</span>
                    </p>

                    <p className="gsap-hero-description text-lg text-gray-800 dark:text-white/80 mb-10 max-w-xl mx-auto font-minimal leading-relaxed">
                        {t('hero.description')}
                    </p>

                    <div className="gsap-hero-ctas flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {items.length > 0 ? (
                            <Link
                                to={items[0].slug ? `/episodes/${items[0].slug}` : `/episode/${items[0].id}`}
                                className="bg-black dark:bg-white hover:bg-gray-800 hover:dark:bg-gray-300 text-white dark:text-black px-8 py-4 rounded-none transition-all duration-300 flex items-center gap-2 font-minimal font-bold text-sm tracking-wider w-full sm:w-auto justify-center uppercase"
                            >
                                [ {t('hero.watch_latest', 'VOIR LE DERNIER ÉPISODE')} ]
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <MagneticButton
                                onClick={() => scrollToSection('videos')}
                                className="bg-black dark:bg-white hover:bg-gray-800 hover:dark:bg-gray-300 text-white dark:text-black px-8 py-4 rounded-none transition-all duration-300 flex items-center gap-2 font-minimal font-bold text-sm tracking-wider w-full sm:w-auto justify-center uppercase"
                            >
                                [ {t('hero.listen_now', 'ÉCOUTER')} ]
                                <ChevronRight className="w-4 h-4" />
                            </MagneticButton>
                        )}
                    </div>

                </div>
            </header>

            {/* Main Content - Skip Link Target */}
            <main id="main-content">
                {/* VIDÉOS Section - Combined with Featured */}
                <section id="videos" className="gsap-section py-16 px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Video className="w-8 h-8 text-black dark:text-white" />
                            <h2 className="text-3xl md:text-4xl font-creativo font-bold">En Vedette</h2>
                        </div>
                        <p className="text-gray-600 dark:text-[#6C757D] font-minimal max-w-xl">
                            Découvrez nos derniers épisodes vidéo et contenus exclusifs.
                        </p>
                        <div className="h-1.5 w-16 bg-gradient-to-r from-black dark:from-white to-black dark:to-white rounded-none mt-4"></div>
                    </div>

                    {/* Horizontal Carousel */}
                    {/* Featured Episode - Single Large Card */}
                    <div className="flex justify-center pb-6">
                        {items.length > 0 && (
                            <Link
                                to={items[0].slug ? `/episodes/${items[0].slug}` : `/episode/${items[0].id}`}
                                className="w-full max-w-4xl group"
                            >
                                <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-black/10 dark:from-white/10 to-black/10 dark:to-white/10 border-2 border-black dark:border-white hover:shadow-xl hover:shadow-black/20 hover:dark:shadow-white/20 transition-all h-full">
                                    <div className="aspect-video overflow-hidden relative">
                                        <LazyImage
                                            src={items[0].fullSrc || items[0].src}
                                            alt={items[0].title}
                                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <div className="w-20 h-20 rounded-full bg-black dark:bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                                <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
                                            </div>
                                        </div>
                                        {/* Featured Badge */}
                                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black dark:bg-white rounded-none">
                                            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-none bg-white animate-pulse"></span>
                                                Dernier Épisode
                                            </span>
                                        </div>
                                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-none border border-white/20">
                                            <span className="text-[10px] font-minimal text-white/90 tracking-wider">
                                                EP.{String(items[0].id).padStart(3, '0')} // {items[0].duration || '45:00'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8">
                                        <span className="text-black dark:text-white text-sm font-bold uppercase tracking-wider">{items[0].category}</span>
                                        <h3 className="text-2xl md:text-3xl font-creativo font-bold mt-2 group-hover:text-black group-hover:dark:text-white transition-colors">{items[0].title}</h3>
                                        <p className="text-gray-500 dark:text-[#6C757D] text-base mt-3 line-clamp-2">{items[0].description || 'Découvrez notre dernier épisode exclusif.'}</p>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </section>
                {/* SHORTS Section */}
                {shorts.length > 0 && (
                    <section className="gsap-section py-20 px-4 md:px-8 max-w-7xl mx-auto">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-3xl md:text-4xl font-creativo font-bold">{t('shorts.title')}</h2>
                            </div>
                            <p className="text-gray-600 dark:text-[#6C757D] font-minimal max-w-xl">
                                {t('shorts.description')}
                            </p>
                            <div className="h-1.5 w-16 bg-[#FF0050] rounded-none mt-4"></div>
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
                                    <div className="aspect-[9/16] rounded-none overflow-hidden bg-gray-900 border border-gray-200 dark:border-[#333] group-hover:border-[#FF0050] transition-all duration-300 relative">
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
                            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-none bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
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
                                    className="w-full h-full rounded-none"
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
                                    className="w-full h-full object-contain rounded-none"
                                />
                            )}

                            {/* Title Overlay */}
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h3 className="text-xl font-bold">{selectedShort.title}</h3>
                            </div>
                        </div>
                    </div>
                )}






                {/* Contact Section */}
                <section id="contact" className="py-24 relative overflow-hidden bg-white dark:bg-black border-t border-gray-200 dark:border-[#333]">
                    <div className="container mx-auto px-6 max-w-5xl relative z-10">

                        {/* New Contact Header Card based on references */}
                        <div className="bg-gray-50 dark:bg-[#020202] p-10 rounded-none border border-gray-200 dark:border-[#333] mb-12 flex flex-col md:flex-row items-center justify-between group hover:border-black/50 hover:dark:border-white/50 transition-all duration-500 shadow-2xl">
                            <div className="mb-6 md:mb-0">
                                <h2 className="text-4xl md:text-5xl font-creativo font-black text-black dark:text-white mb-3">{t('contact.title')}</h2>
                                <p className="text-gray-600 dark:text-[#6C757D] text-lg font-minimal">{t('contact.subtitle')}</p>
                            </div>
                            {/* The Icon Circle */}
                            <div className="bg-gradient-to-tr from-black dark:from-white to-gray-700 dark:to-gray-400 p-6 rounded-none group-hover:scale-110 group-hover:rotate-45 transition-all duration-500 shadow-lg shadow-black/30 dark:shadow-white/30 cursor-pointer">
                                <ArrowUpRight className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12">

                            {/* Contact Info */}
                            <div className="space-y-10">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-5 group cursor-pointer">
                                        <div className="bg-gray-100 dark:bg-[#111] p-4 rounded-none text-black dark:text-white group-hover:bg-black group-hover:dark:bg-white group-hover:text-white group-hover:dark:text-black transition-colors">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-black dark:text-white font-creativo font-bold text-lg">Email</h4>
                                            <p className="text-gray-500 dark:text-[#6C757D]">contact@thetalkfashion.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-5 group cursor-pointer">
                                        <div className="bg-gray-100 dark:bg-[#111] p-4 rounded-none text-black dark:text-white group-hover:bg-black group-hover:dark:bg-white group-hover:text-white group-hover:dark:text-black transition-colors">
                                            <Instagram className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-black dark:text-white font-creativo font-bold text-lg">Social</h4>
                                            <p className="text-gray-500 dark:text-[#6C757D]">@thetalk_podcast</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-5 group cursor-pointer">
                                        <div className="bg-gray-100 dark:bg-[#111] p-4 rounded-none text-black dark:text-white group-hover:bg-black group-hover:dark:bg-white group-hover:text-white group-hover:dark:text-black transition-colors">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-black dark:text-white font-creativo font-bold text-lg">Studio</h4>
                                            <p className="text-gray-500 dark:text-[#6C757D]">Bruxelles, Belgique</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleFormSubmit} className="bg-gray-50 dark:bg-[#020202] p-8 rounded-none border border-gray-200 dark:border-[#333] space-y-5">
                                {formStatus === 'email-client' && (
                                    <div className="bg-black/10 dark:bg-white/10 text-black dark:text-white p-4 rounded-none text-sm font-minimal border border-black/20 dark:border-white/20">
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
                                        className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-none px-4 py-3.5 text-black dark:text-white focus:outline-none focus:border-black focus:dark:border-white focus:ring-1 focus:ring-black focus:dark:ring-white transition-all font-minimal"
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
                                        className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-none px-4 py-3.5 text-black dark:text-white focus:outline-none focus:border-black focus:dark:border-white focus:ring-1 focus:ring-black focus:dark:ring-white transition-all font-minimal"
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
                                        className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-none px-4 py-3.5 text-black dark:text-white focus:outline-none focus:border-black focus:dark:border-white focus:ring-1 focus:ring-black focus:dark:ring-white transition-all resize-none font-minimal"
                                        placeholder="Votre message..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-black dark:bg-white hover:bg-gray-800 hover:dark:bg-gray-300 text-white dark:text-black font-creativo font-bold py-4 rounded-none transition-all shadow-lg shadow-black/20 dark:shadow-white/20 mt-2"
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
                            <Mic className="w-5 h-5 text-black dark:text-white" />
                            <span className="text-black dark:text-white font-creativo font-bold tracking-tight">THE TALK</span>
                        </div>
                        <p className="text-gray-500 dark:text-[#6C757D] text-xs font-minimal">A Podcast by Mijean Rochus. Innovation & Creativity.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <LanguageSwitcher />
                        <div className="h-4 w-[1px] bg-gray-300 dark:bg-[#333] hidden md:block"></div>
                        <a href="https://www.buymeacoffee.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#6C757D] hover:text-black hover:dark:text-white transition-colors font-minimal text-sm font-bold mr-4">
                            <Coffee size={18} />
                            <span>{t('footer.support')}</span>
                        </a>
                        <a href="#" className="text-[#6C757D] hover:text-black hover:dark:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="text-[#6C757D] hover:text-black hover:dark:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                        <a href="#" className="text-[#6C757D] hover:text-black hover:dark:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="mb-2 flex items-center justify-center md:justify-end gap-3 text-xs font-minimal">
                            <Link to="/privacy" className="text-[#6C757D] hover:text-black hover:dark:text-white transition-colors">{t('footer.privacy', 'Confidentialité')}</Link>
                            <span className="text-gray-300 dark:text-[#333]">·</span>
                            <Link to="/terms" className="text-[#6C757D] hover:text-black hover:dark:text-white transition-colors">{t('footer.terms', 'Conditions')}</Link>
                        </p>
                        <p className="text-[#6C757D] text-xs font-minimal opacity-50">© 2025 Mijean Rochus. All Rights Reserved.</p>
                        <p className="text-[#6C757D] text-xs font-minimal opacity-40 mt-1 flex items-center justify-center md:justify-end gap-1">
                            Developed with <span className="text-[#6C757D]">♥</span> by{' '}
                            <a
                                href="https://www.linkedin.com/in/sam-magbo-02086555/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-black dark:text-white hover:text-black hover:dark:text-white transition-colors font-medium"
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
            <div className="fixed bottom-6 right-6 z-40 hidden md:block">
                <button
                    onClick={() => setIsSubscribeOpen(true)}
                    className="group flex items-center gap-2 px-4 py-2 bg-black/80 dark:bg-white/10 backdrop-blur-sm rounded-none border border-white/10 hover:border-white transition-all"
                >
                    <span className="text-xs font-minimal text-white/80 tracking-wider uppercase group-hover:text-white transition-colors">
                        [SUBSCRIBE]
                    </span>
                    <Mail className="w-3 h-3 text-white/60 group-hover:text-white transition-colors" />
                </button>
            </div>
        </div>

    );
}

