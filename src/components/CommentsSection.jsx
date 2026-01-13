import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Send, Trash2, User } from 'lucide-react';
import { checkAchievements } from '../utils/badges';
import { useTranslation } from 'react-i18next';

export default function CommentsSection({ episodeId, user }) {
    const { t } = useTranslation();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        if (!episodeId || !supabase) return;

        const { data, error } = await supabase
            .from('comments')
            .select(`
                id,
                content,
                created_at,
                user_id,
                users (
                    display_name,
                    photo_url
                )
            `)
            .eq('episode_id', episodeId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setComments(data.map(c => ({
                id: c.id,
                text: c.content,
                userId: c.user_id,
                userName: c.users?.display_name || 'Anonyme',
                userPhoto: c.users?.photo_url,
                createdAt: c.created_at,
            })));
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!episodeId || !supabase) {
            setLoading(false);
            return;
        }

        fetchComments();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`comments-${episodeId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'comments',
                    filter: `episode_id=eq.${episodeId}`,
                },
                () => {
                    fetchComments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [episodeId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !supabase) return;

        try {
            const { error } = await supabase
                .from('comments')
                .insert({
                    content: newComment,
                    episode_id: episodeId,
                    user_id: user.uid,
                });

            if (error) throw error;

            setNewComment('');
            checkAchievements(user.uid, 'comment');
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleDelete = async (commentId) => {
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    return (
        <div className="mt-12 bg-gray-50 dark:bg-[#111] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-[#333]">
            <h3 className="text-2xl font-creativo font-bold text-black dark:text-white mb-8">
                {t('comments.title')} ({comments.length})
            </h3>

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-10 flex gap-4">
                    <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full border border-gray-300 dark:border-[#555]"
                    />
                    <div className="flex-1 relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={t('comments.placeholder')}
                            className="w-full bg-white dark:bg-[#000] border border-gray-200 dark:border-[#333] rounded-xl p-4 pr-12 focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] transition-all font-minimal resize-none h-24 text-black dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="absolute bottom-3 right-3 p-2 bg-[#007BFF] text-white rounded-lg hover:bg-[#0069d9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-10 p-6 bg-[#007BFF]/10 rounded-xl border border-[#007BFF]/20 text-center">
                    <p className="text-gray-600 dark:text-[#A9A9F5] font-minimal mb-2">{t('comments.login_prompt')}</p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {loading ? (
                    <p className="text-gray-500 text-center py-4">{t('comments.loading')}</p>
                ) : comments.length === 0 ? (
                    <p className="text-gray-500 dark:text-[#666] text-center italic py-4">{t('comments.first_comment')}</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 animate-fade-in group">
                            {comment.userPhoto ? (
                                <img
                                    src={comment.userPhoto}
                                    alt={comment.userName}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-[#333]"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#333] flex items-center justify-center text-gray-500">
                                    <User size={20} />
                                </div>
                            )}

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-black dark:text-white font-creativo text-sm">
                                        {comment.userName}
                                    </h4>
                                    {comment.createdAt && (
                                        <span className="text-xs text-gray-400 dark:text-[#555]">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <p className="text-gray-600 dark:text-[#CCC] font-minimal text-sm leading-relaxed whitespace-pre-wrap">
                                    {comment.text}
                                </p>
                            </div>

                            {user && user.uid === comment.userId && (
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all self-start pt-1"
                                    title="Supprimer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
