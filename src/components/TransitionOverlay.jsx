import React, { useRef, useLayoutEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

/**
 * TransitionOverlay - Full-screen animated overlay for page transitions
 * Creates a cinematic wipe effect between pages
 */
export default function TransitionOverlay() {
    const overlayRef = useRef(null);
    const location = useLocation();
    const isFirstRender = useRef(true);

    const animateTransition = useCallback(() => {
        const overlay = overlayRef.current;
        if (!overlay) return;

        const tl = gsap.timeline();

        // Wipe in from bottom
        tl.set(overlay, { yPercent: 100, display: 'block' })
            .to(overlay, {
                yPercent: 0,
                duration: 0.5,
                ease: 'power4.inOut',
            })
            // Wipe out to top
            .to(overlay, {
                yPercent: -100,
                duration: 0.5,
                ease: 'power4.inOut',
                delay: 0.1,
            })
            .set(overlay, { display: 'none' });
    }, []);

    useLayoutEffect(() => {
        // Skip animation on first render (initial page load)
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        animateTransition();
    }, [location.pathname, animateTransition]);

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[9998] pointer-events-none hidden"
            style={{ display: 'none' }}
        >
            {/* Main overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF] to-[#A9A9F5]" />

            {/* Logo in center */}
            <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-4xl md:text-6xl font-creativo font-black tracking-[0.1em] text-white uppercase">
                    THE <span className="text-white/80">TALK</span>
                </h1>
            </div>
        </div>
    );
}
