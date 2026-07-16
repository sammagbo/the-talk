import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EpisodeCard } from "@/components/content/episode-card";
import { PostCard } from "@/components/content/post-card";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Container } from "@/components/ui/container";
import { ContentEmpty } from "@/components/ui/content-empty";
import { getPosts } from "@/features/blog/data";
import { getEpisodes } from "@/features/episodes/data";
import { isIndexableEpisode } from "@/lib/content-policy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [allEpisodes, posts] = await Promise.all([getEpisodes(12), getPosts(3)]);
  const episodes = allEpisodes.filter(isIndexableEpisode).slice(0, 3);
  const latestEpisode = episodes[0];

  return (
    <>
      <section className="relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden border-b border-line sm:min-h-[calc(100svh-5rem)]">
        <Image src="/hero-poster.jpg" alt="" fill priority sizes="100vw" className="-z-30 object-cover object-center opacity-55" />
        <video
          className="brand-video absolute inset-0 -z-20 h-full w-full object-cover opacity-45 motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/hero-intro.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,3,7,.48)_0%,rgba(2,3,7,.2)_42%,rgba(2,3,7,.94)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(0,123,255,.2),transparent_58%)]" />
        <div className="brand-grid absolute inset-0 -z-10 opacity-50" />

        <Container className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center py-16 text-center sm:min-h-[calc(100svh-5rem)] sm:py-20">
          <div className="mx-auto max-w-5xl">
            <p className="mb-7 inline-flex items-center gap-3 rounded-full border border-accent/35 bg-accent/10 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-accent-soft backdrop-blur-md">
              <span className="brand-badge-dot h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              Nouvel épisode disponible
            </p>
            <h1 className="font-display text-[clamp(4.6rem,15vw,12rem)] font-black uppercase leading-[0.82] tracking-[-0.07em] text-white drop-shadow-[0_14px_40px_rgba(0,0,0,.58)]">
              THE <span className="brand-title-gradient">TALK</span>
            </h1>
            <p className="mt-7 text-sm font-light uppercase tracking-[0.16em] text-muted sm:text-lg">
              A Podcast by <span className="ml-1 font-serif text-xl normal-case italic tracking-normal text-white sm:text-3xl">Mijean Rochus</span>
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Plongez dans les coulisses de la mode et de la culture à travers des conversations exclusives, directes et sans filtre.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={latestEpisode ? `/episodes/${latestEpisode.slug}` : "/episodes"}
                className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_0_30px_rgba(0,123,255,.34)] transition hover:bg-accent-strong hover:shadow-[0_0_38px_rgba(0,123,255,.5)] sm:w-auto"
              >
                [ Voir le dernier épisode ] <span aria-hidden="true" className="ml-3">&#8594;</span>
              </Link>
              <Link
                href="/about"
                className="inline-flex w-full items-center justify-center rounded-lg border border-white/30 bg-black/20 px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur transition hover:border-accent hover:bg-accent/10 sm:w-auto"
              >
                Découvrir THE TALK
              </Link>
            </div>
            <p className="mt-10 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-white/45">Bruxelles · Mode · Créativité</p>
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-surface/90" aria-label="Univers THE TALK">
        <Container className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["01", "Conversations", "Des échanges authentiques"],
            ["02", "Fashion", "Les coulisses de l’industrie"],
            ["03", "Culture", "Les idées derrière les images"],
          ].map(([number, title, description]) => (
            <div key={number} className="px-1 py-7 sm:px-7 sm:py-9">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-accent">{number}</p>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.12em] text-foreground">{title}</p>
              <p className="mt-1 text-xs text-muted">{description}</p>
            </div>
          ))}
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="mb-12 flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-accent-soft">
                <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" /> À l’antenne
              </p>
              <h2 className="mt-3 font-display text-5xl font-black tracking-[-0.04em] sm:text-6xl">En vedette</h2>
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

      <section className="relative overflow-hidden border-y border-line bg-surface py-20 sm:py-28">
        <div className="brand-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -left-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-accent/15 blur-3xl" />
        <Container>
          <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-accent-soft">Au-delà de l’image</p>
              <p className="mt-5 font-display text-5xl font-black leading-[0.96] tracking-[-0.05em] sm:text-7xl">
                La mode comme point de départ.<br /><span className="text-accent">La conversation comme destination.</span>
              </p>
            </div>
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
              <p className="flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-accent-soft">
                <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" /> Le journal
              </p>
              <h2 className="mt-3 font-display text-5xl font-black tracking-[-0.04em] sm:text-6xl">À lire</h2>
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

      <section className="border-t border-line py-20 sm:py-28">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-accent/25 bg-[linear-gradient(120deg,rgba(0,123,255,.2),rgba(8,11,18,.94)_48%,rgba(169,169,245,.1))] px-7 py-12 sm:px-12 sm:py-16 lg:px-16">
            <div className="brand-grid pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-accent-soft">Une idée, une histoire, un projet</p>
                <h2 className="mt-4 max-w-3xl font-display text-4xl font-black leading-tight tracking-[-0.04em] sm:text-6xl">Faisons avancer la conversation.</h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-muted">THE TALK est ouvert aux collaborations éditoriales, créatives et culturelles.</p>
              </div>
              <a href="mailto:contact@thetalkfashion.com" className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-accent-strong">
                Écrire à THE TALK <span aria-hidden="true" className="ml-3">&#8599;</span>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
