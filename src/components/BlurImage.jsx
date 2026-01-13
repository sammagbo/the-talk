import React, { useState, useEffect, useRef } from 'react';

/**
 * BlurImage - Image component with blur placeholder loading effect
 */
export default function BlurImage({
    src,
    alt = '',
    className = '',
    blurColor = '#1a1a2e',
    ...props
}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        setIsLoaded(false);
        setHasError(false);

        const img = new Image();
        img.src = src;

        img.onload = () => {
            setIsLoaded(true);
        };

        img.onerror = () => {
            setHasError(true);
        };
    }, [src]);

    return (
        <div className={`relative overflow-hidden ${className}`} {...props}>
            {/* Blur placeholder */}
            <div
                className={`absolute inset-0 transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'
                    }`}
                style={{
                    background: `linear-gradient(135deg, ${blurColor} 0%, #2a2a4e 50%, ${blurColor} 100%)`,
                    filter: 'blur(0)',
                }}
            >
                {/* Shimmer effect */}
                <div
                    className="absolute inset-0 animate-shimmer"
                    style={{
                        background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)`,
                        backgroundSize: '200% 100%',
                    }}
                />
            </div>

            {/* Actual image */}
            {!hasError && (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    loading="lazy"
                />
            )}

            {/* Error fallback */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <span className="text-gray-500 text-sm">Image unavailable</span>
                </div>
            )}
        </div>
    );
}
