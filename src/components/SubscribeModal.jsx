import React, { useState } from 'react';
import { X, Mail, Check, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { useTranslation } from 'react-i18next';

export default function SubscribeModal({ isOpen, onClose }) {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            // Add email to Supabase 'newsletter_subscribers' table
            if (supabase) {
                await supabase
                    .from('newsletter_subscribers')
                    .insert({
                        email: email.trim(),
                        source: 'navbar_modal'
                    });
            }

            // Also send to Mailchimp via API route
            try {
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim() }),
                });
                const data = await response.json();
                if (!response.ok && !data.success) {
                    console.warn('Mailchimp subscription warning:', data.error);
                }
            } catch (mailchimpError) {
                console.warn('Mailchimp API error:', mailchimpError);
                // Don't fail if Mailchimp fails - Supabase already saved
            }

            setStatus('success');
            setEmail('');

            // Close modal after 2 seconds
            setTimeout(() => {
                onClose();
                setStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Subscription error:', error);
            setStatus('error');
            setErrorMessage(t('subscribe.error', 'Une erreur est survenue. Réessayez.'));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-[#333] p-8 max-w-md w-full shadow-2xl animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    aria-label="Fermer"
                    className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Content */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#007BFF]/10 rounded-full mb-4">
                        <Mail className="w-8 h-8 text-[#007BFF]" />
                    </div>
                    <h2 className="text-2xl font-creativo font-bold text-black dark:text-white mb-2">
                        {t('subscribe.title', 'Restez Inspiré')}
                    </h2>
                    <p className="text-gray-600 dark:text-[#6C757D] font-minimal text-sm">
                        {t('subscribe.description', 'Recevez les derniers épisodes et insights directement dans votre boîte mail.')}
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                            <Check className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="text-green-500 font-creativo font-bold text-lg">
                            {t('subscribe.success', 'Merci ! Vous êtes inscrit.')}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder={t('subscribe.placeholder', 'votre@email.com')}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#020202] border border-gray-200 dark:border-[#333] rounded-xl text-black dark:text-white focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] transition-all font-minimal placeholder:text-gray-400"
                            />
                        </div>

                        {status === 'error' && (
                            <p className="text-red-500 text-sm text-center font-minimal">
                                {errorMessage}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-gradient-to-r from-[#007BFF] to-[#0056b3] text-white font-creativo font-bold py-4 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,123,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    {t('subscribe.loading', 'Inscription...')}
                                </>
                            ) : (
                                t('subscribe.button', "S'abonner")
                            )}
                        </button>
                    </form>
                )}

                <p className="text-center text-gray-400 text-xs mt-4 font-minimal">
                    {t('subscribe.privacy', 'Nous respectons votre vie privée. Désinscription à tout moment.')}
                </p>
            </div>
        </div>
    );
}
