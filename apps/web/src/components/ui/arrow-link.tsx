import Link from "next/link";

type ArrowLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function ArrowLink({ href, children, className = "" }: ArrowLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-lg border border-accent/35 bg-accent/10 px-4 py-3 text-[0.68rem] font-black uppercase tracking-[0.16em] text-foreground transition hover:border-accent hover:bg-accent hover:text-white ${className}`}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
        &#8594;
      </span>
    </Link>
  );
}
