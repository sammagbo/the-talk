import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Play, Calendar, Tag, Mic, ArrowRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { gsap } from 'gsap';
import { useTranslation } from 'react-i18next';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SearchOverlay({ isOpen, onClose }) {
      const { t } = useTranslation();
      const [query, setQuery] = useState('');
      const [results, setResults] = useState([]);
      const [isLoading, setIsLoading] = useState(false);
      const [semanticMode, setSemanticMode] = useState(true);
      const inputRef = useRef(null);
      const overlayRef = useRef(null);
      const resultsRef = useRef(null);

      // Focus input when opened
      useEffect(() => {
            if (isOpen) {
                  setTimeout(() => inputRef.current?.focus(), 100);
                  gsap.fromTo(overlayRef.current,
                        { opacity: 0, scale: 0.98 },
                        { opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' }
                  );
            }
      }, [isOpen]);

      // Handle search
      useEffect(() => {
            const searchTimer = setTimeout(async () => {
                  if (!query.trim()) {
                        setResults([]);
                        return;
                  }

                  setIsLoading(true);

                  try {
                        if (semanticMode) {
                              // Call Edge Function for semantic search
                              let searchResults = [];

                              try {
                                    const { data, error } = await supabase.functions.invoke('search-vector', {
                                          body: { query, threshold: 0.4, count: 6 }
                                    });

                                    if (error) throw error;
                                    searchResults = data.results || [];
                              } catch (edgeError) {
                                    console.warn('Edge Function unavailable, using client-side fallback:', edgeError);

                                    // Fallback: Generate embedding + call RPC directly
                                    try {
                                          const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
                                          if (!GEMINI_API_KEY) throw new Error('Missing Gemini API Key');

                                          // 1. Generate embedding for query
                                          const embeddingResponse = await fetch(
                                                `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
                                                {
                                                      method: 'POST',
                                                      headers: { 'Content-Type': 'application/json' },
                                                      body: JSON.stringify({
                                                            model: 'models/gemini-embedding-001',
                                                            content: { parts: [{ text: query }] }
                                                      })
                                                }
                                          );

                                          if (!embeddingResponse.ok) {
                                                const errText = await embeddingResponse.text();
                                                throw new Error(`Gemini Embedding Error: ${errText}`);
                                          }

                                          const embeddingData = await embeddingResponse.json();
                                          const embedding = embeddingData.embedding.values;

                                          // 2. Call RPC match_documents
                                          const { data: rpcData, error: rpcError } = await supabase.rpc('match_documents', {
                                                query_embedding: embedding,
                                                match_threshold: 0.4,
                                                match_count: 6
                                          });

                                          if (rpcError) throw rpcError;
                                          searchResults = rpcData || [];

                                    } catch (fallbackError) {
                                          console.error('Available fallback also failed:', fallbackError);
                                          // Keep empty results or handle UI error state
                                    }
                              }

                              setResults(searchResults);
                        } else {
                              // Fallback to basic text search (if needed later)
                              // For now, we rely on semantic search as primary
                        }
                  } catch (err) {
                        console.error('Search error:', err);
                  } finally {
                        setIsLoading(false);
                  }
            }, 500); // 500ms debounce

            return () => clearTimeout(searchTimer);
      }, [query, semanticMode]);

      // Animate results
      useEffect(() => {
            if (results.length > 0) {
                  gsap.fromTo(resultsRef.current.children,
                        { opacity: 0, y: 10 },
                        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
                  );
            }
      }, [results]);

      if (!isOpen) return null;

      return (
            <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-black/95 backdrop-blur-xl flex flex-col">
                  {/* Header */}
                  <div className="container mx-auto px-4 py-6 flex items-center gap-4">
                        <Search className="w-6 h-6 text-gray-400" />
                        <input
                              ref={inputRef}
                              type="text"
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              placeholder={t('search.placeholder', 'Search episodes, topics, ideas...')}
                              className="flex-1 bg-transparent border-none outline-none text-2xl md:text-3xl font-creativo text-black dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
                        />
                        <button
                              onClick={onClose}
                              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                              <X className="w-6 h-6 text-gray-500" />
                        </button>
                  </div>

                  {/* AI Toggle */}
                  <div className="container mx-auto px-4 pb-6 border-b border-gray-100 dark:border-white/10">
                        <div className="flex items-center gap-3">
                              <span className="text-sm font-mono text-gray-500 uppercase tracking-wider">Search Mode:</span>
                              <button
                                    onClick={() => setSemanticMode(!semanticMode)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${semanticMode
                                          ? 'bg-[#007BFF]/10 text-[#007BFF] border-[#007BFF]/20'
                                          : 'bg-gray-100 text-gray-500 border-transparent dark:bg-white/5'
                                          }`}
                              >
                                    <Tag className="w-3 h-3" />
                                    {semanticMode ? 'AI Semantic' : 'Keyword'}
                              </button>
                        </div>
                  </div>

                  {/* Results */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar" ref={overlayRef}>
                        <div className="container mx-auto px-4 py-8">
                              {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                          <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                          <p className="font-mono text-sm">Searching knowledge base...</p>
                                    </div>
                              ) : results.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={resultsRef}>
                                          {results.map((result) => (
                                                <div
                                                      key={result.id}
                                                      className="group relative bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-5 hover:border-[#007BFF]/30 transition-all hover:shadow-lg cursor-pointer"
                                                      onClick={() => {
                                                            if (result.content_type === 'episode') {
                                                                  // Find episode in Home items (passed via context or prop if needed)
                                                                  // For now, simpler navigation or just triggering onPlay if we had the full object
                                                                  // Ideally we'd navigate to /episode/:slug
                                                                  window.location.href = `/episode/${result.metadata.slug}`;
                                                            } else {
                                                                  window.location.href = `/blog/${result.metadata.slug}`;
                                                            }
                                                            onClose();
                                                      }}
                                                >
                                                      <div className="flex items-start justify-between mb-3">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${result.content_type === 'episode'
                                                                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300'
                                                                  : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300'
                                                                  }`}>
                                                                  {result.content_type}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-gray-400">
                                                                  {Math.round(result.similarity * 100)}% match
                                                            </span>
                                                      </div>

                                                      <h3 className="text-xl font-creativo font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#007BFF] transition-colors line-clamp-2">
                                                            {result.title}
                                                      </h3>

                                                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 font-minimal">
                                                            {result.content}
                                                      </p>

                                                      <div className="flex items-center text-[#007BFF] text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                                                            View Content <ArrowRight className="w-3 h-3 ml-1" />
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              ) : query.trim() ? (
                                    <div className="text-center py-20">
                                          <p className="text-xl font-creativo text-gray-400 mb-2">No results found</p>
                                          <p className="text-gray-500">Try searching for a topic, concept, or idea.</p>
                                    </div>
                              ) : (
                                    <div className="text-center py-20 opacity-50">
                                          <Mic className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                                          <p className="font-creativo text-xl">Type to search using AI</p>
                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      );
}
