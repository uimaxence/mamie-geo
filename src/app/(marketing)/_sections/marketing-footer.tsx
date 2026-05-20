import Link from "next/link";
import { Logo } from "@/components/marketing/logo";

// Footer enrichi PR 8b, 4 colonnes (Mamie GEO / Produit / Ressources
// / Légal) + barre de copyright en bas avec liens socials.
//
// Routes pricing / outils / blog / legal n'existent pas encore, les
// liens pointent vers des ancres ou vers des pages que PR 8c+
// fabriquera. Les liens externes (mamie-seo, GitHub, LinkedIn, X)
// vont vers leurs domaines respectifs.

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Features", href: "/#how-it-works" },
      { label: "Tarif", href: "/pricing" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Outils gratuits",
    links: [
      // Audit technique en premier : coût marginal 0 € + plus scalable
      // (cf. doc 09 § 2026-05-16).
      { label: "Audit technique site", href: "/outils/audit-technique" },
      { label: "Test visibilité IA", href: "/outils/test-visibilite-ia" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "https://mamie-seo.fr", external: true },
      { label: "Documentation", href: "/docs" },
      { label: "GitHub", href: "https://github.com/uimaxence/mamie-geo", external: true },
      { label: "Contact", href: "mailto:hello@mamie-geo.fr", external: true },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "CGU", href: "/legal/cgu" },
      { label: "Confidentialité", href: "/legal/privacy" },
      { label: "Mentions légales", href: "/legal/mentions" },
      { label: "DPA", href: "/legal/dpa" },
    ],
  },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-[color:var(--color-border)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Colonne 1 : brand + tagline */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-base font-bold tracking-tight text-[color:var(--color-ink)]"
            >
              <Logo size={24} />
              <span>Mamie GEO</span>
            </Link>
            <p className="type-meta mt-3 max-w-xs">
              Le premier SaaS francophone de tracking de visibilité dans les IA. Hébergé en Europe,
              RGPD natif.
            </p>
          </div>

          {/* Colonnes 2-4 : links */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="type-eyebrow">{col.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row : copyright + socials */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-6">
          <p className="type-meta">
            © {new Date().getFullYear()} Mamie GEO · Fait en France 🇫🇷, hébergé en Europe
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/in/maxencecailleau/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              LinkedIn
            </a>
            <a
              href="https://x.com/uimaxence"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              X
            </a>
            <a
              href="https://github.com/uimaxence/mamie-geo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
