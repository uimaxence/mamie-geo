import { Badge, CornerFrame, LinkButton, Section, StatusDot } from "@/components/ui";
import { HeroDataShowcase } from "./hero-data-showcase";
import { HeroLLMRotator } from "./hero-llm-rotator";

// Hero, wrappé dans <CornerFrame> pour signature print subtile.
// PR 2026-05-13 : le mot en gras dans le headline cycle entre les 5
// LLMs trackés via <HeroLLMRotator>. <HeroDataShowcase> ajoute 4 cartes
// data tiltées sous les CTAs (mini-charts + tooltips), desktop only.
// PR 2026-05-20 : pattern signature retiré (fausse bonne idée après tests),
// l'identité visuelle s'appuie sur logo + couleur + CornerFrame.

export function Hero() {
  return (
    <Section pad="xl" className="relative overflow-hidden">
      <CornerFrame className="relative mx-auto max-w-3xl">
        <div className="flex flex-col items-center px-2 text-center sm:px-6">
          <Badge tone="accent" icon={<StatusDot tone="accent" pulse />} className="mb-8">
            Beta · Generative Engine Optimization
          </Badge>
          <h1 className="type-display">
            Sache enfin si <HeroLLMRotator /> parle de toi.
          </h1>
          <p className="type-body-lg mt-6 max-w-2xl">
            Mamie GEO mesure quotidiennement la visibilité de ta marque dans les 5 IA grand public.
            En français, hébergé en Europe, à partir de 9,99&nbsp;€/mois.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/pricing" variant="primary" size="lg">
              Voir les plans →
            </LinkButton>
            <LinkButton href="/outils/audit-technique" variant="ai" size="lg">
              Audit technique gratuit
            </LinkButton>
          </div>
          <p className="type-meta mt-6">
            30+ checks SEO + GEO en 10 secondes · sans inscription ·{" "}
            <a
              href="/outils/test-visibilite-ia"
              className="underline decoration-[color:var(--color-ink-soft)]/40 underline-offset-2 transition hover:decoration-[color:var(--color-ink)]"
            >
              ou tester la visibilité IA
            </a>
          </p>
        </div>
      </CornerFrame>

      {/* Aperçu data, 4 cartes tiltées avec mini-charts. Desktop only. */}
      <HeroDataShowcase />
    </Section>
  );
}
