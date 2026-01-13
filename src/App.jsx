import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Player from './components/Player';
import { Loader2, AlertTriangle, RefreshCw, Home as HomeIcon } from 'lucide-react';
import CustomCursor from './components/CustomCursor';
import LoadingScreen from './components/LoadingScreen';

// Error Boundary Component with elegant fallback UI
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-creativo font-bold text-white mb-3">
              Oups ! Une erreur s'est produite
            </h1>

            {/* Error Message */}
            <p className="text-gray-400 font-minimal mb-2">
              Nous sommes désolés, quelque chose s'est mal passé.
            </p>
            <p className="text-red-400/70 text-sm font-mono mb-8 bg-red-500/10 rounded-lg p-3">
              {this.state.error?.message || 'Erreur inconnue'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 bg-[#007BFF] hover:bg-[#0069d9] text-white px-6 py-3 rounded-full font-bold transition-all"
              >
                <RefreshCw size={18} />
                Réessayer
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold transition-all"
              >
                <HomeIcon size={18} />
                Retour à l'accueil
              </a>
            </div>
          </div>
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
import { checkAchievements, initializeUserStats, getBadgeById } from './utils/badges';
import { NewBadgeNotification } from './components/BadgesDisplay';


export default function App() {
  const [items, setItems] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [newBadge, setNewBadge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
          spotifyEmbedUrl,
          videoUrl
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
          videoUrl: item.videoUrl,
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
      {/* Loading Screen */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Custom Cursor - Desktop only */}
      <CustomCursor />

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-[#007BFF] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:outline-none focus:ring-2 focus:ring-white"
      >
        Passer au contenu principal
      </a>
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