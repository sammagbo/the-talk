import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "fr_BE",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: { card: "summary_large_image", title: siteConfig.name, description: siteConfig.description, images: ["/og-image.png"] },
};

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
      </body>
    </html>
  );
}
