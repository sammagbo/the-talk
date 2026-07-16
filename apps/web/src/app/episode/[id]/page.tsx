import { notFound, permanentRedirect } from "next/navigation";
import { getLegacyEpisodeSlug } from "@/features/episodes/data";

type LegacyEpisodePageProps = { params: Promise<{ id: string }> };

export default async function LegacyEpisodePage({ params }: LegacyEpisodePageProps) {
  const { id } = await params;
  const slug = await getLegacyEpisodeSlug(id);
  if (!slug) notFound();
  permanentRedirect(`/episodes/${slug}`);
}
