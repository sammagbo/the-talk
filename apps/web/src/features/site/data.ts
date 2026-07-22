import { cache } from "react";
import { fetchFromSanity } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import { sanityCacheTags } from "@/lib/sanity/revalidation";
import type { SiteSettings } from "@/lib/sanity/types";

export const getSiteSettings = cache(() => fetchFromSanity<SiteSettings | null>({
  query: siteSettingsQuery,
  fallback: null,
  cache: "force-cache",
  revalidate: 3600,
  tags: [sanityCacheTags.settings],
}));
