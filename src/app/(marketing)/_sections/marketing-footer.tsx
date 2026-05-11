// Footer minimaliste — version PR 8a. Le footer enrichi (4 colonnes
// produit/ressources/légal + newsletter) arrive en PR 8b.

export function MarketingFooter() {
  return (
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
  );
}
