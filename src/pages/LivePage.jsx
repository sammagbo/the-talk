import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';

import { client, urlFor } from '../sanity';
import { Radio, Calendar, Users, Play, Bell } from 'lucide-react';
import { gsap } from 'gsap';
import LiveChat from '../components/LiveChat';


export default function LivePage() {

      const [event, setEvent] = useState(null);
      const [loading, setLoading] = useState(true);
      const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      const countdownRef = useRef(null);
      const heroRef = useRef(null);

      // Fetch live event from Sanity
      useEffect(() => {
            const fetchEvent = async () => {
                  try {
                        // Get the most recent live event (active first, then upcoming)
                        const query = `*[_type == "liveEvent"] | order(isActive desc, date asc)[0]{
                    _id,
                    title,
                    description,
                    date,
                    youtubeId,
                    isActive,
                    "thumbnailUrl": thumbnail.asset->url
                }`;
                        const data = await client.fetch(query);
                        setEvent(data);
                  } catch (error) {
                        console.error('Error fetching live event:', error);
                  }
                  setLoading(false);
            };

            fetchEvent();

            // Poll for updates every 30 seconds
            const interval = setInterval(fetchEvent, 30000);
            return () => clearInterval(interval);
      }, []);

      // Countdown timer
      useEffect(() => {
            if (!event?.date || event.isActive) return;

            const targetDate = new Date(event.date).getTime();

            const updateCountdown = () => {
                  const now = Date.now();
                  const diff = targetDate - now;

                  if (diff <= 0) {
                        // Event should be starting, refresh to check isActive
                        window.location.reload();
                        return;
                  }

                  setCountdown({
                        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                        seconds: Math.floor((diff % (1000 * 60)) / 1000)
                  });
            };

            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);
            return () => clearInterval(interval);
      }, [event]);

      // GSAP animations for countdown
      useEffect(() => {
            if (countdownRef.current && !event?.isActive) {
                  gsap.fromTo(
                        countdownRef.current.children,
                        { opacity: 0, y: 50, scale: 0.8 },
                        {
                              opacity: 1,
                              y: 0,
                              scale: 1,
                              duration: 0.8,
                              stagger: 0.1,
                              ease: 'back.out(1.7)'
                        }
                  );
            }
      }, [loading, event?.isActive]);

      // Hero entrance animation
      useEffect(() => {
            if (heroRef.current && !loading) {
                  gsap.fromTo(
                        heroRef.current,
                        { opacity: 0 },
                        { opacity: 1, duration: 1, ease: 'power2.out' }
                  );
            }
      }, [loading]);

      if (loading) {
            return (
                  <div className="min-h-screen bg-black flex items-center justify-center">
                        <div className="flex items-center gap-3">
                              <Radio className="w-8 h-8 text-red-500 animate-pulse" />
                              <span className="text-white text-xl font-bold">Loading...</span>
                        </div>
                  </div>
            );
      }

      if (!event) {
            return (
                  <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                        <Radio className="w-16 h-16 text-gray-600 mb-4" />
                        <h1 className="text-2xl font-bold mb-2">No Live Event Scheduled</h1>
                        <p className="text-gray-400">Check back later for upcoming events!</p>
                  </div>
            );
      }

      // Active Live Event - Show Video + Chat
      if (event.isActive) {
            return (
                  <>
                        <Helmet>
                              <title>{event.title} | THE TALK LIVE</title>
                              <meta name="description" content={event.description} />
                        </Helmet>

                        <div className="min-h-screen bg-black pt-20">
                              {/* Live Badge */}
                              <div className="flex items-center justify-center gap-2 mb-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-full">
                                          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                          <span className="text-white font-bold text-sm uppercase tracking-wider">LIVE NOW</span>
                                    </div>
                              </div>

                              {/* Title */}
                              <h1 className="text-3xl md:text-5xl font-bold text-center text-white mb-6 px-4">
                                    {event.title}
                              </h1>

                              {/* Main Layout: Video + Chat */}
                              <div className="max-w-7xl mx-auto px-4 pb-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                          {/* Video */}
                                          <div className="lg:col-span-2">
                                                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-red-500/20">
                                                      <iframe
                                                            src={`https://www.youtube.com/embed/${event.youtubeId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                                                            title={event.title}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                            className="w-full h-full"
                                                      />
                                                </div>
                                                {event.description && (
                                                      <p className="mt-4 text-gray-400 text-center">
                                                            {event.description}
                                                      </p>
                                                )}
                                          </div>

                                          {/* Chat */}
                                          <div className="lg:col-span-1 h-[500px] lg:h-auto">
                                                <LiveChat eventId={event._id} />
                                          </div>
                                    </div>
                              </div>
                        </div>
                  </>
            );
      }

      // Upcoming Event - Show Countdown
      return (
            <>
                  <Helmet>
                        <title>{event.title} | Coming Soon - THE TALK</title>
                        <meta name="description" content={event.description} />
                  </Helmet>

                  <div
                        ref={heroRef}
                        className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden"
                        style={{
                              backgroundImage: event.thumbnailUrl ? `url(${urlFor(event.thumbnailUrl).width(1920).url()})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                        }}
                  >
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

                        {/* Content */}
                        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                              {/* Event Badge */}
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#007BFF]/20 border border-[#007BFF]/50 rounded-full mb-6">
                                    <Calendar className="w-4 h-4 text-[#007BFF]" />
                                    <span className="text-[#007BFF] text-sm font-medium">
                                          {new Date(event.date).toLocaleDateString(undefined, {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                          })}
                                    </span>
                              </div>

                              {/* Title */}
                              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                                    {event.title}
                              </h1>

                              {event.description && (
                                    <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                                          {event.description}
                                    </p>
                              )}

                              {/* Countdown */}
                              <div ref={countdownRef} className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
                                    {[
                                          { value: countdown.days, label: 'Days' },
                                          { value: countdown.hours, label: 'Hours' },
                                          { value: countdown.minutes, label: 'Minutes' },
                                          { value: countdown.seconds, label: 'Seconds' }
                                    ].map(({ value, label }) => (
                                          <div
                                                key={label}
                                                className="flex flex-col items-center"
                                          >
                                                <div className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-2">
                                                      <span className="text-3xl md:text-5xl font-bold text-white font-mono">
                                                            {String(value).padStart(2, '0')}
                                                      </span>
                                                </div>
                                                <span className="text-gray-400 text-sm uppercase tracking-wider">
                                                      {label}
                                                </span>
                                          </div>
                                    ))}
                              </div>

                              {/* Notify Button */}
                              <button className="inline-flex items-center gap-3 px-8 py-4 bg-[#007BFF] hover:bg-[#0069d9] text-white font-bold rounded-full transition-all transform hover:scale-105 group">
                                    <Bell className="w-5 h-5 group-hover:animate-bounce" />
                                    <span>Notify Me When Live</span>
                              </button>
                        </div>

                        {/* Animated Circles Background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#007BFF]/10 rounded-full blur-3xl animate-pulse"></div>
                              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </div>
                  </div>
            </>
      );
}
