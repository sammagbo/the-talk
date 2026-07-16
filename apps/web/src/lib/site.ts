export const siteConfig = {
  name: "THE TALK",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://thetalkfashion.com",
  description: "Le podcast mode et culture de Mijean Rochus — des conversations directes sur les idées, les parcours et les mouvements qui façonnent notre époque.",
  navigation: [
    { href: "/", label: "Accueil" },
    { href: "/episodes", label: "Épisodes" },
    { href: "/blog", label: "Journal" },
    { href: "/about", label: "À propos" },
  ],
} as const;
