/**
 * Gamification System - Badges & Achievements (Supabase Version)
 * 
 * This module defines all badges and the logic to check/award achievements
 */

import { supabase } from '../supabase';

// Badge Definitions
export const BADGES = {
    // Listening Achievements
    FIRST_LISTEN: {
        id: 'first_listen',
        name: 'First Steps',
        description: 'Listened to your first episode',
        icon: 'Play',
        color: 'bg-blue-500',
        criteria: { episodesListened: 1 }
    },
    CURIOUS_LISTENER: {
        id: 'curious_listener',
        name: 'Curious Listener',
        description: 'Listened to 5 episodes',
        icon: 'Headphones',
        color: 'bg-purple-500',
        criteria: { episodesListened: 5 }
    },
    DEDICATED_FAN: {
        id: 'dedicated_fan',
        name: 'Dedicated Fan',
        description: 'Listened to 20 episodes',
        icon: 'Star',
        color: 'bg-yellow-500',
        criteria: { episodesListened: 20 }
    },
    PODCAST_MASTER: {
        id: 'podcast_master',
        name: 'Podcast Master',
        description: 'Listened to 50 episodes',
        icon: 'Crown',
        color: 'bg-amber-500',
        criteria: { episodesListened: 50 }
    },

    // Engagement Achievements
    FIRST_COMMENT: {
        id: 'first_comment',
        name: 'Voice Heard',
        description: 'Posted your first comment',
        icon: 'MessageCircle',
        color: 'bg-green-500',
        criteria: { commentsPosted: 1 }
    },
    ACTIVE_COMMENTER: {
        id: 'active_commenter',
        name: 'Active Commenter',
        description: 'Posted 10 comments',
        icon: 'MessageSquare',
        color: 'bg-teal-500',
        criteria: { commentsPosted: 10 }
    },
    CONVERSATION_STARTER: {
        id: 'conversation_starter',
        name: 'Conversation Starter',
        description: 'Posted 25 comments',
        icon: 'MessagesSquare',
        color: 'bg-cyan-500',
        criteria: { commentsPosted: 25 }
    },

    // Favorites/Likes Achievements
    FIRST_LIKE: {
        id: 'first_like',
        name: 'First Love',
        description: 'Liked your first episode',
        icon: 'Heart',
        color: 'bg-red-500',
        criteria: { episodesLiked: 1 }
    },
    COLLECTOR: {
        id: 'collector',
        name: 'Collector',
        description: 'Liked 10 episodes',
        icon: 'Bookmark',
        color: 'bg-pink-500',
        criteria: { episodesLiked: 10 }
    },
    SUPER_FAN: {
        id: 'super_fan',
        name: 'Super Fan',
        description: 'Liked 25 episodes',
        icon: 'Flame',
        color: 'bg-orange-500',
        criteria: { episodesLiked: 25 }
    },

    // Special Achievements
    NIGHT_OWL: {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Listened to an episode after midnight',
        icon: 'Moon',
        color: 'bg-slate-600',
        criteria: { special: 'night_owl' }
    },
    STREAK_MASTER: {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Visited 7 days in a row',
        icon: 'Zap',
        color: 'bg-yellow-400',
        criteria: { loginStreak: 7 }
    },
    EXPLORER: {
        id: 'explorer',
        name: 'Explorer',
        description: 'Listened to episodes from 3 different categories',
        icon: 'Compass',
        color: 'bg-sky-500',
        criteria: { categoriesExplored: 3 }
    },
    MEDAL_PIONEER: {
        id: 'medal_pioneer',
        name: 'Medal Pioneer',
        description: 'Earned your first 5 badges',
        icon: 'Medal',
        color: 'bg-gradient-to-r from-yellow-400 to-amber-500',
        criteria: { badgesEarned: 5 }
    }
};

// Get all badges as array
export const getAllBadges = () => Object.values(BADGES);

// Get badge by ID
export const getBadgeById = (id) => {
    return Object.values(BADGES).find(badge => badge.id === id);
};

/**
 * Check and award achievements based on user stats
 * @param {string} userId - User ID
 * @param {string} action - The action that triggered the check
 * @param {object} metadata - Additional data about the action
 * @returns {Promise<string[]>} - Array of newly awarded badge IDs
 */
