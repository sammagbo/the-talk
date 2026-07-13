import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Volume2, VolumeX, Share2, Check, SkipBack, SkipForward } from 'lucide-react';
import { shareContent, getEpisodeShareUrl } from '../utils/share';
import LazySpotifyEmbed from './LazySpotifyEmbed';
import AudioWaveform from './AudioWaveform';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function Player({ currentEpisode, isPlaying, onClose, onTogglePlay }) {
    const audioRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [shareToast, setShareToast] = useState(null);

    // New controls state
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    useEffect(() => {
        if (currentEpisode?.audioUrl && audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback failed:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [currentEpisode, isPlaying]);

    // Volume control
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // Playback speed control
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

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
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500 dark:text-[#6C757D] truncate">{currentEpisode.category}</p>
                        </div>
                    </div>
                </div>

                {/* Controls (Center) */}
                <div className="flex flex-col items-center w-1/3">
                    {currentEpisode.audioUrl ? (
                        <>
                            <div className="flex items-center gap-4 mb-2">
                                {/* Skip Back */}
                                <button
                                    onClick={() => {
                                        if (audioRef.current) {
                                            audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
                                            setProgress(audioRef.current.currentTime);
                                        }
                                    }}
                                    aria-label="Skip back 10 seconds"
                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    <SkipBack size={18} />
                                </button>

                                {/* Play/Pause */}
                                <button
                                    onClick={onTogglePlay}
                                    aria-label={isPlaying ? 'Pause' : 'Play'}
                                    className="w-12 h-12 bg-[#007BFF] hover:bg-[#0069d9] rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 shadow-lg shadow-[#007BFF]/20"
                                >
                                    {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
                                </button>

                                {/* Skip Forward */}
                                <button
                                    onClick={() => {
                                        if (audioRef.current) {
                                            audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration || 0);
                                            setProgress(audioRef.current.currentTime);
                                        }
                                    }}
                                    aria-label="Skip forward 10 seconds"
                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    <SkipForward size={18} />
                                </button>
                            </div>

                            {/* Waveform */}
                            {isPlaying && (
                                <div className="w-full max-w-[200px] mb-1 hidden md:block">
                                    <AudioWaveform isPlaying={isPlaying} barCount={16} height={20} />
                                </div>
                            )}
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
                            <LazySpotifyEmbed
                                embedUrl={currentEpisode.spotifyEmbedUrl}
                                height={80}
                                title={`Spotify - ${currentEpisode.title}`}
                            />
                        </div>
                    ) : (
                        <p className="text-xs text-red-500">Audio non disponible</p>
                    )}
                </div>

                {/* Actions (Right) */}
                <div className="flex items-center justify-end gap-2 md:gap-4 w-1/3">
                    {/* Share Button */}
                    <button
                        aria-label="Share"
                        onClick={async () => {
                            if (!currentEpisode?.id) return;
                            const shareUrl = getEpisodeShareUrl(currentEpisode.id);
                            const result = await shareContent({
                                title: `${currentEpisode.title} | THE TALK`,
                                text: `Écoute cet épisode de THE TALK: ${currentEpisode.title}`,
                                url: shareUrl
                            });
                            if (result.success && result.method === 'clipboard') {
                                setShareToast('Link Copied!');
                                setTimeout(() => setShareToast(null), 3000);
                            }
                        }}
                        className="text-gray-400 hover:text-black dark:hover:text-white transition-colors hidden md:block"
                    >
                        <Share2 size={20} />
                    </button>

                    {/* Playback Speed */}
                    <div className="relative hidden md:block">
                        <button
                            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                            aria-label="Playback speed"
                            className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-[#222] rounded-full transition-colors"
                        >
                            {playbackSpeed}x
                        </button>
                        {showSpeedMenu && (
                            <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg shadow-xl py-1 min-w-[80px] z-50">
                                {PLAYBACK_SPEEDS.map((speed) => (
                                    <button
                                        key={speed}
                                        onClick={() => {
                                            setPlaybackSpeed(speed);
                                            setShowSpeedMenu(false);
                                        }}
                                        className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-[#222] transition-colors ${playbackSpeed === speed ? 'text-[#007BFF] font-bold' : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {speed}x
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Volume Control */}
                    <div className="relative hidden md:flex items-center gap-2">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            onMouseEnter={() => setShowVolumeSlider(true)}
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                            className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-200 ${showVolumeSlider ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}
                            onMouseLeave={() => setShowVolumeSlider(false)}
                        >
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => {
                                    setVolume(parseFloat(e.target.value));
                                    if (parseFloat(e.target.value) > 0) setIsMuted(false);
                                }}
                                className="w-full h-1 bg-gray-200 dark:bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#007BFF]"
                            />
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        aria-label="Fermer le lecteur"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full text-gray-500 dark:text-[#6C757D] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Share Toast Notification */}
            {shareToast && (
                <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-[201] animate-fade-in-up">
                    <div className="flex items-center gap-3 px-5 py-3 bg-[#007BFF] text-white rounded-xl shadow-lg">
                        <Check size={18} />
                        <span className="font-minimal text-sm">{shareToast}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
