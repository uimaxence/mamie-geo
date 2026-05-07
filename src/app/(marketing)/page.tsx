import { LinkButton } from "@/components/ui";

// Home placeholder — la vraie home (hero + sans/avec + how-it-works
// + outil gratuit) arrive en PR 8. En attendant, couverture sobre
// alignée direction Airbnb-like : blanc, gris, accent ponctuel sur
// le CTA. Pas de serif, pas d'italique.

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[color:var(--color-ink)]">Mamie GEO</span>
        <a
          href="/login"
          className="text-sm font-medium text-[color:var(--color-ink)] no-underline hover:text-[color:var(--color-accent)]"
        >
          Connexion
        </a>
      </header>

      <section className="mt-24 sm:mt-40">
        <span className="type-eyebrow">Generative Engine Optimization · en français</span>
        <h1 className="type-display mt-6 max-w-3xl">Sache enfin si ChatGPT parle de toi.</h1>
        <p className="type-body-lg mt-6 max-w-2xl">
          Mamie GEO mesure quotidiennement la visibilité de ta marque dans ChatGPT, Claude,
          Perplexity, Gemini et Le Chat de Mistral. En français, hébergé en Europe, à partir de 49
          €/mois.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <LinkButton href="/login" variant="accent" size="lg">
            Se connecter →
          </LinkButton>
          <span className="type-meta">
            14 jours d&apos;essai · Sans carte bancaire · 5 minutes pour s&apos;inscrire
          </span>
        </div>
      </section>

      <hr className="rule mt-32" />

      <footer className="mt-6">
        <p className="type-meta">
          Site en construction. La home complète arrive en PR 8. Suivre le journal de bord sur{" "}
          <a href="https://github.com/uimaxence/mamie-geo">GitHub</a>.
        </p>
      </footer>
    </main>
  );
}
