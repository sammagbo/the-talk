import React, { useState, useEffect } from 'react';

const LazyImage = ({ src, alt, className, placeholder, ...props }) => {
    const [imageSrc, setImageSrc] = useState(placeholder || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E");
    const [imageRef, setImageRef] = useState();

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
                        rootMargin: '75%',
                    }
                );
                observer.observe(imageRef);
            } else {
                // Fallback for older browsers
                setImageSrc(src); // eslint-disable-line react-hooks/set-state-in-effect
            }
        }
        return () => {
            didCancel = true;
            if (observer && observer.unobserve) {
                observer.unobserve(imageRef);
            }
        };
    }, [src, imageSrc, imageRef]);

    return (
        <img
            ref={setImageRef}
            src={imageSrc}
            alt={alt}
            className={className}
            loading="lazy"
            decoding="async"
            {...props}
        />
    );
};

export default LazyImage;
