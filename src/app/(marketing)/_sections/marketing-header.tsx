import Link from "next/link";
import { LinkButton } from "@/components/ui";
import { Logo } from "@/components/marketing/logo";

// Header marketing, logo à gauche, à droite : nav items + séparateur
// vertical fin + auth buttons. Réorganisé 2026-05-13 suite retour Max
// (avant : nav au centre, séparé).
//
// Tous les liens internes via next/link (exigence ESLint
// @next/next/no-html-link-for-pages).

export function MarketingHeader() {
  return (
    <header className="border-b border-[color:var(--color-border)] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        {/* Left : logo + wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold tracking-tight text-[color:var(--color-ink)]"
        >
          <Logo size={28} />
          <span>Mamie GEO</span>
        </Link>

        {/* Right : nav items + séparateur vertical + auth buttons.
         * Tout regroupé pour aligner à droite. Le séparateur (1 px,
         * h-5, bg-border) délimite subtilement nav et auth. */}
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              Tarif
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              Blog
            </Link>
            <Link
              href="/#faq"
              className="text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              FAQ
            </Link>
          </nav>

          {/* Séparateur vertical fin et discret, hidden sur mobile
           * (la nav est cachée < sm donc le séparateur n'aurait rien
           * à séparer). */}
          <span aria-hidden className="hidden h-5 w-px bg-[color:var(--color-border)] sm:block" />

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              Connexion
            </Link>
            <LinkButton href="/login" variant="primary" size="sm">
              Se connecter
            </LinkButton>
          </div>
        </div>
      </div>
    </header>
  );
}
