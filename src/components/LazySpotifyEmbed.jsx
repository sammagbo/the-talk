import React, { useState, useEffect, useRef } from 'react';
import { Play, Loader2 } from 'lucide-react';

/**
 * LazySpotifyEmbed - Loads Spotify iframe only when visible in viewport
 * Reduces initial page weight by deferring heavy iframe until needed
 */
export default function LazySpotifyEmbed({
    embedUrl,
    height = 80,
    className = '',
    title = 'Spotify Player'
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect();
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '100px', // Load slightly before visible
            }
        );

        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    if (!embedUrl) return null;

    return (
        <div
            ref={containerRef}
            className={`relative w-full ${className}`}
            style={{ minHeight: height }}
        >
            {!isVisible ? (
                // Lightweight placeholder before iframe loads
                <div
                    className="flex items-center justify-center gap-3 bg-[#1DB954]/10 rounded-xl border border-[#1DB954]/20 cursor-pointer hover:bg-[#1DB954]/20 transition-colors"
                    style={{ height }}
                    onClick={() => setIsVisible(true)}
                >
                    <Play size={20} className="text-[#1DB954]" fill="currentColor" />
                    <span className="text-sm font-medium text-[#1DB954]">
                        Écouter sur Spotify
                    </span>
                </div>
            ) : (
                <>
                    {/* Loading state */}
                    {!isLoaded && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-[#111] rounded-xl"
                            style={{ height }}
                        >
                            <Loader2 className="w-6 h-6 animate-spin text-[#1DB954]" />
                        </div>
                    )}

                    {/* Spotify iframe */}
                    <iframe
                        title={title}
                        src={embedUrl}
                        width="100%"
                        height={height}
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        onLoad={() => setIsLoaded(true)}
                        className={`rounded-xl shadow-sm transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        style={{ borderRadius: '12px' }}
                    />
                </>
            )}
        </div>
    );
}
