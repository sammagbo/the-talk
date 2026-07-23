import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Home as HomeIcon, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function NotFound() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col">
            <Helmet>
                <title>404 — THE TALK</title>
                <meta name="robots" content="noindex, follow" />
            </Helmet>

            <style>
                {`
          .font-creativo { font-family: 'Outfit', sans-serif; }
          .font-minimal { font-family: 'Inter', sans-serif; }
        `}
            </style>

            <Navbar
                onScrollToSection={() => { }}
                onOpenSearch={() => { }}
            />

            <main
                id="main-content"
                className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24"
            >
                <p className="text-xs md:text-sm tracking-[0.3em] uppercase font-minimal text-black dark:text-white mb-6">
                    [ {t('notFound.tag', 'ERREUR 404')} ]
                </p>

                <h1
                    aria-hidden="true"
                    className="font-creativo font-black leading-[0.85] uppercase tracking-tighter text-[28vw] md:text-[20vw] lg:text-[16rem] select-none bg-clip-text text-transparent bg-gradient-to-b from-black/90 to-black/40 dark:from-white dark:to-white/30"
                >
                    404
                </h1>

                <h2 className="mt-2 text-2xl md:text-4xl font-creativo font-bold uppercase tracking-tight">
                    {t('notFound.title', 'Page introuvable')}
                </h2>

                <p className="mt-4 max-w-md font-minimal text-black/60 dark:text-white/60 text-base md:text-lg">
                    {t('notFound.description', "La page que vous cherchez n'existe pas ou a été déplacée.")}
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white hover:bg-gray-800 hover:dark:bg-gray-300 text-white dark:text-black px-7 py-3 rounded-none font-bold uppercase tracking-wider text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:dark:ring-white focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
                    >
                        <HomeIcon size={18} />
                        {t('notFound.home', "Retour à l'accueil")}
                    </Link>
                    <Link
                        to="/episodes"
                        className="inline-flex items-center justify-center gap-2 border border-black/20 dark:border-white/20 hover:border-black/50 dark:hover:border-white/50 px-7 py-3 rounded-none font-bold uppercase tracking-wider text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:dark:ring-white"
                    >
                        {t('notFound.episodes', 'Voir les épisodes')}
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </main>
        </div>
    );
}
