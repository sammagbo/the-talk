import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { client, urlFor } from '../sanity';
import {
    User,
    Heart,
    Lock,
    Globe,
    Settings,
    ArrowLeft,
    Loader2,
    X,
    Check,
    Shield,
    Eye,
    EyeOff,
    Medal
} from 'lucide-react';
import LazyImage from '../components/LazyImage';
import BadgesDisplay from '../components/BadgesDisplay';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
    const { t } = useTranslation();
    const { uid } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [profileData, setProfileData] = useState(null);
    const [favoriteEpisodes, setFavoriteEpisodes] = useState([]);
    const [userBadges, setUserBadges] = useState([]);
    const [userStats, setUserStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [saving, setSaving] = useState(false);

    const isOwnProfile = user?.uid === uid;

    // Fetch user profile and favorites
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get user from Supabase
                if (!supabase) {
                    setError('Database not available');
                    setLoading(false);
                    return;
                }

                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', uid)
                    .single();

                if (userError || !userData) {
                    setError(t('profile.error_not_found'));
                    setLoading(false);
                    return;
                }

                // Check privacy - if private and not own profile, block access
                if (userData.isPublic === false && !isOwnProfile) {
                    setError(t('profile.error_private'));
                    setLoading(false);
                    return;
                }

                setProfileData({
                    displayName: userData.display_name || 'Anonymous User',
                    photoURL: userData.photo_url || null,
                    email: userData.email || '',
                    isPublic: true, // default to public
                    createdAt: userData.created_at,
                });
                setIsPublic(true);
                setUserBadges(userData.badges || []);

                // Fetch user stats from user_stats table
                const { data: statsData } = await supabase
                    .from('user_stats')
                    .select('*')
                    .eq('user_id', uid)
                    .single();
                setUserStats(statsData || {});

                // Fetch favorites
                const { data: favoritesData } = await supabase
                    .from('favorites')
                    .select('episode_id')
                    .eq('user_id', uid);
                const favoriteIds = favoritesData?.map(f => f.episode_id) || [];

                // Fetch favorite episodes from Sanity
                if (favoriteIds.length > 0) {
                    const episodeIds = favoriteIds.map(id => `"${id}"`).join(',');
                    const query = `*[_type == "episode" && _id in [${episodeIds}]] {
                        _id,
                        title,
                        slug,
                        category->{title},
                        mainImage,
                        date
                    }`;

                    const episodes = await client.fetch(query);
                    setFavoriteEpisodes(episodes.map(ep => ({
                        id: ep._id,
                        title: ep.title,
                        slug: ep.slug?.current,
                        category: ep.category?.title || 'Épisodes',
                        image: ep.mainImage ? urlFor(ep.mainImage).width(400).url() : null,
                        date: ep.date
                    })));
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(t('profile.error_load'));
                setLoading(false);
            }
        };

        if (uid) {
            fetchProfile();
        }
    }, [uid, isOwnProfile]);

    // Update user document when profile data is first loaded (to sync auth info)
    useEffect(() => {
        const syncUserData = async () => {
            if (user && isOwnProfile && supabase) {
                try {
                    await supabase
                        .from('users')
                        .update({
                            display_name: user.displayName,
                            photo_url: user.photoURL,
                            email: user.email
                        })
                        .eq('id', user.uid);
                } catch (err) {
                    console.log('Could not sync user data:', err);
                }
            }
        };
        syncUserData();
    }, [user, isOwnProfile]);

    // Handle privacy toggle save
    const handleSaveSettings = async () => {
        if (!user || !isOwnProfile) return;

        setSaving(true);
        try {
            // For now, privacy is handled client-side
            // Could add is_public column to users table if needed
            setProfileData(prev => ({ ...prev, isPublic }));
            setIsSettingsOpen(false);
        } catch (err) {
            console.error('Error saving settings:', err);
        }
        setSaving(false);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#007BFF]" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center text-center px-4">
                <Helmet>
                    <title>Profile | THE TALK</title>
                </Helmet>
                <div className="bg-gray-100 dark:bg-[#111] p-6 rounded-full mb-6">
                    {error === 'This profile is private' ? (
                        <Lock className="w-12 h-12 text-gray-400" />
                    ) : (
                        <User className="w-12 h-12 text-gray-400" />
                    )}
                </div>
                <h1 className="text-2xl font-creativo font-bold text-black dark:text-white mb-2">
                    {error}
                </h1>
                <p className="text-gray-500 dark:text-[#6C757D] mb-6">
                    {error === t('profile.error_private')
                        ? t('profile.private_description')
                        : t('profile.not_found_description')}
                </p>
                <Link
                    to="/"
                    className="flex items-center gap-2 text-[#007BFF] hover:underline"
                >
                    <ArrowLeft size={18} />
                    {t('nav.back_gallery')}
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Helmet>
                <title>{profileData?.displayName || 'Profile'} | THE TALK</title>
            </Helmet>

            {/* Back Navigation */}
            <div className="fixed top-6 left-6 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-[#333] text-black dark:text-white hover:border-[#007BFF] transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="font-minimal text-sm">{t('profile.back')}</span>
                </button>
            </div>

            {/* Profile Header */}
            <header className="relative pt-24 pb-16 px-4 border-b border-gray-200 dark:border-[#333]">
                {/* Background Gradient */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#007BFF]/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#A9A9F5]/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    {/* Avatar */}
                    <div className="relative inline-block mb-6">
                        {profileData?.photoURL ? (
                            <img
                                src={profileData.photoURL}
                                alt={profileData.displayName}
                                className="w-32 h-32 rounded-full border-4 border-white dark:border-[#222] shadow-2xl object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#007BFF] to-[#A9A9F5] flex items-center justify-center border-4 border-white dark:border-[#222] shadow-2xl">
                                <User className="w-16 h-16 text-white" />
                            </div>
                        )}

                        {/* Privacy Badge */}
                        <div className={`absolute -bottom-2 -right-2 p-2 rounded-full shadow-lg ${profileData?.isPublic
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                            }`}>
                            {profileData?.isPublic ? <Globe size={16} /> : <Lock size={16} />}
                        </div>
                    </div>

                    {/* Name & Email */}
                    <h1 className="text-3xl md:text-4xl font-creativo font-bold text-black dark:text-white mb-2">
                        {profileData?.displayName}
                    </h1>
                    {isOwnProfile && (
                        <p className="text-gray-500 dark:text-[#6C757D] font-minimal mb-4">
                            {profileData?.email}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="flex justify-center gap-8 mt-6">
                        <div className="text-center">
                            <p className="text-2xl font-creativo font-bold text-[#007BFF]">
                                {favoriteEpisodes.length}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-[#6C757D] font-minimal">
                                {t('profile.liked_episodes')}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-creativo font-bold text-yellow-500">
                                {userBadges.length}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-[#6C757D] font-minimal">
                                {t('profile.badges_earned')}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-creativo font-bold text-green-500">
                                {userStats.episodesListened || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-[#6C757D] font-minimal">
                                {t('profile.episodes_played')}
                            </p>
                        </div>
                    </div>

                    {/* Settings Button (Own Profile Only) */}
                    {isOwnProfile && (
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="mt-6 inline-flex items-center gap-2 bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:hover:bg-[#222] px-5 py-2.5 rounded-full text-black dark:text-white font-minimal text-sm transition-colors border border-gray-200 dark:border-[#333]"
                        >
                            <Settings size={16} />
                            {t('profile.settings')}
                        </button>
                    )}
                </div>
            </header>

            {/* Badges Section */}
            <section className="py-16 px-4 max-w-7xl mx-auto border-b border-gray-200 dark:border-[#333]">
                <div className="flex items-center gap-3 mb-8">
                    <Medal className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-creativo font-bold text-black dark:text-white">
                        {t('profile.achievements')}
                    </h2>
                </div>
                <BadgesDisplay userBadges={userBadges} showAll={isOwnProfile} />
            </section>

            {/* Liked Episodes Section */}
            <section className="py-16 px-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
                    <h2 className="text-2xl font-creativo font-bold text-black dark:text-white">
                        {t('profile.liked_episodes')}
                    </h2>
                </div>

                {favoriteEpisodes.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-[#333]">
                        <Heart className="w-12 h-12 text-gray-300 dark:text-[#333] mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-[#6C757D] font-minimal">
                            {isOwnProfile
                                ? t('profile.no_likes_own')
                                : t('profile.no_likes_other')}
                        </p>
                        {isOwnProfile && (
                            <Link
                                to="/"
                                className="inline-block mt-4 text-[#007BFF] hover:underline"
                            >
                                {t('profile.explore_episodes')}
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteEpisodes.map((episode) => (
                            <Link
                                key={episode.id}
                                to={`/episode/${episode.id}`}
                                className="group bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-[#333] overflow-hidden hover:border-[#007BFF]/50 transition-all"
                            >
                                <div className="aspect-video overflow-hidden">
                                    {episode.image ? (
                                        <LazyImage
                                            src={episode.image}
                                            alt={episode.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#007BFF]/20 to-[#A9A9F5]/20 flex items-center justify-center">
                                            <Heart className="w-12 h-12 text-[#007BFF]/30" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <p className="text-[#007BFF] text-xs font-creativo font-bold uppercase tracking-widest mb-2">
                                        {episode.category}
                                    </p>
                                    <h3 className="text-lg font-creativo font-bold text-black dark:text-white group-hover:text-[#007BFF] transition-colors line-clamp-2">
                                        {episode.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#111] max-w-md w-full rounded-2xl border border-gray-200 dark:border-[#333] shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#333]">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-[#007BFF]" />
                                <h3 className="text-xl font-creativo font-bold text-black dark:text-white">
                                    Privacy Settings
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Privacy Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#020202] rounded-xl border border-gray-200 dark:border-[#333]">
                                <div className="flex items-center gap-4">
                                    {isPublic ? (
                                        <Eye className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <EyeOff className="w-6 h-6 text-gray-500" />
                                    )}
                                    <div>
                                        <p className="font-creativo font-bold text-black dark:text-white">
                                            {isPublic ? t('profile.public_profile') : t('profile.private_profile')}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-[#6C757D]">
                                            {isPublic
                                                ? t('profile.public_description')
                                                : t('profile.private_only_you')}
                                        </p>
                                    </div>
                                </div>

                                {/* Toggle Switch */}
                                <button
                                    onClick={() => setIsPublic(!isPublic)}
                                    className={`relative w-14 h-8 rounded-full transition-colors ${isPublic ? 'bg-green-500' : 'bg-gray-300 dark:bg-[#333]'
                                        }`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isPublic ? 'translate-x-7' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>

                            {/* Info */}
                            <p className="text-sm text-gray-500 dark:text-[#6C757D] text-center">
                                {isPublic
                                    ? t('profile.public_info')
                                    : t('profile.private_info')}
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-[#333]">
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-[#333] text-black dark:text-white font-minimal hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
                            >
                                {t('profile.cancel')}
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                disabled={saving}
                                className="flex-1 px-4 py-3 rounded-xl bg-[#007BFF] hover:bg-[#0069d9] text-white font-creativo font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Check size={18} />
                                        {t('profile.save')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
