import React, { useState, useEffect } from 'react';
import { BACKEND_ENABLED } from '../config/features';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Menu,
    X,
    Home as HomeIcon,
    Headphones,
    BookOpen,
    Info,
    Bell,
    Download,
    LogOut,
    ShoppingBag,
    Shield,
    Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import SocialAuthButtons from './SocialAuthButtons';
import { usePushNotifications } from '../hooks/usePushNotifications';

/**
 * Navbar - Reusable navigation component with clear site structure
 * 
 * Menu structure:
 * Home → Vidéos → Épisodes → Blog → Sobre → Contato
 */
export default function Navbar({
    onScrollToSection,

    onOpenSearch,
    deferredPrompt,
    onInstallClick
}) {
    const { t } = useTranslation();
    const location = useLocation();
    const { user, logout } = useAuth();
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

    // Main navigation items — streamlined to real destinations only
    const navItems = [
        {
            label: t('nav.home', 'Home'),
            icon: HomeIcon,
            type: 'link',
            to: '/'
        },
        {
            label: t('nav.episodes', 'Épisodes'),
            icon: Headphones,
            type: 'link',
            to: '/episodes'
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
            description: 'About the hosts'
        },
        {
            label: t('nav.store', 'Boutique'),
            icon: ShoppingBag,
            type: 'link',
            to: '/store'
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
                                aria-label={`Naviguer vers ${item.label}`}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <Icon size={16} />
                                {item.label}
                            </button>
                        );
                    })}

                    {/* Separator */}
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

                    {/* User Section — gated behind backend flag */}
                    {BACKEND_ENABLED && (
                      <>
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
                                {/* Admin Button - only visible for admin users */}
                                {['admin@example.com', 'sammagbo@gmail.com'].includes(user.email) && (
                                    <Link
                                        to="/admin"
                                        title="Painel Admin"
                                        className="p-2 text-[#A9A9F5] hover:text-[#007BFF] hover:bg-[#007BFF]/10 rounded-lg transition-colors"
                                    >
                                        <Shield size={18} />
                                    </Link>
                                )}
                                <button
                                    onClick={logout}
                                    aria-label="Se déconnecter"
                                    title="Se déconnecter"
                                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative group">
                                <button
                                    className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-4 py-2 rounded-lg transition-all text-sm font-bold uppercase tracking-wider"
                                >
                                    {t('nav.login', 'Connexion')}
                                </button>
                                {/* Dropdown with social auth options */}
                                <div className="absolute right-0 top-full mt-2 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-[#333]">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">
                                            {t('auth.chooseProvider', 'Escolha como entrar')}
                                        </p>
                                        <SocialAuthButtons />
                                    </div>
                                </div>
                            </div>
                        )}
                      </>
                    )}

                    {/* Utilities */}
                    <button
                        onClick={onOpenSearch}
                        className="p-2 text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors mr-1"
                        aria-label="Search"
                    >
                        <Search size={20} />
                    </button>
                    <ThemeToggle />

                    {BACKEND_ENABLED && (
                    <button
                        onClick={requestPermission}
                        aria-label={notificationPermission === 'granted' ? 'Notifications activées' : 'Activer les notifications'}
                        className={`p-2 rounded-lg transition-colors ${notificationPermission === 'granted'
                            ? 'text-[#007BFF] bg-[#007BFF]/10'
                            : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                        title={notificationPermission === 'granted' ? 'Notifications activées' : 'Activer les notifications'}
                    >
                        <Bell size={18} fill={notificationPermission === 'granted' ? 'currentColor' : 'none'} />
                    </button>
                    )}

                    {deferredPrompt && (
                        <button
                            onClick={onInstallClick}
                            aria-label="Installer l'application"
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
                        </nav>

                        {/* Footer: User & Utilities */}
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                            <div className="flex items-center gap-6">
                                {/* Auth cluster — gated behind backend flag */}
                                {BACKEND_ENABLED && (
                                  <>
                                    {user ? (
                                        <>
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
                                            {/* Admin Button - mobile */}
                                            {['admin@example.com', 'sammagbo@gmail.com'].includes(user.email) && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#A9A9F5]/20 text-[#A9A9F5] rounded-full font-mono text-sm tracking-wider hover:bg-[#A9A9F5]/30 transition-colors"
                                                >
                                                    <Shield size={16} />
                                                    Admin
                                                </Link>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                                            <p className="text-white/60 text-sm font-mono">
                                                {t('auth.chooseProvider', 'Escolha como entrar')}
                                            </p>
                                            <SocialAuthButtons
                                                onSuccess={() => setIsMenuOpen(false)}
                                            />
                                        </div>
                                    )}
                                  </>
                                )}

                                <div className="w-px h-8 bg-white/20" />

                                <button
                                    onClick={() => {
                                        onOpenSearch?.();
                                        setIsMenuOpen(false);
                                    }}
                                    className="p-2 rounded-full border border-white/20 text-white/50 hover:text-white hover:border-white/40 transition-all"
                                >
                                    <Search size={20} />
                                </button>

                                <ThemeToggle />

                                {BACKEND_ENABLED && (
                                <button
                                    onClick={requestPermission}
                                    className={`p-2 rounded-full border ${notificationPermission === 'granted'
                                        ? 'border-[#007BFF] text-[#007BFF]'
                                        : 'border-white/20 text-white/50 hover:text-white hover:border-white/40'
                                        } transition-all`}
                                >
                                    <Bell size={20} fill={notificationPermission === 'granted' ? 'currentColor' : 'none'} />
                                </button>
                                )}

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
