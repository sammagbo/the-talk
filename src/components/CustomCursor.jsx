import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Custom animated cursor component with fashion-style aesthetics
 * Features:
 * - Smooth following animation
 * - Grows on hover over interactive elements
 * - Mix-blend-mode for trendy effect
 */
export default function CustomCursor() {
    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        const cursorDot = cursorDotRef.current;

        if (!cursor || !cursorDot) return;

        // Hide default cursor
        document.body.style.cursor = 'none';

        // Mouse move handler
        const onMouseMove = (e) => {
            // Main cursor follows with slight delay
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.5,
                ease: 'power2.out',
            });

            // Dot follows instantly
            gsap.to(cursorDot, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
            });
        };

        // Hover effects
        const onMouseEnter = () => {
            gsap.to(cursor, {
                scale: 2,
                duration: 0.3,
                ease: 'power2.out',
            });
            gsap.to(cursorDot, {
                opacity: 0,
                duration: 0.2,
            });
        };

        const onMouseLeave = () => {
            gsap.to(cursor, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out',
            });
            gsap.to(cursorDot, {
                opacity: 1,
                duration: 0.2,
            });
        };

        // Add event listeners
        window.addEventListener('mousemove', onMouseMove);

        // Add hover effect to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, textarea, .cursor-hover');
        interactiveElements.forEach((el) => {
            el.addEventListener('mouseenter', onMouseEnter);
            el.addEventListener('mouseleave', onMouseLeave);
        });

        // Cleanup
        return () => {
            document.body.style.cursor = 'auto';
            window.removeEventListener('mousemove', onMouseMove);
            interactiveElements.forEach((el) => {
                el.removeEventListener('mouseenter', onMouseEnter);
                el.removeEventListener('mouseleave', onMouseLeave);
            });
        };
    }, []);

    // Only show on desktop
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        return null;
    }

    return (
        <>
            {/* Main cursor ring */}
            <div
                ref={cursorRef}
                className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
                style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid rgba(0, 123, 255, 0.5)',
                    borderRadius: '50%',
                    mixBlendMode: 'difference',
                    backgroundColor: 'rgba(169, 169, 245, 0.1)',
                }}
            />
            {/* Center dot */}
            <div
                ref={cursorDotRef}
                className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
                style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#007BFF',
                    borderRadius: '50%',
                }}
            />
        </>
    );
}
