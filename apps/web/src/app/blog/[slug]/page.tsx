import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableArticle } from "@/components/content/portable-article";
import { Container } from "@/components/ui/container";
import { getPost } from "@/features/blog/data";
import { formatDate } from "@/lib/format";
import { getSanityImageUrl } from "@/lib/sanity/image";

export const dynamic = "force-dynamic";

type PostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article introuvable" };
  const image = getSanityImageUrl(post.seo?.ogImage || post.coverImage, { width: 1200, height: 630 });
  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt || undefined,
    alternates: { canonical: `/blog/${slug}` },
    robots: post.seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const cover = getSanityImageUrl(post.coverImage, { width: 1800, height: 1200 });

  return (
    <article className="pb-20 sm:pb-28">
      <Container className="py-12 sm:py-16">
        <Link href="/blog" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground">
          &#8592; Le journal
        </Link>
        <header className="mx-auto mt-12 max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            {[post.categories?.[0]?.title, formatDate(post.publishedAt)].filter(Boolean).join(" · ") || "THE TALK"}
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-8xl">{post.title}</h1>
          {post.excerpt ? <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted">{post.excerpt}</p> : null}
          {post.author?.name ? <p className="mt-6 text-xs uppercase tracking-[0.18em] text-muted">Par {post.author.name}</p> : null}
        </header>
      </Container>

      {cover ? (
        <Container>
          <div className="relative aspect-[3/2] overflow-hidden bg-surface-soft">
            <Image src={cover} alt={post.coverImage?.alt ?? post.title} fill priority sizes="100vw" className="object-cover" />
          </div>
        </Container>
      ) : null}

      {post.body?.length ? (
        <Container className="pt-14 sm:pt-20">
          <div className="mx-auto max-w-3xl"><PortableArticle value={post.body} /></div>
        </Container>
      ) : null}
    </article>
  );
}
