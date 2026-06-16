import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { LinkButton, Section } from "@/components/ui";
import { MarketingFooter } from "../../_sections/marketing-footer";
import { MarketingHeader } from "../../_sections/marketing-header";

// Landing comparative SEO-focus : capter le mot-clé "alternative
// Profound" en français (zéro compétition à ce jour). Recycle l'article
// blog `mamie-geo-vs-profound.mdx` en format conversion-first.
//
// Source de vérité produit/pricing : doc CLAUDE.md § 1, article blog,
// et page /pricing. Toute évolution tarifaire à propager ici.
//
// Cf. plan V0 belle home P0.6 (2026-05-26).

export const metadata: Metadata = {
  title: "Mamie GEO vs Profound — l'alternative francophone à 1/10ᵉ du prix",
  description:
    "Profound vise les grandes entreprises US à 500 $/mois. Mamie GEO vise les freelances et PME francophones dès 9,99 €/mois, avec Le Chat de Mistral, hébergement EU et support FR. Comparaison honnête.",
  alternates: {
    canonical: "https://mamie-geo.fr/vs/profound",
  },
  openGraph: {
    title: "Mamie GEO vs Profound — l'alternative francophone à 1/10ᵉ du prix",
    description:
      "Comparatif feature-by-feature : pricing, LLMs trackés, hébergement, conformité, langue. Sans bullshit.",
    url: "https://mamie-geo.fr/vs/profound",
    type: "website",
  },
};

const BREADCRUMB_JSONLD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: "https://mamie-geo.fr" },
    {
      "@type": "ListItem",
      position: 2,
      name: "Comparatifs",
      item: "https://mamie-geo.fr/vs",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "vs Profound",
      item: "https://mamie-geo.fr/vs/profound",
    },
  ],
};

// Lignes du tableau comparatif. true / false → ✓ / ✗ avec pastille.
// Sinon string affichée telle quelle. Groupé par catégorie pour la
// lisibilité.
type Cell = string | boolean;
interface Row {
  feature: string;
  profound: Cell;
  mamieGeo: Cell;
}
interface Group {
  title: string;
  rows: Row[];
}

