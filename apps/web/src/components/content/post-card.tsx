import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { getSanityImageUrl } from "@/lib/sanity/image";
import type { Post } from "@/lib/sanity/types";

export function PostCard({ post }: { post: Post }) {
  const imageUrl = getSanityImageUrl(post.coverImage, { width: 1000, height: 1250 });

  return (
    <article className="group h-full">
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent/55 hover:shadow-[0_18px_60px_rgba(0,123,255,.12)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-soft">
          <Image
            src={imageUrl ?? "/hero-poster.jpg"}
            alt={post.coverImage?.alt ?? post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.035] group-hover:opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/45 via-transparent to-transparent" />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-accent-soft">
            {[post.categories?.[0]?.title, formatDate(post.publishedAt)].filter(Boolean).join(" · ")}
          </p>
          <h2 className="mt-3 font-display text-2xl font-black leading-tight tracking-[-0.025em] text-foreground transition-colors group-hover:text-accent">
            {post.title}
          </h2>
          {post.excerpt ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{post.excerpt}</p> : null}
        </div>
      </Link>
    </article>
  );
}
