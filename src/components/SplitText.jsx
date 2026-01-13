import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * SplitText - Animated text reveal component
 * Splits text into characters/words and animates them
 */
export default function SplitText({
    children,
    className = '',
    type = 'chars', // 'chars' | 'words' | 'lines'
    stagger = 0.03,
    duration = 0.8,
    delay = 0,
    y = 50,
    scrollTrigger = false,
    triggerStart = 'top 80%',
}) {
    const containerRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || hasAnimated.current) return;

        const text = container.textContent;
        container.innerHTML = '';

        let elements = [];

        if (type === 'chars') {
            // Split into characters
            elements = text.split('').map((char, i) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.display = 'inline-block';
                span.style.opacity = '0';
                span.style.transform = `translateY(${y}px)`;
                container.appendChild(span);
                return span;
            });
        } else if (type === 'words') {
            // Split into words
            elements = text.split(' ').map((word, i, arr) => {
                const span = document.createElement('span');
                span.textContent = word + (i < arr.length - 1 ? '\u00A0' : '');
                span.style.display = 'inline-block';
                span.style.opacity = '0';
                span.style.transform = `translateY(${y}px)`;
                container.appendChild(span);
                return span;
            });
        }

        const animationConfig = {
            opacity: 1,
            y: 0,
            duration,
            stagger,
            delay,
            ease: 'power3.out',
        };

        if (scrollTrigger) {
            gsap.to(elements, {
                ...animationConfig,
                scrollTrigger: {
                    trigger: container,
                    start: triggerStart,
                    toggleActions: 'play none none none',
                },
            });
        } else {
            gsap.to(elements, animationConfig);
        }

        hasAnimated.current = true;
    }, [type, stagger, duration, delay, y, scrollTrigger, triggerStart]);

    return (
        <span ref={containerRef} className={className}>
            {children}
        </span>
    );
}
