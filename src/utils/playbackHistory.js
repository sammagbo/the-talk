/**
 * Playback History - Tracks listening progress for episodes (Supabase Version)
 */

import { supabase } from '../supabase';

/**
 * Save playback progress to Supabase
 */
export const savePlaybackProgress = async (userId, episode, currentTime, duration) => {
    if (!userId || !episode?.id || !supabase) return;

    try {
        const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
        const isCompleted = progressPercent >= 95;

        await supabase
            .from('playback_history')
            .upsert({
                user_id: userId,
                episode_id: episode.id,
                progress_seconds: Math.floor(currentTime),
                duration_seconds: Math.floor(duration),
                completed: isCompleted,
                last_played_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,episode_id',
            });

    } catch (error) {
        console.error('Error saving playback progress:', error);
    }
};

/**
 * Get the most recent unfinished episode for a user
 */
export const getContinueListening = async (userId) => {
    if (!userId || !supabase) return null;

    try {
        const { data, error } = await supabase
            .from('playback_history')
            .select('*')
            .eq('user_id', userId)
            .eq('completed', false)
            .order('last_played_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return null;

        return {
            id: data.id,
            episodeId: data.episode_id,
            currentTime: data.progress_seconds,
            duration: data.duration_seconds,
            progressPercent: data.duration_seconds > 0
                ? (data.progress_seconds / data.duration_seconds) * 100
                : 0,
            lastPlayedAt: data.last_played_at,
        };
    } catch (error) {
        console.error('Error fetching continue listening:', error);
        return null;
    }
};

/**
 * Get listening history for a user
 */
export const getListeningHistory = async (userId, maxItems = 5) => {
    if (!userId || !supabase) return [];

    try {
        const { data, error } = await supabase
            .from('playback_history')
            .select('*')
            .eq('user_id', userId)
            .order('last_played_at', { ascending: false })
            .limit(maxItems);

        if (error) throw error;

        return (data || []).map(item => ({
            id: item.id,
            episodeId: item.episode_id,
            currentTime: item.progress_seconds,
            duration: item.duration_seconds,
            progressPercent: item.duration_seconds > 0
                ? (item.progress_seconds / item.duration_seconds) * 100
                : 0,
            isCompleted: item.completed,
            lastPlayedAt: item.last_played_at,
        }));
    } catch (error) {
        console.error('Error fetching listening history:', error);
        return [];
    }
};

/**
 * Get saved playback position for an episode
 */
export const getSavedPosition = async (userId, episodeId) => {
    if (!userId || !episodeId || !supabase) return 0;

    try {
        const { data, error } = await supabase
            .from('playback_history')
            .select('progress_seconds, completed')
            .eq('user_id', userId)
            .eq('episode_id', episodeId)
            .single();

        if (error || !data) return 0;
        if (data.completed) return 0; // Don't resume if completed
        return data.progress_seconds || 0;
    } catch (error) {
        console.error('Error getting saved position:', error);
        return 0;
    }
};

/**
 * Mark an episode as completed
 */
export const markAsCompleted = async (userId, episodeId) => {
    if (!userId || !episodeId || !supabase) return;

    try {
        await supabase
            .from('playback_history')
            .update({ completed: true })
            .eq('user_id', userId)
            .eq('episode_id', episodeId);
    } catch (error) {
        console.error('Error marking as completed:', error);
    }
};
