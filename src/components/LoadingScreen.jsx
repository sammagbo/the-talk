import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

/**
 * Animated loading screen with THE TALK branding
 * Features:
 * - Logo reveal animation
 * - Progress bar
 * - Smooth exit transition
 */
export default function LoadingScreen({ onComplete }) {
    const containerRef = useRef(null);
    const logoRef = useRef(null);
    const progressRef = useRef(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const container = containerRef.current;
        const logo = logoRef.current;
        const progressBar = progressRef.current;

        // Initial state
        gsap.set(logo, { opacity: 0, y: 30 });

        // Animate logo in
        gsap.to(logo, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            delay: 0.2,
        });

        // Simulate loading progress
        const progressTl = gsap.timeline({
            onComplete: () => {
                // Exit animation
                gsap.to(container, {
                    yPercent: -100,
                    duration: 0.8,
                    ease: 'power4.inOut',
                    delay: 0.3,
                    onComplete: () => {
                        if (onComplete) onComplete();
                    },
                });
            },
        });

        progressTl.to({}, {
            duration: 2,
            ease: 'power1.inOut',
            onUpdate: function () {
                const prog = Math.round(this.progress() * 100);
                setProgress(prog);
                if (progressBar) {
                    gsap.to(progressBar, {
                        width: `${prog}%`,
                        duration: 0.1,
                    });
                }
            },
        });

        return () => {
            progressTl.kill();
        };
    }, [onComplete]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center"
        >
            {/* Background gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#007BFF]/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A9A9F5]/20 rounded-full blur-[120px]" />

            {/* Logo */}
            <div ref={logoRef} className="text-center z-10">
                <h1 className="text-5xl md:text-7xl font-creativo font-black tracking-[0.1em] text-white uppercase">
                    THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007BFF] to-[#A9A9F5]">TALK</span>
                </h1>
                <p className="text-[#6C757D] mt-4 text-sm tracking-widest uppercase font-minimal">
                    Loading Experience
                </p>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 z-10">
                <div className="h-[2px] bg-[#333] rounded-full overflow-hidden">
                    <div
                        ref={progressRef}
                        className="h-full bg-gradient-to-r from-[#007BFF] to-[#A9A9F5] rounded-full"
                        style={{ width: '0%' }}
                    />
                </div>
                <p className="text-center text-[#6C757D] text-xs mt-3 font-mono">
                    {progress}%
                </p>
            </div>
        </div>
    );
}
