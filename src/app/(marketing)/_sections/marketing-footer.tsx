import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/marketing/logo";

// Footer enrichi PR 8b, 4 colonnes (Mamie GEO / Produit / Ressources
// / Légal) + barre de copyright en bas avec liens socials.
//
// 2026-05-26 (P0.8 plan V0) : retrait lien /docs mort (404) + ajout
// bloc trust RGPD/EU/DPA au-dessus du copyright. Colonne Comparatifs
// sera ajoutée quand /vs/profound sera livrée (P0.6).

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
    // Pages comparatives, P0.6 plan V0 (2026-05-26). /vs/mint et
    // /vs/peec arriveront en P1.
    title: "Comparatifs",
    links: [{ label: "vs Profound", href: "/vs/profound" }],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "https://mamie-seo.fr", external: true },
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
        {/* md:grid-cols-6 = 1 col brand + 5 cols liens (Produit, Outils,
         * Comparatifs, Ressources, Légal). Sur mobile : 2 cols → brand
         * pleine largeur (col-span-2), puis les colonnes liens à 2 par
         * ligne. */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
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

        {/* Bloc trust RGPD : différenciateur fort vs concurrents US,
         * placé juste avant le copyright pour rester visible mais pas
         * tape-à-l'œil. Icône bouclier Lucide + 4 puces séparées par
         * des `·`. */}
        <div className="mt-12 flex items-center gap-2.5 border-t border-[color:var(--color-border)] pt-6 text-[color:var(--color-ink-soft)]">
          <ShieldCheck size={16} strokeWidth={2} className="text-[color:var(--color-ink)]" />
          <p className="type-meta">
            Hébergement EU · RGPD natif · DPA disponible · 0 tracker publicitaire
          </p>
        </div>

        {/* Bottom row : copyright + socials */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
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
