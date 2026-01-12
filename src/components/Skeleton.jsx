import React from 'react';

/**
 * Skeleton Loader Components
 * Elegant loading placeholders that mimic content structure
 */

// Base skeleton with shimmer animation
export function Skeleton({ className = '', children }) {
    return (
        <div className={`relative overflow-hidden bg-gray-200 dark:bg-[#222] rounded-lg ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            {children}
        </div>
    );
}

// Episode card skeleton
export function EpisodeCardSkeleton() {
    return (
        <div className="bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#333]">
            <Skeleton className="aspect-[4/3]" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// Grid of episode skeletons
export function EpisodeGridSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <EpisodeCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Product card skeleton (for store)
export function ProductCardSkeleton() {
    return (
        <div className="rounded-xl overflow-hidden">
            <Skeleton className="aspect-[3/4]" />
            <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
            </div>
        </div>
    );
}

// Blog post skeleton
export function BlogPostSkeleton() {
    return (
        <div className="bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#333]">
            <Skeleton className="aspect-video" />
            <div className="p-6 space-y-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );
}

// Hero section skeleton
export function HeroSkeleton() {
    return (
        <div className="h-screen flex items-center justify-center bg-black">
            <div className="text-center space-y-6 max-w-2xl px-6">
                <Skeleton className="h-4 w-32 mx-auto" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <div className="flex justify-center gap-4">
                    <Skeleton className="h-12 w-36 rounded-full" />
                    <Skeleton className="h-12 w-36 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// Shorts/Video skeleton
export function ShortsSkeleton() {
    return (
        <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32">
                    <Skeleton className="aspect-[9/16] rounded-2xl" />
                    <Skeleton className="h-3 w-full mt-2" />
                </div>
            ))}
        </div>
    );
}

// Text line skeletons
export function TextSkeleton({ lines = 3 }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

export default Skeleton;
