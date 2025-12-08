import React, { useState, useEffect } from 'react';
import { X, Mail, Sparkles, Send } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

        // Mobile: Timer (30s)
        const timer = setTimeout(() => {
            if (!hasTriggered) {
                setIsVisible(true);
                setHasTriggered(true);
            }
        }, 30000);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            await addDoc(collection(db, 'leads'), {
                email: email,
                source: 'exit_intent',
                timestamp: serverTimestamp()
            });
            setStatus('success');
            localStorage.setItem('exit_popup_closed', 'true');
            setTimeout(() => {
                setIsVisible(false);
            }, 3000);
        } catch (error) {
            console.error("Error saving lead:", error);
            setStatus('error');
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#111] max-w-md w-full rounded-2xl border border-gray-200 dark:border-[#333] shadow-2xl overflow-hidden relative animate-scale-up">

                {/* Close Button */}
                <button
                    onClick={handleDismiss}
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
