import React, { useState, useEffect } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { db } from '../firebase';
import { collection, doc, setDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';

export default function Rating({ episodeId, user }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [average, setAverage] = useState(0);
    const [count, setCount] = useState(0);
    const [userRatingDoc, setUserRatingDoc] = useState(null);

    // Fetch ratings and calculate average
    useEffect(() => {
        if (!episodeId) return;

        const q = query(collection(db, 'ratings'), where('episodeId', '==', episodeId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ratings = snapshot.docs.map(doc => doc.data().value);
            if (ratings.length > 0) {
                const sum = ratings.reduce((a, b) => a + b, 0);
                setAverage(sum / ratings.length);
                setCount(ratings.length);
            } else {
                setAverage(0);
                setCount(0);
            }
        });

        return () => unsubscribe();
    }, [episodeId]);

    // Check for existing user rating
    useEffect(() => {
        if (!user || !episodeId) {
            setRating(0);
            return;
        }

        // We use a composite ID for the document to easily find/update user's rating
        const docId = `${episodeId}_${user.uid}`;
        const unsubscribe = onSnapshot(doc(db, 'ratings', docId), (doc) => {
            if (doc.exists()) {
                setRating(doc.data().value);
                setUserRatingDoc(doc);
            } else {
                setRating(0);
                setUserRatingDoc(null);
            }
        });

        return () => unsubscribe();
    }, [user, episodeId]);

    const handleRate = async (value) => {
        if (!user) {
            alert("Veuillez vous connecter pour noter cet épisode.");
            return;
        }

        const docId = `${episodeId}_${user.uid}`;
        try {
            await setDoc(doc(db, 'ratings', docId), {
                episodeId,
                userId: user.uid,
                value,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving rating:", error);
        }
    };

    return (
        <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
                <div className="flex items-center">
                    {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                            <button
                                key={index}
                                type="button"
                                className={`transition-colors ${user ? 'cursor-pointer' : 'cursor-default'}`}
                                onClick={() => handleRate(starValue)}
                                onMouseEnter={() => user && setHover(starValue)}
                                onMouseLeave={() => user && setHover(0)}
                                disabled={!user}
                            >
                                <Star
                                    size={20}
                                    className={`transition-all ${starValue <= (hover || rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-transparent text-gray-300 dark:text-gray-600"
                                        }`}
                                />
                            </button>
                        );
                    })}
                </div>
                <span className="text-sm font-bold text-black dark:text-white font-creativo">
                    {average.toFixed(1)} <span className="text-gray-400 font-normal font-minimal">({count})</span>
                </span>
            </div>
            {!user && (
                <span className="text-[10px] text-gray-400">Connectez-vous pour noter</span>
            )}
        </div>
    );
}
