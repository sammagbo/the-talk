import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ImageReveal - Animated image reveal with mask/clip-path
 * Creates a cinematic image entrance effect
 */
export default function ImageReveal({
    src,
    alt = '',
    className = '',
    direction = 'left', // 'left' | 'right' | 'top' | 'bottom' | 'center'
    duration = 1.2,
    delay = 0,
    scrollTrigger = true,
    triggerStart = 'top 80%',
    children,
}) {
    const containerRef = useRef(null);
    const overlayRef = useRef(null);
    const imageRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        const overlay = overlayRef.current;
        const image = imageRef.current;

        if (!container || !overlay || hasAnimated.current) return;

        // Set initial states based on direction
        let overlayFrom = {};
        let imageTo = { scale: 1 };

        switch (direction) {
            case 'left':
                overlayFrom = { xPercent: 0 };
                gsap.set(overlay, { xPercent: 0 });
                break;
            case 'right':
                overlayFrom = { xPercent: 0 };
                gsap.set(overlay, { xPercent: 0, right: 0, left: 'auto' });
                break;
            case 'top':
                overlayFrom = { yPercent: 0 };
                gsap.set(overlay, { yPercent: 0 });
                break;
            case 'bottom':
                overlayFrom = { yPercent: 0 };
                gsap.set(overlay, { yPercent: 0, bottom: 0, top: 'auto' });
                break;
            case 'center':
                gsap.set(overlay, { scaleX: 1 });
                break;
            default:
                overlayFrom = { xPercent: 0 };
        }

        gsap.set(image, { scale: 1.3 });

        const animate = () => {
            if (hasAnimated.current) return;
            hasAnimated.current = true;

            const tl = gsap.timeline({ defaults: { ease: 'power4.inOut' } });

            if (direction === 'center') {
                tl.to(overlay, { scaleX: 0, duration, delay });
            } else if (direction === 'left' || direction === 'right') {
                tl.to(overlay, { xPercent: direction === 'left' ? -100 : 100, duration, delay });
            } else {
                tl.to(overlay, { yPercent: direction === 'top' ? -100 : 100, duration, delay });
            }

            tl.to(image, { scale: 1, duration: duration * 1.2 }, `-=${duration * 0.8}`);
        };

        if (scrollTrigger) {
            ScrollTrigger.create({
                trigger: container,
                start: triggerStart,
                onEnter: animate,
            });
        } else {
            animate();
        }
    }, [direction, duration, delay, scrollTrigger, triggerStart]);

    return (
        <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
            {children || (
                <img
                    ref={imageRef}
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                />
            )}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-[#007BFF] z-10"
                style={{ transformOrigin: direction === 'center' ? 'center' : undefined }}
            />
        </div>
    );
}
