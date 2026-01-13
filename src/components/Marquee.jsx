import React from 'react';
import './Marquee.css';

/**
 * Marquee - Infinite scrolling text/content
 * Creates a smooth infinite scroll effect
 */
export default function Marquee({
    children,
    speed = 30,
    direction = 'left',
    pauseOnHover = true,
    className = '',
    repeat = 4,
}) {
    const content = Array(repeat).fill(children);

    return (
        <div
            className={`marquee-container ${pauseOnHover ? 'pause-on-hover' : ''} ${className}`}
            style={{ '--marquee-speed': `${speed}s` }}
        >
            <div className={`marquee-content ${direction === 'right' ? 'reverse' : ''}`}>
                {content.map((item, i) => (
                    <div key={i} className="marquee-item">
                        {item}
                    </div>
                ))}
            </div>
            <div className={`marquee-content ${direction === 'right' ? 'reverse' : ''}`} aria-hidden="true">
                {content.map((item, i) => (
                    <div key={i} className="marquee-item">
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}
