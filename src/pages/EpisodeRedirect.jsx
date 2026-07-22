import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { client } from '../sanity';

/**
 * EpisodeRedirect — backward compatibility for the legacy /episode/:id route.
 * Resolves the episode by its Sanity _id, then redirects to the canonical
 * slug URL (/episodes/:slug) so old links keep working.
 */
export default function EpisodeRedirect() {
    const { id } = useParams();
    const [state, setState] = useState({ status: 'loading', slug: null });

    useEffect(() => {
        let cancelled = false;
        const resolveSlug = async () => {
            try {
                const slug = await client.fetch(
                    `*[_type == "episode" && _id == $id][0].slug.current`,
                    { id }
                );
                if (!cancelled) {
                    setState(slug ? { status: 'found', slug } : { status: 'missing', slug: null });
                }
            } catch {
                if (!cancelled) setState({ status: 'missing', slug: null });
            }
        };
        if (id) resolveSlug();
        return () => { cancelled = true; };
    }, [id]);

    if (state.status === 'found') {
        return <Navigate to={`/episodes/${state.slug}`} replace />;
    }
    if (state.status === 'missing') {
        return <Navigate to="/episodes" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
            <Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" />
        </div>
    );
}
