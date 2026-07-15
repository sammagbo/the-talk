import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { getSanityImageUrl } from "@/lib/sanity/image";

const components: PortableTextComponents = {
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const external = href.startsWith("http");
      return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{children}</a>;
    },
  },
  types: {
    image: ({ value }) => {
      const url = getSanityImageUrl(value, { width: 1600 });
      if (!url) return null;
      return (
        <figure className="my-10">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-soft">
            <Image src={url} alt={typeof value?.alt === "string" ? value.alt : ""} fill sizes="(min-width: 1024px) 800px, 100vw" className="object-cover" />
          </div>
          {typeof value?.caption === "string" ? <figcaption className="mt-3 text-sm text-muted">{value.caption}</figcaption> : null}
        </figure>
      );
    },
  },
};

export function PortableArticle({ value }: { value: PortableTextBlock[] }) {
  return <div className="editorial-copy"><PortableText value={value} components={components} /></div>;
}
