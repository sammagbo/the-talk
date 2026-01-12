import React, { useState, useEffect } from 'react';
import { BarChart3, Check, Users, Lock } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot, increment, runTransaction } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function PollComponent({ episodeId, poll }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [results, setResults] = useState({});
    const [totalVotes, setTotalVotes] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if poll is valid
    if (!poll || !poll.isActive || !poll.question || !poll.options?.length) {
        return null;
    }

    // Listen to real-time poll results
    useEffect(() => {
        if (!episodeId || !db) return;

        const pollRef = doc(db, 'polls', episodeId);

        const unsubscribe = onSnapshot(pollRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setResults(data.votes || {});

                // Calculate total votes
                const total = Object.values(data.votes || {}).reduce((sum, count) => sum + count, 0);
                setTotalVotes(total);
            } else {
                setResults({});
                setTotalVotes(0);
            }
        }, (error) => {
            console.error('Error listening to poll results:', error);
        });

        return () => unsubscribe();
    }, [episodeId]);

    // Check if user has already voted
    useEffect(() => {
        const checkUserVote = async () => {
            if (!user || !episodeId || !db) return;

            try {
                const userVoteRef = doc(db, 'poll_votes', `${episodeId}_${user.uid}`);
                const voteSnap = await getDoc(userVoteRef);

                if (voteSnap.exists()) {
                    setHasVoted(true);
                    setSelectedOption(voteSnap.data().optionId);
                }
            } catch (error) {
                console.error('Error checking user vote:', error);
            }
        };

        checkUserVote();
    }, [user, episodeId]);

    const handleVote = async (optionId) => {
        if (!user) {
            alert('Please login to vote');
            return;
        }

        if (hasVoted || isSubmitting) return;

        setIsSubmitting(true);
        setLoading(true);

        try {
            const pollRef = doc(db, 'polls', episodeId);
            const userVoteRef = doc(db, 'poll_votes', `${episodeId}_${user.uid}`);

            // Use transaction to ensure atomic update
            await runTransaction(db, async (transaction) => {
                const pollDoc = await transaction.get(pollRef);

                // Check if user already voted (double check in transaction)
                const userVoteDoc = await transaction.get(userVoteRef);
                if (userVoteDoc.exists()) {
                    throw new Error('Already voted');
                }

                // Initialize or update poll document
                if (!pollDoc.exists()) {
                    const initialVotes = {};
                    poll.options.forEach(opt => {
                        initialVotes[opt.id] = opt.id === optionId ? 1 : 0;
                    });
                    transaction.set(pollRef, {
                        episodeId,
                        question: poll.question,
                        votes: initialVotes,
                        createdAt: new Date()
                    });
                } else {
                    transaction.update(pollRef, {
                        [`votes.${optionId}`]: increment(1)
                    });
                }

                // Record user's vote
                transaction.set(userVoteRef, {
                    odId: user.uid,
                    episodeId,
                    optionId,
                    votedAt: new Date()
                });
            });

            setHasVoted(true);
            setSelectedOption(optionId);
        } catch (error) {
            if (error.message === 'Already voted') {
                setHasVoted(true);
            } else {
                console.error('Error voting:', error);
            }
        }

        setIsSubmitting(false);
        setLoading(false);
    };

    const getPercentage = (optionId) => {
        if (totalVotes === 0) return 0;
        return Math.round(((results[optionId] || 0) / totalVotes) * 100);
    };

    const getVoteCount = (optionId) => {
        return results[optionId] || 0;
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
                {poll.options.map((option) => {
                    const percentage = getPercentage(option.id);
                    const voteCount = getVoteCount(option.id);
                    const isSelected = selectedOption === option.id;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleVote(option.id)}
                            disabled={hasVoted || !user || isSubmitting}
                            className={`
                                relative w-full text-left p-4 rounded-xl border transition-all overflow-hidden
                                ${hasVoted
                                    ? 'cursor-default'
                                    : 'cursor-pointer hover:border-[#007BFF]/50 hover:bg-[#007BFF]/5'
                                }
                                ${isSelected
                                    ? 'border-[#007BFF] bg-[#007BFF]/10'
                                    : 'border-gray-200 dark:border-[#333] bg-white dark:bg-[#111]'
                                }
                                ${!user ? 'opacity-70' : ''}
                            `}
                        >
                            {/* Progress Bar Background */}
                            {hasVoted && (
                                <div
                                    className={`absolute inset-0 transition-all duration-500 ${isSelected
                                        ? 'bg-[#007BFF]/20'
                                        : 'bg-gray-100 dark:bg-[#222]'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            )}

                            {/* Content */}
                            <div className="relative flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    {/* Check mark for selected */}
                                    {isSelected && hasVoted && (
                                        <div className="w-5 h-5 bg-[#007BFF] rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                    <span className={`font-minimal ${isSelected
                                        ? 'font-bold text-[#007BFF]'
                                        : 'text-black dark:text-white'
                                        }`}>
                                        {option.text}
                                    </span>
                                </div>

                                {/* Results */}
                                {hasVoted && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`font-bold ${isSelected ? 'text-[#007BFF]' : 'text-gray-600 dark:text-[#A0A0A0]'
                                            }`}>
                                            {percentage}%
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                            ({voteCount})
                                        </span>
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
