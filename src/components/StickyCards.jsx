import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * StickyCards - Cards that stack and stick as you scroll
 * Creates a layered reveal effect
 */
export default function StickyCards({ children, className = '' }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const cards = container.querySelectorAll('.sticky-card');
        if (cards.length === 0) return;

        const ctx = gsap.context(() => {
            cards.forEach((card, i) => {
                const isLast = i === cards.length - 1;

                ScrollTrigger.create({
                    trigger: card,
                    start: 'top top',
                    end: isLast ? 'bottom bottom' : 'bottom top',
                    pin: !isLast,
                    pinSpacing: false,
                });

                // Scale and opacity effect for stacked cards
                if (!isLast) {
                    gsap.to(card, {
                        scale: 0.9,
                        opacity: 0.5,
                        scrollTrigger: {
                            trigger: cards[i + 1],
                            start: 'top bottom',
                            end: 'top top',
                            scrub: true,
                        },
                    });
                }
            });
        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {children}
        </div>
    );
}

/**
 * StickyCard - Individual sticky card item
 */
export function StickyCard({ children, className = '' }) {
    return (
        <div className={`sticky-card w-full ${className}`}>
            {children}
        </div>
    );
}
