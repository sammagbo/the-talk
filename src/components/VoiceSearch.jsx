import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Mic, MicOff, Search, X, Loader2 } from 'lucide-react';

/**
 * VoiceSearch - Voice-based search component
 */
export default function VoiceSearch({ onSearch, onClose, isOpen }) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'fr-FR';

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const result = event.results[current][0].transcript;
                setTranscript(result);

                if (event.results[current].isFinal) {
                    setIsListening(false);
                    if (onSearch) {
                        onSearch(result);
                    }
                }
            };

            recognitionRef.current.onerror = (event) => {
                setError('Erreur de reconnaissance vocale');
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        } else {
            setError('La recherche vocale n\'est pas supportée par votre navigateur');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onSearch]);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.5)' }
            );
        }
    }, [isOpen]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setError(null);
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div ref={containerRef} className="text-center max-w-md w-full mx-4">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X size={24} className="text-white" />
                </button>

                {/* Microphone button */}
                <button
                    onClick={isListening ? stopListening : startListening}
                    className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 mx-auto transition-all ${isListening
                            ? 'bg-red-500 animate-pulse'
                            : 'bg-[#007BFF] hover:bg-[#0069d9]'
                        }`}
                >
                    {isListening ? (
                        <MicOff size={40} className="text-white" />
                    ) : (
                        <Mic size={40} className="text-white" />
                    )}
                </button>

                {/* Instructions */}
                <p className="text-white/70 text-lg font-minimal mb-4">
                    {isListening
                        ? 'Je vous écoute...'
                        : 'Appuyez sur le micro pour parler'}
                </p>

                {/* Transcript */}
                {transcript && (
                    <div className="bg-white/10 rounded-xl p-4 mb-4">
                        <p className="text-white text-lg font-minimal">"{transcript}"</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <p className="text-red-400 text-sm font-minimal">{error}</p>
                )}

                {/* Listening indicator */}
                {isListening && (
                    <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-[#007BFF] rounded-full animate-sound-wave"
                                style={{
                                    height: `${20 + Math.random() * 20}px`,
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
