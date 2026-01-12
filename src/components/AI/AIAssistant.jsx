import React, { useState, useEffect, useRef } from 'react';
import { useWebLLM } from '../../hooks/useWebLLM';
import { useTranslation } from 'react-i18next';
import { Bot, Send, X, Loader2, Sparkles, Download, AlertTriangle } from 'lucide-react';

export default function AIAssistant({ contextText, isOpen, onClose }) {
    const { t } = useTranslation();
    const { status, progress, progressToDisplay, error, initEngine, generateResponse, messages, isModelLoaded } = useWebLLM();
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initial system prompt suggestion
    const handleGenerateSummary = () => {
        const prompt = `Please analyze the following text and provide 3 key bullet points summarizing the main ideas. Keep it concise.\n\nContext:\n${contextText?.substring(0, 2000)}...`;
        generateResponse(prompt, "You are a helpful assistant that summarizes podcast episodes.");
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const prompt = input;
        setInput('');

        // If context is provided, append it invisibly to the first message if needed
        // Or just rely on the conversation history if we want to be smarter
        generateResponse(prompt);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#111] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-[#333] flex flex-col max-h-[80vh] overflow-hidden">

                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-[#333] flex justify-between items-center bg-gray-50 dark:bg-[#050505]">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#007BFF]/10 p-2 rounded-lg">
                            <Bot className="w-5 h-5 text-[#007BFF]" />
                        </div>
                        <div>
                            <h3 className="font-creativo font-bold text-lg dark:text-white">The Talk AI</h3>
                            <p className="text-xs text-green-500 font-mono flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Runs Locally
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-[#0a0a0a]">

                    {/* State: Initial Consent */}
                    {!isModelLoaded && status === 'idle' && (
                        <div className="text-center py-8 px-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 inline-block">
                                <Download className="w-12 h-12 text-[#007BFF] mx-auto mb-2" />
                            </div>
                            <h4 className="text-xl font-bold mb-2 dark:text-white">Download AI Model</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                                To use AI features privately on your device, we need to download the model (~1.5GB) once.
                            </p>
                            <button
                                onClick={initEngine}
                                className="bg-[#007BFF] hover:bg-[#0069d9] text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 mx-auto"
                            >
                                <Download size={18} />
                                Download & Initialize
                            </button>
                            <p className="text-xs text-gray-400 mt-4">Requires a device with WebGPU support.</p>
                        </div>
                    )}

                    {/* State: Loading/Downloading */}
                    {status === 'loading' && (
                        <div className="text-center py-10">
                            <Loader2 className="w-10 h-10 text-[#007BFF] animate-spin mx-auto mb-4" />
                            <h4 className="font-bold mb-2 dark:text-white">Setting up AI...</h4>
                            <p className="text-xs text-gray-500 font-mono mb-4">{progressToDisplay}</p>
                            <div className="w-full bg-gray-200 dark:bg-[#333] rounded-full h-2.5 max-w-xs mx-auto overflow-hidden">
                                <div className="bg-[#007BFF] h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}

                    {/* State: Ready / Chat */}
                    {isModelLoaded && (
                        <div className="space-y-4">
                            {/* Empty State / Suggestions */}
                            {messages.length === 0 && (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 text-sm mb-4">Ready! Ask me anything about this episode.</p>
                                    <button
                                        onClick={handleGenerateSummary}
                                        className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        <Sparkles size={16} />
                                        Generate Key Takeaways
                                    </button>
                                </div>
                            )}

                            {/* Message List */}
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                                        max-w-[85%] rounded-2xl p-3 text-sm
                                        ${msg.role === 'user'
                                            ? 'bg-[#007BFF] text-white rounded-br-none'
                                            : 'bg-white dark:bg-[#222] text-black dark:text-gray-200 border border-gray-200 dark:border-[#333] rounded-bl-none shadow-sm'}
                                    `}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    )}

                    {/* Error State */}
                    {status === 'error' && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                            <AlertTriangle size={24} />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                {isModelLoaded && (
                    <div className="p-4 bg-white dark:bg-[#111] border-t border-gray-200 dark:border-[#333]">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask a question..."
                                disabled={status === 'generating'}
                                className="flex-1 bg-gray-100 dark:bg-[#222] border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007BFF] dark:text-white"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || status === 'generating'}
                                className="bg-[#007BFF] hover:bg-[#0069d9] disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
                            >
                                {status === 'generating' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
