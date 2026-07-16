import type { PortableTextBlock } from "@portabletext/types";

export type SanityImage = {
  asset?: { _ref?: string; _type?: "reference" };
  alt?: string; caption?: string; hotspot?: Record<string, number>; crop?: Record<string, number>;
};
export type Category = { title: string; slug?: string | null };
export type Episode = {
  _id: string; title: string; slug: string; summary?: string | null; publishedAt?: string | null;
  duration?: string | null; coverImage?: SanityImage | null; category?: Category | null;
  videoUrl?: string | null; audioUrl?: string | null; spotifyUrl?: string | null;
  seasonNumber?: number | null; episodeNumber?: number | null; featured?: boolean | null;
};
export type Post = {
  _id: string; title: string; slug: string; excerpt?: string | null; publishedAt?: string | null;
  coverImage?: SanityImage | null; body?: PortableTextBlock[] | null;
  author?: { name: string; slug?: string | null } | null;
  categories?: Category[] | null; featured?: boolean | null;
};
