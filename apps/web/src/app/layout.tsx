import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSiteSettings } from "@/features/site/data";
import { getSanityImageUrl } from "@/lib/sanity/image";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings?.title || siteConfig.name;
  const description = settings?.defaultSeo?.metaDescription || settings?.description || siteConfig.description;
  const canonicalUrl = settings?.canonicalUrl || siteConfig.url;
  const socialImage = getSanityImageUrl(settings?.defaultSeo?.ogImage, { width: 1200, height: 630 }) || "/og-image.png";

  return {
    metadataBase: new URL(canonicalUrl),
    title: { default: settings?.defaultSeo?.metaTitle || name, template: `%s — ${name}` },
    description,
    robots: settings?.defaultSeo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website", locale: "fr_BE", siteName: name, title: name, description,
      images: [{ url: socialImage, width: 1200, height: 630, alt: name }],
    },
    twitter: { card: "summary_large_image", title: name, description, images: [socialImage] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full">
        <a className="skip-link" href="#contenu">Aller au contenu</a>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main id="contenu" className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
