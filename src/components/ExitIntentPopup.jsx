import React, { useState, useEffect } from 'react';
import { X, Mail, Sparkles, Send } from 'lucide-react';
import { supabase } from '../supabase';

export default function ExitIntentPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        // Check if already dismissed or subscribed
        const isClosed = localStorage.getItem('exit_popup_closed');
        if (isClosed) return;

        // Desktop: Exit Intent
        const handleMouseLeave = (e) => {
            if (e.clientY <= 0 && !hasTriggered) {
                setIsVisible(true);
                setHasTriggered(true);
            }
        };

        // Mobile: Timer (60s)
        const timer = setTimeout(() => {
            if (!hasTriggered) {
                // Remove auto-trigger for better UX, or make it very long
                // setIsVisible(true);
                // setHasTriggered(true);
            }
        }, 60000);

        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            clearTimeout(timer);
        };
    }, [hasTriggered]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('exit_popup_closed', 'true');
    };

    // Close on click outside
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleDismiss();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        try {
            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 10000)
            );

            const promises = [];

            // Save to Supabase if available
            if (supabase) {
                const savePromise = supabase
                    .from('newsletter_subscribers')
                    .insert({
                        email: email.trim(),
                        source: 'exit_intent',
                    });
                promises.push(savePromise);
            }

            // Also send to Mailchimp via API
            const mailchimpPromise = fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim() }),
            }).then(res => {
                if (!res.ok) {
                    console.warn('Mailchimp subscription failed, but continuing...');
                }
                return res;
            }).catch(err => {
                console.warn('Mailchimp API error:', err);
                // Don't fail the whole operation if Mailchimp fails
                return null;
            });
            promises.push(mailchimpPromise);

            // Wait for all promises with timeout
            await Promise.race([
                Promise.all(promises),
                timeoutPromise
            ]);

            setStatus('success');
            localStorage.setItem('exit_popup_closed', 'true');
            setTimeout(() => {
                setIsVisible(false);
            }, 3000);
        } catch (error) {
            console.error("Error saving lead:", error);
            // Even on error, close the popup after showing error briefly
            setStatus('error');
            setTimeout(() => {
                setIsVisible(false);
                localStorage.setItem('exit_popup_closed', 'true');
            }, 3000);
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={handleOverlayClick}
        >
            <div className="bg-white dark:bg-[#111] max-w-md w-full rounded-2xl border border-gray-200 dark:border-[#333] shadow-2xl overflow-hidden relative animate-scale-up">

                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    aria-label="Fermer"
                    className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#007BFF] to-[#A9A9F5] opacity-10"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#007BFF]/20 rounded-full blur-3xl"></div>

                <div className="p-8 pt-10 relative">
                    {status === 'success' ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles size={32} />
                            </div>
                            <h3 className="text-2xl font-creativo font-bold text-black dark:text-white mb-2">Bienvenue !</h3>
                            <p className="text-gray-600 dark:text-[#6C757D] font-minimal">
                                Vous faites maintenant partie du cercle privé. Vérifiez votre boîte mail.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 bg-[#007BFF]/10 text-[#007BFF] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                                    <Sparkles size={12} />
                                    Exclusive Content
                                </div>
                                <h2 className="text-3xl font-creativo font-bold text-black dark:text-white mb-3">
                                    Ne partez pas les mains vides !
                                </h2>
                                <p className="text-gray-600 dark:text-[#6C757D] text-sm font-minimal leading-relaxed">
                                    Rejoignez 10,000+ créatifs. Recevez notre guide exclusif <strong>"Le Futur de l'Art Digital"</strong> directement dans votre boîte mail.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={status === 'loading'}
                                        className="w-full bg-gray-50 dark:bg-[#020202] border border-gray-200 dark:border-[#333] rounded-xl pl-12 pr-4 py-3 text-black dark:text-white focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] transition-all font-minimal"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-[#007BFF] hover:bg-[#0069d9] text-white font-creativo font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#007BFF]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? (
                                        'Traitement...'
                                    ) : (
                                        <>Envoyer moi le guide <Send size={16} /></>
                                    )}
                                </button>
                            </form>

                            <p className="text-center text-xs text-gray-400 mt-4">
                                Pas de spam. Désinscription en un clic.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
