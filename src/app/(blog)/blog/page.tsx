import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Section } from "@/components/ui";
import { ARTICLES, CATEGORY_TONE, type ArticleMeta } from "./articles-registry";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Méthodes, études et tutoriels pour mesurer et améliorer la visibilité de ta marque dans ChatGPT, Claude, Perplexity, Gemini et Le Chat de Mistral.",
};

// Index blog — liste les articles publiés. Tri par date DESC, pas de
// pagination (V0 a moins de 10 articles).

type Tone =
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "accent"
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "pink"
  | "yellow";

export default function BlogIndexPage() {
  const sorted = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <Section pad="xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="type-eyebrow">Le journal Mamie GEO</span>
          <h1 className="type-display mt-3">Méthodes, études et opinions.</h1>
          <p className="type-body-lg mt-6">
            On publie ici nos méthodes pour mesurer et améliorer la visibilité dans les IA. Pas de
            listicles génériques générés par IA — du contenu écrit à la main.
          </p>
        </div>
      </Section>

      <Section variant="tinted" pad="xl">
        <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {sorted.map((article) => (
            <li key={article.slug}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function ArticleCard({ article }: { article: ArticleMeta }) {
  const tone = CATEGORY_TONE[article.category] as Tone;
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex h-full flex-col rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6 transition hover:border-[color:var(--color-border-strong)]"
    >
      <div className="flex items-center gap-2">
        <Badge tone={tone}>{article.category}</Badge>
        <span className="type-meta">{formatDate(article.date)}</span>
        <span className="type-meta">·</span>
        <span className="type-meta">{article.readingTimeMin} min</span>
      </div>
      <h2 className="type-h3 mt-4 text-[color:var(--color-ink)] group-hover:underline group-hover:underline-offset-4">
        {article.title}
      </h2>
      <p className="type-body mt-3 text-sm">{article.description}</p>
      <div className="mt-auto pt-6">
        <span className="type-meta">Par {article.author}</span>
      </div>
    </Link>
  );
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
