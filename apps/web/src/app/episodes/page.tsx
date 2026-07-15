import type { Metadata } from "next";
import { EpisodeCard } from "@/components/content/episode-card";
import { Container } from "@/components/ui/container";
import { ContentEmpty } from "@/components/ui/content-empty";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEpisodes } from "@/features/episodes/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Épisodes",
  description: "Toutes les conversations de THE TALK avec les voix qui façonnent la mode et la culture.",
  alternates: { canonical: "/episodes" },
};

export default async function EpisodesPage() {
  const episodes = await getEpisodes(48);

  return (
    <Container className="py-16 sm:py-24 lg:py-28">
      <SectionHeading
        eyebrow="Toutes les conversations"
        title="Épisodes"
        description="Des échanges directs avec les créateurs, penseurs et personnalités qui font bouger la mode et la culture."
      />
      <div className="mt-16 sm:mt-24">
        {episodes.length ? (
          <div className="grid gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {episodes.map((episode) => <EpisodeCard key={episode._id} episode={episode} />)}
          </div>
        ) : (
          <ContentEmpty title="Aucun épisode publié pour le moment." description="Revenez bientôt : les prochains entretiens sont en préparation." />
        )}
      </div>
    </Container>
  );
}
