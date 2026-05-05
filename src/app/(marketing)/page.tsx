// Placeholder Sprint 0 — la vraie home (hero + sans/avec + how-it-works + …)
// arrive en Sprint 1 (cf. geo-project/10-design-direction.md § Hero).
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-24">
      <p className="text-sm uppercase tracking-widest text-[color:var(--color-warm-gray)]">
        Mamie GEO · Sprint 0
      </p>
      <h1 className="mt-4 font-serif text-5xl leading-tight">
        Sache enfin si ChatGPT parle de toi.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[color:var(--color-ink)]">
        Tracking quotidien de ta visibilité dans <em>ChatGPT, Claude, Perplexity, Gemini</em> et{" "}
        <em>Le Chat</em> de Mistral. En français, hébergé en France, à partir de 49 €/mois.
      </p>
      <p className="mt-12 text-sm text-[color:var(--color-warm-gray)]">
        Site en construction.{" "}
        <a className="text-[color:var(--color-terracotta)] underline" href="/login">
          Connexion bêta →
        </a>
      </p>
    </main>
  );
}
