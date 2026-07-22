import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="grid min-h-[65vh] place-items-center py-20 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-soft">Erreur 404</p>
        <h1 className="mt-5 font-display text-6xl tracking-[-0.05em] sm:text-8xl">Page introuvable</h1>
        <p className="mx-auto mt-5 max-w-lg leading-7 text-muted">Cette conversation n’est pas disponible, ou son adresse a changé.</p>
        <Link href="/" className="mt-8 inline-block border border-line px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition hover:border-foreground">Retour à l’accueil</Link>
      </div>
    </Container>
  );
}
