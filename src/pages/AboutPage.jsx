import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import LazyImage from '../components/LazyImage';
import { useGSAP, gsap } from '../hooks/useGSAP';

export default function AboutPage() {
    const { t } = useTranslation();
    const [deferredPrompt, setDeferredPrompt] = useState(null);

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

    useGSAP(() => {
        const sections = gsap.utils.toArray('.gsap-section');
        sections.forEach((section) => {
            gsap.from(section, {
                y: 40,
                opacity: 0,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
            });
        });

        gsap.utils.toArray('.gsap-parallax').forEach((element) => {
            gsap.to(element, {
                yPercent: -15,
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

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
            <Helmet>
                <title>À propos | THE TALK</title>
                <meta name="description" content="Découvrez Mijean Rochus et Gleid, les hôtes de THE TALK." />
                <meta property="og:title" content="À propos | THE TALK" />
                <meta property="og:description" content="Découvrez Mijean Rochus et Gleid, les hôtes de THE TALK." />
                <meta property="og:type" content="website" />
            </Helmet>

            <style>
                {`
                    .font-creativo { font-family: 'Outfit', sans-serif; }
                    .font-minimal { font-family: 'Inter', sans-serif; }
                    
                    /* Film Grain Effect */
                    .film-grain {
                        position: relative;
                    }
                    .film-grain::after {
                        content: "";
                        position: absolute;
                        inset: 0;
                        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                        opacity: 0.04;
                        pointer-events: none;
                        z-index: 10;
                    }
                `}
            </style>

            <Navbar
                onScrollToSection={() => {}}
                onOpenSearch={() => {}}
                deferredPrompt={deferredPrompt}
                onInstallClick={handleInstallClick}
            />

            <main id="main-content" className="pt-24 md:pt-32 pb-24 film-grain overflow-hidden">
                {/* HUD Data Badge - Page Header */}
                <div className="container mx-auto px-6 max-w-7xl mb-24">
                    <div className="flex flex-col border-b border-black/10 dark:border-white/10 pb-8 mb-16 gsap-section">
                        <p className="text-xs tracking-[0.2em] uppercase font-minimal text-black/50 dark:text-white/50 mb-4">[ À PROPOS ]</p>
                        <h1 className="text-5xl md:text-8xl font-creativo font-black leading-[0.9] uppercase tracking-tighter">
                            Behind<br/>The Lens
                        </h1>
                    </div>

                    {/* Mijean Section */}
                    <section id="mijean" className="mb-32">
                        {/* Mijean Hero */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start mb-24">
                            {/* Image Left */}
                            <div className="lg:col-span-5 gsap-parallax relative">
                                <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-[#111]">
                                    <LazyImage
                                        src="/mijean-placeholder.png"
                                        alt="Mijean Rochus"
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                    />
                                </div>
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1 text-xs font-mono border border-black/10 dark:border-white/10 uppercase tracking-wider">
                                    M. Rochus // Founder
                                </div>
                            </div>

                            {/* Content Right */}
                            <div className="lg:col-span-7 gsap-section pt-8">
                                <h2 className="text-4xl md:text-7xl font-creativo font-bold uppercase tracking-tight mb-4">Mijean<br/>Rochus</h2>
                                <p className="text-sm tracking-widest uppercase font-minimal text-black/50 dark:text-white/50 mb-12">
                                    Fashion Photographer | Podcast Host | Creative Visionary
                                </p>

                                <p className="text-xl md:text-2xl font-minimal leading-relaxed text-black/80 dark:text-white/80 mb-12">
                                    Mijean Rochus is a Brussels-based fashion photographer specializing in conceptual fashion, reportage, editorial, and runway photography. Through a distinctive lens, he captures the essence of fashion in all its vibrant diversity, documenting the industry's multifaceted beauty across the globe.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-black/10 dark:border-white/10 pt-8 mb-12">
                                    <div>
                                        <h3 className="font-creativo font-bold text-lg">Fashion Photography</h3>
                                        <p className="font-minimal text-black/60 dark:text-white/60">Runway & Editorial</p>
                                    </div>
                                    <div>
                                        <h3 className="font-creativo font-bold text-lg">The Talk Podcast</h3>
                                        <p className="font-minimal text-black/60 dark:text-white/60">Fashion & Lifestyle</p>
                                    </div>
                                </div>
                                
                                <div className="opacity-50 dark:invert">
                                    <p className="text-xs tracking-widest uppercase font-minimal mb-2 text-black/50 dark:text-white/50">Signature</p>
                                    <LazyImage
                                        src="https://fakeimg.pl/200x60/000000/ffffff/?text=Mijean+Rochus&font=lobster"
                                        alt="Signature Mijean Rochus"
                                        className="h-10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mijean Biography Header */}
                        <div className="text-center max-w-3xl mx-auto mb-20 gsap-section">
                            <p className="text-xs tracking-[0.2em] uppercase font-minimal text-black/50 dark:text-white/50 mb-4">[ Biography ]</p>
                            <h3 className="text-4xl md:text-5xl font-creativo font-bold mb-6">The Journey of Mijean Rochus</h3>
                            <p className="text-xl font-minimal text-black/70 dark:text-white/70">
                                From model to photographer, TV presenter to podcast host — a story of passion, creativity, and transformation.
                            </p>
                        </div>

                        {/* Mijean Timeline */}
                        <div className="max-w-5xl mx-auto space-y-16">
                            
                            {/* Early Influences */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 gsap-section border-t border-black/10 dark:border-white/10 pt-12">
                                <div className="md:col-span-4">
                                    <h4 className="font-creativo font-bold text-2xl mb-2">Early Influences</h4>
                                    <p className="font-minimal text-sm text-black/50 dark:text-white/50 uppercase tracking-wider">Where it all began</p>
                                </div>
                                <div className="md:col-span-8">
                                    <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80">
                                        Mijean's journey into the world of photography began with an unexpected twist. At the age of 19, while seeking assistance with a school project at a local Photoshop, Mijean caught the eye of a seasoned photographer who also happened to be a former model for Flair Magazine. Intrigued by Mijean's presence, this photographer turned the camera towards him, capturing captivating images. This encounter sparked a dialogue that would change the course of Mijean's life.
                                    </p>
                                </div>
                            </div>

                            {/* The Modeling Years */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 gsap-section border-t border-black/10 dark:border-white/10 pt-12">
                                <div className="md:col-span-4">
                                    <h4 className="font-creativo font-bold text-2xl mb-2">The Modeling Years</h4>
                                    <p className="font-minimal text-sm text-black/50 dark:text-white/50 uppercase tracking-wider">A decade on the runway</p>
                                </div>
                                <div className="md:col-span-8">
                                    <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80">
                                        Months later, Mijean gave modeling a try. For over a decade he booked jobs in Belgium and on occasions more international jobs. He did not only grace runways but he also did commercial work. At Models Inc. International, one of his agencies, Mijean could also been seen passing his expertise to aspiring models. His commitment to excellence and a deep understanding of the modeling world were evident in his dedication to maintaining his body as a precision tool for his craft.
                                    </p>
                                </div>
                            </div>

                            {/* The Shift to the Creative Lens */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 gsap-section border-t border-black/10 dark:border-white/10 pt-12">
                                <div className="md:col-span-4">
                                    <h4 className="font-creativo font-bold text-2xl mb-2">The Shift to the Creative Lens</h4>
                                    <p className="font-minimal text-sm text-black/50 dark:text-white/50 uppercase tracking-wider">Transformation into a photographer</p>
                                </div>
                                <div className="md:col-span-8 space-y-6">
                                    <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80">
                                        Behind the allure of the camera, Mijean's curiosity about the mechanics of photography began to grow. He longed to be part of the creative process, learning the intricate details of image selection, lighting, and more. As more people sought his expertise in photo selection, they encouraged him to consider formal study in photography.
                                    </p>
                                    <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80">
                                        Life took Mijean on a different path, leading him to obtain a professional bachelor's degree in social cultural studies. However, the spark for photography remained ignited.
                                    </p>
                                </div>
                            </div>

                            {/* Television Career */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 gsap-section border-t border-black/10 dark:border-white/10 pt-12">
                                <div className="md:col-span-4">
                                    <h4 className="font-creativo font-bold text-2xl mb-2">Television Career</h4>
                                    <p className="font-minimal text-sm text-black/50 dark:text-white/50 uppercase tracking-wider">2008 - Bel'Afrika TV</p>
                                </div>
                                <div className="md:col-span-8">
                                    <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80">
                                        In 2008, Mijean became a television presenter for Bel'Afrika TV on TV Brussels, reigniting his passion for photography as he conducted research, wrote articles, conducted interviews, and captured striking images of guests. He interviewed Belgian singer Kate Ryan who represented Belgium at the Eurosong contest, and footballers of African descent for the Ebbenhouten Schoen awards.
                                    </p>
                                </div>
                            </div>

                            {/* MI Casting */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 gsap-section border-t border-black/10 dark:border-white/10 pt-12">
                                <div className="md:col-span-4">
                                    <h4 className="font-creativo font-bold text-2xl mb-2">MI Casting</h4>
                                    <p className="font-minimal text-sm text-black/50 dark:text-white/50 uppercase tracking-wider">2011 - Multicultural Identity</p>
                                </div>
                                <div className="md:col-span-8">
                                    <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80">
                                        In 2011, Mijean co-founded the MI Casting (Multicultural Identity Casting) association. The platform became a nurturing ground for diverse talent, fostering collaborations with industry icons such as Romain Brau, Walter Van Beirendonck, Mientus, and Label M UK. Under his guidance, several models went on to walk the runways of London, Milan, and Paris Fashion Weeks.
                                    </p>
                                </div>
                            </div>

                            {/* MIRO 4 You Magazine */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 gsap-section border-t border-black/10 dark:border-white/10 pt-12">
                                <div className="md:col-span-4">
                                    <h4 className="font-creativo font-bold text-2xl mb-2">MIRO 4 You Magazine</h4>
                                    <p className="font-minimal text-sm text-black/50 dark:text-white/50 uppercase tracking-wider">2019 - Present | Global Fashion Coverage</p>
                                </div>
                                <div className="md:col-span-8">
                                    <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80 mb-6">
                                        Out of these diverse experiences, MIRO for You Magazine by Marc Vanderbiesen & Mijean Rochus was born. Under this banner, Mijean captures fashion's multifaceted beauty and diversity. Since 2019, he has embarked on a journey across Europe, documenting the glamour and innovation of fashion weeks in London, Pitti Uomo, Milan, Alta Roma, Paris, Amsterdam, Maastricht and Copenhagen fashion week.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {['London', 'Milan', 'Paris', 'Amsterdam', 'Copenhagen', 'Alta Roma', 'Pitti Uomo', 'Maastricht'].map(city => (
                                            <span key={city} className="border border-black/20 dark:border-white/20 px-3 py-1 text-sm font-minimal uppercase tracking-wider">{city}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* The Talk Podcast */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 gsap-section border-t border-black/10 dark:border-white/10 pt-12">
                                <div className="md:col-span-4">
                                    <h4 className="font-creativo font-bold text-2xl mb-2">The Talk Podcast</h4>
                                    <p className="font-minimal text-sm text-black/50 dark:text-white/50 uppercase tracking-wider">New Chapter • 2025</p>
                                </div>
                                <div className="md:col-span-8 space-y-6">
                                    <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80">
                                        In 2025, Mijean expanded his creative reach into the audio-visual space. While hosting fashion conversations at Galeries Lafayette, he met his future colleague, Gleid. Their immediate dynamic led to the creation of "The Talk," a fashion and lifestyle audio-video podcast.
                                    </p>
                                    <blockquote className="border-l-2 border-black dark:border-white pl-6 italic font-creativo text-2xl leading-relaxed my-8">
                                        "As a passport to cutting-edge fashion and cultural shifts, The Talk brings the world of high fashion and city secrets directly to the audience. With no filters and a sharp lens, Mijean continues to illuminate the narratives and emotions that define modern lifestyle and culture."
                                    </blockquote>
                                    <blockquote className="border-l-2 border-black dark:border-white pl-6 italic font-creativo text-2xl leading-relaxed my-8">
                                        "Mijean Rochus's photographic journey is a testament to the transformative power of passion and dedication. With every click of the shutter, he illuminates and captures not just images but the emotions and narratives that lie within them."
                                    </blockquote>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Spacer */}
                    <div className="w-full h-px bg-black/10 dark:bg-white/10 my-32"></div>

                    {/* Gleid Section */}
                    <section id="gleid">
                        
                        {/* Gleid Hero */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start mb-24">
                            {/* Content Left */}
                            <div className="lg:col-span-7 gsap-section order-2 lg:order-1 pt-8">
                                <h2 className="text-4xl md:text-7xl font-creativo font-bold uppercase tracking-tight mb-4">Gleid</h2>
                                <p className="text-sm tracking-widest uppercase font-minimal text-black/50 dark:text-white/50 mb-12">
                                    Creative Engineer | Fashion Reporter | Co-Founder
                                </p>

                                <p className="text-xl md:text-2xl font-minimal leading-relaxed text-black/80 dark:text-white/80 mb-12">
                                    Gleid is a Paris-based creative engineer working at the intersection of digital innovation, fashion, and culture. His work focuses on building digital and software based solutions for creative and service driven projects, while also engaging in writing, reporting, and brand storytelling.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-black/10 dark:border-white/10 pt-8">
                                    <div>
                                        <h3 className="font-creativo font-bold text-lg">Digital Innovation</h3>
                                        <p className="font-minimal text-black/60 dark:text-white/60">Creative Tech Solutions</p>
                                    </div>
                                    <div>
                                        <h3 className="font-creativo font-bold text-lg">Fashion Culture</h3>
                                        <p className="font-minimal text-black/60 dark:text-white/60">Reporting & Storytelling</p>
                                    </div>
                                </div>
                            </div>

                            {/* Image Right */}
                            <div className="lg:col-span-5 gsap-parallax relative order-1 lg:order-2">
                                <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-[#111]">
                                    <LazyImage
                                        src="/gleid-placeholder.png"
                                        alt="Gleid"
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                    />
                                </div>
                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1 text-xs font-mono border border-black/10 dark:border-white/10 uppercase tracking-wider text-right">
                                    Gleid // Creative Partner
                                </div>
                            </div>
                        </div>

                        {/* Gleid Biography Header */}
                        <div className="text-center max-w-3xl mx-auto mb-20 gsap-section">
                            <p className="text-xs tracking-[0.2em] uppercase font-minimal text-black/50 dark:text-white/50 mb-4">[ Biography ]</p>
                            <h3 className="text-4xl md:text-5xl font-creativo font-bold mb-6">Between Digital & The Field</h3>
                            <p className="text-xl font-minimal text-black/70 dark:text-white/70">
                                A journey from instinctive fashion connection to hands-on experience and digital creativity.
                            </p>
                        </div>

                        {/* Gleid Timeline */}
                        <div className="max-w-5xl mx-auto space-y-16">
                            
                            {/* Instinctive Connection */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 gsap-section border-t border-black/10 dark:border-white/10 pt-12">
                                <div className="md:col-span-4">
                                    <h4 className="font-creativo font-bold text-2xl mb-2">Instinctive Connection</h4>
                                    <p className="font-minimal text-sm text-black/50 dark:text-white/50 uppercase tracking-wider">The roots of craftsmanship</p>
                                </div>
                                <div className="md:col-span-8">
                                    <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80">
                                        Gleid developed an instinctive connection to fashion at a very young age. Introduced to this world by his mother first a passionate creator and seamstress, later a professional he grew up surrounded by fabrics, patterns, and craftsmanship. Observing garments take shape, he learned the language of creation through dialogue and practice, forming an early sensitivity to aesthetics and meaning.
                                    </p>
                                </div>
                            </div>

                            {/* Digital Evolution */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 gsap-section border-t border-black/10 dark:border-white/10 pt-12">
                                <div className="md:col-span-4">
                                    <h4 className="font-creativo font-bold text-2xl mb-2">Digital Evolution</h4>
                                    <p className="font-minimal text-sm text-black/50 dark:text-white/50 uppercase tracking-wider">Tech as a central force</p>
                                </div>
                                <div className="md:col-span-8">
                                    <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80">
                                        As his interests evolved, Gleid oriented his academic path toward computer science and digital technologies. At the same time, his curiosity expanded toward information, market analysis, and event production. He began writing articles, presenting brands, studying trends, and decoding the cultural dynamics shaping the fashion industry.
                                    </p>
                                </div>
                            </div>

                            {/* Global Exposure */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 gsap-section border-t border-black/10 dark:border-white/10 pt-12">
                                <div className="md:col-span-4">
                                    <h4 className="font-creativo font-bold text-2xl mb-2">Global Exposure</h4>
                                    <p className="font-minimal text-sm text-black/50 dark:text-white/50 uppercase tracking-wider">Tokyo & International</p>
                                </div>
                                <div className="md:col-span-8">
                                    <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80">
                                        This curiosity naturally led him from analysis to hands-on experience. He worked as a sales advisor on multiple occasions, collaborating with brands and agencies, notably in Tokyo. There, he developed a deeper appreciation for more conceptual and radical approaches to fashion. Gleid realized his role was not only to observe fashion, but to document, interpret, and transmit it.
                                    </p>
                                </div>
                            </div>

                            {/* A Hybrid Vision */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 gsap-section border-t border-black/10 dark:border-white/10 pt-12">
                                <div className="md:col-span-4">
                                    <h4 className="font-creativo font-bold text-2xl mb-2">A Hybrid Vision</h4>
                                    <p className="font-minimal text-sm text-black/50 dark:text-white/50 uppercase tracking-wider">Reporter & Engineer</p>
                                </div>
                                <div className="md:col-span-8">
                                    <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80">
                                        From this realization emerged a clear direction: to become a fashion reporter, while continuing to operate at the crossroads of digital innovation and event-based culture. His ambition is to merge technology, fashion, and contemporary culture, creating narratives that reflect the rhythm, complexity, and authenticity of modern life.
                                    </p>
                                </div>
                            </div>

                            {/* Birth of The Talk */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 gsap-section border-t border-black/10 dark:border-white/10 pt-12">
                                <div className="md:col-span-4">
                                    <h4 className="font-creativo font-bold text-2xl mb-2">Birth of The Talk</h4>
                                    <p className="font-minimal text-sm text-black/50 dark:text-white/50 uppercase tracking-wider">Co-Founder</p>
                                </div>
                                <div className="md:col-span-8 space-y-8">
                                    <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80">
                                        Gleid’s path crossed with Mijean Rochus during the Tranoï Pop-Up at Galeries Lafayette. Mijean’s experience, vision, and passion for fashion immediately resonated with him, leading to a natural creative alignment. Together, they founded The Talk, a project conceived as an open dialogue, a cultural platform, and a sharp, unfiltered lens on modern fashion and lifestyle.
                                    </p>
                                    
                                    <div>
                                        <h5 className="font-creativo font-bold text-xl mb-3">Aesthetic Identity</h5>
                                        <p className="font-minimal text-lg leading-relaxed text-black/80 dark:text-white/80">
                                            Deeply passionate about cinema and photography, Gleid favors aesthetics that are raw, honest, and direct. His strong affinity for denim and Karasu Zoku reflects a deep connection to Japanese fashion culture, while his dedication to streetwear integrates its codes into his daily style.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
