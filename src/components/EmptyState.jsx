import React from 'react';
import { Inbox, Search, ShoppingBag, Headphones, Video, FileText, AlertCircle } from 'lucide-react';

/**
 * Empty State Components
 * Friendly messages when there's no content to display
 */

// Generic empty state
export function EmptyState({
    icon: Icon = Inbox,
    title = "Rien à afficher",
    description = "Il n'y a pas encore de contenu ici.",
    action = null,
    className = ""
}) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#222] flex items-center justify-center mb-6">
                <Icon className="w-10 h-10 text-gray-400 dark:text-[#555]" />
            </div>
            <h3 className="text-xl font-creativo font-bold text-gray-700 dark:text-gray-300 mb-2">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-[#6C757D] font-minimal max-w-sm mb-6">
                {description}
            </p>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}

// No episodes found
export function NoEpisodesState({ onReset }) {
    return (
        <EmptyState
            icon={Headphones}
            title="Aucun épisode trouvé"
            description="Essayez de modifier vos filtres ou revenez plus tard pour voir de nouveaux épisodes."
            action={onReset && (
                <button
                    onClick={onReset}
                    className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-6 py-2 rounded-full font-bold transition-all"
                >
                    Réinitialiser les filtres
                </button>
            )}
        />
    );
}

// No search results
export function NoSearchResultsState({ query, onClear }) {
    return (
        <EmptyState
            icon={Search}
            title="Aucun résultat"
            description={`Aucun résultat trouvé pour "${query}". Essayez un autre terme de recherche.`}
            action={onClear && (
                <button
                    onClick={onClear}
                    className="text-[#007BFF] hover:underline font-minimal"
                >
                    Effacer la recherche
                </button>
            )}
        />
    );
}

// Empty cart/store
export function NoProductsState() {
    return (
        <EmptyState
            icon={ShoppingBag}
            title="Boutique en construction"
            description="Notre collection exclusive arrive bientôt. Restez à l'écoute !"
        />
    );
}

// No videos
export function NoVideosState() {
    return (
        <EmptyState
            icon={Video}
            title="Pas de vidéos pour le moment"
            description="De nouvelles vidéos seront disponibles prochainement."
        />
    );
}

// No blog posts
export function NoBlogPostsState() {
    return (
        <EmptyState
            icon={FileText}
            title="Aucun article"
            description="Le blog arrive bientôt avec du contenu exclusif."
        />
    );
}

// Error state
export function ErrorState({ message, onRetry }) {
    return (
        <EmptyState
            icon={AlertCircle}
            title="Oups ! Une erreur s'est produite"
            description={message || "Quelque chose s'est mal passé. Veuillez réessayer."}
            action={onRetry && (
                <button
                    onClick={onRetry}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold transition-all"
                >
                    Réessayer
                </button>
            )}
        />
    );
}

// Offline state
export function OfflineState() {
    return (
        <EmptyState
            icon={AlertCircle}
            title="Vous êtes hors ligne"
            description="Vérifiez votre connexion internet et réessayez."
            action={
                <button
                    onClick={() => window.location.reload()}
                    className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-6 py-2 rounded-full font-bold transition-all"
                >
                    Actualiser
                </button>
            }
        />
    );
}

export default EmptyState;
