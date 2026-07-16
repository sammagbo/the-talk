import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/ui/container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/85 shadow-[0_8px_40px_rgba(0,0,0,.32)] backdrop-blur-xl">
      <Container className="flex h-[4.5rem] items-center justify-between gap-5 sm:h-20">
        <Link href="/" className="group flex items-center gap-3" aria-label="THE TALK — accueil">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-accent/30 bg-accent/10 shadow-[0_0_24px_rgba(0,123,255,.12)] transition group-hover:border-accent/60 group-hover:bg-accent/15">
            <Image src="/logo.png" width={44} height={44} alt="" className="h-8 w-8 invert" priority />
          </span>
          <span className="flex flex-col">
            <span className="text-base font-black leading-none tracking-[-0.02em]">THE <span className="text-accent">TALK</span></span>
            <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-accent-soft">By Mijean Rochus</span>
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted transition hover:bg-white/5 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/episodes"
          className="hidden rounded-lg bg-accent px-4 py-2.5 text-[0.68rem] font-black uppercase tracking-[0.15em] text-white shadow-[0_0_24px_rgba(0,123,255,.2)] transition hover:bg-accent-strong hover:shadow-[0_0_28px_rgba(0,123,255,.36)] lg:inline-flex"
        >
          Écouter
        </Link>

        <details className="group relative md:hidden">
          <summary className="cursor-pointer list-none rounded-lg border border-line px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground [&::-webkit-details-marker]:hidden">
            Menu <span aria-hidden="true" className="text-accent">+</span>
          </summary>
          <nav
            aria-label="Navigation mobile"
            className="absolute right-0 top-12 flex min-w-56 flex-col rounded-xl border border-line bg-surface/98 p-2 shadow-2xl"
          >
            {siteConfig.navigation.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-4 py-3 text-sm font-semibold text-muted hover:bg-accent/10 hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </Container>
    </header>
  );
}
