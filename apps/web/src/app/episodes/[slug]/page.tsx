import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableArticle } from "@/components/content/portable-article";
import { Container } from "@/components/ui/container";
import { getEpisode } from "@/features/episodes/data";
import { getEpisodePolicy } from "@/lib/content-policy";
import { formatDate } from "@/lib/format";
import { getSanityImageUrl } from "@/lib/sanity/image";
import { getYouTubeId } from "@/lib/youtube";

export const dynamic = "force-dynamic";

type EpisodePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getEpisode(slug);
  if (!episode) return { title: "Épisode introuvable" };
  const policy = getEpisodePolicy(slug);
  const image = getSanityImageUrl(episode.seo?.ogImage || episode.coverImage, { width: 1200, height: 630 });
  return {
    title: episode.seo?.metaTitle || episode.title,
    description: episode.seo?.metaDescription || episode.summary || undefined,
    alternates: { canonical: `/episodes/${slug}` },
    robots: policy.role === "test" || episode.seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { slug } = await params;
  const episode = await getEpisode(slug);
  if (!episode) notFound();

  const policy = getEpisodePolicy(slug);
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
        {policy.notice ? (
          <aside className="mt-8 border-l-2 border-accent bg-surface px-5 py-4" aria-label={policy.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-soft">{policy.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{policy.notice}</p>
          </aside>
        ) : null}
        <header className="mt-12 grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-soft">{episodeLabel || "THE TALK"}</p>
            <h1 className="mt-5 max-w-5xl font-display text-5xl leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-8xl">{episode.title}</h1>
            {episode.guests?.length ? (
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Avec {episode.guests.map((guest) => guest.name).join(", ")}
              </p>
            ) : null}
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

        {episode.showNotes?.length ? (
          <section className="mx-auto mt-16 max-w-3xl border-t border-line pt-12 sm:mt-24 sm:pt-16" aria-labelledby="notes-episode">
            <h2 id="notes-episode" className="mb-9 font-display text-4xl tracking-[-0.035em] sm:text-5xl">Notes de l’épisode</h2>
            <PortableArticle value={episode.showNotes} />
          </section>
        ) : null}
      </Container>
    </article>
  );
}
