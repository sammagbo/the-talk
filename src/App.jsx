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

// Données du podcast (Initial State)
const portfolioItems = [
  {
    id: 1,
    category: 'Interview',
    title: 'Épisode 1 : Le Début',
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    fullSrc: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=80',
    spotifyEmbedUrl: "https://open.spotify.com/embed/episode/4GI3DXEafWwnCweVFKT7ux?utm_source=generator"
  },
  {
    id: 2,
    category: 'Coulisses',
    title: 'Enregistrement Studio',
    src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80',
    fullSrc: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80',
    spotifyEmbedUrl: "https://open.spotify.com/embed/episode/51Xm8d6G78XJm2i9t8wJ3d?utm_source=generator"
  },
  {
    id: 3,
    category: 'Épisodes',
    title: 'Épisode 2 : Innovation',
    src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80',
    fullSrc: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1600&q=80',
    spotifyEmbedUrl: "https://open.spotify.com/embed/episode/3mZ9d8XJm2i9t8wJ3d?utm_source=generator"
  },
  {
    id: 4,
    category: 'Interview',
    title: 'Vision Créative',
    src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80',
    fullSrc: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80',
    spotifyEmbedUrl: "https://open.spotify.com/embed/episode/1Xm8d6G78XJm2i9t8wJ3d?utm_source=generator"
  },
  {
    id: 5,
    category: 'Coulisses',
    title: 'Setup Digital',
    src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    fullSrc: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1600&q=80',
    spotifyEmbedUrl: "https://open.spotify.com/embed/episode/2Xm8d6G78XJm2i9t8wJ3d?utm_source=generator"
  },
  {
    id: 6,
    category: 'Épisodes',
    title: 'Épisode 3 : Futur',
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    fullSrc: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80',
    spotifyEmbedUrl: "https://open.spotify.com/embed/episode/3Xm8d6G78XJm2i9t8wJ3d?utm_source=generator"
  }
];

export default function App() {
  const [items, setItems] = useState(portfolioItems);
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

  // RSS Fetching with DOMParser
  useEffect(() => {
    const fetchRSS = async () => {
      try {
        const FEED_URL = 'https://feeds.simplecast.com/54nAGcIl';
        const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`;

        const response = await fetch(PROXY_URL);
        const dataJson = await response.json();
        const str = dataJson.contents;
        const data = new window.DOMParser().parseFromString(str, "text/xml");
        const items = Array.from(data.querySelectorAll("item"));

        if (items.length > 0) {
          const newItems = items.slice(0, 6).map((item, index) => {
            const title = item.querySelector("title")?.textContent || "Sans titre";
            const link = item.querySelector("link")?.textContent;
            const enclosure = item.querySelector("enclosure")?.getAttribute("url");
            const itunesImage = item.getElementsByTagName("itunes:image")[0]?.getAttribute("href");
            const image = itunesImage || 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=800&q=80';

            return {
              id: `rss-${index}`,
              category: 'Épisodes',
              title: title,
              src: image,
              fullSrc: image,
              spotifyEmbedUrl: link && link.includes('open.spotify.com') ? link.replace('/episode/', '/embed/episode/') : null,
              audioUrl: enclosure,
              description: item.querySelector("description")?.textContent
            };
          });

          setItems(newItems);
        }
      } catch (error) {
        console.error("Error fetching RSS:", error);
      }
    };

    fetchRSS();
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
    </div>
  );
}