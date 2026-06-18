import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import { LinkButton, Section } from "@/components/ui";
import { MarketingFooter } from "../_sections/marketing-footer";
import { MarketingHeader } from "../_sections/marketing-header";

// Template partagé des pages comparatives /vs/<concurrent>.
//
// Inspiré du format conversion-first de sendshort.ai/compare/* : hero
// face-à-face → tableau feature-by-feature groupé → « qui choisir » →
// FAQ → CTA final. Chaque page concurrent = un objet `VsConfig`, zéro
// markup dupliqué (cf. /vs/profound, /vs/peec-ai, /vs/otterly,
// /vs/rankscale).
//
// Source de vérité produit/pricing : CLAUDE.md § 1 + page /pricing. Toute
// évolution tarifaire à propager dans les `VsConfig` de chaque page.

export type Cell = string | boolean;

export interface Row {
  feature: string;
  competitor: Cell;
  mamieGeo: Cell;
}

export interface Group {
  title: string;
  rows: Row[];
}

interface ProductSide {
  name: string;
  tagline: string;
  price: string;
  priceSuffix: string;
  target: string;
}

interface ChoiceSide {
  title: string;
  points: string[];
}

export interface VsConfig {
  /** slug d'URL, ex: "peec-ai" → /vs/peec-ai */
  slug: string;
  /** nom du concurrent affiché en tête de colonne, ex: "Peec AI" */
  competitorName: string;
  /** breadcrumb + balise <title> courte, ex: "vs Peec AI" */
  breadcrumbLabel: string;
  h1: ReactNode;
  heroIntro: ReactNode;
  /** sous-ligne du hero, ex: "Mis à jour le 18 juin 2026. Données ..." */
  tableNote: string;
  competitorCard: ProductSide;
  mamieCard: ProductSide;
  comparison: Group[];
  chooseCompetitor: ChoiceSide;
  chooseMamie: ChoiceSide;
  faq: { q: string; a: string }[];
}

function breadcrumbJsonLd(config: VsConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://mamie-geo.fr" },
      { "@type": "ListItem", position: 2, name: "Comparatifs", item: "https://mamie-geo.fr/vs" },
      {
        "@type": "ListItem",
        position: 3,
        name: config.breadcrumbLabel,
        item: `https://mamie-geo.fr/vs/${config.slug}`,
      },
    ],
  };
}

function faqJsonLd(config: VsConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function VsPage({ config }: { config: VsConfig }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(config)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(config)) }}
      />
      <MarketingHeader />

      {/* Hero comparatif */}
      <Section pad="xl" className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="type-eyebrow">Comparatif</span>
          <h1 className="type-display mt-3">{config.h1}</h1>
          <p className="type-body-lg mt-6">{config.heroIntro}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/pricing" variant="primary" size="lg">
              Essayer gratuitement 14&nbsp;jours
            </LinkButton>
            <LinkButton href="#tableau" variant="secondary" size="lg">
              Voir le tableau ↓
            </LinkButton>
          </div>
          <p className="type-meta mt-6">
            Essai 14&nbsp;jours sans carte · Sans engagement · Hébergé EU
          </p>
        </div>

        {/* Cards face-à-face hero */}
        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <ProductCard side={config.competitorCard} />
          <ProductCard side={config.mamieCard} highlighted />
        </div>
      </Section>

      {/* Tableau comparatif détaillé */}
      <Section variant="tinted" pad="xl" id="tableau">
        <div className="mx-auto max-w-3xl text-center">
          <span className="type-eyebrow">Feature par feature</span>
          <h2 className="type-h1 mt-3">Le détail, sans détour.</h2>
          <p className="type-body mt-4">{config.tableNote}</p>
        </div>

        <div className="mt-12 overflow-x-auto">
          <table className="mx-auto w-full max-w-4xl border-collapse text-left">
            <thead>
              <tr className="border-b border-[color:var(--color-border-strong)]">
                <th className="type-eyebrow px-3 py-3 text-left">Critère</th>
                <th className="type-h3 px-3 py-3 text-center">{config.competitorName}</th>
                <th className="type-h3 px-3 py-3 text-center text-[color:var(--color-accent)]">
                  Mamie GEO
                </th>
              </tr>
            </thead>
            <tbody>
              {config.comparison.map((group) => (
                <ComparisonGroup key={group.title} group={group} />
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Pour qui le concurrent, pour qui Mamie GEO */}
      <Section pad="xl">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="type-eyebrow">En résumé</span>
            <h2 className="type-h1 mt-3">Qui choisir ?</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <ChoiceCard side={config.chooseCompetitor} />
            <ChoiceCard side={config.chooseMamie} highlighted />
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section variant="tinted" pad="xl">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="type-eyebrow">FAQ</span>
            <h2 className="type-h1 mt-3">Les questions qu&apos;on nous pose.</h2>
          </div>
          <div className="mt-12 flex flex-col gap-3">
            {config.faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white p-5"
              >
                <summary className="cursor-pointer list-none text-base font-semibold text-[color:var(--color-ink)]">
                  {item.q}
                </summary>
                <p className="type-body mt-3 text-[color:var(--color-ink-soft)]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA final */}
      <Section pad="xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="type-h1">Prêt à voir ce que les IA disent de toi ?</h2>
          <p className="type-body mt-4">
            Commence avec le plan Solo : essai gratuit 14 jours sans carte, garantie remboursement
            14 jours, annulable en 1 clic.
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
      </Section>

      <MarketingFooter />
    </>
  );
}

// ─── Sub-composants ───────────────────────────────────────────────────

function ProductCard({ side, highlighted = false }: { side: ProductSide; highlighted?: boolean }) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] border p-7 ${
        highlighted
          ? "border-[color:var(--color-accent)] bg-white shadow-[var(--shadow-md)]"
          : "border-[color:var(--color-border)] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="type-h2">{side.name}</h3>
        {highlighted && (
          <span className="rounded-full bg-[color:var(--color-accent-faint)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-accent)]">
            Notre offre
          </span>
        )}
      </div>
      <p className="type-meta mt-2">{side.tagline}</p>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-semibold text-5xl tracking-tighter text-[color:var(--color-ink)]">
          {side.price}
        </span>
        <span className="type-meta">{side.priceSuffix}</span>
      </div>
      <p className="type-meta mt-4 border-t border-[color:var(--color-border)] pt-4">
        {side.target}
      </p>
    </div>
  );
}

