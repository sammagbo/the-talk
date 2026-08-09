import React, { useState, useEffect } from 'react';
import { STORE_ENABLED } from '../config/features';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Menu,
    X,
    Home as HomeIcon,
    Headphones,
    BookOpen,
    Info,
    Download,
    ShoppingBag
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

/**
 * Navbar - Reusable navigation component with clear site structure
 *
 * Menu structure:
 * Home → Épisodes → Blog → À propos → Boutique
 */
export default function Navbar({
    onScrollToSection,
    deferredPrompt,
    onInstallClick
}) {
    const { t } = useTranslation();
    const location = useLocation();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const isHomePage = location.pathname === '/';

    // Scroll detection for styling
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change. This intentionally reacts to route
    // changes (including browser back/forward, which the per-link onClick
    // handlers don't cover), so setting state here is the desired behaviour.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate reset of ephemeral menu state on navigation
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Handle section scroll (only works on home page)
    const handleSectionClick = (sectionId) => {
        setIsMenuOpen(false);
        if (isHomePage && onScrollToSection) {
            onScrollToSection(sectionId);
        } else {
            // Navigate to home with hash
            window.location.assign(`/#${sectionId}`);
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
            type: 'link', to: '/about', description: 'About the hosts'
        },
        ...(STORE_ENABLED ? [{
            label: t('nav.store', 'Boutique'),
            icon: ShoppingBag,
            type: 'link',
            to: '/store'
        }] : []),
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
                        className="w-10 h-10 rounded-none object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="flex flex-col">
                        <span className="text-xl font-creativo font-bold tracking-tight leading-none text-black dark:text-white">
                            THE TALK
                        </span>
                        <span className="text-[10px] font-minimal text-black dark:text-white tracking-widest uppercase">
                            By Mijean Rochus &amp; Gleid
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
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm font-bold uppercase tracking-wider transition-colors ${isActive
                                        ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white'
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
                                className="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <Icon size={16} />
                                {item.label}
                            </button>
                        );
                    })}

                    {/* Separator */}
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

                    {/* Utilities */}
                    <ThemeToggle />

                    {deferredPrompt && (
                        <button
                            onClick={onInstallClick}
                            aria-label="Installer l'application"
                            className="flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black px-3 py-2 rounded font-bold text-sm uppercase tracking-wider transition-transform hover:scale-105"
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
                        className="absolute top-6 right-6 p-3 text-white hover:text-black hover:dark:text-white transition-colors z-50"
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
                                            className="group flex items-center gap-6 py-3 border-b border-white/10 hover:border-black hover:dark:border-white transition-all"
                                        >
                                            <span className="text-white/40 font-minimal text-sm tracking-wider">
                                                {formattedIndex}.
                                            </span>
                                            <span className="text-3xl md:text-4xl font-creativo font-bold text-white uppercase tracking-[0.1em] group-hover:text-black group-hover:dark:text-white transition-colors">
                                                {item.label}
                                            </span>
                                            <Icon size={24} className="ml-auto text-white/30 group-hover:text-black group-hover:dark:text-white transition-colors" />
                                        </Link>
                                    );
                                }

                                return (
                                    <button
                                        key={item.label}
                                        onClick={() => handleSectionClick(item.section)}
                                        className="group flex items-center gap-6 py-3 border-b border-white/10 hover:border-black hover:dark:border-white transition-all text-left w-full"
                                    >
                                        <span className="text-white/40 font-minimal text-sm tracking-wider">
                                            {formattedIndex}.
                                        </span>
                                        <span className="text-3xl md:text-4xl font-creativo font-bold text-white uppercase tracking-[0.1em] group-hover:text-black group-hover:dark:text-white transition-colors">
                                            {item.label}
                                        </span>
                                        <Icon size={24} className="ml-auto text-white/30 group-hover:text-black group-hover:dark:text-white transition-colors" />
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Footer: Utilities */}
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                            <div className="flex items-center gap-6">
                                <ThemeToggle />

                                {deferredPrompt && (
                                    <button
                                        onClick={() => { onInstallClick?.(); setIsMenuOpen(false); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded font-minimal text-sm tracking-wider hover:scale-105 transition-transform"
                                    >
                                        <Download size={16} />
                                        INSTALL
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* HUD Corner Indicators */}
                        <div className="absolute top-8 left-8 text-white/20 font-minimal text-[10px] tracking-wider">
                            MENU // NAVIGATION
                        </div>
                        <div className="absolute top-8 right-20 text-white/20 font-minimal text-[10px] tracking-wider">
                            THE_TALK.FM
                        </div>
                    </div>
                </div>
            )}
        </nav>

    );
}
