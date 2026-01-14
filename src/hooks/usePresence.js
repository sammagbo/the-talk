import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

/**
 * usePresence Hook
 * 
 * Manages real-time presence for live listener tracking using Supabase Realtime.
 * 
 * @param {string} episodeId - The episode to track presence for
 * @returns {Object} - { listenerCount, isConnected, updatePresence }
 */
export function usePresence(episodeId) {
    const { user } = useAuth();
    const [listenerCount, setListenerCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const channelRef = useRef(null);
    const presenceIdRef = useRef(null);

    // Update presence status
    const updatePresence = useCallback(async (status = 'listening') => {
        if (!supabase || !episodeId) return;

        try {
            const presenceData = {
                user_id: user?.uid || null,
                episode_id: episodeId,
                status,
                last_seen: new Date().toISOString(),
            };

            if (presenceIdRef.current) {
                // Update existing presence
                await supabase
                    .from('presence')
                    .update(presenceData)
                    .eq('id', presenceIdRef.current);
            } else {
                // Insert new presence
                const { data, error } = await supabase
                    .from('presence')
                    .insert(presenceData)
                    .select('id')
                    .single();

                if (!error && data) {
                    presenceIdRef.current = data.id;
                }
            }
        } catch (error) {
            console.error('Failed to update presence:', error);
        }
    }, [episodeId, user?.uid]);

    // Remove presence on disconnect
    const removePresence = useCallback(async () => {
        if (!supabase || !presenceIdRef.current) return;

        try {
            await supabase
                .from('presence')
                .delete()
                .eq('id', presenceIdRef.current);
            presenceIdRef.current = null;
        } catch (error) {
            console.error('Failed to remove presence:', error);
        }
    }, []);

    // Fetch current listener count
    const fetchListenerCount = useCallback(async () => {
        if (!supabase || !episodeId) return;

        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

            const { count, error } = await supabase
                .from('presence')
                .select('*', { count: 'exact', head: true })
                .eq('episode_id', episodeId)
                .gt('last_seen', fiveMinutesAgo);

            if (!error) {
                setListenerCount(count || 0);
            }
        } catch (error) {
            console.error('Failed to fetch listener count:', error);
        }
    }, [episodeId]);

    // Subscribe to real-time presence changes
    useEffect(() => {
        if (!supabase || !episodeId) return;

        // Initial presence registration
        updatePresence('listening');
        fetchListenerCount();

        // Set up real-time subscription
        const channel = supabase
            .channel(`presence:${episodeId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'presence',
                    filter: `episode_id=eq.${episodeId}`,
                },
                () => {
                    // Refetch count on any presence change
                    fetchListenerCount();
                }
            )
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED');
            });

        channelRef.current = channel;

        // Heartbeat to keep presence alive
        const heartbeat = setInterval(() => {
            updatePresence('listening');
        }, 30000); // Every 30 seconds

        // Cleanup on unmount
        return () => {
            clearInterval(heartbeat);
            removePresence();
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [episodeId, updatePresence, removePresence, fetchListenerCount]);

    // Handle page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                updatePresence('paused');
            } else {
                updatePresence('listening');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [updatePresence]);

    // Handle window unload
    useEffect(() => {
        const handleUnload = () => {
            removePresence();
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [removePresence]);

    return {
        listenerCount,
        isConnected,
        updatePresence,
    };
}

export default usePresence;
