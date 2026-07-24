import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { X, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { client } from '../sanity';

const YOUTUBE_ID_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function isYouTubeUrl(url) {
    return !!url && (url.includes('youtube') || url.includes('youtu.be'));
}

function ShortSlide({ short, isActive, muted, registerRef }) {
    const youtube = isYouTubeUrl(short.videoUrl);
    const youtubeId = youtube ? short.videoUrl.match(YOUTUBE_ID_REGEX)?.[1] : null;

    return (
        <div
            data-id={short._id}
            ref={(el) => registerRef(short._id, el)}
            className="relative h-[100dvh] w-full snap-start snap-always flex items-center justify-center bg-black"
        >
            {isActive ? (
                youtube ? (
                    <>
                        <iframe
                            key={`${short._id}-${muted}`}
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${muted ? 1 : 0}&playsinline=1&controls=0&loop=1&playlist=${youtubeId}&rel=0`}
                            title={short.title}
                            className="aspect-[9/16] h-full max-h-full w-auto max-w-full"
                            allow="autoplay; encrypted-media; picture-in-picture"
                        />
                        {/* Absorbs touch so the swipe reaches the feed's scroll container instead of
                            being captured by the cross-origin iframe (iOS in particular). */}
                        <div className="absolute inset-0" aria-hidden="true" />
                    </>
                ) : (
                    <video
                        ref={(el) => {
                            if (!el) return;
                            // React's `muted` prop doesn't reliably set the HTML attribute on first
                            // paint, and iOS Safari requires the attribute (not just the property) to
                            // allow autoplay. Force all three, and (re)try play() on every update.
                            el.muted = muted;
                            el.defaultMuted = true;
                            el.setAttribute('muted', '');
                            if (isActive && muted) {
                                el.play().catch(() => {});
                            }
                        }}
                        src={short.videoUrl}
                        autoPlay
                        loop
                        playsInline
                        className="h-full max-h-full w-auto max-w-full object-contain"
                    />
                )
            ) : (
                <img
                    src={short.thumbnailUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80'}
                    alt={short.title}
                    className="h-full max-h-full w-auto max-w-full object-contain"
                />
            )}

            <div className="pointer-events-none absolute bottom-8 left-4 right-4">
                <p className="font-minimal text-sm text-white">{short.title}</p>
            </div>
        </div>
    );
}

export default function ShortsPage({ onPause }) {
    const navigate = useNavigate();
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState(null);
    const [muted, setMuted] = useState(true);

    const containerRef = useRef(null);
    const slideRefs = useRef({});

    const registerRef = (id, el) => {
        if (el) slideRefs.current[id] = el;
        else delete slideRefs.current[id];
    };

    // Pause the global audio player once when entering the immersive shorts feed.
    useEffect(() => {
        onPause?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only; onPause identity changes every App render
    }, []);

    // Fetch shorts.
    useEffect(() => {
        let cancelled = false;
        const startId = new URLSearchParams(window.location.search).get('start');

        const fetchShorts = async () => {
            try {
                const query = `*[_type == "short"] | order(publishedAt desc)[0...50] {
                    _id,
                    title,
                    videoUrl,
                    "thumbnailUrl": thumbnail.asset->url,
                    publishedAt
                }`;
                const data = await client.fetch(query);
                if (cancelled) return;
                setShorts(data);
                setActiveId(startId && data.some((s) => s._id === startId) ? startId : (data[0]?._id ?? null));
            } catch (error) {
                console.error('Error fetching shorts:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchShorts();
        return () => { cancelled = true; };
    }, []);

    // Deep-link: jump straight to the requested short once the feed is rendered.
    useEffect(() => {
        if (!shorts.length) return;
        const startId = new URLSearchParams(window.location.search).get('start');
        if (!startId) return;
        slideRefs.current[startId]?.scrollIntoView({ behavior: 'instant' });
    }, [shorts]);

    // Only the slide crossing 60% visibility mounts its player; the rest show a thumbnail.
    useEffect(() => {
        if (!shorts.length || !containerRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.dataset.id);
                    }
                });
            },
            { root: containerRef.current, threshold: 0.6 }
        );
        Object.values(slideRefs.current).forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, [shorts]);

    return (
        <div className="fixed inset-0 z-[200] h-[100dvh] bg-black">
            <Helmet>
                <title>Shorts | THE TALK</title>
            </Helmet>

            <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Fermer"
                className="fixed top-4 right-4 z-10 flex h-10 w-10 items-center justify-center bg-black/40 text-white transition-colors hover:bg-black/60"
                style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}
            >
                <X className="h-6 w-6" />
            </button>

            <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? 'Activer le son' : 'Couper le son'}
                className="fixed top-4 left-4 z-10 flex h-10 w-10 items-center justify-center bg-black/40 text-white transition-colors hover:bg-black/60"
                style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}
            >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>

            {loading ? (
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-white" />
                </div>
            ) : shorts.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                    <p className="font-minimal text-white">Aucun short pour le moment.</p>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="font-minimal text-sm uppercase tracking-widest text-white/60 hover:text-white"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            ) : (
                <div
                    ref={containerRef}
                    className="h-full overflow-y-scroll"
                    style={{ scrollSnapType: 'y mandatory', overscrollBehaviorY: 'contain' }}
                >
                    {shorts.map((short) => (
                        <ShortSlide
                            key={short._id}
                            short={short}
                            isActive={short._id === activeId}
                            muted={muted}
                            registerRef={registerRef}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
