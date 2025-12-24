/**
 * Gamification System - Badges & Achievements
 * 
 * This module defines all badges and the logic to check/award achievements
 */

import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

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
    EARLY_ADOPTER: {
        id: 'early_adopter',
        name: 'Early Adopter',
        description: 'Joined during the first month',
        icon: 'Rocket',
        color: 'bg-indigo-500',
        criteria: { special: 'early_adopter' }
    },
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
    PROFILE_COMPLETE: {
        id: 'profile_complete',
        name: 'Profile Complete',
        description: 'Set up your complete profile',
        icon: 'UserCheck',
        color: 'bg-emerald-500',
        criteria: { special: 'profile_complete' }
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
 * @param {string} userId - Firebase user ID
 * @param {string} action - The action that triggered the check ('listen', 'comment', 'like')
 * @param {object} metadata - Additional data about the action
 * @returns {Promise<string[]>} - Array of newly awarded badge IDs
 */
export const checkAchievements = async (userId, action, metadata = {}) => {
    if (!userId || !db) return [];

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Initialize user document if it doesn't exist
            await setDoc(userRef, {
                badges: [],
                stats: {
                    episodesListened: 0,
                    commentsPosted: 0,
                    episodesLiked: 0,
                    categoriesExplored: [],
                    loginStreak: 0,
                    lastLoginDate: null
                },
                createdAt: serverTimestamp()
            });
            return [];
        }

        const userData = userSnap.data();
        const currentBadges = userData.badges || [];
        const stats = userData.stats || {
            episodesListened: 0,
            commentsPosted: 0,
            episodesLiked: 0,
            categoriesExplored: [],
            loginStreak: 0
        };

        // Update stats based on action
        let updatedStats = { ...stats };

        switch (action) {
            case 'listen':
                updatedStats.episodesListened = (stats.episodesListened || 0) + 1;
                if (metadata.category && !stats.categoriesExplored?.includes(metadata.category)) {
                    updatedStats.categoriesExplored = [...(stats.categoriesExplored || []), metadata.category];
                }
                // Check for night owl
                const hour = new Date().getHours();
                if (hour >= 0 && hour < 5) {
                    updatedStats.isNightOwl = true;
                }
                break;
            case 'comment':
                updatedStats.commentsPosted = (stats.commentsPosted || 0) + 1;
                break;
            case 'like':
                updatedStats.episodesLiked = (stats.episodesLiked || 0) + 1;
                break;
            case 'unlike':
                updatedStats.episodesLiked = Math.max(0, (stats.episodesLiked || 1) - 1);
                break;
            default:
                break;
        }

        // Check which badges should be awarded
        const newBadges = [];

        for (const badge of Object.values(BADGES)) {
            // Skip if already earned
            if (currentBadges.includes(badge.id)) continue;

            let shouldAward = false;

            // Check criteria
            if (badge.criteria.episodesListened && updatedStats.episodesListened >= badge.criteria.episodesListened) {
                shouldAward = true;
            }
            if (badge.criteria.commentsPosted && updatedStats.commentsPosted >= badge.criteria.commentsPosted) {
                shouldAward = true;
            }
            if (badge.criteria.episodesLiked && updatedStats.episodesLiked >= badge.criteria.episodesLiked) {
                shouldAward = true;
            }
            if (badge.criteria.categoriesExplored && updatedStats.categoriesExplored?.length >= badge.criteria.categoriesExplored) {
                shouldAward = true;
            }
            if (badge.criteria.special === 'night_owl' && updatedStats.isNightOwl) {
                shouldAward = true;
            }
            if (badge.criteria.badgesEarned && (currentBadges.length + newBadges.length) >= badge.criteria.badgesEarned) {
                shouldAward = true;
            }

            if (shouldAward) {
                newBadges.push(badge.id);
            }
        }

        // Update user document with new stats and badges
        const updateData = {
            stats: updatedStats
        };

        if (newBadges.length > 0) {
            updateData.badges = arrayUnion(...newBadges);
        }

        await updateDoc(userRef, updateData);

        return newBadges;
    } catch (error) {
        console.error('Error checking achievements:', error);
        return [];
    }
};

/**
 * Get user's badges and stats
 * @param {string} userId - Firebase user ID
 * @returns {Promise<{badges: string[], stats: object}>}
 */
export const getUserBadges = async (userId) => {
    if (!userId || !db) return { badges: [], stats: {} };

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return { badges: [], stats: {} };
        }

        const userData = userSnap.data();
        return {
            badges: userData.badges || [],
            stats: userData.stats || {}
        };
    } catch (error) {
        console.error('Error getting user badges:', error);
        return { badges: [], stats: {} };
    }
};

/**
 * Initialize user stats (call on first login)
 * @param {string} userId - Firebase user ID
 * @param {object} userData - User data from auth
 */
export const initializeUserStats = async (userId, userData = {}) => {
    if (!userId || !db) return;

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                displayName: userData.displayName || null,
                email: userData.email || null,
                photoURL: userData.photoURL || null,
                badges: [],
                stats: {
                    episodesListened: 0,
                    commentsPosted: 0,
                    episodesLiked: 0,
                    categoriesExplored: [],
                    loginStreak: 0,
                    lastLoginDate: null
                },
                favorites: [],
                isPublic: true,
                createdAt: serverTimestamp()
            });
        } else {
            // Update user info and check for login streak
            const data = userSnap.data();
            const today = new Date().toDateString();
            const lastLogin = data.stats?.lastLoginDate;

            let newStreak = data.stats?.loginStreak || 0;
            if (lastLogin) {
                const lastDate = new Date(lastLogin);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastDate.toDateString() === yesterday.toDateString()) {
                    newStreak += 1;
                } else if (lastDate.toDateString() !== today) {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            await updateDoc(userRef, {
                displayName: userData.displayName || data.displayName,
                email: userData.email || data.email,
                photoURL: userData.photoURL || data.photoURL,
                'stats.loginStreak': newStreak,
                'stats.lastLoginDate': today
            });

            // Check for streak badge
            if (newStreak >= 7) {
                await checkAchievements(userId, 'streak');
            }
        }
    } catch (error) {
        console.error('Error initializing user stats:', error);
    }
};
