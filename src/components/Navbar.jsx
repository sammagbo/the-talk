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
            label: t('nav.home', 'Home'),
            icon: HomeIcon,
            type: 'link',
            to: '/'
        },
        {
            label: t('nav.videos', 'Vidéos'),
            icon: Video,
            type: 'section',
            section: 'videos',
            description: 'Watch our video content'
        },
        {
            label: t('nav.episodes', 'Épisodes'),
            icon: Headphones,
            type: 'section',
            section: 'galerie',
            description: 'Listen to podcast episodes'
        },
        {
            label: t('nav.store', 'Boutique'),
            icon: ShoppingBag,
            type: 'link',
            to: '/store'
        },
        {
            label: t('nav.blog', 'Blog'),
            icon: BookOpen,
            type: 'link',
            to: '/blog'
        },
        {
            label: t('nav.about', 'À propos'),
            icon: Info,
            type: 'section',
            section: 'apropos',
            description: 'About Mijean Rochus'
        },
        {
            label: t('nav.contact', 'Contact'),
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
                                    onClick={() => {
                                        if (item.to === '/') {
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }
                                        setIsMenuOpen(false);
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${isActive
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
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <Icon size={16} />
                                {item.label}
                            </button>
                        );
                    })}

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
                            className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-4 py-2 rounded-lg transition-all text-sm font-bold uppercase tracking-wider"
                        >
                            {t('nav.login', 'Connexion')}
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
                            className="flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black px-3 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-transform hover:scale-105"
                        >
                            <Download size={14} />
                            {t('nav.install', 'Installer')}
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

            {/* Full-Screen Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black">
                    {/* Close Button */}
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute top-6 right-6 p-3 text-white hover:text-[#007BFF] transition-colors z-50"
                        aria-label="Fermer le menu"
                    >
                        <X size={32} />
                    </button>

                    {/* Full-Screen Menu Content */}
                    <div className="h-full flex flex-col justify-center items-center px-6">
                        {/* Numbered Navigation */}
                        <nav className="flex flex-col gap-4 w-full max-w-md">
                            {navItems.map((item, index) => {
                                const Icon = item.icon;
                                const formattedIndex = String(index).padStart(2, '0');

                                if (item.type === 'link') {
                                    return (
                                        <Link
                                            key={item.label}
                                            to={item.to}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="group flex items-center gap-6 py-3 border-b border-white/10 hover:border-[#007BFF] transition-all"
                                        >
                                            <span className="text-white/40 font-mono text-sm tracking-wider">
                                                {formattedIndex}.
                                            </span>
                                            <span className="text-3xl md:text-4xl font-creativo font-bold text-white uppercase tracking-[0.1em] group-hover:text-[#007BFF] transition-colors">
                                                {item.label}
                                            </span>
                                            <Icon size={24} className="ml-auto text-white/30 group-hover:text-[#007BFF] transition-colors" />
                                        </Link>
                                    );
                                }

                                return (
                                    <button
                                        key={item.label}
                                        onClick={() => handleSectionClick(item.section)}
                                        className="group flex items-center gap-6 py-3 border-b border-white/10 hover:border-[#007BFF] transition-all text-left w-full"
                                    >
                                        <span className="text-white/40 font-mono text-sm tracking-wider">
                                            {formattedIndex}.
                                        </span>
                                        <span className="text-3xl md:text-4xl font-creativo font-bold text-white uppercase tracking-[0.1em] group-hover:text-[#007BFF] transition-colors">
                                            {item.label}
                                        </span>
                                        <Icon size={24} className="ml-auto text-white/30 group-hover:text-[#007BFF] transition-colors" />
                                    </button>
                                );
                            })}

                            {/* Store Link */}
                            <Link
                                to="/store"
                                onClick={() => setIsMenuOpen(false)}
                                className="group flex items-center gap-6 py-3 border-b border-white/10 hover:border-[#A9A9F5] transition-all"
                            >
                                <span className="text-white/40 font-mono text-sm tracking-wider">
                                    {String(navItems.length).padStart(2, '0')}.
                                </span>
                                <span className="text-3xl md:text-4xl font-creativo font-bold text-white uppercase tracking-[0.1em] group-hover:text-[#A9A9F5] transition-colors">
                                    {t('nav.store', 'Boutique')}
                                </span>
                                <ShoppingBag size={24} className="ml-auto text-white/30 group-hover:text-[#A9A9F5] transition-colors" />
                            </Link>
                        </nav>

                        {/* Footer: User & Utilities */}
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                            <div className="flex items-center gap-6">
                                {user ? (
                                    <Link
                                        to={`/profile/${user.uid}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                                    >
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName}
                                            className="w-10 h-10 rounded-full border-2 border-white/20"
                                        />
                                        <span className="font-mono text-sm tracking-wider">{user.displayName?.split(' ')[0]}</span>
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => { signInWithGoogle(); setIsMenuOpen(false); }}
                                        className="px-6 py-2.5 border border-[#007BFF] text-[#007BFF] rounded-full font-mono text-sm tracking-wider hover:bg-[#007BFF] hover:text-white transition-all"
                                    >
                                        {t('nav.login', 'CONNEXION')}
                                    </button>
                                )}

                                <div className="w-px h-8 bg-white/20" />

                                <ThemeToggle />

                                <button
                                    onClick={requestPermission}
                                    className={`p-2 rounded-full border ${notificationPermission === 'granted'
                                        ? 'border-[#007BFF] text-[#007BFF]'
                                        : 'border-white/20 text-white/50 hover:text-white hover:border-white/40'
                                        } transition-all`}
                                >
                                    <Bell size={20} fill={notificationPermission === 'granted' ? 'currentColor' : 'none'} />
                                </button>

                                {deferredPrompt && (
                                    <button
                                        onClick={() => { onInstallClick?.(); setIsMenuOpen(false); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-mono text-sm tracking-wider hover:scale-105 transition-transform"
                                    >
                                        <Download size={16} />
                                        INSTALL
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* HUD Corner Indicators */}
                        <div className="absolute top-8 left-8 text-white/20 font-mono text-[10px] tracking-wider">
                            MENU // NAVIGATION
                        </div>
                        <div className="absolute top-8 right-20 text-white/20 font-mono text-[10px] tracking-wider">
                            THE_TALK.FM
                        </div>
                    </div>
                </div>
            )}
        </nav>

    );
}
