import { Badge, CornerFrame, LinkButton, Section, StatusDot } from "@/components/ui";

// Hero — wrappé dans <CornerFrame> pour signature print subtile.
// Mix-weight sur le headline (ChatGPT en bold) selon pattern doc 10
// § Patterns de personnalité (update 2026-05-11).

export function Hero() {
  return (
    <Section pad="xl">
      <CornerFrame className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center px-2 text-center sm:px-6">
          <Badge tone="accent" icon={<StatusDot tone="accent" pulse />} className="mb-8">
            Beta · Generative Engine Optimization
          </Badge>
          <h1 className="type-display">
            Sache enfin si <strong className="font-bold">ChatGPT</strong> parle de toi.
          </h1>
          <p className="type-body-lg mt-6 max-w-2xl">
            Mamie GEO mesure quotidiennement la visibilité de ta marque dans ChatGPT, Claude,
            Perplexity, Gemini et Le Chat de Mistral. En français, hébergé en Europe, à partir de 49
            €/mois.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/login" variant="primary" size="lg">
              Tester gratuitement →
            </LinkButton>
            <LinkButton href="#sans-avec" variant="secondary" size="lg">
              Voir comment ça marche
            </LinkButton>
          </div>
          <p className="type-meta mt-6">
            14 jours d&apos;essai · Sans carte bancaire · 5 minutes pour s&apos;inscrire
          </p>
        </div>
      </CornerFrame>
    </Section>
  );
}
