import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getSiteSettings } from "@/features/site/data";
import { siteConfig } from "@/lib/site";

export async function SiteFooter() {
  const settings = await getSiteSettings();

  return (
    <footer className="relative overflow-hidden border-t border-line bg-surface">
      <div className="brand-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <Container className="relative py-14 sm:py-20">
        <div className="grid gap-8 border-b border-line pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-accent-soft">Let&apos;s work together</p>
            <p className="mt-4 max-w-3xl font-display text-4xl leading-[1.02] tracking-[-0.04em] sm:text-6xl">
              Une histoire ou un projet à partager&nbsp;?
            </p>
          </div>
          <a
            href="mailto:contact@thetalkfashion.com"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-accent-strong"
          >
            Nous contacter <span aria-hidden="true" className="ml-3">&#8599;</span>
          </a>
        </div>

        <div className="grid gap-12 pt-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Link href="/" aria-label="THE TALK — accueil" className="inline-flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-xl border border-accent/30 bg-accent/10">
                <Image src="/logo.png" alt="" width={64} height={64} className="h-10 w-10 invert" />
              </span>
              <span className="text-xl font-black tracking-[-0.02em]">THE <span className="text-accent">TALK</span></span>
            </Link>
            <p className="mt-6 max-w-md text-sm leading-6 text-muted">{settings?.description || siteConfig.description}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">
            {siteConfig.navigation.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-accent-soft">
                {item.label}
              </Link>
            ))}
            {settings?.socialLinks?.map((item) => (
              <a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent-soft">
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <p className="mt-12 text-xs text-muted">
          &copy; {new Date().getFullYear()} THE TALK. Tous droits réservés.
        </p>
      </Container>
    </footer>
  );
}
