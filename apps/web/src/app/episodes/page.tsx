import type { Metadata } from "next";
import { EpisodeCard } from "@/components/content/episode-card";
import { Container } from "@/components/ui/container";
import { ContentEmpty } from "@/components/ui/content-empty";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEpisodes } from "@/features/episodes/data";
import { isTestEpisode } from "@/lib/content-policy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Épisodes",
  description: "Toutes les conversations de THE TALK avec les voix qui façonnent la mode et la culture.",
  alternates: { canonical: "/episodes" },
};

export default async function EpisodesPage() {
  const episodes = await getEpisodes(48);
  const editorialEpisodes = episodes.filter((episode) => !isTestEpisode(episode));
  const testEpisodes = episodes.filter(isTestEpisode);

  return (
    <Container className="py-16 sm:py-24 lg:py-28">
      <SectionHeading
        eyebrow="Toutes les conversations"
        title="Épisodes"
        description="Des échanges directs avec les créateurs, penseurs et personnalités qui font bouger la mode et la culture."
      />
      <div className="mt-16 sm:mt-24">
        {editorialEpisodes.length ? (
          <div className="grid gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {editorialEpisodes.map((episode) => <EpisodeCard key={episode._id} episode={episode} />)}
          </div>
        ) : (
          <ContentEmpty title="Aucun épisode publié pour le moment." description="Revenez bientôt : les prochains entretiens sont en préparation." />
        )}
      </div>

      {testEpisodes.length ? (
        <section className="mt-24 border-t border-line pt-14 sm:mt-32 sm:pt-20" aria-labelledby="demonstrations-techniques">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-soft">Laboratoire</p>
          <h2 id="demonstrations-techniques" className="mt-4 font-display text-4xl tracking-[-0.035em] sm:text-5xl">
            Démonstrations techniques
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
            Ces contenus sont volontairement conservés pour tester l’affichage et les médias du site. Ils restent accessibles ici, séparés du catalogue éditorial.
          </p>
          <div className="mt-12 grid gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {testEpisodes.map((episode) => <EpisodeCard key={episode._id} episode={episode} />)}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