const COMPARISON: Group[] = [
  {
    title: "Pricing",
    rows: [
      { feature: "Plan d'entrée", profound: "500 $/mois", mamieGeo: "9,99 €/mois" },
      { feature: "Plan Pro / standard", profound: "~1 200 $/mois", mamieGeo: "149 €/mois" },
      { feature: "Plan Enterprise", profound: "Jusqu'à 2 000 $/mois", mamieGeo: "Sur devis" },
      {
        feature: "Essai gratuit ou garantie",
        profound: "Démo commerciale obligatoire",
        mamieGeo: "Garantie remboursement 14j",
      },
      {
        feature: "Outil gratuit sans inscription",
        profound: false,
        mamieGeo: "Audit technique 30+ checks",
      },
    ],
  },
  {
    title: "LLMs trackés",
    rows: [
      { feature: "ChatGPT", profound: true, mamieGeo: true },
      { feature: "Claude", profound: true, mamieGeo: true },
      { feature: "Perplexity", profound: true, mamieGeo: true },
      { feature: "Gemini", profound: true, mamieGeo: true },
      { feature: "Le Chat (Mistral) 🇫🇷", profound: false, mamieGeo: true },
      { feature: "Copilot · Grok · Meta AI · DeepSeek", profound: true, mamieGeo: false },
    ],
  },
  {
    title: "Hébergement & conformité",
    rows: [
      { feature: "Hébergement", profound: "AWS US", mamieGeo: "Vercel EU + Neon Frankfurt" },
      { feature: "RGPD natif", profound: "Via SCC", mamieGeo: true },
      {
        feature: "DPA disponible",
        profound: "Négociation Enterprise",
        mamieGeo: "Sur demande, tous plans",
      },
      { feature: "SOC 2 Type II", profound: true, mamieGeo: false },
    ],
  },
  {
    title: "Langue & marché",
    rows: [
      { feature: "Interface", profound: "Anglais uniquement", mamieGeo: "Français" },
      { feature: "Rapports", profound: "Anglais", mamieGeo: "Français" },
      { feature: "Support", profound: "Anglais", mamieGeo: "Français" },
      { feature: "Documentation", profound: "Anglais", mamieGeo: "Français" },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: "Pourquoi Mamie GEO ne track-t-il pas Grok, DeepSeek ou Copilot ?",
    a: "Choix éditorial V0 : on track les 5 LLMs les plus utilisés en France (ChatGPT, Claude, Perplexity, Gemini, Le Chat). Ajouter Grok ou DeepSeek alourdit le coût LLM sans valeur pour notre cible francophone. On les ajoutera si la demande émerge.",
  },
  {
    q: "Mamie GEO peut-il remplacer Profound pour une grande entreprise FR ?",
    a: "Probablement pas en V0 — pas de SSO SAML, pas de SOC 2, pas d'API avancée. Pour une grande entreprise qui veut un outil français, on peut discuter d'un plan custom (hello@mamie-geo.fr). Mais pour 90 % des PME françaises, Mamie GEO suffit largement.",
  },
  {
    q: "Combien coûte Mamie GEO vs Profound sur un an ?",
    a: "Mamie GEO Pro 149 €/mois = 1 788 €/an. Profound Starter 500 $/mois ≈ 5 500 €/an. Différence d'environ 3 700 €/an pour des features comparables sur les LLMs grand public + un meilleur tracking du marché FR (Le Chat).",
  },
];

export default function VsProfoundPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSONLD) }}
      />
      <MarketingHeader />

      {/* Hero comparatif */}
      <Section pad="xl" className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="type-eyebrow">Comparatif</span>
          <h1 className="type-display mt-3">
            Mamie GEO vs Profound — l&apos;alternative francophone à 1/10ᵉ du prix
          </h1>
          <p className="type-body-lg mt-6">
            Profound vise les Fortune 1000 anglo-saxonnes à 500&nbsp;$/mois. Mamie GEO vise les
            freelances et PME francophones dès 9,99&nbsp;€/mois, avec Le Chat de Mistral et
            hébergement Europe. Voici la comparaison honnête, sans bullshit.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/pricing" variant="primary" size="lg">
              Démarrer — 9,99&nbsp;€/mois
            </LinkButton>
            <LinkButton href="#tableau" variant="secondary" size="lg">
              Voir le tableau ↓
            </LinkButton>
          </div>
          <p className="type-meta mt-6">
            Garantie remboursement 14&nbsp;jours · Sans engagement · Hébergé EU
          </p>
        </div>

        {/* Cards face-à-face hero */}
        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <ProductCard
            name="Profound"
            tagline="L'outil US de référence pour Fortune 1000"
            price="500 $"
            priceSuffix="/mois (plan Starter)"
            target="Grandes entreprises US/UK · Marketing 50+ personnes"
          />
          <ProductCard
            name="Mamie GEO"
            tagline="Le SaaS francophone GEO pour freelances et PME"
            price="9,99 €"
            priceSuffix="/mois (plan Solo)"
            target="Freelances · PME · Agences SEO/marketing FR"
            highlighted
          />
        </div>
      </Section>

      {/* Tableau comparatif détaillé */}
      <Section variant="tinted" pad="xl" id="tableau">
        <div className="mx-auto max-w-3xl text-center">
          <span className="type-eyebrow">Feature par feature</span>
          <h2 className="type-h1 mt-3">Le détail, sans détour.</h2>
          <p className="type-body mt-4">
            Mis à jour le 12 mai 2026. Données Profound depuis leur page pricing publique et leur
            documentation.
          </p>
        </div>

        <div className="mt-12 overflow-x-auto">
          <table className="mx-auto w-full max-w-4xl border-collapse text-left">
            <thead>
              <tr className="border-b border-[color:var(--color-border-strong)]">
                <th className="type-eyebrow px-3 py-3 text-left">Critère</th>
                <th className="type-h3 px-3 py-3 text-center">Profound</th>
                <th className="type-h3 px-3 py-3 text-center text-[color:var(--color-accent)]">
                  Mamie GEO
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((group) => (
                <ComparisonGroup key={group.title} group={group} />
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Pour qui Profound, pour qui Mamie GEO */}
      <Section pad="xl">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="type-eyebrow">En résumé</span>
            <h2 className="type-h1 mt-3">Qui choisir ?</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <ChoiceCard
              title="Choisir Profound si…"
              points={[
                "Grande entreprise US/UK, budget tooling > 5 k$/mois",
                "Besoin de SOC 2 Type II, SAML SSO, 8 LLMs anglo-saxons",
                "Équipe marketing 50+ personnes habituée aux outils US",
                "Tu cibles un marché anglo-saxon global (Grok, DeepSeek)",
              ]}
            />
            <ChoiceCard
              title="Choisir Mamie GEO si…"
              highlighted
              points={[
                "Freelance ou PME francophone, budget < 500 €/mois",
                "Tu as besoin de Le Chat (Mistral) dans le tracking",
                "Tu valorises l'hébergement EU et le support français",
                "Tu veux pouvoir tester sans engagement (garantie 14j)",
              ]}
            />
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section variant="tinted" pad="xl">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="type-eyebrow">FAQ</span>
            <h2 className="type-h1 mt-3">Trois questions, trois réponses.</h2>
          </div>
          <div className="mt-12 flex flex-col gap-3">
            {FAQ_ITEMS.map((item) => (
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
            Commence avec le plan Solo à 9,99&nbsp;€/mois. Garantie remboursement 14 jours,
            annulable en 1 clic.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/pricing" variant="primary" size="lg">
              Démarrer — 9,99&nbsp;€/mois
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

// ─── Sub-composants locaux ────────────────────────────────────────────

function ProductCard({
  name,
  tagline,
  price,
  priceSuffix,
  target,
  highlighted = false,
}: {
  name: string;
  tagline: string;
  price: string;
  priceSuffix: string;
  target: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] border p-7 ${
        highlighted
          ? "border-[color:var(--color-accent)] bg-white shadow-[var(--shadow-md)]"
          : "border-[color:var(--color-border)] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="type-h2">{name}</h3>
        {highlighted && (
          <span className="rounded-full bg-[color:var(--color-accent-faint)] px-2.5 py-1 text-xs font-semibold text-[color:var(--color-accent)]">
            Notre offre
          </span>
        )}
      </div>
      <p className="type-meta mt-2">{tagline}</p>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-semibold text-5xl tracking-tighter text-[color:var(--color-ink)]">
          {price}
        </span>
        <span className="type-meta">{priceSuffix}</span>
      </div>
      <p className="type-meta mt-4 border-t border-[color:var(--color-border)] pt-4">{target}</p>
    </div>
  );
}

function ChoiceCard({
  title,
  points,
  highlighted = false,
}: {
  title: string;
  points: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] border p-7 ${
        highlighted
          ? "border-[color:var(--color-accent)] bg-white shadow-[var(--shadow-md)]"
          : "border-[color:var(--color-border)] bg-white"
      }`}
    >
      <h3 className="type-h3">{title}</h3>
      <ul className="mt-5 flex flex-col gap-2.5">
        {points.map((p) => (
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
          <ComparisonCell value={row.profound} />
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
