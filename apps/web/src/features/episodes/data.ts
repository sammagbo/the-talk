import { cache } from "react";
import { fetchFromSanity } from "@/lib/sanity/client";
import { episodeBySlugQuery, latestEpisodesQuery } from "@/lib/sanity/queries";
import type { Episode } from "@/lib/sanity/types";

export function getEpisodes(limit = 12) {
  return fetchFromSanity<Episode[]>({ query: latestEpisodesQuery, params: { limit }, fallback: [] });
}
export const getEpisode = cache((slug: string) => fetchFromSanity<Episode | null>({
  query: episodeBySlugQuery, params: { slug }, fallback: null,
}));
