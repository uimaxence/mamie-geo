import { LinkButton } from "@/components/ui";

// Home placeholder — la vraie home (hero + sans/avec + how-it-works
// + outil gratuit) arrive en PR 8 (cf. doc 10 § Hero). En attendant
// on pose une couverture éditoriale propre alignée Direction A.

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-16">
      <header className="flex items-baseline justify-between">
        <span className="type-eyebrow">Mamie GEO · Beta</span>
        <span className="type-meta">Sprint 1 · Phase A</span>
      </header>

      <hr className="rule mt-3" />

      <section className="mt-20 sm:mt-32">
        <p className="type-eyebrow">Generative Engine Optimization · en français</p>
        <h1 className="type-display mt-6">
          Sache enfin si <span className="italic">ChatGPT</span> parle de toi.
        </h1>
        <p className="type-body-lg mt-8 max-w-2xl">
          Mamie GEO mesure quotidiennement la visibilité de ta marque dans{" "}
          <strong className="text-[color:var(--color-ink)]">
            ChatGPT, Claude, Perplexity, Gemini
          </strong>{" "}
          et <strong className="text-[color:var(--color-ink)]">Le Chat</strong> de Mistral. En
          français, hébergé en Europe, à partir de 49 €/mois.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <LinkButton href="/login" variant="primary" size="lg">
            Se connecter
          </LinkButton>
          <span className="type-meta">
            14 jours d&apos;essai · Sans carte bancaire · 5 minutes pour s&apos;inscrire
          </span>
        </div>
      </section>

      <hr className="rule mt-24 sm:mt-32" />

      <footer className="mt-6">
        <p className="type-meta">
          Site en construction. La vraie home arrive en PR 8. En attendant tu peux te connecter en
          beta sur <a href="/login">/login</a> ou suivre le journal de bord sur{" "}
          <a href="https://github.com/uimaxence/mamie-geo">GitHub</a>.
        </p>
      </footer>
    </main>
  );
}
