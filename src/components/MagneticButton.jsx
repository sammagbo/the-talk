import React, { useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Magnetic button component that attracts toward the cursor
 * Creates an engaging hover effect commonly seen in high-end fashion websites
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onClick - Click handler
 * @param {number} props.strength - Magnetic pull strength (default: 0.3)
 */
export default function MagneticButton({
    children,
    className = '',
    onClick,
    strength = 0.3,
    ...props
}) {
    const buttonRef = useRef(null);

    const handleMouseMove = (e) => {
        const button = buttonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(button, {
            x: x * strength,
            y: y * strength,
            duration: 0.3,
            ease: 'power2.out',
        });
    };

    const handleMouseLeave = () => {
        const button = buttonRef.current;
        if (!button) return;

        gsap.to(button, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)',
        });
    };

    return (
        <button
            ref={buttonRef}
            className={className}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {children}
        </button>
    );
}
