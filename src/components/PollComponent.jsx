import React, { useState, useEffect } from 'react';
import { BarChart3, Check, Lock } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function PollComponent({ episodeId, poll }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [results, setResults] = useState({});
    const [totalVotes, setTotalVotes] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if poll is valid
    if (!poll || !poll.isActive || !poll.question || !poll.options?.length) {
        return null;
    }

    // Fetch poll results
    const fetchResults = async () => {
        if (!episodeId || !supabase) return;

        const { data, error } = await supabase
            .from('poll_votes')
            .select('option_index')
            .eq('poll_id', episodeId);

        if (!error && data) {
            const voteCounts = {};
            data.forEach(vote => {
                voteCounts[vote.option_index] = (voteCounts[vote.option_index] || 0) + 1;
            });
            setResults(voteCounts);
            setTotalVotes(data.length);
        }
    };

    // Listen to real-time poll results
    useEffect(() => {
        if (!episodeId || !supabase) return;

        fetchResults();

        const channel = supabase
            .channel(`poll-${episodeId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'poll_votes',
                    filter: `poll_id=eq.${episodeId}`,
                },
                () => {
                    fetchResults();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [episodeId]);

    // Check if user has already voted
    useEffect(() => {
        const checkUserVote = async () => {
            if (!user || !episodeId || !supabase) return;

            const { data, error } = await supabase
                .from('poll_votes')
                .select('option_index')
                .eq('poll_id', episodeId)
                .eq('user_id', user.uid)
                .single();

            if (!error && data) {
                setHasVoted(true);
                setSelectedOption(data.option_index);
            }
        };

        checkUserVote();
    }, [user, episodeId]);

    const handleVote = async (optionIndex) => {
        if (!user) {
            alert('Please login to vote');
            return;
        }

        if (hasVoted || isSubmitting || !supabase) return;

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('poll_votes')
                .insert({
                    poll_id: episodeId,
                    user_id: user.uid,
                    option_index: optionIndex,
                });

            if (error) {
                if (error.code === '23505') {
                    // Unique constraint violation - already voted
                    setHasVoted(true);
                } else {
                    throw error;
                }
            } else {
                setHasVoted(true);
                setSelectedOption(optionIndex);
            }
        } catch (error) {
            console.error('Error voting:', error);
        }

        setIsSubmitting(false);
    };

    const getPercentage = (optionIndex) => {
        if (totalVotes === 0) return 0;
        return Math.round(((results[optionIndex] || 0) / totalVotes) * 100);
    };

    const getVoteCount = (optionIndex) => {
        return results[optionIndex] || 0;
    };

    return (
        <div className="bg-gradient-to-br from-[#007BFF]/5 to-[#A9A9F5]/5 rounded-2xl border border-[#007BFF]/20 p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#007BFF]/10 p-2 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-[#007BFF]" />
                </div>
                <div>
                    <h3 className="text-lg font-creativo font-bold text-black dark:text-white">
                        {t('poll.title')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-[#6C757D]">
                        {totalVotes} {totalVotes === 1 ? t('poll.vote') : t('poll.votes')}
                    </p>
                </div>
            </div>

            {/* Question */}
            <p className="text-xl font-creativo font-bold text-black dark:text-white mb-6">
                {poll.question}
            </p>

            {/* Options */}
            <div className="space-y-3">
                {poll.options.map((option, index) => {
                    const percentage = getPercentage(index);
                    const voteCount = getVoteCount(index);
                    const isSelected = selectedOption === index;

                    return (
                        <button
                            key={index}
                            onClick={() => handleVote(index)}
                            disabled={hasVoted || !user || isSubmitting}
                            className={`
                                relative w-full text-left p-4 rounded-xl border transition-all overflow-hidden
                                ${hasVoted ? 'cursor-default' : 'cursor-pointer hover:border-[#007BFF]/50 hover:bg-[#007BFF]/5'}
                                ${isSelected ? 'border-[#007BFF] bg-[#007BFF]/10' : 'border-gray-200 dark:border-[#333] bg-white dark:bg-[#111]'}
                                ${!user ? 'opacity-70' : ''}
                            `}
                        >
                            {/* Progress Bar Background */}
                            {hasVoted && (
                                <div
                                    className={`absolute inset-0 transition-all duration-500 ${isSelected ? 'bg-[#007BFF]/20' : 'bg-gray-100 dark:bg-[#222]'}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            )}

                            {/* Content */}
                            <div className="relative flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    {isSelected && hasVoted && (
                                        <div className="w-5 h-5 bg-[#007BFF] rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                    <span className={`font-minimal ${isSelected ? 'font-bold text-[#007BFF]' : 'text-black dark:text-white'}`}>
                                        {option.text}
                                    </span>
                                </div>

                                {hasVoted && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`font-bold ${isSelected ? 'text-[#007BFF]' : 'text-gray-600 dark:text-[#A0A0A0]'}`}>
                                            {percentage}%
                                        </span>
                                        <span className="text-gray-400 text-xs">({voteCount})</span>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Login prompt */}
            {!user && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-[#6C757D]">
                    <Lock size={14} />
                    <span>{t('poll.login_prompt')}</span>
                </div>
            )}

            {/* Voted confirmation */}
            {hasVoted && (
                <div className="mt-4 flex items-center gap-2 text-sm text-green-500">
                    <Check size={14} />
                    <span>{t('poll.vote_recorded')}</span>
                </div>
            )}

            {/* Loading state */}
            {isSubmitting && (
                <div className="mt-4 flex items-center gap-2 text-sm text-[#007BFF]">
                    <div className="w-4 h-4 border-2 border-[#007BFF] border-t-transparent rounded-full animate-spin" />
                    <span>{t('poll.submitting')}</span>
                </div>
            )}
        </div>
    );
}
