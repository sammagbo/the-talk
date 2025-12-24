import React from 'react';
import {
    Play,
    Headphones,
    Star,
    Crown,
    MessageCircle,
    MessageSquare,
    MessagesSquare,
    Heart,
    Bookmark,
    Flame,
    Rocket,
    Moon,
    Zap,
    UserCheck,
    Compass,
    Medal,
    Lock
} from 'lucide-react';
import { getAllBadges, getBadgeById } from '../utils/badges';

// Map badge icon names to Lucide components
const iconMap = {
    Play,
    Headphones,
    Star,
    Crown,
    MessageCircle,
    MessageSquare,
    MessagesSquare,
    Heart,
    Bookmark,
    Flame,
    Rocket,
    Moon,
    Zap,
    UserCheck,
    Compass,
    Medal
};

/**
 * Single Badge Component
 */
function Badge({ badge, isUnlocked, size = 'md' }) {
    const Icon = iconMap[badge.icon] || Medal;

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-16 h-16',
        lg: 'w-20 h-20'
    };

    const iconSizes = {
        sm: 20,
        md: 24,
        lg: 32
    };

    return (
        <div
            className={`relative group cursor-pointer transition-all duration-300 ${isUnlocked ? 'hover:scale-110' : 'opacity-40 grayscale'
                }`}
            title={`${badge.name}${isUnlocked ? '' : ' (Locked)'}`}
        >
            {/* Badge Circle */}
            <div className={`
                ${sizeClasses[size]} 
                rounded-full 
                flex items-center justify-center 
                ${isUnlocked ? badge.color : 'bg-gray-300 dark:bg-gray-700'}
                ${isUnlocked ? 'shadow-lg' : ''}
                transition-all duration-300
            `}>
                {isUnlocked ? (
                    <Icon size={iconSizes[size]} className="text-white" />
                ) : (
                    <Lock size={iconSizes[size]} className="text-gray-500 dark:text-gray-400" />
                )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                <div className="bg-black dark:bg-white text-white dark:text-black px-3 py-2 rounded-lg text-center whitespace-nowrap shadow-xl">
                    <p className="font-creativo font-bold text-sm">{badge.name}</p>
                    <p className="text-xs opacity-80">{badge.description}</p>
                    {!isUnlocked && (
                        <p className="text-xs text-yellow-400 dark:text-yellow-600 mt-1">🔒 Locked</p>
                    )}
                </div>
                {/* Arrow */}
                <div className="absolute left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-black dark:border-t-white"></div>
            </div>
        </div>
    );
}

/**
 * Badges Section Component for ProfilePage
 */
export default function BadgesDisplay({ userBadges = [], showAll = true }) {
    const allBadges = getAllBadges();
    const unlockedBadgeIds = userBadges;

    // Separate unlocked and locked badges
    const unlockedBadges = allBadges.filter(badge => unlockedBadgeIds.includes(badge.id));
    const lockedBadges = allBadges.filter(badge => !unlockedBadgeIds.includes(badge.id));

    // Calculate progress
    const progressPercent = (unlockedBadges.length / allBadges.length) * 100;

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-gray-100 dark:bg-[#111] rounded-xl p-4 border border-gray-200 dark:border-[#333]">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-minimal text-gray-600 dark:text-[#6C757D]">
                        Achievement Progress
                    </span>
                    <span className="text-sm font-creativo font-bold text-[#007BFF]">
                        {unlockedBadges.length}/{allBadges.length}
                    </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-[#222] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#007BFF] to-[#A9A9F5] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Unlocked Badges */}
            {unlockedBadges.length > 0 && (
                <div>
                    <h4 className="text-lg font-creativo font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                        <Medal className="w-5 h-5 text-yellow-500" />
                        Earned Badges ({unlockedBadges.length})
                    </h4>
                    <div className="flex flex-wrap gap-4">
                        {unlockedBadges.map(badge => (
                            <Badge key={badge.id} badge={badge} isUnlocked={true} />
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Badges (optional display) */}
            {showAll && lockedBadges.length > 0 && (
                <div>
                    <h4 className="text-lg font-creativo font-bold text-gray-400 dark:text-[#6C757D] mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Locked Badges ({lockedBadges.length})
                    </h4>
                    <div className="flex flex-wrap gap-4">
                        {lockedBadges.map(badge => (
                            <Badge key={badge.id} badge={badge} isUnlocked={false} size="sm" />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {unlockedBadges.length === 0 && (
                <div className="text-center py-8 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-[#333]">
                    <Medal className="w-12 h-12 mx-auto text-gray-300 dark:text-[#333] mb-4" />
                    <p className="text-gray-500 dark:text-[#6C757D] font-minimal mb-2">
                        No badges earned yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-[#555]">
                        Start listening to episodes and engaging to earn badges!
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Mini version for showing in compact spaces
 */
export function BadgesMini({ userBadges = [], maxDisplay = 5 }) {
    const displayBadges = userBadges.slice(0, maxDisplay);
    const remaining = userBadges.length - maxDisplay;

    if (displayBadges.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-1">
            {displayBadges.map(badgeId => {
                const badge = getBadgeById(badgeId);
                if (!badge) return null;
                return (
                    <Badge key={badge.id} badge={badge} isUnlocked={true} size="sm" />
                );
            })}
            {remaining > 0 && (
                <span className="text-sm text-gray-500 dark:text-[#6C757D] ml-2">
                    +{remaining} more
                </span>
            )}
        </div>
    );
}

/**
 * New Badge Notification Component
 */
export function NewBadgeNotification({ badge, onClose }) {
    const Icon = iconMap[badge.icon] || Medal;

    return (
        <div className="fixed bottom-24 right-6 z-50 animate-bounce-in">
            <div className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#333] p-6 max-w-sm">
                <div className="flex items-start gap-4">
                    <div className={`${badge.color} p-4 rounded-full`}>
                        <Icon size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-[#007BFF] font-bold uppercase tracking-wider mb-1">
                            🎉 New Badge Unlocked!
                        </p>
                        <h4 className="text-xl font-creativo font-bold text-black dark:text-white">
                            {badge.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-[#6C757D]">
                            {badge.description}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black dark:hover:text-white"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}
