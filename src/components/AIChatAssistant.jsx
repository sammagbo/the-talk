import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { MessageCircle, Send, X, Bot, User, Loader2 } from 'lucide-react';

/**
 * AIChatAssistant - AI-powered chat assistant for episode Q&A
 */
export default function AIChatAssistant({
    episodeContext = '',
    isOpen = false,
    onClose,
}) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: 'Bonjour! Je suis l\'assistant IA de THE TALK. Posez-moi des questions sur cet épisode ou sur le podcast en général. 🎙️',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, y: 20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
            );
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const responses = [
                'C\'est une excellente question! Dans cet épisode, Mijean discute de ce sujet en profondeur vers la 15ème minute.',
                'Je comprends votre curiosité. Le podcast explore souvent des thèmes liés à la mode et au lifestyle de manière unique.',
                'Bonne observation! Vous pouvez aussi consulter d\'autres épisodes sur des sujets similaires.',
                'Merci pour cette question! Le contenu de THE TALK est conçu pour inspirer et informer notre communauté.',
            ];

            const aiMessage = {
                id: Date.now(),
                role: 'assistant',
                content: responses[Math.floor(Math.random() * responses.length)],
            };

            setMessages((prev) => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={containerRef}
            className="fixed bottom-24 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-[#333] shadow-2xl z-[9998] overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#007BFF] to-[#A9A9F5]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-creativo font-bold text-white">Assistant IA</h3>
                        <p className="text-xs text-white/70">Powered by AI</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                    <X size={18} className="text-white" />
                </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                    ? 'bg-[#007BFF]'
                                    : 'bg-gray-200 dark:bg-[#333]'
                                }`}
                        >
                            {message.role === 'user' ? (
                                <User size={16} className="text-white" />
                            ) : (
                                <Bot size={16} className="text-[#007BFF]" />
                            )}
                        </div>
                        <div
                            className={`max-w-[75%] p-3 rounded-2xl ${message.role === 'user'
                                    ? 'bg-[#007BFF] text-white rounded-br-md'
                                    : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 rounded-bl-md'
                                }`}
                        >
                            <p className="text-sm font-minimal">{message.content}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#333] flex items-center justify-center">
                            <Bot size={16} className="text-[#007BFF]" />
                        </div>
                        <div className="bg-gray-100 dark:bg-[#1a1a1a] p-3 rounded-2xl rounded-bl-md">
                            <Loader2 size={16} className="animate-spin text-[#007BFF]" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-[#333]">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Posez votre question..."
                        className="flex-1 bg-gray-100 dark:bg-[#1a1a1a] border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="w-10 h-10 rounded-full bg-[#007BFF] hover:bg-[#0069d9] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        <Send size={16} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * AIChatButton - Floating button to open AI chat
 */
export function AIChatButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#007BFF] to-[#A9A9F5] shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-[9997]"
        >
            <MessageCircle size={24} className="text-white" />
        </button>
    );
}
