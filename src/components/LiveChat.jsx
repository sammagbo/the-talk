import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function LiveChat({ eventId }) {
      const { t } = useTranslation();
      const { user } = useAuth();
      const [messages, setMessages] = useState([]);
      const [newMessage, setNewMessage] = useState('');
      const [loading, setLoading] = useState(true);
      const [sending, setSending] = useState(false);
      const [onlineCount, setOnlineCount] = useState(0);
      const messagesEndRef = useRef(null);
      const chatContainerRef = useRef(null);

      // Auto-scroll to bottom
      const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      };

      useEffect(() => {
            scrollToBottom();
      }, [messages]);

      // Fetch initial messages and subscribe to realtime
      useEffect(() => {
            if (!eventId) return;

            const fetchMessages = async () => {
                  setLoading(true);
                  const { data, error } = await supabase
                        .from('live_messages')
                        .select('*')
                        .eq('event_id', eventId)
                        .order('created_at', { ascending: true })
                        .limit(100);

                  if (!error && data) {
                        setMessages(data);
                  }
                  setLoading(false);
            };

            fetchMessages();

            // Subscribe to new messages
            const channel = supabase
                  .channel(`live-chat-${eventId}`)
                  .on(
                        'postgres_changes',
                        {
                              event: 'INSERT',
                              schema: 'public',
                              table: 'live_messages',
                              filter: `event_id=eq.${eventId}`
                        },
                        (payload) => {
                              setMessages(prev => [...prev, payload.new]);
                        }
                  )
                  .subscribe();

            // Track presence for online count
            const presenceChannel = supabase.channel(`live-presence-${eventId}`, {
                  config: { presence: { key: user?.id || 'anonymous' } }
            });

            presenceChannel
                  .on('presence', { event: 'sync' }, () => {
                        const state = presenceChannel.presenceState();
                        setOnlineCount(Object.keys(state).length);
                  })
                  .subscribe(async (status) => {
                        if (status === 'SUBSCRIBED') {
                              await presenceChannel.track({
                                    user_id: user?.id || 'anonymous',
                                    online_at: new Date().toISOString()
                              });
                        }
                  });

            return () => {
                  supabase.removeChannel(channel);
                  supabase.removeChannel(presenceChannel);
            };
      }, [eventId, user?.id]);

      // Send message
      const handleSend = async (e) => {
            e.preventDefault();
            if (!newMessage.trim() || !user || sending) return;

            setSending(true);
            const { error } = await supabase.from('live_messages').insert({
                  event_id: eventId,
                  user_id: user.id,
                  user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anon',
                  user_avatar: user.user_metadata?.avatar_url || null,
                  content: newMessage.trim()
            });

            if (!error) {
                  setNewMessage('');
            }
            setSending(false);
      };

      const formatTime = (timestamp) => {
            return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };

      return (
            <div className="flex flex-col h-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#333]">
                        <div className="flex items-center gap-2">
                              <MessageCircle className="w-5 h-5 text-[#007BFF]" />
                              <span className="font-bold text-black dark:text-white">Live Chat</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <Users size={14} />
                              <span>{onlineCount}</span>
                        </div>
                  </div>

                  {/* Messages */}
                  <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
                  >
                        {loading ? (
                              <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 text-[#007BFF] animate-spin" />
                              </div>
                        ) : messages.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-sm">Be the first to chat!</p>
                              </div>
                        ) : (
                              messages.map((msg) => (
                                    <div key={msg.id} className="flex gap-3 animate-fade-in">
                                          {msg.user_avatar ? (
                                                <img
                                                      src={msg.user_avatar}
                                                      alt={msg.user_name}
                                                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                />
                                          ) : (
                                                <div className="w-8 h-8 rounded-full bg-[#007BFF]/20 flex items-center justify-center flex-shrink-0">
                                                      <span className="text-xs font-bold text-[#007BFF]">
                                                            {msg.user_name?.charAt(0).toUpperCase()}
                                                      </span>
                                                </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2">
                                                      <span className="font-bold text-sm text-black dark:text-white truncate">
                                                            {msg.user_name}
                                                      </span>
                                                      <span className="text-xs text-gray-400">
                                                            {formatTime(msg.created_at)}
                                                      </span>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                                                      {msg.content}
                                                </p>
                                          </div>
                                    </div>
                              ))
                        )}
                        <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#0a0a0a]">
                        {user ? (
                              <form onSubmit={handleSend} className="flex gap-2">
                                    <input
                                          type="text"
                                          value={newMessage}
                                          onChange={(e) => setNewMessage(e.target.value)}
                                          placeholder="Send a message..."
                                          maxLength={200}
                                          className="flex-1 px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-full text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#007BFF]"
                                    />
                                    <button
                                          type="submit"
                                          disabled={!newMessage.trim() || sending}
                                          className="p-2 bg-[#007BFF] text-white rounded-full hover:bg-[#0069d9] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                          {sending ? (
                                                <Loader2 size={18} className="animate-spin" />
                                          ) : (
                                                <Send size={18} />
                                          )}
                                    </button>
                              </form>
                        ) : (
                              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    {t('comments.login_prompt', 'Login to chat')}
                              </p>
                        )}
                  </div>
            </div>
      );
}
