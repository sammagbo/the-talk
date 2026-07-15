import type { Metadata } from "next";
import Image from "next/image";
import { EpisodeCard } from "@/components/content/episode-card";
import { PostCard } from "@/components/content/post-card";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Container } from "@/components/ui/container";
import { ContentEmpty } from "@/components/ui/content-empty";
import { getPosts } from "@/features/blog/data";
import { getEpisodes } from "@/features/episodes/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [episodes, posts] = await Promise.all([getEpisodes(3), getPosts(3)]);

  return (
    <>
      <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden border-b border-line sm:min-h-[calc(100svh-6rem)]">
        <Image src="/hero-poster.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-center opacity-60" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,10,10,.96)_0%,rgba(10,10,10,.7)_48%,rgba(10,10,10,.24)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-background to-transparent" />

        <Container className="flex min-h-[calc(100svh-5rem)] items-end py-14 sm:min-h-[calc(100svh-6rem)] sm:py-20">
          <div className="max-w-5xl">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.32em] text-accent-soft">Podcast · Mode · Culture</p>
            <h1 className="font-display text-[clamp(4rem,12vw,11rem)] leading-[0.78] tracking-[-0.065em]">
              Sans filtre.<br /><span className="italic text-accent-soft">Avec style.</span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-[#ded9d0] sm:text-lg">
              Mijean Rochus reçoit celles et ceux qui pensent, créent et déplacent les lignes de la mode et de la culture.
            </p>
            <ArrowLink href="/episodes" className="mt-9">Découvrir les épisodes</ArrowLink>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="mb-12 flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-soft">À l’antenne</p>
              <h2 className="mt-3 font-display text-5xl tracking-[-0.04em] sm:text-6xl">Derniers épisodes</h2>
            </div>
            <ArrowLink href="/episodes">Tous les épisodes</ArrowLink>
          </div>
          {episodes.length ? (
            <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {episodes.map((episode) => <EpisodeCard key={episode._id} episode={episode} />)}
            </div>
          ) : (
            <ContentEmpty title="Les conversations arrivent bientôt." description="Les épisodes publiés dans le Studio apparaîtront automatiquement ici." />
          )}
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <p className="font-display text-5xl leading-[0.98] tracking-[-0.045em] sm:text-7xl">
              La mode comme point de départ. La conversation comme destination.
            </p>
            <div className="max-w-xl lg:justify-self-end">
              <p className="text-lg leading-8 text-muted">
                THE TALK explore les parcours, les idées et les contradictions derrière les images. Des voix singulières, des échanges francs et le temps d’aller au fond des choses.
              </p>
              <ArrowLink href="/about" className="mt-8">Notre histoire</ArrowLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="mb-12 flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-soft">Le journal</p>
              <h2 className="mt-3 font-display text-5xl tracking-[-0.04em] sm:text-6xl">À lire</h2>
            </div>
            <ArrowLink href="/blog">Tous les articles</ArrowLink>
          </div>
          {posts.length ? (
            <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => <PostCard key={post._id} post={post} />)}
            </div>
          ) : (
            <ContentEmpty title="Le journal se prépare." description="Les articles publiés dans le Studio apparaîtront automatiquement ici." />
          )}
        </Container>
      </section>
    </>
  );
}
