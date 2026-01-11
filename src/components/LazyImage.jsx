import React, { useState, useEffect } from 'react';

/**
 * LazyImage - Optimized lazy loading with responsive srcset support
 * Features:
 * - IntersectionObserver for lazy loading
 * - srcset for responsive images (Sanity CDN)
 * - WebP format when supported
 * - Blur placeholder effect
 */
const LazyImage = ({
    src,
    alt,
    className,
    placeholder,
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    widths = [320, 640, 800, 1024, 1280],
    quality = 75,
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(placeholder || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E");
    const [imageRef, setImageRef] = useState();
    const [isLoaded, setIsLoaded] = useState(false);

    // Generate srcset for Sanity images
    const generateSrcSet = (baseSrc) => {
        if (!baseSrc || !baseSrc.includes('cdn.sanity.io')) {
            return null; // Only generate srcset for Sanity images
        }

        return widths
            .map((w) => {
                // Add/update width and quality params for Sanity CDN
                const url = new URL(baseSrc);
                url.searchParams.set('w', w);
                url.searchParams.set('q', quality);
                url.searchParams.set('auto', 'format'); // Auto WebP when supported
                return `${url.toString()} ${w}w`;
            })
            .join(', ');
    };

    useEffect(() => {
        let observer;
        let didCancel = false;

        if (imageRef && imageSrc !== src) {
            if (IntersectionObserver) {
                observer = new IntersectionObserver(
                    entries => {
                        entries.forEach(entry => {
                            if (
                                !didCancel &&
                                (entry.intersectionRatio > 0 || entry.isIntersecting)
                            ) {
                                setImageSrc(src);
                                observer.unobserve(imageRef);
                            }
                        });
                    },
                    {
                        threshold: 0.01,
                        rootMargin: '200px', // Load 200px before visible
                    }
                );
                observer.observe(imageRef);
            } else {
                // Fallback for older browsers
                setImageSrc(src);
            }
        }
        return () => {
            didCancel = true;
            if (observer && observer.unobserve) {
                observer.unobserve(imageRef);
            }
        };
    }, [src, imageSrc, imageRef]);

    const srcSet = generateSrcSet(src);

    return (
        <img
            ref={setImageRef}
            src={imageSrc}
            srcSet={isLoaded && srcSet ? srcSet : undefined}
            sizes={srcSet ? sizes : undefined}
            alt={alt}
            className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-70'}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            {...props}
        />
    );
};

export default LazyImage;

