import { cache } from "react";
import { fetchFromSanity } from "@/lib/sanity/client";
import { episodeBySlugQuery, episodeSlugByIdQuery, latestEpisodesQuery } from "@/lib/sanity/queries";
import { sanityCacheTags } from "@/lib/sanity/revalidation";
import type { Episode } from "@/lib/sanity/types";

export function getEpisodes(limit = 12) {
  return fetchFromSanity<Episode[]>({
    query: latestEpisodesQuery,
    params: { limit },
    fallback: [],
    tags: [sanityCacheTags.episodes],
  });
}
export const getEpisode = cache((slug: string) => fetchFromSanity<Episode | null>({
  query: episodeBySlugQuery,
  params: { slug },
  fallback: null,
  tags: [sanityCacheTags.episodes, sanityCacheTags.episode(slug)],
}));
export const getLegacyEpisodeSlug = cache((id: string) => fetchFromSanity<string | null>({
  query: episodeSlugByIdQuery,
  params: { id },
  fallback: null,
  tags: [sanityCacheTags.episodes],
}));
