import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Player from './components/Player';
import { Loader2 } from 'lucide-react';

// Error Boundary Component for catching lazy load errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#000', color: '#fff', minHeight: '100vh' }}>
          <h1 style={{ color: '#f00' }}>Something went wrong</h1>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', marginTop: '20px' }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Home = lazy(() => import('./pages/Home').catch(err => {
  console.error('Failed to load Home:', err);
  return { default: () => <div style={{ color: '#fff', padding: '40px' }}>Failed to load Home: {err.message}</div> };
}));
const EpisodePage = lazy(() => import('./pages/EpisodePage'));
const StorePage = lazy(() => import('./pages/StorePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
import { useAuth } from './context/AuthContext';
import { db } from './firebase';
import SponsorBanner from './components/SponsorBanner';
import ExitIntentPopup from './components/ExitIntentPopup';
import OfflineAlert from './components/OfflineAlert';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { client, urlFor } from './sanity';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { checkAchievements, initializeUserStats } from './utils/badges';
import { NewBadgeNotification } from './components/BadgesDisplay';

export default function App() {
  const [items, setItems] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [newBadge, setNewBadge] = useState(null);

  // Firestore Favorites Logic
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setFavorites(docSnap.data().favorites || []);
        } else {
          // Initialize user doc if it doesn't exist
          setDoc(userRef, { favorites: [] });
          setFavorites([]);
        }
      });
      return unsubscribe;
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFavorites([]);
    }
  }, [user]);

  const toggleFavorite = async (episodeId) => {
    if (!user) {
      alert("Please login to save favorites.");
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    try {
      if (favorites.includes(episodeId)) {
        await updateDoc(userRef, {
          favorites: arrayRemove(episodeId)
        });
        // Check achievements for unlike
        checkAchievements(user.uid, 'unlike');
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(episodeId)
        });
        // Check achievements for like
        const newBadges = await checkAchievements(user.uid, 'like');
        if (newBadges.length > 0) {
          // Show notification for first new badge
          const { getBadgeById } = await import('./utils/badges');
          const badge = getBadgeById(newBadges[0]);
          if (badge) setNewBadge(badge);
        }
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const handlePlay = async (episode) => {
    if (currentEpisode?.id === episode.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentEpisode(episode);
      setIsPlaying(true);

      // Check achievements for listening
      if (user) {
        const newBadges = await checkAchievements(user.uid, 'listen', {
          category: episode.category
        });
        if (newBadges.length > 0) {
          const { getBadgeById } = await import('./utils/badges');
          const badge = getBadgeById(newBadges[0]);
          if (badge) setNewBadge(badge);
        }
      }
    }
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setCurrentEpisode(null);
  };

  // Sanity Fetching
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const query = `*[_type == "episode"] | order(date desc) {
          _id,
          title,
          slug,
          description,
          date,
          duration,
          category->{title},
          mainImage,
          audioUrl,
          spotifyEmbedUrl
        }`;

        const data = await client.fetch(query);

        // Function to convert Spotify URL to embed format
        const convertToSpotifyEmbed = (url) => {
          if (!url) return null;

          // If already in embed format, return as is
          if (url.includes('/embed/')) {
            return url;
          }

          // Convert normal Spotify URLs to embed format
          // Supports multiple formats:
          // https://open.spotify.com/episode/xxx
          // https://open.spotify.com/intl-fr/track/xxx (with locale)
          // https://open.spotify.com/show/xxx?si=xxx (with query params)
          const spotifyRegex = /https:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(episode|show|track|playlist|album)\/([a-zA-Z0-9]+)/;
          const match = url.match(spotifyRegex);

          if (match) {
            return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
          }

          return null;
        };

        const mappedItems = data.map(item => ({
          id: item._id,
          category: item.category?.title || 'Épisodes',
          title: item.title,
          src: item.mainImage ? urlFor(item.mainImage).width(800).url() : 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=800&q=80',
          fullSrc: item.mainImage ? urlFor(item.mainImage).width(1600).url() : 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=1600&q=80',
          spotifyEmbedUrl: convertToSpotifyEmbed(item.spotifyEmbedUrl),
          audioUrl: item.audioUrl,
          description: item.description,
          date: item.date,
          duration: item.duration,
          slug: item.slug?.current
        }));

        setItems(mappedItems);
      } catch (error) {
        console.error("Error fetching from Sanity:", error);
      }
    };

    fetchEpisodes();
  }, []);

  return (
    <div className="relative min-h-screen bg-black">
      <OfflineAlert />
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-black">
            <Loader2 className="w-10 h-10 animate-spin text-[#007BFF]" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home items={items} onPlay={handlePlay} favorites={favorites} toggleFavorite={toggleFavorite} />} />
            <Route path="/episode/:id" element={<EpisodePage items={items} onPlay={handlePlay} onPause={() => setIsPlaying(false)} currentEpisode={currentEpisode} isPlaying={isPlaying} />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/profile/:uid" element={<ProfilePage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      <SponsorBanner />
      <ExitIntentPopup />

      <Player
        currentEpisode={currentEpisode}
        isPlaying={isPlaying}
        onClose={handleClosePlayer}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
      />

      {/* New Badge Notification */}
      {newBadge && (
        <NewBadgeNotification
          badge={newBadge}
          onClose={() => setNewBadge(null)}
        />
      )}
      <SpeedInsights />
    </div >
  );
}