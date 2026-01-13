import { useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Custom hook for using GSAP with React
 * Handles cleanup automatically on component unmount
 * 
 * @param {Function} animation - Function that creates GSAP animations
 * @param {Array} dependencies - Dependencies array for re-running animations
 */
export const useGSAP = (animation, dependencies = []) => {
    const contextRef = useRef(null);

    useLayoutEffect(() => {
        // Create a GSAP context for cleanup
        contextRef.current = gsap.context(() => {
            animation();
        });

        // Cleanup on unmount
        return () => {
            if (contextRef.current) {
                contextRef.current.revert();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
};

/**
 * Fade in from bottom animation
 * @param {string} selector - CSS selector or element ref
 * @param {object} options - Animation options
 */
export const fadeInUp = (selector, options = {}) => {
    const defaults = {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.1,
    };
    return gsap.from(selector, { ...defaults, ...options });
};

/**
 * Fade in with scale animation
 * @param {string} selector - CSS selector or element ref
 * @param {object} options - Animation options
 */
export const fadeInScale = (selector, options = {}) => {
    const defaults = {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
    };
    return gsap.from(selector, { ...defaults, ...options });
};

/**
 * Create a scroll-triggered animation
 * @param {string} selector - CSS selector for elements to animate
 * @param {object} fromVars - GSAP from variables
 * @param {object} scrollOptions - ScrollTrigger options
 */
export const scrollAnimation = (selector, fromVars = {}, scrollOptions = {}) => {
    const defaultFromVars = {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        stagger: 0.15,
    };

    const defaultScrollOptions = {
        trigger: selector,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
    };

    return gsap.from(selector, {
        ...defaultFromVars,
        ...fromVars,
        scrollTrigger: {
            ...defaultScrollOptions,
            ...scrollOptions,
        },
    });
};

/**
 * Text reveal animation (character by character)
 * @param {string} selector - CSS selector for text element
 * @param {object} options - Animation options
 */
export const textReveal = (selector, options = {}) => {
    const defaults = {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.02,
    };
    return gsap.from(selector, { ...defaults, ...options });
};

/**
 * Parallax effect on scroll
 * @param {string} selector - CSS selector for element
 * @param {number} speed - Parallax speed multiplier
 */
export const parallax = (selector, speed = 0.5) => {
    return gsap.to(selector, {
        yPercent: -50 * speed,
        ease: 'none',
        scrollTrigger: {
            trigger: selector,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
    });
};

// Export gsap and ScrollTrigger for direct usage
export { gsap, ScrollTrigger };
