import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { client } from '../sanity';
import {
    Shield,
    Users,
    MessageSquare,
    Headphones,
    TrendingUp,
    ArrowLeft,
    Loader2,
    AlertTriangle,
    Mail,
    Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Globe, { getUserLocation } from '../components/Globe';

// Admin email whitelist - add your admin emails here
const ADMIN_EMAILS = ['admin@example.com', 'sammagbo@gmail.com'];

export default function AdminPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalComments: 0,
        totalEpisodes: 0,
        totalNewsletterSubs: 0
    });
    const [recentEpisodes, setRecentEpisodes] = useState([]);
    const [recentComments, setRecentComments] = useState([]);
    const [userGrowth, setUserGrowth] = useState([]);
    const [dailyActivity, setDailyActivity] = useState(null);
    const [globeMarkers, setGlobeMarkers] = useState([]);


    // Check if user is admin
    const isAdmin = user && ADMIN_EMAILS.includes(user.email);

    useEffect(() => {
        if (!isAdmin) return;

        const fetchStats = async () => {
            setLoading(true);
            try {
                if (!supabase) {
                    console.error('Supabase not available');
                    return;
                }

                // Fetch total users
                const { count: totalUsers } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true });

                // Fetch total comments
                const { count: totalComments } = await supabase
                    .from('comments')
                    .select('*', { count: 'exact', head: true });

                // Fetch recent comments
                const { data: commentsData } = await supabase
                    .from('comments')
                    .select(`
                        id,
                        content,
                        created_at,
                        users (display_name)
                    `)
                    .order('created_at', { ascending: false })
                    .limit(5);

                setRecentComments((commentsData || []).map(c => ({
                    id: c.id,
                    text: c.content,
                    userName: c.users?.display_name || 'Anônimo',
                    timestamp: { toDate: () => new Date(c.created_at) }
                })));

                // Fetch episodes from Sanity
                const episodesQuery = `*[_type == "episode"] | order(date desc) {
                    _id,
                    title,
                    date,
                    category->{title}
                }`;
                const episodes = await client.fetch(episodesQuery);

                // Fetch newsletter subscribers count
                const { count: totalNewsletterSubs } = await supabase
                    .from('newsletter_subscribers')
                    .select('*', { count: 'exact', head: true });

                // Fetch user growth (last 30 days)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const { data: usersData } = await supabase
                    .from('users')
                    .select('created_at')
                    .gte('created_at', thirtyDaysAgo.toISOString())
                    .order('created_at', { ascending: true });

                // Process user growth data for chart
                const growthByDay = {};
                (usersData || []).forEach(u => {
                    const day = new Date(u.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    growthByDay[day] = (growthByDay[day] || 0) + 1;
                });

                const growthData = Object.entries(growthByDay).map(([date, count]) => ({
                    date,
                    users: count
                }));
                setUserGrowth(growthData);

                setStats({
                    totalUsers: totalUsers || 0,
                    totalComments: totalComments || 0,
                    totalEpisodes: episodes.length,
                    totalNewsletterSubs: totalNewsletterSubs || 0
                });
                setRecentEpisodes(episodes.slice(0, 5));
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isAdmin]);

    // Access denied for non-admins
    if (!user) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <div className="text-center p-8">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Acesso Negado</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Você precisa estar logado para acessar esta página.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-[#007BFF] text-white rounded-lg hover:bg-[#0069d9] transition-colors"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <div className="text-center p-8">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Acesso Restrito</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Você não tem permissão para acessar o painel administrativo.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-[#007BFF] text-white rounded-lg hover:bg-[#0069d9] transition-colors"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#007BFF]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Header */}
            <header className="bg-white dark:bg-[#111] border-b border-gray-200 dark:border-[#333] sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
                        </button>
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-[#007BFF]" />
                            <h1 className="text-xl font-bold text-black dark:text-white">Painel Administrativo</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                            Admin
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-[#333] shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-black dark:text-white mb-1">{stats.totalUsers}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total de Usuários</p>
                    </div>

                    <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-[#333] shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-black dark:text-white mb-1">{stats.totalComments}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total de Comentários</p>
                    </div>

                    <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-[#333] shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                                <Headphones className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-black dark:text-white mb-1">{stats.totalEpisodes}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total de Episódios</p>
                    </div>

                    <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-[#333] shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-black dark:text-white mb-1">{stats.totalNewsletterSubs}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Assinantes Newsletter</p>
                    </div>
                </div>

                {/* User Growth Chart */}
                {userGrowth.length > 0 && (
                    <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-[#333] shadow-sm mb-8">
                        <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#007BFF]" />
                            Crescimento de Usuários (30 dias)
                        </h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={userGrowth}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#007BFF" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#007BFF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        stroke="#6C757D"
                                        fontSize={12}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#6C757D"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#111',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#007BFF"
                                        fillOpacity={1}
                                        fill="url(#colorUsers)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Audience Globe */}
                <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-[#333] shadow-sm mb-8">
                    <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                        🌍 Audiência Global (Visualização)
                    </h2>
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        <div className="w-full lg:w-64">
                            <Globe
                                markers={[
                                    { lat: 48.8566, lon: 2.3522, size: 0.08 },   // Paris
                                    { lat: -23.5505, lon: -46.6333, size: 0.06 }, // São Paulo
                                    { lat: 40.7128, lon: -74.006, size: 0.05 },   // NYC
                                    { lat: 51.5074, lon: -0.1278, size: 0.04 },   // London
                                    { lat: 35.6762, lon: 139.6503, size: 0.03 }, // Tokyo
                                ]}
                                className="max-w-[250px] mx-auto"
                            />
                        </div>
                        <div className="flex-1 text-center lg:text-left">
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                Arraste o globo para explorar. Os pontos azuis representam concentrações de audiência.
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">🇫🇷 França</span>
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">🇧🇷 Brasil</span>
                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs">🇺🇸 EUA</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Recent Data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Episodes */}
                    <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-[#333] shadow-sm">
                        <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                            <Headphones className="w-5 h-5 text-[#007BFF]" />
                            Episódios Recentes
                        </h2>
                        <div className="space-y-3">
                            {recentEpisodes.length > 0 ? (
                                recentEpisodes.map((episode) => (
                                    <div
                                        key={episode._id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-medium text-black dark:text-white truncate">{episode.title}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {episode.category?.title || 'Sem categoria'} • {new Date(episode.date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum episódio encontrado</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Comments */}
                    <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-[#333] shadow-sm">
                        <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-[#007BFF]" />
                            Comentários Recentes
                        </h2>
                        <div className="space-y-3">
                            {recentComments.length > 0 ? (
                                recentComments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-black dark:text-white text-sm">
                                                {comment.userName || 'Anônimo'}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {comment.timestamp?.toDate?.()?.toLocaleDateString('pt-BR') || 'Data desconhecida'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{comment.text}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum comentário encontrado</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
