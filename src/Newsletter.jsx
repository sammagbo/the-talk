import React, { useState } from 'react';
import { Mail, ArrowRight, Check, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Newsletter = () => {
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
            // Send to Mailchimp via API route
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json();

            if (response.ok || data.success) {
                setStatus('success');
                setEmail('');
                // Reset after 5 seconds
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                throw new Error(data.error || 'Failed to subscribe');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            setStatus('error');
            setErrorMessage(t('subscribe.error', 'An error occurred. Please try again.'));
            // Reset error after 4 seconds
            setTimeout(() => {
                setStatus('idle');
                setErrorMessage('');
            }, 4000);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <form
                onSubmit={handleSubmit}
                className="relative flex items-center"
            >
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-[#6C757D]" />
                    </div>
                    <input
                        type="email"
                        name="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === 'loading'}
                        className="block w-full pl-11 pr-36 py-4 bg-[#111] border border-[#333] rounded text-white placeholder-[#6C757D] focus:outline-none focus:border-black focus:dark:border-white focus:ring-1 focus:ring-black focus:dark:ring-white transition-all font-minimal disabled:opacity-50"
                        placeholder={t('subscribe.placeholder', 'your@email.com')}
                    />
                    <button
                        type="submit"
                        disabled={status === 'loading' || status === 'success'}
                        className={`absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded transition-all transform hover:scale-105 font-bold flex items-center gap-2 disabled:cursor-not-allowed ${status === 'success'
                            ? 'bg-green-500 hover:bg-green-500'
                            : status === 'error'
                                ? 'bg-red-500 hover:bg-red-500'
                                : 'bg-black dark:bg-white hover:bg-gray-800 hover:dark:bg-gray-300'
                            } text-white`}
                    >
                        {status === 'loading' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : status === 'success' ? (
                            <Check className="w-5 h-5" />
                        ) : status === 'error' ? (
                            <AlertCircle className="w-5 h-5" />
                        ) : (
                            <>
                                {t('subscribe.button', "Subscribe")}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>
            {status === 'success' && (
                <p className="mt-3 text-green-500 text-sm font-minimal text-center animate-fade-in">
                    {t('subscribe.success', 'Thank you! You are subscribed.')}
                </p>
            )}
            {status === 'error' && errorMessage && (
                <p className="mt-3 text-red-500 text-sm font-minimal text-center animate-fade-in">
                    {errorMessage}
                </p>
            )}
        </div>
    );
};

export default Newsletter;
