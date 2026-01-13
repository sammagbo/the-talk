import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

/**
 * PageTransition - Animated page transition wrapper
 * Creates smooth entrance/exit animations for page content
 */
export default function PageTransition({ children }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Entrance animation
        const ctx = gsap.context(() => {
            gsap.fromTo(
                container,
                {
                    opacity: 0,
                    y: 30,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'power3.out',
                }
            );
        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="page-transition">
            {children}
        </div>
    );
}
