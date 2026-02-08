import React, { useRef, useEffect } from 'react';
import createGlobe from 'cobe';

/**
 * Interactive 3D Globe for visualizing audience locations
 * Uses cobe library for lightweight WebGL globe rendering
 */
export default function Globe({ markers = [], className = '' }) {
      const canvasRef = useRef(null);
      const pointerInteracting = useRef(null);
      const pointerInteractionMovement = useRef(0);
      const globeRef = useRef(null);
      const phiRef = useRef(0);

      useEffect(() => {
            if (!canvasRef.current) return;

            let width = 0;

            const onResize = () => {
                  if (canvasRef.current) {
                        width = canvasRef.current.offsetWidth;
                  }
            };
            window.addEventListener('resize', onResize);
            onResize();

            const globe = createGlobe(canvasRef.current, {
                  devicePixelRatio: 2,
                  width: width * 2,
                  height: width * 2,
                  phi: 0,
                  theta: 0.3,
                  dark: 1,
                  diffuse: 3,
                  mapSamples: 16000,
                  mapBrightness: 1.2,
                  baseColor: [0.1, 0.1, 0.1],
                  markerColor: [0.1, 0.5, 1], // Blue markers
                  glowColor: [0.05, 0.2, 0.4],
                  markers: markers.map(m => ({
                        location: [m.lat, m.lon],
                        size: m.size || 0.05
                  })),
                  onRender: (state) => {
                        // Auto-rotate when not interacting
                        if (!pointerInteracting.current) {
                              phiRef.current += 0.002;
                        }
                        state.phi = phiRef.current + pointerInteractionMovement.current;
                        state.width = width * 2;
                        state.height = width * 2;
                  }
            });

            globeRef.current = globe;

            // Cleanup
            return () => {
                  globe.destroy();
                  window.removeEventListener('resize', onResize);
            };
      }, []);

      // Update markers when they change
      useEffect(() => {
            // Cobe doesn't support dynamic marker updates natively,
            // so we'd need to recreate the globe for real-time updates
            // For now, markers are passed once on mount
      }, [markers]);

      return (
            <div className={`relative ${className}`}>
                  <canvas
                        ref={canvasRef}
                        className="w-full aspect-square cursor-grab active:cursor-grabbing"
                        onPointerDown={(e) => {
                              pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
                              canvasRef.current.style.cursor = 'grabbing';
                        }}
                        onPointerUp={() => {
                              pointerInteracting.current = null;
                              canvasRef.current.style.cursor = 'grab';
                        }}
                        onPointerOut={() => {
                              pointerInteracting.current = null;
                              if (canvasRef.current) {
                                    canvasRef.current.style.cursor = 'grab';
                              }
                        }}
                        onMouseMove={(e) => {
                              if (pointerInteracting.current !== null) {
                                    const delta = e.clientX - pointerInteracting.current;
                                    pointerInteractionMovement.current = delta / 100;
                              }
                        }}
                        onTouchMove={(e) => {
                              if (pointerInteracting.current !== null && e.touches[0]) {
                                    const delta = e.touches[0].clientX - pointerInteracting.current;
                                    pointerInteractionMovement.current = delta / 100;
                              }
                        }}
                  />

                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#007BFF]/20 via-transparent to-transparent pointer-events-none" />
            </div>
      );
}

/**
 * Map timezone offset to approximate lat/lon
 * This is a rough approximation based on timezone
 */
export function timezoneToLatLon(timezoneOffset) {
      // Offset is in minutes, convert to hours
      const hours = -timezoneOffset / 60;

      // Rough longitude calculation (15 degrees per hour zone)
      const lon = hours * 15;

      // Random latitude for visual distribution
      // Most users are in northern hemisphere
      const lat = 20 + Math.random() * 40;

      return { lat, lon };
}

/**
 * Parse timezone from IP or browser to location
 */
export function getUserLocation() {
      try {
            const timezoneOffset = new Date().getTimezoneOffset();
            return timezoneToLatLon(timezoneOffset);
      } catch {
            // Default to somewhere in Europe
            return { lat: 48.8566, lon: 2.3522 };
      }
}
