import React, { useRef } from 'react';
import { gsap } from 'gsap';

/**
 * MicroButton - Button with micro-interaction animations
 */
export function MicroButton({
    children,
    onClick,
    className = '',
    variant = 'default', // 'default' | 'pulse' | 'bounce' | 'glow'
    ...props
}) {
    const buttonRef = useRef(null);

    const handleClick = (e) => {
        const button = buttonRef.current;
        if (!button) return;

        switch (variant) {
            case 'pulse':
                gsap.fromTo(
                    button,
                    { scale: 1 },
                    { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 }
                );
                break;
            case 'bounce':
                gsap.fromTo(
                    button,
                    { y: 0 },
                    { y: -5, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1 }
                );
                break;
            case 'glow':
                gsap.fromTo(
                    button,
                    { boxShadow: '0 0 0 0 rgba(0, 123, 255, 0.5)' },
                    {
                        boxShadow: '0 0 20px 10px rgba(0, 123, 255, 0)',
                        duration: 0.4,
                        ease: 'power2.out'
                    }
                );
                break;
            default:
                gsap.fromTo(
                    button,
                    { scale: 1 },
                    { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 }
                );
        }

        if (onClick) onClick(e);
    };

    return (
        <button
            ref={buttonRef}
            onClick={handleClick}
            className={className}
            {...props}
        >
            {children}
        </button>
    );
}

/**
 * RippleButton - Button with material-style ripple effect
 */
export function RippleButton({ children, onClick, className = '', ...props }) {
    const buttonRef = useRef(null);

    const handleClick = (e) => {
        const button = buttonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            left: ${x}px;
            top: ${y}px;
        `;

        button.appendChild(ripple);

        gsap.to(ripple, {
            width: Math.max(rect.width, rect.height) * 2,
            height: Math.max(rect.width, rect.height) * 2,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => ripple.remove(),
        });

        if (onClick) onClick(e);
    };

    return (
        <button
            ref={buttonRef}
            onClick={handleClick}
            className={`relative overflow-hidden ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

/**
 * HoverScale - Wrapper that adds scale on hover
 */
export function HoverScale({ children, scale = 1.05, className = '' }) {
    const ref = useRef(null);

    const handleEnter = () => {
        gsap.to(ref.current, { scale, duration: 0.2, ease: 'power2.out' });
    };

    const handleLeave = () => {
        gsap.to(ref.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
    };

    return (
        <div
            ref={ref}
            className={className}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            {children}
        </div>
    );
}

/**
 * HoverLift - Wrapper that adds lift (shadow + translate) on hover
 */
export function HoverLift({ children, className = '' }) {
    const ref = useRef(null);

    const handleEnter = () => {
        gsap.to(ref.current, {
            y: -5,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            duration: 0.2,
            ease: 'power2.out',
        });
    };

    const handleLeave = () => {
        gsap.to(ref.current, {
            y: 0,
            boxShadow: '0 0 0 rgba(0,0,0,0)',
            duration: 0.2,
            ease: 'power2.out',
        });
    };

    return (
        <div
            ref={ref}
            className={className}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            {children}
        </div>
    );
}
