import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getSiteSettings } from "@/features/site/data";
import { siteConfig } from "@/lib/site";

export async function SiteFooter() {
  const settings = await getSiteSettings();

  return (
    <footer className="border-t border-line bg-surface">
      <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <Link href="/" aria-label="THE TALK — accueil" className="inline-flex items-center gap-4">
            <Image src="/logo.png" alt="" width={64} height={64} className="h-14 w-14 invert" />
            <span className="text-lg font-semibold tracking-[0.3em]">THE TALK</span>
          </Link>
          <p className="mt-6 max-w-md text-sm leading-6 text-muted">{settings?.description || siteConfig.description}</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs uppercase tracking-[0.16em] text-muted">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
          {settings?.socialLinks?.map((item) => (
            <a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">
              {item.label}
            </a>
          ))}
        </div>
        <p className="text-xs text-muted lg:col-span-2">
          &copy; {new Date().getFullYear()} THE TALK. Tous droits réservés.
        </p>
      </Container>
    </footer>
  );
}
