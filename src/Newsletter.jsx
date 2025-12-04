import React, { useState } from 'react';
import { Mail, ArrowRight, Check } from 'lucide-react';

const Newsletter = ({
    action = "#",
    placeholder = "Votre email...",
    buttonText = "S'abonner"
}) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(''); // 'loading', 'success', 'error'

    const handleSubmit = (e) => {
        if (action === "#") {
            e.preventDefault();
            // Simulate submission for demo
            setStatus('loading');
            setTimeout(() => {
                setStatus('success');
                setEmail('');
            }, 1500);
        }
        // If action is provided, let the form submit naturally
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <form
                action={action}
                method="POST"
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
                        className="block w-full pl-11 pr-32 py-4 bg-[#111] border border-[#333] rounded-full text-white placeholder-[#6C757D] focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF] transition-all font-minimal"
                        placeholder={placeholder}
                    />
                    <button
                        type="submit"
                        disabled={status === 'loading' || status === 'success'}
                        className={`absolute right-1.5 top-1.5 bottom-1.5 bg-[#007BFF] hover:bg-[#0069d9] text-white px-6 rounded-full transition-all transform hover:scale-105 font-bold shadow-[0_0_15px_rgba(0,123,255,0.3)] flex items-center gap-2 ${status === 'success' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    >
                        {status === 'loading' ? (
                            <span className="animate-pulse">...</span>
                        ) : status === 'success' ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <>
                                {buttonText}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>
            {status === 'success' && (
                <p className="mt-3 text-green-500 text-sm font-minimal text-center animate-fade-in">
                    Merci ! Vous êtes inscrit à la newsletter.
                </p>
            )}
        </div>
    );
};

export default Newsletter;
