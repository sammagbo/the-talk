import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Volume2, Maximize2 } from 'lucide-react';

export default function Player({ currentEpisode, isPlaying, onClose, onTogglePlay }) {
    const audioRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (currentEpisode?.audioUrl && audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback failed:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [currentEpisode, isPlaying]);

    // Media Session API Support
    useEffect(() => {
        if ('mediaSession' in navigator && currentEpisode) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentEpisode.title,
                artist: 'Mijean Rochus',
                album: 'THE TALK',
                artwork: [
                    { src: currentEpisode.src, sizes: '96x96', type: 'image/jpeg' },
                    { src: currentEpisode.src, sizes: '128x128', type: 'image/jpeg' },
                    { src: currentEpisode.src, sizes: '192x192', type: 'image/jpeg' },
                    { src: currentEpisode.src, sizes: '256x256', type: 'image/jpeg' },
                    { src: currentEpisode.src, sizes: '384x384', type: 'image/jpeg' },
                    { src: currentEpisode.src, sizes: '512x512', type: 'image/jpeg' },
                ]
            });

            navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

            navigator.mediaSession.setActionHandler('play', () => {
                if (!isPlaying) onTogglePlay();
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                if (isPlaying) onTogglePlay();
            });
            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                if (audioRef.current) {
                    const skipTime = details.seekOffset || 10;
                    audioRef.current.currentTime = Math.max(audioRef.current.currentTime - skipTime, 0);
                    setProgress(audioRef.current.currentTime);
                }
            });
            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                if (audioRef.current) {
                    const skipTime = details.seekOffset || 10;
                    audioRef.current.currentTime = Math.min(audioRef.current.currentTime + skipTime, audioRef.current.duration);
                    setProgress(audioRef.current.currentTime);
                }
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                // Rewind 10 seconds
                if (audioRef.current) {
                    audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
                    setProgress(audioRef.current.currentTime);
                }
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                // Skip forward 10 seconds
                if (audioRef.current) {
                    audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration || 0);
                    setProgress(audioRef.current.currentTime);
                }
            });

            // Cleanup: remove action handlers on unmount
            return () => {
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.setActionHandler('play', null);
                    navigator.mediaSession.setActionHandler('pause', null);
                    navigator.mediaSession.setActionHandler('seekbackward', null);
                    navigator.mediaSession.setActionHandler('seekforward', null);
                    navigator.mediaSession.setActionHandler('previoustrack', null);
                    navigator.mediaSession.setActionHandler('nexttrack', null);
                }
            };
        }
    }, [currentEpisode, isPlaying, onTogglePlay]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const formatTime = (time) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    };

    if (!currentEpisode) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl border-t border-gray-200 dark:border-[#333] p-4 z-[100] transition-all duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
            <div className="container mx-auto flex items-center justify-between gap-4">

                {/* Info */}
                <div className="flex items-center gap-4 w-1/3">
                    <img
                        src={currentEpisode.src}
                        alt={currentEpisode.title}
                        className="w-12 h-12 rounded-lg object-cover shadow-md hidden md:block"
                    />
                    <div className="min-w-0">
                        <h4 className="font-bold text-sm md:text-base truncate text-black dark:text-white">{currentEpisode.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-[#6C757D] truncate">{currentEpisode.category}</p>
                    </div>
                </div>

                {/* Controls (Center) */}
                <div className="flex flex-col items-center w-1/3">
                    {currentEpisode.audioUrl ? (
                        <>
                            <div className="flex items-center gap-6 mb-2">
                                <button
                                    onClick={onTogglePlay}
                                    aria-label={isPlaying ? 'Pause' : 'Play'}
                                    className="w-10 h-10 bg-[#007BFF] hover:bg-[#0069d9] rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 shadow-lg shadow-[#007BFF]/20"
                                >
                                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                                </button>
                            </div>
                            <div className="w-full flex items-center gap-3 text-xs font-minimal text-gray-500 dark:text-[#6C757D]">
                                <span>{formatTime(progress)}</span>
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 100}
                                    value={progress}
                                    onChange={handleSeek}
                                    className="w-full h-1 bg-gray-200 dark:bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#007BFF]"
                                />
                                <span>{formatTime(duration)}</span>
                            </div>
                            <audio
                                ref={audioRef}
                                src={currentEpisode.audioUrl}
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={() => onTogglePlay(false)}
                            />
                        </>
                    ) : currentEpisode.spotifyEmbedUrl ? (
                        <div className="w-full max-w-md">
                            <iframe
                                title="Spotify Player"
                                style={{ borderRadius: '12px' }}
                                src={currentEpisode.spotifyEmbedUrl}
                                width="100%"
                                height="80"
                                frameBorder="0"
                                allowFullScreen=""
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                className="shadow-sm"
                            ></iframe>
                        </div>
                    ) : (
                        <p className="text-xs text-red-500">Audio non disponible</p>
                    )}
                </div>

                {/* Actions (Right) */}
                <div className="flex items-center justify-end gap-4 w-1/3">
                    <button aria-label="Volume" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors hidden md:block">
                        <Volume2 size={20} />
                    </button>
                    <button
                        onClick={onClose}
                        aria-label="Fermer le lecteur"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full text-gray-500 dark:text-[#6C757D] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
