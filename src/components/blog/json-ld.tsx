// JSON-LD structured data components — Schema.org Article, FAQPage,
// BreadcrumbList. Server components — rendent un <script
// type="application/ld+json"> inline. Le boost GEO majeur vient de
// FAQPage : Google et les LLM citent en priorité les contenus avec
// cette structure (cf. Schema.org docs + doc 09 § 2026-05-16).
//
// Sécurité : on serialize via JSON.stringify, pas de risque XSS car
// pas de string interpolation user-controlled dans le contenu HTML.
// Mais on s'assure que les valeurs n'incluent pas de `</script>`.

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

function JsonLdScript({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // L'usage de dangerouslySetInnerHTML est nécessaire pour injecter
      // du JSON pur dans un <script type="application/ld+json">. C'est
      // explicitement le pattern recommandé Next.js (cf. doc App Router).
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

// ─── Article ─────────────────────────────────────────────────────────

export interface ArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  datePublished: string; // ISO YYYY-MM-DD
  authorName: string;
  publisherName: string;
  publisherLogoUrl: string;
}

export function ArticleJsonLd(props: ArticleJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: props.title,
    description: props.description,
    image: props.imageUrl,
    datePublished: props.datePublished,
    dateModified: props.datePublished,
    author: { "@type": "Organization", name: props.authorName },
    publisher: {
      "@type": "Organization",
      name: props.publisherName,
      logo: { "@type": "ImageObject", url: props.publisherLogoUrl },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": props.url },
  };
  return <JsonLdScript data={data} />;
}

// ─── BreadcrumbList ──────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <JsonLdScript data={data} />;
}

// ─── FAQPage ─────────────────────────────────────────────────────────

export interface FaqItem {
  q: string;
  a: string;
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return <JsonLdScript data={data} />;
}
