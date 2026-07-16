import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getEpisode } from "@/features/episodes/data";
import { formatDate } from "@/lib/format";
import { getSanityImageUrl } from "@/lib/sanity/image";
import { getYouTubeId } from "@/lib/youtube";

export const dynamic = "force-dynamic";

type EpisodePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getEpisode(slug);
  if (!episode) return { title: "Épisode introuvable" };
  const image = getSanityImageUrl(episode.coverImage, { width: 1200, height: 630 });
  return {
    title: episode.title,
    description: episode.summary ?? undefined,
    alternates: { canonical: `/episodes/${slug}` },
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { slug } = await params;
  const episode = await getEpisode(slug);
  if (!episode) notFound();

  const videoId = getYouTubeId(episode.videoUrl);
  const cover = getSanityImageUrl(episode.coverImage, { width: 1800, height: 1013 });
  const episodeLabel = [
    episode.seasonNumber ? `Saison ${episode.seasonNumber}` : null,
    episode.episodeNumber ? `Épisode ${episode.episodeNumber}` : null,
    formatDate(episode.publishedAt),
  ].filter(Boolean).join(" · ");

  return (
    <article>
      <Container className="py-12 sm:py-16">
        <Link href="/episodes" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground">
          &#8592; Tous les épisodes
        </Link>
        <header className="mt-12 grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-soft">{episodeLabel || "THE TALK"}</p>
            <h1 className="mt-5 max-w-5xl font-display text-5xl leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-8xl">{episode.title}</h1>
          </div>
          {episode.summary ? <p className="text-lg leading-8 text-muted lg:pb-2">{episode.summary}</p> : null}
        </header>
      </Container>

      <Container className="pb-16 sm:pb-24">
        <div className="relative aspect-video overflow-hidden bg-surface-soft">
          {videoId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title={episode.title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <Image src={cover ?? "/hero-poster.jpg"} alt={episode.coverImage?.alt ?? episode.title} fill priority sizes="100vw" className="object-cover" />
          )}
        </div>

        {(episode.audioUrl || episode.spotifyUrl || (episode.videoUrl && !videoId)) ? (
          <section className="mt-8 border border-line bg-surface p-6 sm:p-8" aria-labelledby="ecouter">
            <h2 id="ecouter" className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">Écouter l’épisode</h2>
            {episode.audioUrl ? <audio controls preload="metadata" src={episode.audioUrl} className="mt-6 w-full" /> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {episode.spotifyUrl ? (
                <a href={episode.spotifyUrl} target="_blank" rel="noreferrer" className="border border-line px-5 py-3 text-xs font-semibold uppercase tracking-[0.17em] transition hover:border-foreground">
                  Ouvrir dans Spotify
                </a>
              ) : null}
              {episode.videoUrl && !videoId ? (
                <a href={episode.videoUrl} target="_blank" rel="noreferrer" className="border border-line px-5 py-3 text-xs font-semibold uppercase tracking-[0.17em] transition hover:border-foreground">
                  Voir la vidéo
                </a>
              ) : null}
            </div>
          </section>
        ) : null}
      </Container>
    </article>
  );
}
