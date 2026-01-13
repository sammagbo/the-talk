import React, { useState } from 'react';
import { ChevronDown, Search, Download, Copy, Check } from 'lucide-react';

/**
 * TranscriptView - Episode transcript display with search and timestamps
 */
export default function TranscriptView({
    transcript = [],
    onSeek,
    className = ''
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    if (transcript.length === 0) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const filteredTranscript = searchQuery
        ? transcript.filter((item) =>
            item.text.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : transcript;

    const copyTranscript = async () => {
        const text = transcript.map((t) => `[${formatTime(t.startTime)}] ${t.text}`).join('\n');
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const displayItems = isExpanded ? filteredTranscript : filteredTranscript.slice(0, 5);

    return (
        <div className={`bg-gray-50 dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#333] ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-[#333]">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-creativo font-bold text-black dark:text-white">
                        Transcription
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={copyTranscript}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#222] transition-colors"
                            title="Copier la transcription"
                        >
                            {copied ? (
                                <Check size={16} className="text-green-500" />
                            ) : (
                                <Copy size={16} className="text-gray-500" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher dans la transcription..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#333] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#007BFF]"
                    />
                </div>
            </div>

            {/* Transcript Items */}
            <div className="max-h-96 overflow-y-auto">
                {displayItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => onSeek?.(item.startTime)}
                        className="w-full flex items-start gap-3 p-4 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors text-left border-b border-gray-100 dark:border-[#222] last:border-0"
                    >
                        <span className="text-xs font-mono text-[#007BFF] bg-[#007BFF]/10 px-2 py-1 rounded flex-shrink-0">
                            {formatTime(item.startTime)}
                        </span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-minimal leading-relaxed">
                            {searchQuery ? (
                                <HighlightText text={item.text} highlight={searchQuery} />
                            ) : (
                                item.text
                            )}
                        </p>
                    </button>
                ))}
            </div>

            {/* Show More */}
            {filteredTranscript.length > 5 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-center gap-2 p-3 text-[#007BFF] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors border-t border-gray-200 dark:border-[#333]"
                >
                    <span className="text-sm font-medium">
                        {isExpanded ? 'Voir moins' : `Voir tout (${filteredTranscript.length})`}
                    </span>
                    <ChevronDown
                        size={16}
                        className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </button>
            )}
        </div>
    );
}

/**
 * HighlightText - Highlights search matches in text
 */
function HighlightText({ text, highlight }) {
    if (!highlight) return text;

    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-300 dark:bg-yellow-500/30 text-inherit rounded px-0.5">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
}
