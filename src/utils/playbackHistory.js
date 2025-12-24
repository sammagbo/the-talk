/**
 * Playback History - Tracks listening progress for episodes
 */

import { doc, getDoc, setDoc, collection, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Save playback progress to Firestore
 * @param {string} userId - Firebase user ID
 * @param {object} episode - Episode object with id, title, src, category
 * @param {number} currentTime - Current playback position in seconds
 * @param {number} duration - Total episode duration in seconds
 */
export const savePlaybackProgress = async (userId, episode, currentTime, duration) => {
    if (!userId || !episode?.id || !db) return;

    try {
        const historyRef = doc(db, 'listening_history', `${userId}_${episode.id}`);

        const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
        const isCompleted = progressPercent >= 95; // Consider complete at 95%

        await setDoc(historyRef, {
            userId: userId,
            episodeId: episode.id,
            episodeTitle: episode.title,
            episodeImage: episode.src || episode.fullSrc || null,
            episodeCategory: episode.category || 'Épisodes',
            currentTime: currentTime,
            duration: duration,
            progressPercent: progressPercent,
            isCompleted: isCompleted,
            lastPlayedAt: serverTimestamp()
        }, { merge: true });

    } catch (error) {
        console.error('Error saving playback progress:', error);
    }
};

/**
 * Get the most recent unfinished episode for a user
 * @param {string} userId - Firebase user ID
 * @returns {Promise<object|null>} - Most recent unfinished episode or null
 */
export const getContinueListening = async (userId) => {
    if (!userId || !db) return null;

    try {
        const historyRef = collection(db, 'listening_history');
        const q = query(
            historyRef,
            where('userId', '==', userId),
            where('isCompleted', '==', false),
            orderBy('lastPlayedAt', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('Error fetching continue listening:', error);
        return null;
    }
};

/**
 * Get listening history for a user (multiple episodes)
 * @param {string} userId - Firebase user ID
 * @param {number} maxItems - Maximum number of items to return
 * @returns {Promise<object[]>} - Array of listening history entries
 */
export const getListeningHistory = async (userId, maxItems = 5) => {
    if (!userId || !db) return [];

    try {
        const historyRef = collection(db, 'listening_history');
        const q = query(
            historyRef,
            where('userId', '==', userId),
            orderBy('lastPlayedAt', 'desc'),
            limit(maxItems)
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching listening history:', error);
        return [];
    }
};

/**
 * Get saved playback position for an episode
 * @param {string} userId - Firebase user ID
 * @param {string} episodeId - Episode ID
 * @returns {Promise<number>} - Saved position in seconds, or 0
 */
export const getSavedPosition = async (userId, episodeId) => {
    if (!userId || !episodeId || !db) return 0;

    try {
        const historyRef = doc(db, 'listening_history', `${userId}_${episodeId}`);
        const docSnap = await getDoc(historyRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Don't resume if already completed
            if (data.isCompleted) return 0;
            return data.currentTime || 0;
        }
        return 0;
    } catch (error) {
        console.error('Error getting saved position:', error);
        return 0;
    }
};

/**
 * Mark an episode as completed
 * @param {string} userId - Firebase user ID
 * @param {string} episodeId - Episode ID
 */
export const markAsCompleted = async (userId, episodeId) => {
    if (!userId || !episodeId || !db) return;

    try {
        const historyRef = doc(db, 'listening_history', `${userId}_${episodeId}`);
        await setDoc(historyRef, {
            isCompleted: true,
            progressPercent: 100,
            completedAt: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('Error marking as completed:', error);
    }
};
