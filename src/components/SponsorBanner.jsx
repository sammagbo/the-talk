import React, { useState, useEffect } from 'react';
import { client, urlFor } from '../sanity';
// import { analytics } from '../firebase'; // Analytics removed from firebase config
import { X, ExternalLink } from 'lucide-react';

export default function SponsorBanner() {
    const [sponsor, setSponsor] = useState(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchSponsor = async () => {
            try {
                // Fetch the first active sponsor
                const query = `*[_type == "sponsor" && isActive == true][0]{
                    name,
                    "logoUrl": logo.asset->url,
                    url,
                    text
                }`;
                const data = await client.fetch(query);
                if (data) setSponsor(data);
            } catch (error) {
                console.error("Error fetching sponsor:", error);
            }
        };

        fetchSponsor();
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
    };

    const handleClick = () => {
        // Analytics tracking disabled
        // if (sponsor) {
        //     logEvent(analytics, 'select_content', {
        //         content_type: 'sponsor',
        //         item_id: sponsor.name,
        //         destination: sponsor.url
        //     });
        // }
    };

    if (!sponsor || !isVisible) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-28 z-40 max-w-sm animate-fade-in-up">
            <div className="bg-white dark:bg-[#111] border border-[#007BFF]/30 p-4 rounded-xl shadow-2xl flex items-center gap-4 relative overflow-hidden backdrop-blur-md">
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#007BFF]/10 rounded-full blur-2xl"></div>

                <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-black rounded-lg p-2 flex items-center justify-center border border-gray-200 dark:border-[#333]">
                    {sponsor.logoUrl ? (
                        <img src={urlFor(sponsor.logoUrl).width(200).url()} alt={sponsor.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                        <span className="text-xs font-bold">{sponsor.name}</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#007BFF] font-bold uppercase tracking-wider mb-0.5">Sponsorisé</p>
                    <p className="text-sm font-medium text-black dark:text-white line-clamp-2 leading-tight pr-6">
                        {sponsor.text || `Découvrez ${sponsor.name}`}
                    </p>
                    <a
                        href={sponsor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleClick}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#007BFF] mt-1 transition-colors group"
                    >
                        Visiter le site <ExternalLink size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </a>
                </div>

                <button
                    onClick={handleDismiss}
                    aria-label="Fermer"
                    className="absolute top-2 right-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
