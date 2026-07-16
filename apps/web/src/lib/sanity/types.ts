import type { PortableTextBlock } from "@portabletext/types";

export type SanityImage = {
  asset?: { _ref?: string; _type?: "reference" };
  alt?: string; caption?: string; hotspot?: Record<string, number>; crop?: Record<string, number>;
};
export type Category = { title: string; slug?: string | null };
export type Person = { name: string; slug?: string | null; role?: string | null; image?: SanityImage | null };
export type Seo = {
  metaTitle?: string | null; metaDescription?: string | null; ogImage?: SanityImage | null; noIndex?: boolean | null;
};
export type Episode = {
  _id: string; title: string; slug: string; summary?: string | null; publishedAt?: string | null;
  duration?: string | null; coverImage?: SanityImage | null; category?: Category | null;
  videoUrl?: string | null; audioUrl?: string | null; spotifyUrl?: string | null;
  seasonNumber?: number | null; episodeNumber?: number | null; featured?: boolean | null;
  showNotes?: PortableTextBlock[] | null; guests?: Person[] | null; seo?: Seo | null;
};
export type Post = {
  _id: string; title: string; slug: string; excerpt?: string | null; publishedAt?: string | null;
  coverImage?: SanityImage | null; body?: PortableTextBlock[] | null;
  author?: { name: string; slug?: string | null } | null;
  categories?: Category[] | null; featured?: boolean | null; seo?: Seo | null;
};
export type SiteSettings = {
  title?: string | null; description?: string | null; canonicalUrl?: string | null;
  socialLinks?: { label: string; url: string }[] | null; defaultSeo?: Seo | null;
};