function ChoiceCard({ side, highlighted = false }: { side: ChoiceSide; highlighted?: boolean }) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] border p-7 ${
        highlighted
          ? "border-[color:var(--color-accent)] bg-white shadow-[var(--shadow-md)]"
          : "border-[color:var(--color-border)] bg-white"
      }`}
    >
      <h3 className="type-h3">{side.title}</h3>
      <ul className="mt-5 flex flex-col gap-2.5">
        {side.points.map((p) => (
          <li
            key={p}
            className="flex items-start gap-2.5 text-sm text-[color:var(--color-ink-soft)]"
          >
            <Check
              size={16}
              strokeWidth={2.2}
              className={`mt-0.5 shrink-0 ${
                highlighted ? "text-[color:var(--color-accent)]" : "text-[color:var(--color-ink)]"
              }`}
            />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComparisonGroup({ group }: { group: Group }) {
  return (
    <>
      <tr>
        <td colSpan={3} className="type-eyebrow pt-8 pb-3 text-[color:var(--color-ink)]">
          {group.title}
        </td>
      </tr>
      {group.rows.map((row) => (
        <tr key={row.feature} className="border-t border-[color:var(--color-border)]">
          <td className="px-3 py-3 text-sm font-medium text-[color:var(--color-ink-soft)]">
            {row.feature}
          </td>
          <ComparisonCell value={row.competitor} />
          <ComparisonCell value={row.mamieGeo} highlighted />
        </tr>
      ))}
    </>
  );
}

function ComparisonCell({ value, highlighted = false }: { value: Cell; highlighted?: boolean }) {
  if (value === true) {
    return (
      <td className="px-3 py-3 text-center">
        <span
          className={`inline-flex size-5 items-center justify-center rounded-full ${
            highlighted
              ? "bg-[color:var(--color-accent-faint)] text-[color:var(--color-accent)]"
              : "bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]"
          }`}
        >
          <Check size={12} strokeWidth={3} />
        </span>
      </td>
    );
  }
  if (value === false) {
    return (
      <td className="px-3 py-3 text-center">
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-[color:var(--color-gray-100)] text-[color:var(--color-muted)]">
          <X size={12} strokeWidth={3} />
        </span>
      </td>
    );
  }
  return (
    <td
      className={`px-3 py-3 text-center text-sm ${
        highlighted
          ? "font-semibold text-[color:var(--color-ink)]"
          : "text-[color:var(--color-ink-soft)]"
      }`}
    >
      {value}
    </td>
  );
}
