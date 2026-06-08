import { Badge } from "@/components/ui";
import { getRelatedArticles } from "@/lib/blog/registry";
import { CATEGORY_TONE } from "@/lib/blog/schemas";
import { RelatedArticleLink } from "./related-article-link";

// 3 articles liés en fin d'article, fait le maillage interne SEO
// + propose une lecture suite sans nécessiter d'écrire les liens à la
// main. Le scoring (même catégorie + keywords overlap) vit dans le
// registry (cf. getRelatedArticles).

export function RelatedArticles({ slug }: { slug: string }) {
  const related = getRelatedArticles(slug, 3);
  if (related.length === 0) return null;

  return (
    <section className="not-prose mt-20 border-t border-[color:var(--color-border)] pt-12">
      <h2 className="type-h2 mb-2">À lire aussi</h2>
      <p className="type-meta">Articles liés sur le même sujet.</p>
      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {related.map((article) => (
          <li key={article.slug}>
            <RelatedArticleLink fromSlug={slug} toSlug={article.slug}>
              <Badge tone={CATEGORY_TONE[article.category]} className="self-start">
                {article.category}
              </Badge>
              <h3 className="type-h3 mt-3 text-[color:var(--color-ink)] group-hover:underline group-hover:underline-offset-4">
                {article.title}
              </h3>
              <p className="type-body mt-2 text-sm line-clamp-3">{article.description}</p>
              <span className="type-meta mt-auto pt-4">
                {article.readingTimeMin} min de lecture
              </span>
            </RelatedArticleLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
