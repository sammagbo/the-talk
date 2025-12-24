import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getContinueListening } from '../utils/playbackHistory';

export default function ContinueListening({ onPlay }) {
    const { user } = useAuth();
    const [continueData, setContinueData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContinueListening = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const data = await getContinueListening(user.uid);
                setContinueData(data);
            } catch (error) {
                console.error('Error fetching continue listening:', error);
            }
            setLoading(false);
        };

        fetchContinueListening();
    }, [user]);

    // Don't show if not logged in or no data
    if (!user || loading || !continueData) return null;

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const timeLeft = continueData.duration - continueData.currentTime;
    const progressPercent = continueData.progressPercent || 0;

    const handleContinue = () => {
        if (onPlay) {
            onPlay({
                id: continueData.episodeId,
                title: continueData.episodeTitle,
                src: continueData.episodeImage,
                category: continueData.episodeCategory,
                // The Player will automatically restore position from saved data
            });
        }
    };

    return (
        <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <RotateCcw className="w-5 h-5 text-[#007BFF]" />
                <h2 className="text-xl font-creativo font-bold text-black dark:text-white">
                    Continue Listening
                </h2>
            </div>

            <div
                onClick={handleContinue}
                className="group relative bg-gradient-to-r from-[#007BFF]/10 to-[#A9A9F5]/10 rounded-2xl border border-[#007BFF]/20 hover:border-[#007BFF]/50 p-4 md:p-6 cursor-pointer transition-all"
            >
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Episode Image */}
                    <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                        <img
                            src={continueData.episodeImage || 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=200&q=80'}
                            alt={continueData.episodeTitle}
                            className="w-full h-full rounded-xl object-cover"
                        />
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 bg-[#007BFF] rounded-full flex items-center justify-center">
                                <Play size={20} fill="white" className="text-white ml-0.5" />
                            </div>
                        </div>
                    </div>

                    {/* Episode Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[#007BFF] text-xs font-creativo font-bold uppercase tracking-widest mb-1">
                            {continueData.episodeCategory}
                        </p>
                        <h3 className="text-lg md:text-xl font-creativo font-bold text-black dark:text-white truncate group-hover:text-[#007BFF] transition-colors">
                            {continueData.episodeTitle}
                        </h3>

                        {/* Progress info */}
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-[#6C757D]">
                            <Clock size={14} />
                            <span>{formatTime(timeLeft)} remaining</span>
                        </div>
                    </div>

                    {/* Resume Button (Desktop) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleContinue();
                        }}
                        className="hidden md:flex items-center gap-2 bg-[#007BFF] hover:bg-[#0069d9] text-white px-6 py-3 rounded-full font-creativo font-bold transition-all shadow-lg shadow-[#007BFF]/20"
                    >
                        <Play size={18} fill="currentColor" />
                        Resume
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="h-1.5 bg-gray-200 dark:bg-[#333] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#007BFF] to-[#A9A9F5] rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs text-gray-400 dark:text-[#555]">
                        <span>{formatTime(continueData.currentTime)}</span>
                        <span>{Math.round(progressPercent)}% complete</span>
                        <span>{formatTime(continueData.duration)}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
