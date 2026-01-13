import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../supabase';

export default function Rating({ episodeId, user }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [average, setAverage] = useState(0);
    const [count, setCount] = useState(0);

    // Fetch ratings and calculate average
    const fetchRatings = async () => {
        if (!episodeId || !supabase) return;

        const { data, error } = await supabase
            .from('ratings')
            .select('rating')
            .eq('episode_id', episodeId);

        if (!error && data) {
            if (data.length > 0) {
                const sum = data.reduce((a, b) => a + b.rating, 0);
                setAverage(sum / data.length);
                setCount(data.length);
            } else {
                setAverage(0);
                setCount(0);
            }
        }
    };

    useEffect(() => {
        if (!episodeId || !supabase) return;

        fetchRatings();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`ratings-${episodeId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'ratings',
                    filter: `episode_id=eq.${episodeId}`,
                },
                () => {
                    fetchRatings();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [episodeId]);

    // Check for existing user rating
    useEffect(() => {
        if (!user || !episodeId || !supabase) {
            setRating(0);
            return;
        }

        const fetchUserRating = async () => {
            const { data, error } = await supabase
                .from('ratings')
                .select('rating')
                .eq('episode_id', episodeId)
                .eq('user_id', user.uid)
                .single();

            if (!error && data) {
                setRating(data.rating);
            } else {
                setRating(0);
            }
        };

        fetchUserRating();
    }, [user, episodeId]);

    const handleRate = async (value) => {
        if (!user) {
            alert("Veuillez vous connecter pour noter cet épisode.");
            return;
        }
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('ratings')
                .upsert({
                    user_id: user.uid,
                    episode_id: episodeId,
                    rating: value,
                }, {
                    onConflict: 'user_id,episode_id',
                });

            if (error) throw error;
            setRating(value);
        } catch (error) {
            console.error("Error saving rating:", error);
        }
    };

    return (
        <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
                <div className="flex items-center">
                    {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                            <button
                                key={index}
                                type="button"
                                className={`transition-colors ${user ? 'cursor-pointer' : 'cursor-default'}`}
                                onClick={() => handleRate(starValue)}
                                onMouseEnter={() => user && setHover(starValue)}
                                onMouseLeave={() => user && setHover(0)}
                                disabled={!user}
                            >
                                <Star
                                    size={20}
                                    className={`transition-all ${starValue <= (hover || rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-transparent text-gray-300 dark:text-gray-600"
                                        }`}
                                />
                            </button>
                        );
                    })}
                </div>
                <span className="text-sm font-bold text-black dark:text-white font-creativo">
                    {average.toFixed(1)} <span className="text-gray-400 font-normal font-minimal">({count})</span>
                </span>
            </div>
            {!user && (
                <span className="text-[10px] text-gray-400">Connectez-vous pour noter</span>
            )}
        </div>
    );
}
