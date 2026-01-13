import React, { useState } from 'react';
import { Clock, Play } from 'lucide-react';

/**
 * EpisodeChapters - Chapter markers for podcast episodes
 */
export default function EpisodeChapters({
    chapters = [],
    currentTime = 0,
    onSeek,
    className = ''
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (chapters.length === 0) return null;

    const getCurrentChapter = () => {
        for (let i = chapters.length - 1; i >= 0; i--) {
            if (currentTime >= chapters[i].startTime) {
                return i;
            }
        }
        return 0;
    };

    const currentChapterIndex = getCurrentChapter();

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`bg-gray-50 dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#333] ${className}`}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Clock size={18} className="text-[#007BFF]" />
                    <span className="font-creativo font-bold text-black dark:text-white">
                        Chapitres
                    </span>
                    <span className="text-sm text-gray-500 dark:text-[#6C757D]">
                        ({chapters.length})
                    </span>
                </div>
                <span className="text-xs text-[#007BFF] font-minimal">
                    {isExpanded ? 'Réduire' : 'Voir tout'}
                </span>
            </button>

            {/* Chapters List */}
            {isExpanded && (
                <div className="border-t border-gray-200 dark:border-[#333]">
                    {chapters.map((chapter, index) => (
                        <button
                            key={index}
                            onClick={() => onSeek(chapter.startTime)}
                            className={`w-full flex items-center gap-4 p-4 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors text-left ${index === currentChapterIndex
                                    ? 'bg-[#007BFF]/10 border-l-2 border-[#007BFF]'
                                    : ''
                                }`}
                        >
                            {/* Chapter Number */}
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === currentChapterIndex
                                        ? 'bg-[#007BFF] text-white'
                                        : 'bg-gray-200 dark:bg-[#222] text-gray-600 dark:text-[#6C757D]'
                                    }`}
                            >
                                {index === currentChapterIndex ? (
                                    <Play size={14} fill="currentColor" />
                                ) : (
                                    index + 1
                                )}
                            </div>

                            {/* Chapter Info */}
                            <div className="flex-1 min-w-0">
                                <h4
                                    className={`font-minimal font-medium truncate ${index === currentChapterIndex
                                            ? 'text-[#007BFF]'
                                            : 'text-black dark:text-white'
                                        }`}
                                >
                                    {chapter.title}
                                </h4>
                                {chapter.description && (
                                    <p className="text-xs text-gray-500 dark:text-[#6C757D] truncate">
                                        {chapter.description}
                                    </p>
                                )}
                            </div>

                            {/* Time */}
                            <span className="text-sm font-mono text-gray-500 dark:text-[#6C757D]">
                                {formatTime(chapter.startTime)}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
