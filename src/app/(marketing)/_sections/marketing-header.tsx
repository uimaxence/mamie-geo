import Link from "next/link";
import { LinkButton } from "@/components/ui";

// Header marketing — logo + nav + 2 CTAs. Présent sur toutes les
// pages du route group (marketing). Tous les liens internes via
// next/link (exigence ESLint @next/next/no-html-link-for-pages).

export function MarketingHeader() {
  return (
    <header className="border-b border-[color:var(--color-border)] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-base font-bold tracking-tight text-[color:var(--color-ink)]">
          Mamie GEO
        </Link>
        <nav className="hidden gap-7 sm:flex">
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
            href="/#faq"
            className="text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
          >
            FAQ
          </Link>
        </nav>
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
    </header>
  );
}
