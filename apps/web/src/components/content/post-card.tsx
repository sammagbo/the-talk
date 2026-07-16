import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { getSanityImageUrl } from "@/lib/sanity/image";
import type { Post } from "@/lib/sanity/types";

export function PostCard({ post }: { post: Post }) {
  const imageUrl = getSanityImageUrl(post.coverImage, { width: 1000, height: 1250 });

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface-soft">
          <Image
            src={imageUrl ?? "/hero-poster.jpg"}
            alt={post.coverImage?.alt ?? post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.025] group-hover:opacity-90"
          />
        </div>
        <div className="pt-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-accent-soft">
            {[post.categories?.[0]?.title, formatDate(post.publishedAt)].filter(Boolean).join(" · ")}
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight tracking-[-0.03em] text-foreground transition-colors group-hover:text-accent-soft">
            {post.title}
          </h2>
          {post.excerpt ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{post.excerpt}</p> : null}
        </div>
      </Link>
    </article>
  );
}
