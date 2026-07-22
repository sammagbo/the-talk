import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "À propos",
  description: "Découvrez l’intention de THE TALK, le podcast mode et culture présenté par Mijean Rochus.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Container className="py-16 sm:py-24 lg:py-28">
        <SectionHeading
          eyebrow="À propos"
          title="Une conversation qui va au-delà de l’image."
          description="THE TALK est un espace de parole consacré aux trajectoires, aux idées et aux réalités qui façonnent la mode et la culture aujourd’hui."
        />
      </Container>

      <Container className="pb-20 sm:pb-28">
        <div className="grid overflow-hidden rounded-3xl border border-line lg:grid-cols-2">
          <div className="relative aspect-square bg-[radial-gradient(circle_at_center,rgba(169,169,245,.72),rgba(0,123,255,.92)_52%,rgba(0,50,110,1)_100%)]">
            <div className="brand-grid absolute inset-0 opacity-60" />
            <Image src="/logo.png" alt="Le symbole THE TALK" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain p-16 invert sm:p-24" />
          </div>
          <div className="flex items-center bg-surface p-8 sm:p-14 lg:p-16">
            <div className="max-w-xl space-y-6 text-base leading-8 text-muted sm:text-lg">
              <p className="font-display text-4xl font-black leading-tight tracking-[-0.035em] text-foreground sm:text-5xl">Écouter avant de conclure.</p>
              <p>
                Présenté par Mijean Rochus, THE TALK reçoit des créateurs, entrepreneurs, artistes et penseurs pour des échanges sans posture. Chaque épisode prend le temps de comprendre un parcours et ce qu’il dit de notre époque.
              </p>
              <p>
                La mode est notre point d’entrée, jamais notre limite. Nous parlons aussi d’identité, de transmission, d’ambition, de création et des systèmes qui influencent ce que nous voyons.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
