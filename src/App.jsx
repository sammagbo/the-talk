import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Player from './components/Player';
import { Loader2, AlertTriangle, RefreshCw, Home as HomeIcon } from 'lucide-react';
import CustomCursor from './components/CustomCursor';
import LoadingScreen from './components/LoadingScreen';
import TransitionOverlay from './components/TransitionOverlay';
import ScrollProgress from './components/ScrollProgress';
import CursorTrail from './components/CursorTrail';

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
            <div className="w-20 h-20 mx-auto mb-6 rounded-none bg-red-500/10 flex items-center justify-center">
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
            <p className="text-red-400/70 text-sm font-minimal mb-8 bg-red-500/10 rounded-none p-3">
              {this.state.error?.message || 'Erreur inconnue'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white hover:bg-gray-800 hover:dark:bg-gray-300 text-white dark:text-black px-6 py-3 rounded-none font-bold transition-all"
              >
                <RefreshCw size={18} />
                Réessayer
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-none font-bold transition-all"
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
const EpisodeRedirect = lazy(() => import('./pages/EpisodeRedirect'));
const EpisodesPage = lazy(() => import('./pages/EpisodesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const StorePage = lazy(() => import('./pages/StorePage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ShortsPage = lazy(() => import('./pages/ShortsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
import SponsorBanner from './components/SponsorBanner';
import OfflineAlert from './components/OfflineAlert';
import { client, urlFor } from './sanity';
import { convertToSpotifyEmbed } from './utils/spotify';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { STORE_ENABLED } from './config/features';


export default function App() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handlePlay = (episode) => {
    if (currentEpisode?.id === episode.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentEpisode(episode);
      setIsPlaying(true);
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

      {/* Page Transition Overlay */}
      <TransitionOverlay />

      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Cursor Trail Effect - Desktop only */}
      <CursorTrail color="#6C757D" particleCount={15} />

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-black focus:dark:bg-white focus:text-white focus:px-4 focus:py-2 focus:rounded-none focus:font-bold focus:outline-none focus:ring-2 focus:ring-white"
      >
        Passer au contenu principal
      </a>
      <OfflineAlert />
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-black">
            <Loader2 className="w-10 h-10 animate-spin text-black dark:text-white" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home items={items} />} />
            <Route path="/episodes/:slug" element={<EpisodePage items={items} onPlay={handlePlay} onPause={() => setIsPlaying(false)} currentEpisode={currentEpisode} isPlaying={isPlaying} />} />
            {/* Backward compatibility: legacy /episode/:id redirects to the canonical slug URL */}
            <Route path="/episode/:id" element={<EpisodeRedirect />} />
            {STORE_ENABLED && <Route path="/store" element={<StorePage />} />}
            <Route path="/episodes" element={<EpisodesPage items={items} onPlay={handlePlay} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/shorts" element={<ShortsPage onPause={() => setIsPlaying(false)} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      <SponsorBanner />

      {location.pathname !== '/shorts' && (
        <Player
          currentEpisode={currentEpisode}
          isPlaying={isPlaying}
          onClose={handleClosePlayer}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
        />
      )}
      <SpeedInsights />
    </div >
  );
}
