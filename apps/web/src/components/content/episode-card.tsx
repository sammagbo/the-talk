import Image from "next/image";
import Link from "next/link";
import { getEpisodePolicy } from "@/lib/content-policy";
import { formatDate } from "@/lib/format";
import { getSanityImageUrl } from "@/lib/sanity/image";
import type { Episode } from "@/lib/sanity/types";

export function EpisodeCard({ episode }: { episode: Episode }) {
  const policy = getEpisodePolicy(episode);
  const imageUrl = getSanityImageUrl(episode.coverImage, { width: 1200, height: 675 });
  const date = formatDate(episode.publishedAt);
  const number = [
    episode.seasonNumber ? `S${episode.seasonNumber}` : null,
    episode.episodeNumber ? `E${episode.episodeNumber}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <article className="group">
      <Link href={`/episodes/${episode.slug}`} rel={policy.role === "test" ? "nofollow" : undefined} className="block">
        <div className="relative aspect-video overflow-hidden bg-surface-soft">
          <Image
            src={imageUrl ?? "/hero-poster.jpg"}
            alt={episode.coverImage?.alt ?? episode.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.025] group-hover:opacity-90"
          />
          <span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-foreground text-background transition-transform group-hover:scale-110" aria-hidden="true">
            &#9654;
          </span>
        </div>
        <div className="pt-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-accent-soft">
            {[policy.label ?? null, number || null, episode.category?.title ?? null, date].filter(Boolean).join(" · ")}
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight tracking-[-0.03em] text-foreground transition-colors group-hover:text-accent-soft">
            {episode.title}
          </h2>
          {episode.summary ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{episode.summary}</p> : null}
        </div>
      </Link>
    </article>
  );
}
