import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * CountUp - Animated number counter
 * Counts from 0 to target number when visible
 */
export default function CountUp({
    end,
    duration = 2,
    suffix = '',
    prefix = '',
    className = '',
    decimals = 0,
    scrollTrigger = true,
}) {
    const [displayValue, setDisplayValue] = useState(0);
    const containerRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || hasAnimated.current) return;

        const animateCount = () => {
            if (hasAnimated.current) return;
            hasAnimated.current = true;

            const obj = { value: 0 };
            gsap.to(obj, {
                value: end,
                duration,
                ease: 'power2.out',
                onUpdate: () => {
                    setDisplayValue(
                        decimals > 0
                            ? obj.value.toFixed(decimals)
                            : Math.round(obj.value)
                    );
                },
            });
        };

        if (scrollTrigger) {
            ScrollTrigger.create({
                trigger: container,
                start: 'top 85%',
                onEnter: animateCount,
            });
        } else {
            animateCount();
        }
    }, [end, duration, decimals, scrollTrigger]);

    return (
        <span ref={containerRef} className={className}>
            {prefix}{displayValue}{suffix}
        </span>
    );
}
