import React, { useState, useEffect } from 'react';
import { Ticket, Loader2, Check, Calendar, Users } from 'lucide-react';
import { gsap } from 'gsap';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { client } from '../sanity';
import { useTranslation } from 'react-i18next';

export default function RSVPButton({ className = '' }) {
      const { t } = useTranslation();
      const { user } = useAuth();
      const [event, setEvent] = useState(null);
      const [loading, setLoading] = useState(true);
      const [reserving, setReserving] = useState(false);
      const [hasReserved, setHasReserved] = useState(false);
      const [participantCount, setParticipantCount] = useState(0);
      const [showTicket, setShowTicket] = useState(false);

      // Fetch upcoming live event
      useEffect(() => {
            const fetchEvent = async () => {
                  try {
                        const query = `*[_type == "liveEvent" && isActive == false && date > now()] | order(date asc)[0]{
                    _id,
                    title,
                    date
                }`;
                        const data = await client.fetch(query);
                        setEvent(data);

                        // Check participant count
                        if (data?._id && supabase) {
                              const { count } = await supabase
                                    .from('event_participants')
                                    .select('*', { count: 'exact', head: true })
                                    .eq('event_id', data._id);
                              setParticipantCount(count || 0);
                        }
                  } catch (error) {
                        console.error('Error fetching event:', error);
                  }
                  setLoading(false);
            };

            fetchEvent();
      }, []);

      // Check if user already reserved
      useEffect(() => {
            if (!user || !event?._id || !supabase) return;

            const checkReservation = async () => {
                  const { data } = await supabase
                        .from('event_participants')
                        .select('id')
                        .eq('event_id', event._id)
                        .eq('user_id', user.uid)
                        .single();

                  setHasReserved(!!data);
            };

            checkReservation();
      }, [user, event]);

      // Handle RSVP
      const handleReserve = async () => {
            if (!user) {
                  alert(t('auth.login_required', 'Please login to reserve your spot'));
                  return;
            }
            if (!event || !supabase) return;

            setReserving(true);

            try {
                  const { error } = await supabase.from('event_participants').insert({
                        event_id: event._id,
                        user_id: user.uid,
                        user_email: user.email,
                        user_name: user.displayName || user.email?.split('@')[0]
                  });

                  if (error) {
                        if (error.code === '23505') {
                              // Already registered
                              setHasReserved(true);
                        } else {
                              throw error;
                        }
                  } else {
                        setHasReserved(true);
                        setParticipantCount(prev => prev + 1);

                        // Show ticket animation
                        setShowTicket(true);
                        setTimeout(() => setShowTicket(false), 3000);
                  }
            } catch (error) {
                  console.error('RSVP error:', error);
                  alert('Error reserving spot. Please try again.');
            }

            setReserving(false);
      };

      // Ticket animation
      useEffect(() => {
            if (showTicket) {
                  gsap.fromTo(
                        '.rsvp-ticket',
                        { scale: 0, rotation: -10, opacity: 0 },
                        {
                              scale: 1,
                              rotation: 0,
                              opacity: 1,
                              duration: 0.6,
                              ease: 'back.out(1.7)'
                        }
                  );
            }
      }, [showTicket]);

      // Don't show if no upcoming event
      if (loading || !event) return null;

      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
      });

      return (
            <>
                  <div className={`${className}`}>
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gradient-to-r from-[#007BFF]/10 to-purple-500/10 border border-[#007BFF]/30 rounded-2xl backdrop-blur-sm">
                              {/* Event Info */}
                              <div className="flex-1 text-center sm:text-left">
                                    <div className="flex items-center justify-center sm:justify-start gap-2 text-[#007BFF] mb-1">
                                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                          <span className="text-xs font-bold uppercase tracking-wider">
                                                Upcoming Live
                                          </span>
                                    </div>
                                    <h4 className="font-bold text-black dark:text-white text-lg line-clamp-1">
                                          {event.title}
                                    </h4>
                                    <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                          <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {formattedDate}
                                          </span>
                                          <span className="flex items-center gap-1">
                                                <Users size={14} />
                                                {participantCount} going
                                          </span>
                                    </div>
                              </div>

                              {/* RSVP Button */}
                              <button
                                    onClick={handleReserve}
                                    disabled={reserving || hasReserved}
                                    className={`
                            flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105
                            ${hasReserved
                                                ? 'bg-green-500 text-white cursor-default'
                                                : 'bg-[#007BFF] hover:bg-[#0069d9] text-white'
                                          }
                            disabled:opacity-70 disabled:cursor-not-allowed
                        `}
                              >
                                    {reserving ? (
                                          <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Reserving...
                                          </>
                                    ) : hasReserved ? (
                                          <>
                                                <Check size={18} />
                                                Reserved!
                                          </>
                                    ) : (
                                          <>
                                                <Ticket size={18} />
                                                Reserve my Spot
                                          </>
                                    )}
                              </button>
                        </div>
                  </div>

                  {/* Ticket Success Animation */}
                  {showTicket && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                              <div className="rsvp-ticket bg-white dark:bg-[#111] rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl border border-[#007BFF]/30">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                                          <Ticket className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                                          🎉 You're In!
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                          Your spot for <strong>{event.title}</strong> is reserved.
                                    </p>
                                    <p className="text-sm text-[#007BFF]">
                                          {formattedDate}
                                    </p>
                                    <button
                                          onClick={() => setShowTicket(false)}
                                          className="mt-6 px-6 py-2 bg-[#007BFF] text-white rounded-full hover:bg-[#0069d9] transition-colors"
                                    >
                                          Awesome!
                                    </button>
                              </div>
                        </div>
                  )}
            </>
      );
}
