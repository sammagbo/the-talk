import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/container";

export function SiteHeader() {
  return (
    <header className="relative z-40 border-b border-line bg-background/95 backdrop-blur">
      <Container className="flex h-20 items-center justify-between sm:h-24">
        <Link href="/" className="flex items-center gap-3" aria-label="THE TALK — accueil">
          <Image src="/logo.png" width={44} height={44} alt="" className="h-9 w-9 invert sm:h-11 sm:w-11" priority />
          <span className="text-sm font-semibold tracking-[0.3em]">THE TALK</span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-8 md:flex">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <details className="group relative md:hidden">
          <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.2em] text-foreground [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <nav
            aria-label="Navigation mobile"
            className="absolute right-0 top-10 flex min-w-52 flex-col border border-line bg-surface p-2 shadow-2xl"
          >
            {siteConfig.navigation.map((item) => (
              <Link key={item.href} href={item.href} className="px-4 py-3 text-sm text-muted hover:bg-surface-soft hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </Container>
    </header>
  );
}
