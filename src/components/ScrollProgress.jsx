import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollProgress - Animated progress bar at top of page
 */
export default function ScrollProgress({ color = '#007BFF' }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            setProgress(scrollPercent);
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 h-1 z-[9999] bg-transparent">
            <div
                className="h-full transition-all duration-100 ease-out"
                style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${color}, #A9A9F5)`,
                    boxShadow: `0 0 10px ${color}`,
                }}
            />
        </div>
    );
}
