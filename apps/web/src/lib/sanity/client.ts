import { createClient, type QueryParams } from "@sanity/client";
import { sanityConfig } from "./config";

export const sanityClient = createClient({ ...sanityConfig, perspective: "published", useCdn: process.env.NODE_ENV === "production" });

type SanityRequest<T> = {
  query: string;
  params?: QueryParams;
  fallback: T;
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
};

export async function fetchFromSanity<T>({
  query,
  params = {},
  fallback,
  cache = "force-cache",
  revalidate = 60,
  tags = [],
}: SanityRequest<T>) {
  try {
    return await sanityClient.fetch<T>(query, params, {
      cache,
      next: { revalidate, tags },
    });
  }
  catch (error) { console.error("[sanity] Content request failed", error); return fallback; }
}
