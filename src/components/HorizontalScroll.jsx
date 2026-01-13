import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * HorizontalScroll - Apple-style horizontal scroll section
 * Section that scrolls horizontally as user scrolls vertically
 */
export default function HorizontalScroll({ children, className = '' }) {
    const containerRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        if (!container || !wrapper) return;

        // Calculate how far to scroll
        const scrollWidth = wrapper.scrollWidth - container.offsetWidth;

        const ctx = gsap.context(() => {
            gsap.to(wrapper, {
                x: -scrollWidth,
                ease: 'none',
                scrollTrigger: {
                    trigger: container,
                    pin: true,
                    scrub: 1,
                    end: () => `+=${scrollWidth}`,
                    invalidateOnRefresh: true,
                },
            });
        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className={`overflow-hidden ${className}`}>
            <div ref={wrapperRef} className="flex gap-8 will-change-transform">
                {children}
            </div>
        </section>
    );
}

/**
 * HorizontalScrollItem - Individual item in horizontal scroll
 */
export function HorizontalScrollItem({ children, className = '' }) {
    return (
        <div className={`flex-shrink-0 ${className}`}>
            {children}
        </div>
    );
}
