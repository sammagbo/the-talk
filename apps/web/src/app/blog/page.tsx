import type { Metadata } from "next";
import { PostCard } from "@/components/content/post-card";
import { Container } from "@/components/ui/container";
import { ContentEmpty } from "@/components/ui/content-empty";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPosts } from "@/features/blog/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal",
  description: "Regards, entretiens et récits autour de la mode et de la culture par THE TALK.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPosts(48);

  return (
    <Container className="py-16 sm:py-24 lg:py-28">
      <SectionHeading
        eyebrow="Idées et perspectives"
        title="Le journal"
        description="Des récits, des regards et des prolongements aux conversations entendues dans THE TALK."
      />
      <div className="mt-16 sm:mt-24">
        {posts.length ? (
          <div className="grid gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
        ) : (
          <ContentEmpty title="Aucun article publié pour le moment." description="Le journal prend forme. Les premiers textes seront bientôt disponibles." />
        )}
      </div>
    </Container>
  );
}