export const checkAchievements = async (userId, action, metadata = {}) => {
    if (!userId || !supabase) return [];

    try {
        // Get or create user stats
        let { data: stats, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // Stats don't exist, create them
            const { data: newStats, error: createError } = await supabase
                .from('user_stats')
                .insert({ user_id: userId })
                .select()
                .single();

            if (createError) throw createError;
            stats = newStats;
        } else if (error) {
            throw error;
        }

        // Get current user badges
        const { data: userData } = await supabase
            .from('users')
            .select('badges')
            .eq('id', userId)
            .single();

        const currentBadges = userData?.badges || [];

        // Update stats based on action
        let updatedStats = { ...stats };

        switch (action) {
            case 'listen':
                updatedStats.total_listens = (stats.total_listens || 0) + 1;
                if (metadata.category) {
                    const categories = stats.categories_explored || [];
                    if (!categories.includes(metadata.category)) {
                        updatedStats.categories_explored = [...categories, metadata.category];
                    }
                }
                break;
            case 'comment':
                updatedStats.total_comments = (stats.total_comments || 0) + 1;
                break;
            case 'like':
                updatedStats.total_likes = (stats.total_likes || 0) + 1;
                break;
            case 'unlike':
                updatedStats.total_likes = Math.max(0, (stats.total_likes || 1) - 1);
                break;
            default:
                break;
        }

        // Check which badges should be awarded
        const newBadges = [];

        for (const badge of Object.values(BADGES)) {
            if (currentBadges.includes(badge.id)) continue;

            let shouldAward = false;

            if (badge.criteria.episodesListened && updatedStats.total_listens >= badge.criteria.episodesListened) {
                shouldAward = true;
            }
            if (badge.criteria.commentsPosted && updatedStats.total_comments >= badge.criteria.commentsPosted) {
                shouldAward = true;
            }
            if (badge.criteria.episodesLiked && updatedStats.total_likes >= badge.criteria.episodesLiked) {
                shouldAward = true;
            }
            if (badge.criteria.categoriesExplored && (updatedStats.categories_explored?.length || 0) >= badge.criteria.categoriesExplored) {
                shouldAward = true;
            }
            if (badge.criteria.badgesEarned && (currentBadges.length + newBadges.length) >= badge.criteria.badgesEarned) {
                shouldAward = true;
            }

            if (shouldAward) {
                newBadges.push(badge.id);
            }
        }

        // Update stats
        await supabase
            .from('user_stats')
            .update({
                total_listens: updatedStats.total_listens,
                total_likes: updatedStats.total_likes,
                total_comments: updatedStats.total_comments,
                categories_explored: updatedStats.categories_explored,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        // Update badges if new ones earned
        if (newBadges.length > 0) {
            await supabase
                .from('users')
                .update({ badges: [...currentBadges, ...newBadges] })
                .eq('id', userId);
        }

        return newBadges;
    } catch (error) {
        console.error('Error checking achievements:', error);
        return [];
    }
};

/**
 * Get user's badges and stats
 */
export const getUserBadges = async (userId) => {
    if (!userId || !supabase) return { badges: [], stats: {} };

    try {
        const [{ data: userData }, { data: stats }] = await Promise.all([
            supabase.from('users').select('badges').eq('id', userId).single(),
            supabase.from('user_stats').select('*').eq('user_id', userId).single(),
        ]);

        return {
            badges: userData?.badges || [],
            stats: stats || {}
        };
    } catch (error) {
        console.error('Error getting user badges:', error);
        return { badges: [], stats: {} };
    }
};

/**
 * Initialize user stats (call on first login)
 */
export const initializeUserStats = async (userId, userData = {}) => {
    if (!userId || !supabase) return;

    try {
        // Check if user stats exist
        const { data: existing } = await supabase
            .from('user_stats')
            .select('user_id')
            .eq('user_id', userId)
            .single();

        if (!existing) {
            await supabase.from('user_stats').insert({ user_id: userId });
        }
    } catch (error) {
        console.error('Error initializing user stats:', error);
    }
};
