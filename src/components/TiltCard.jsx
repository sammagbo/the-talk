import React, { useRef } from 'react';
import { gsap } from 'gsap';

/**
 * TiltCard - 3D perspective tilt effect on hover
 * Creates an engaging hover effect commonly seen in modern websites
 */
export default function TiltCard({
    children,
    className = '',
    maxTilt = 15,
    scale = 1.02,
    speed = 400,
    glare = true,
    glareOpacity = 0.2,
}) {
    const cardRef = useRef(null);
    const glareRef = useRef(null);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const rotateX = (mouseY / (rect.height / 2)) * -maxTilt;
        const rotateY = (mouseX / (rect.width / 2)) * maxTilt;

        gsap.to(card, {
            rotateX,
            rotateY,
            scale,
            duration: speed / 1000,
            ease: 'power2.out',
            transformPerspective: 1000,
        });

        if (glare && glareRef.current) {
            const glareX = ((e.clientX - rect.left) / rect.width) * 100;
            const glareY = ((e.clientY - rect.top) / rect.height) * 100;
            gsap.to(glareRef.current, {
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${glareOpacity}) 0%, transparent 60%)`,
                duration: 0.3,
            });
        }
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;

        gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration: speed / 1000,
            ease: 'power2.out',
        });

        if (glare && glareRef.current) {
            gsap.to(glareRef.current, {
                background: 'transparent',
                duration: 0.3,
            });
        }
    };

    return (
        <div
            ref={cardRef}
            className={`relative ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transformStyle: 'preserve-3d' }}
        >
            {children}
            {glare && (
                <div
                    ref={glareRef}
                    className="absolute inset-0 pointer-events-none rounded-inherit z-10"
                    style={{ borderRadius: 'inherit' }}
                />
            )}
        </div>
    );
}
