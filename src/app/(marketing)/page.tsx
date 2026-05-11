import { LinkButton, Section, Badge } from "@/components/ui";

// Home placeholder enrichi — applique le langage designme.agency / taap.it
// (cf. doc 09 § 2026-05-11) : sections alternées blanc/gris-50, hero
// centré titre sans-serif épais, CTAs noir pill + outline gris,
// eyebrow badge accent ponctuel. La vraie home complète (sans/avec,
// how-it-works, témoignages, founder, FAQ, footer) arrive en PR 8.

export default function HomePage() {
  return (
    <>
      {/* Header pleine largeur, fond blanc */}
      <header className="border-b border-[color:var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-base font-bold tracking-tight text-[color:var(--color-ink)]">
            Mamie GEO
          </span>
          <nav className="hidden gap-7 sm:flex">
            <a
              href="#features"
              className="text-sm text-[color:var(--color-ink-soft)] no-underline hover:text-[color:var(--color-ink)]"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-[color:var(--color-ink-soft)] no-underline hover:text-[color:var(--color-ink)]"
            >
              Tarif
            </a>
            <a
              href="#faq"
              className="text-sm text-[color:var(--color-ink-soft)] no-underline hover:text-[color:var(--color-ink)]"
            >
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium text-[color:var(--color-ink-soft)] no-underline hover:text-[color:var(--color-ink)]"
            >
              Connexion
            </a>
            <LinkButton href="/login" variant="primary" size="sm">
              Se connecter
            </LinkButton>
          </div>
        </div>
      </header>

      {/* Hero — fond blanc, contenu centré */}
      <Section pad="xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Badge tone="neutral" className="mb-6">
            Beta · Generative Engine Optimization
          </Badge>
          <h1 className="type-display">Sache enfin si ChatGPT parle de toi.</h1>
          <p className="type-body-lg mt-6 max-w-2xl">
            Mamie GEO mesure quotidiennement la visibilité de ta marque dans ChatGPT, Claude,
            Perplexity, Gemini et Le Chat de Mistral. En français, hébergé en Europe, à partir de 49
            €/mois.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/login" variant="primary" size="lg">
              Se connecter →
            </LinkButton>
            <LinkButton href="#features" variant="secondary" size="lg">
              Voir comment ça marche
            </LinkButton>
          </div>
          <p className="type-meta mt-6">
            14 jours d&apos;essai · Sans carte bancaire · 5 minutes pour s&apos;inscrire
          </p>
        </div>
      </Section>

      {/* Section "Comment ça marche" — fond gris-50 pour break visuel */}
      <Section variant="tinted" pad="xl" id="features">
        <div className="mx-auto max-w-3xl text-center">
          <span className="type-eyebrow">Comment ça marche</span>
          <h2 className="type-h1 mt-3">Trois étapes pour mesurer ta visibilité IA.</h2>
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.title}
              className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6"
            >
              <span className="type-eyebrow">{step.eyebrow}</span>
              <h3 className="type-h3 mt-3">{step.title}</h3>
              <p className="type-body mt-2">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Footer minimaliste */}
      <footer className="border-t border-[color:var(--color-border)] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8">
          <span className="text-sm font-semibold tracking-tight text-[color:var(--color-ink)]">
            Mamie GEO
          </span>
          <p className="type-meta">
            Site en construction. Suivre le journal de bord sur{" "}
            <a href="https://github.com/uimaxence/mamie-geo" className="link">
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </>
  );
}

const STEPS = [
  {
    eyebrow: "Étape 01",
    title: "Connecte ta marque",
    description:
      "Donne ton domaine, on suggère 10 prompts français représentatifs de tes audiences cibles.",
  },
  {
    eyebrow: "Étape 02",
    title: "On interroge les IA pour toi",
    description:
      "Tous les jours à 6h, on demande à ChatGPT, Claude, Perplexity, Gemini et Le Chat les questions de tes futurs clients.",
  },
  {
    eyebrow: "Étape 03",
    title: "Tu reçois ton score de visibilité",
    description:
      "Dashboard quotidien, comparatif concurrents, email hebdo. Tu sais quoi corriger pour remonter dans les réponses IA.",
  },
] as const;
