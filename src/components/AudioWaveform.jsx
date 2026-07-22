import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

/**
 * AudioWaveform - Visual representation of audio with animated bars
 */
export default function AudioWaveform({
    isPlaying = false,
    barCount = 20,
    height = 40,
}) {
    const containerRef = useRef(null);
    const barsRef = useRef([]);
    const animationsRef = useRef([]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Create bars
        containerRef.current.innerHTML = '';
        barsRef.current = [];
        animationsRef.current = [];

        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.style.cssText = `
                width: ${100 / barCount - 2}%;
                height: 20%;
                background: currentColor;
                border-radius: 2px;
                transform-origin: bottom;
            `;
            containerRef.current.appendChild(bar);
            barsRef.current.push(bar);
        }
    }, [barCount]);

    useEffect(() => {
        // Kill existing animations
        animationsRef.current.forEach(anim => anim?.kill());
        animationsRef.current = [];

        if (isPlaying) {
            barsRef.current.forEach((bar, i) => {
                const anim = gsap.to(bar, {
                    height: `${Math.random() * 80 + 20}%`,
                    duration: 0.15 + Math.random() * 0.2,
                    repeat: -1,
                    yoyo: true,
                    ease: 'power1.inOut',
                    delay: i * 0.02,
                });
                animationsRef.current.push(anim);
            });
        } else {
            barsRef.current.forEach((bar) => {
                gsap.to(bar, {
                    height: '20%',
                    duration: 0.3,
                    ease: 'power2.out',
                });
            });
        }

        return () => {
            animationsRef.current.forEach(anim => anim?.kill());
        };
    }, [isPlaying]);

    return (
        <div
            ref={containerRef}
            className="flex items-end justify-between gap-0.5 text-black dark:text-white"
            style={{ height }}
        />
    );
}
