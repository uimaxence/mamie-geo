import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LinkButton, Section } from "@/components/ui";
import { MarketingFooter } from "../_sections/marketing-footer";
import { MarketingHeader } from "../_sections/marketing-header";
import { COMPARISONS } from "./comparisons";

// Hub des comparatifs /vs. Inspiré du /compare de sendshort.ai : une
// page d'entrée qui liste tous les face-à-face concurrents et capte les
// requêtes « mamie geo vs … » + « alternative à … ».

export const metadata: Metadata = {
  title: "Mamie GEO vs les autres outils GEO : tous les comparatifs",
  description:
    "Comparatifs honnêtes de Mamie GEO face aux principaux outils de visibilité IA : Qwairy, Meteoria, Peec AI, Profound, Otterly, Rankscale. Pricing, LLMs trackés, conformité, sans bullshit.",
  alternates: { canonical: "https://mamie-geo.fr/vs" },
  openGraph: {
    title: "Mamie GEO vs les autres outils GEO : tous les comparatifs",
    description:
      "Face-à-face honnêtes avec les principaux outils de tracking de visibilité IA. Sans bullshit.",
    url: "https://mamie-geo.fr/vs",
    type: "website",
  },
};

const ITEMLIST_JSONLD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: COMPARISONS.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `Mamie GEO ${c.navLabel}`,
    url: `https://mamie-geo.fr/vs/${c.slug}`,
  })),
};

export default function VsHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ITEMLIST_JSONLD) }}
      />
      <MarketingHeader />

      <Section pad="xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="type-eyebrow">Comparatifs</span>
          <h1 className="type-display mt-3">Mamie GEO face aux autres outils GEO</h1>
          <p className="type-body-lg mt-6">
            Des comparaisons honnêtes, sans bullshit : pricing, IA trackées, conformité, et surtout
            « qui choisir pour quel besoin ». On dit aussi quand un concurrent est plus pertinent
            que nous.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/pricing" variant="primary" size="lg">
              Essayer gratuitement 14&nbsp;jours
            </LinkButton>
            <LinkButton href="/outils/audit-technique" variant="ai" size="lg">
              Audit gratuit d&apos;abord
            </LinkButton>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
          {COMPARISONS.map((c) => (
            <Link
              key={c.slug}
              href={`/vs/${c.slug}`}
              className="group flex flex-col rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6 transition hover:border-[color:var(--color-accent)] hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="type-h3">
                  Mamie GEO <span className="text-[color:var(--color-muted)]">{c.navLabel}</span>
                </h2>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-[color:var(--color-muted)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--color-accent)]"
                />
              </div>
              <p className="type-body mt-3 text-[color:var(--color-ink-soft)]">{c.tagline}</p>
              <span className="type-meta mt-4 inline-block rounded-full bg-[color:var(--color-accent-faint)] px-2.5 py-1 font-semibold text-[color:var(--color-accent)] w-fit">
                {c.priceHook}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <MarketingFooter />
    </>
  );
}
