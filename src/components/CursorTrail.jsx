import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * CursorTrail - Particle trail effect following the cursor
 */
export default function CursorTrail({
    color = '#007BFF',
    particleCount = 20,
    particleSize = 8,
    fadeOut = 0.3
}) {
    const containerRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Only show on desktop
        if (window.innerWidth < 1024) return;

        const container = containerRef.current;
        if (!container) return;

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: ${particleSize}px;
                height: ${particleSize}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9997;
                opacity: 0;
                mix-blend-mode: screen;
            `;
            container.appendChild(particle);
            particlesRef.current.push({
                el: particle,
                x: 0,
                y: 0,
            });
        }

        // Mouse move handler
        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        // Animation loop
        const animate = () => {
            let lastX = mouseRef.current.x;
            let lastY = mouseRef.current.y;

            particlesRef.current.forEach((particle, i) => {
                const speed = 0.15 + (i * 0.02);

                particle.x += (lastX - particle.x) * speed;
                particle.y += (lastY - particle.y) * speed;

                gsap.set(particle.el, {
                    x: particle.x - particleSize / 2,
                    y: particle.y - particleSize / 2,
                    opacity: 1 - (i / particleCount) * fadeOut,
                    scale: 1 - (i / particleCount) * 0.5,
                });

                lastX = particle.x;
                lastY = particle.y;
            });

            requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        const animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
            particlesRef.current.forEach(p => p.el.remove());
            particlesRef.current = [];
        };
    }, [color, particleCount, particleSize, fadeOut]);

    return <div ref={containerRef} className="hidden lg:block" />;
}
