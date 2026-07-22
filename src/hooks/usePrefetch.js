import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * usePrefetch - Hook to prefetch pages on link hover
 */
export default function usePrefetch() {
    const location = useLocation();
    // Persist across renders so already-prefetched hrefs are not fetched twice.
    const prefetchedRef = useRef(new Set());

    const prefetch = useCallback((href) => {
        if (prefetchedRef.current.has(href)) return;

        // Create a link element for prefetching
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        link.as = 'document';
        document.head.appendChild(link);

        prefetchedRef.current.add(href);
    }, []);

    useEffect(() => {
        const handleMouseEnter = (e) => {
            const link = e.target.closest('a[href^="/"]');
            if (link && link.href) {
                const url = new URL(link.href);
                if (url.pathname !== location.pathname) {
                    prefetch(link.href);
                }
            }
        };

        document.addEventListener('mouseenter', handleMouseEnter, true);

        return () => {
            document.removeEventListener('mouseenter', handleMouseEnter, true);
        };
    }, [location.pathname, prefetch]);
}

/**
 * PrefetchLink - Component that prefetches on hover
 */
export function PrefetchLink({ to, children, className = '', ...props }) {
    const handleMouseEnter = () => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = to;
        link.as = 'document';
        document.head.appendChild(link);
    };

    return (
        <a
            href={to}
            className={className}
            onMouseEnter={handleMouseEnter}
            {...props}
        >
            {children}
        </a>
    );
}
