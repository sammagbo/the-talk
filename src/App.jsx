import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Player from './components/Player';
import { Loader2 } from 'lucide-react';

const Home = lazy(() => import('./pages/Home'));
const EpisodePage = lazy(() => import('./pages/EpisodePage'));
const StorePage = lazy(() => import('./pages/StorePage'));
import { useAuth } from './context/AuthContext';
import { db } from './firebase';
import SponsorBanner from './components/SponsorBanner';
import ExitIntentPopup from './components/ExitIntentPopup';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { client, urlFor } from './sanity';

// Données du podcast (Initial State)


export default function App() {
  const [items, setItems] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

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
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(episodeId)
        });
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

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
          audioUrl
        }`;

        const data = await client.fetch(query);

        const mappedItems = data.map(item => ({
          id: item._id,
          category: item.category?.title || 'Épisodes',
          title: item.title,
          src: item.mainImage ? urlFor(item.mainImage).width(800).url() : 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=800&q=80',
          fullSrc: item.mainImage ? urlFor(item.mainImage).width(1600).url() : 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=1600&q=80',
          spotifyEmbedUrl: null,
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
    <div className="relative min-h-screen">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
          <Loader2 className="w-10 h-10 animate-spin text-[#007BFF]" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home items={items} onPlay={handlePlay} favorites={favorites} toggleFavorite={toggleFavorite} />} />
          <Route path="/episode/:id" element={<EpisodePage items={items} onPlay={handlePlay} currentEpisode={currentEpisode} isPlaying={isPlaying} />} />
          <Route path="/store" element={<StorePage />} />
        </Routes>
      </Suspense>

      <SponsorBanner />
      <ExitIntentPopup />

      <Player
        currentEpisode={currentEpisode}
        isPlaying={isPlaying}
        onClose={handleClosePlayer}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
      />
    </div >
  );
}