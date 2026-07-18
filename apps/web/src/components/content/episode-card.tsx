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
    <article className="group h-full">
      <Link
        href={`/episodes/${episode.slug}`}
        rel={policy.role === "test" ? "nofollow" : undefined}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent/55 hover:shadow-[0_18px_60px_rgba(0,123,255,.12)]"
      >
        <div className="relative aspect-video overflow-hidden bg-surface-soft">
          <Image
            src={imageUrl ?? "/hero-poster.jpg"}
            alt={episode.coverImage?.alt ?? episode.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.035] group-hover:opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          <span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-accent text-white shadow-[0_0_24px_rgba(0,123,255,.4)] transition-transform group-hover:scale-110" aria-hidden="true">
            &#9654;
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-accent-soft">
            {[policy.label ?? null, number || null, episode.category?.title ?? null, date].filter(Boolean).join(" · ")}
          </p>
          <h2 className="mt-3 font-display text-2xl font-black leading-tight tracking-[-0.025em] text-foreground transition-colors group-hover:text-accent">
            {episode.title}
          </h2>
          {episode.summary ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{episode.summary}</p> : null}
        </div>
      </Link>
    </article>
  );
}
