import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Menu,
    X,
    Home as HomeIcon,
    Video,
    Headphones,
    BookOpen,
    Users,
    Info,
    Mail,
    Bell,
    Download,
    LogOut,
    ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { usePushNotifications } from '../hooks/usePushNotifications';

/**
 * Navbar - Reusable navigation component with clear site structure
 * 
 * Menu structure:
 * Home → Vidéos → Épisodes → Blog → Sobre → Contato
 */
export default function Navbar({
    onScrollToSection,
    onOpenSubscribe,
    deferredPrompt,
    onInstallClick
}) {
    const { t } = useTranslation();
    const location = useLocation();
    const { user, signInWithGoogle, logout } = useAuth();
    const { requestPermission, notificationPermission } = usePushNotifications();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const isHomePage = location.pathname === '/';

    // Scroll detection for styling
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Handle section scroll (only works on home page)
    const handleSectionClick = (sectionId) => {
        setIsMenuOpen(false);
        if (isHomePage && onScrollToSection) {
            onScrollToSection(sectionId);
        } else {
            // Navigate to home with hash
            window.location.href = `/#${sectionId}`;
        }
    };

    // Main navigation items with clear structure
    const navItems = [
        {
            label: 'Home',
            icon: HomeIcon,
            type: 'link',
            to: '/'
        },
        {
            label: 'Vidéos',
            icon: Video,
            type: 'section',
            section: 'galerie',
            description: 'Watch our video content'
        },
        {
            label: 'Épisodes',
            icon: Headphones,
            type: 'section',
            section: 'galerie',
            description: 'Listen to podcast episodes'
        },
        {
            label: 'Blog',
            icon: BookOpen,
            type: 'link',
            to: '/blog'
        },
        {
            label: 'Sobre',
            icon: Info,
            type: 'section',
            section: 'apropos',
            description: 'About Mijean Rochus'
        },
        {
            label: 'Contato',
            icon: Mail,
            type: 'section',
            section: 'contact',
            description: 'Get in touch'
        },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled
                    ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-[#333] py-3'
                    : 'bg-transparent py-5'
                }`}
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center gap-3 group"
                >
                    <img
                        src="/logo.png"
                        alt="THE TALK Logo"
                        className="w-10 h-10 rounded-lg object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="flex flex-col">
                        <span className="text-xl font-creativo font-bold tracking-tight leading-none text-black dark:text-white">
                            THE TALK
                        </span>
                        <span className="text-[10px] font-minimal text-[#A9A9F5] tracking-widest uppercase">
                            By Mijean Rochus
                        </span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.type === 'link' && location.pathname === item.to;

                        if (item.type === 'link') {
                            return (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-[#007BFF]/10 text-[#007BFF]'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {item.label}
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={item.label}
                                onClick={() => handleSectionClick(item.section)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <Icon size={16} />
                                {item.label}
                            </button>
                        );
                    })}

                    {/* Separator */}
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

                    {/* Store */}
                    <Link
                        to="/store"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <ShoppingBag size={16} />
                        Boutique
                    </Link>

                    {/* Separator */}
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

                    {/* User Section */}
                    {user ? (
                        <div className="flex items-center gap-2">
                            <Link
                                to={`/profile/${user.uid}`}
                                title="View Profile"
                                className="hover:ring-2 hover:ring-[#007BFF] rounded-full transition-all"
                            >
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName}
                                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-[#333]"
                                />
                            </Link>
                            <button
                                onClick={logout}
                                title="Se déconnecter"
                                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={signInWithGoogle}
                            className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-4 py-2 rounded-lg transition-all text-sm font-bold"
                        >
                            Connexion
                        </button>
                    )}

                    {/* Utilities */}
                    <ThemeToggle />

                    <button
                        onClick={requestPermission}
                        className={`p-2 rounded-lg transition-colors ${notificationPermission === 'granted'
                                ? 'text-[#007BFF] bg-[#007BFF]/10'
                                : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                        title={notificationPermission === 'granted' ? 'Notifications activées' : 'Activer les notifications'}
                    >
                        <Bell size={18} fill={notificationPermission === 'granted' ? 'currentColor' : 'none'} />
                    </button>

                    {deferredPrompt && (
                        <button
                            onClick={onInstallClick}
                            className="flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black px-3 py-2 rounded-lg font-bold text-sm transition-transform hover:scale-105"
                        >
                            <Download size={14} />
                            Instalar
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 text-black dark:text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-black border-b border-gray-200 dark:border-[#333] shadow-xl">
                    <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;

                            if (item.type === 'link') {
                                return (
                                    <Link
                                        key={item.label}
                                        to={item.to}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <Icon size={20} className="text-[#007BFF]" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            }

                            return (
                                <button
                                    key={item.label}
                                    onClick={() => handleSectionClick(item.section)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left w-full"
                                >
                                    <Icon size={20} className="text-[#007BFF]" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            );
                        })}

                        {/* Separator */}
                        <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />

                        {/* Store */}
                        <Link
                            to="/store"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <ShoppingBag size={20} className="text-[#007BFF]" />
                            <span className="font-medium">Boutique</span>
                        </Link>

                        {/* Separator */}
                        <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />

                        {/* User & Utilities */}
                        <div className="flex items-center justify-between px-4 py-3">
                            {user ? (
                                <Link
                                    to={`/profile/${user.uid}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3"
                                >
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName}
                                        className="w-10 h-10 rounded-full border border-gray-300 dark:border-[#333]"
                                    />
                                    <span className="font-medium text-black dark:text-white">{user.displayName}</span>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => { signInWithGoogle(); setIsMenuOpen(false); }}
                                    className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-6 py-2.5 rounded-lg font-bold"
                                >
                                    Connexion
                                </button>
                            )}

                            <div className="flex items-center gap-2">
                                <ThemeToggle />
                                <button
                                    onClick={requestPermission}
                                    className={`p-2 rounded-lg ${notificationPermission === 'granted'
                                            ? 'text-[#007BFF] bg-[#007BFF]/10'
                                            : 'text-gray-500'
                                        }`}
                                >
                                    <Bell size={20} fill={notificationPermission === 'granted' ? 'currentColor' : 'none'} />
                                </button>
                            </div>
                        </div>

                        {deferredPrompt && (
                            <button
                                onClick={() => { onInstallClick?.(); setIsMenuOpen(false); }}
                                className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black mx-4 py-3 rounded-xl font-bold"
                            >
                                <Download size={18} />
                                Instalar App
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
