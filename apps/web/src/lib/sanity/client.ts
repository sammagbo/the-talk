import { createClient, type QueryParams } from "@sanity/client";
import { sanityConfig } from "./config";

export const sanityClient = createClient({ ...sanityConfig, perspective: "published", useCdn: process.env.NODE_ENV === "production" });

type SanityRequest<T> = {
  query: string;
  params?: QueryParams;
  fallback: T;
  cache?: RequestCache;
  revalidate?: number;
};

export async function fetchFromSanity<T>({ query, params = {}, fallback, cache = "no-store", revalidate }: SanityRequest<T>) {
  try {
    return await sanityClient.fetch<T>(query, params, {
      cache,
      next: revalidate ? { revalidate } : undefined,
    });
  }
  catch (error) { console.error("[sanity] Content request failed", error); return fallback; }
}
