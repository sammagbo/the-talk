import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Confetti - Celebration effect with falling particles
 * Triggers on mount and can be controlled via props
 */
export default function Confetti({ active = true, duration = 3000, colors = ['#007BFF', '#A9A9F5', '#FFD700', '#FF6B6B', '#4ECDC4'] }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!active || !containerRef.current) return;

        const container = containerRef.current;
        const particles = [];
        const particleCount = 100;

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 10 + 5}px;
                height: ${Math.random() * 10 + 5}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                pointer-events: none;
            `;
            container.appendChild(particle);
            particles.push(particle);
        }

        // Animate particles
        particles.forEach((particle, i) => {
            const startX = Math.random() * window.innerWidth;
            const startY = -50;
            const endX = startX + (Math.random() - 0.5) * 400;
            const endY = window.innerHeight + 100;

            gsap.set(particle, { x: startX, y: startY, rotation: 0, opacity: 1 });

            gsap.to(particle, {
                x: endX,
                y: endY,
                rotation: Math.random() * 720 - 360,
                opacity: 0,
                duration: Math.random() * 2 + 2,
                delay: Math.random() * 0.5,
                ease: 'power1.out',
            });
        });

        // Cleanup
        const timer = setTimeout(() => {
            particles.forEach((p) => p.remove());
        }, duration);

        return () => {
            clearTimeout(timer);
            particles.forEach((p) => p.remove());
        };
    }, [active, duration, colors]);

    if (!active) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden"
        />
    );
}
