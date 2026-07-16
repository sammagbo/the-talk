import { cache } from "react";
import { fetchFromSanity } from "@/lib/sanity/client";
import { latestPostsQuery, postBySlugQuery } from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";

export function getPosts(limit = 12) {
  return fetchFromSanity<Post[]>({ query: latestPostsQuery, params: { limit }, fallback: [] });
}
export const getPost = cache((slug: string) => fetchFromSanity<Post | null>({
  query: postBySlugQuery, params: { slug }, fallback: null,
}));
