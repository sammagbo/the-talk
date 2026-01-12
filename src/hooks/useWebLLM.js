import { useState, useCallback, useRef, useEffect } from 'react';
import { CreateMLCEngine } from "@mlc-ai/web-llm";

// Using a lightweight but capable model
const SELECTED_MODEL = "Phi-3-mini-4k-instruct-q4f16_1-MLC";

export function useWebLLM() {
    const [status, setStatus] = useState('idle'); // idle, loading, ready, generating, error
    const [progress, setProgress] = useState(0);
    const [progressToDisplay, setProgressToDisplay] = useState('');
    const [error, setError] = useState(null);
    const engineRef = useRef(null);
    const [messages, setMessages] = useState([]);

    // Initialize the engine
    const initEngine = useCallback(async () => {
        if (engineRef.current) return;

        try {
            setStatus('loading');
            setError(null);

            const initProgressCallback = (report) => {
                // Update progress based on the report
                // calculate percentage if possible or just show text
                setProgressToDisplay(report.text);

                // Estimate progress percentage from text if numeric isn't available
                // WebLLM reports often have "Fetching" or "Loading" with sizes
                if (report.progress) {
                    setProgress(Math.round(report.progress * 100));
                }
            };

            const engine = await CreateMLCEngine(
                SELECTED_MODEL,
                { initProgressCallback: initProgressCallback }
            );

            engineRef.current = engine;
            setStatus('ready');
            setProgress(100);
        } catch (err) {
            console.error("WebLLM Init Error:", err);
            setError(err.message || "Failed to load AI model");
            setStatus('error');
        }
    }, []);

    // Generate response
    const generateResponse = useCallback(async (prompt, systemPrompt = "You are a helpful AI assistant.") => {
        if (!engineRef.current) {
            setError("Engine not initialized");
            return;
        }

        try {
            setStatus('generating');

            const newMessages = [
                { role: "system", content: systemPrompt },
                ...messages,
                { role: "user", content: prompt }
            ];

            // Update UI with user message immediately
            setMessages(prev => [...prev, { role: "user", content: prompt }]);

            const chunks = await engineRef.current.chat.completions.create({
                messages: newMessages,
                temperature: 0.7,
                stream: true,
            });

            let fullResponse = "";
            let messageAdded = false;

            for await (const chunk of chunks) {
                const content = chunk.choices[0]?.delta?.content || "";
                fullResponse += content;

                // Update specific message in state (streaming effect)
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg.role === "assistant" && messageAdded) {
                        // Update existing assistant message
                        const newPrev = [...prev];
                        newPrev[newPrev.length - 1] = { role: "assistant", content: fullResponse };
                        return newPrev;
                    } else if (!messageAdded) {
                        // Add new assistant message
                        messageAdded = true;
                        return [...prev, { role: "assistant", content: fullResponse }];
                    }
                    return prev;
                });
            }

            setStatus('ready');
            return fullResponse;

        } catch (err) {
            console.error("Generation Error:", err);
            setError(err.message || "Failed to generate response");
            setStatus('error');
        }
    }, [messages]);

    // Simple one-off generation (good for summaries)
    const generateSimple = useCallback(async (prompt) => {
        if (!engineRef.current) return null;

        try {
            setStatus('generating');
            const reply = await engineRef.current.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            });
            setStatus('ready');
            return reply.choices[0].message.content;
        } catch (err) {
            setError(err.message);
            setStatus('error');
            return null;
        }
    }, []);

    return {
        status,
        progress,
        progressToDisplay,
        error,
        initEngine,
        generateResponse,
        generateSimple,
        messages,
        setMessages,
        isModelLoaded: !!engineRef.current
    };
}
