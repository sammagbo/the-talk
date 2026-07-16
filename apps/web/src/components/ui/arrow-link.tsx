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
      className={`group inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition-colors hover:text-accent-soft ${className}`}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
        &#8594;
      </span>
    </Link>
  );
}
