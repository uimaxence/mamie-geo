import Link from "next/link";
import { Badge, Section } from "@/components/ui";
import { CATEGORY_TONE, getArticleBySlug } from "../articles-registry";

const ARTICLE_SLUG = "mamie-geo-vs-profound";

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

const article = getArticleBySlug(ARTICLE_SLUG);

export const metadata = {
  title: article?.title,
  description: article?.description,
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  if (!article) return null;
  const tone = CATEGORY_TONE[article.category] as Tone;

  return (
    <article>
      <Section pad="lg">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="type-eyebrow inline-flex items-center hover:text-[color:var(--color-ink)]"
          >
            ← Tous les articles
          </Link>
          <div className="mt-8 flex items-center gap-3">
            <Badge tone={tone}>{article.category}</Badge>
            <span className="type-meta">{formatDate(article.date)}</span>
            <span className="type-meta">·</span>
            <span className="type-meta">{article.readingTimeMin} min de lecture</span>
          </div>
          <h1 className="type-display mt-6">{article.title}</h1>
          <p className="type-body-lg mt-6 max-w-prose">{article.description}</p>
          <p className="type-meta mt-8">Par {article.author}</p>
          <hr className="rule mt-8" />
        </div>
      </Section>

      <Section pad="md">
        <div className="mx-auto max-w-3xl">{children}</div>
      </Section>
    </article>
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
