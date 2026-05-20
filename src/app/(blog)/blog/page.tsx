import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Section } from "@/components/ui";
import { BlogNewsletterForm } from "@/components/blog/newsletter-form";
import { listArticles, type Article } from "@/lib/blog/registry";
import { CATEGORY_TONE } from "@/lib/blog/schemas";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Méthodes, études et tutoriels pour mesurer et améliorer la visibilité de ta marque dans ChatGPT, Claude, Perplexity, Gemini et Le Chat de Mistral.",
};

// Index blog — liste les articles publiés via le registry filesystem
// (cf. doc 09 § 2026-05-16). Plus de registry TS manuel ; tout vient
// du scan de `src/content/blog/*.mdx`. Pas de pagination en V0
// (< 10 articles).

export default function BlogIndexPage() {
  const articles = listArticles();

  return (
    <>
      <Section pad="xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="type-eyebrow">Blog</span>
          <h1 className="type-display mt-3">Dernières actualités.</h1>
          <p className="type-body-lg mt-6">
            Méthodes, études et tutoriels pour piloter ta visibilité dans ChatGPT, Claude,
            Perplexity, Gemini et Le Chat.
          </p>
          <BlogNewsletterForm />
        </div>
      </Section>

      <Section variant="tinted" pad="xl">
        <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <li key={article.slug}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex h-full flex-col rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-6 transition hover:border-[color:var(--color-border-strong)] hover:shadow-[var(--shadow-sm)]"
    >
      <div className="flex items-center gap-2">
        <Badge tone={CATEGORY_TONE[article.category]}>{article.category}</Badge>
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
