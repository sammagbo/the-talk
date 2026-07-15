import type { MetadataRoute } from "next";
import { getPosts } from "@/features/blog/data";
import { getEpisodes } from "@/features/episodes/data";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [episodes, posts] = await Promise.all([getEpisodes(500), getPosts(500)]);
  const staticRoutes: MetadataRoute.Sitemap = ["", "/episodes", "/blog", "/about"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...episodes.map((episode) => ({
      url: `${siteConfig.url}/episodes/${episode.slug}`,
      lastModified: episode.publishedAt ?? undefined,
    })),
    ...posts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastModified: post.publishedAt ?? undefined,
    })),
  ];
}
