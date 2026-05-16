import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Section } from "@/components/ui";
import { ArticleCTA } from "@/components/blog/article-cta";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/blog/json-ld";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { RelatedArticles } from "@/components/blog/related-articles";
import { TOC } from "@/components/blog/toc";
import { getArticleBySlug, listArticleSlugs } from "@/lib/blog/registry";
import { CATEGORY_TONE } from "@/lib/blog/schemas";
import { env } from "@/lib/env";

// Page détail article — un seul template paramétré, remplace l'ancien
// pattern 1 layout + 1 page.mdx PAR slug (cf. doc 09 § 2026-05-16).
// Charge dynamiquement le module MDX depuis `src/content/blog/[slug].mdx`
// (le frontmatter est lu séparément via registry, le composant React
// est rendu pour le contenu).
//
// Statique : `generateStaticParams` + `generateMetadata` permettent à
// Next.js de prerender chaque article en HTML pur au build (SSG).

interface Params {
  slug: string;
}

export function generateStaticParams() {
  return listArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  const url = `${env.NEXT_PUBLIC_APP_URL}/blog/${slug}`;
  const ogUrl = `${url}/opengraph-image`;
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    authors: [{ name: article.author }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.description,
      siteName: "Mamie GEO",
      locale: "fr_FR",
      publishedTime: `${article.date}T00:00:00.000Z`,
      authors: [article.author],
      images: [{ url: ogUrl, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [ogUrl],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  // Dynamic import — Next.js compile chaque .mdx en module React.
  // Le frontmatter est ignoré au render (remark-frontmatter le retire).
  const mod = await import(`@/content/blog/${slug}.mdx`);
  const ArticleBody = mod.default as React.ComponentType;

  const url = `${env.NEXT_PUBLIC_APP_URL}/blog/${slug}`;
  const ogUrl = `${url}/opengraph-image`;
  const baseUrl = env.NEXT_PUBLIC_APP_URL ?? "https://mamie-geo.fr";

  return (
    <article>
      <ReadingProgress />

      <ArticleJsonLd
        title={article.title}
        description={article.description}
        url={url}
        imageUrl={ogUrl}
        datePublished={article.date}
        authorName={article.author}
        publisherName="Mamie GEO"
        publisherLogoUrl={`${baseUrl}/icon.svg`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: baseUrl },
          { name: "Blog", url: `${baseUrl}/blog` },
          { name: article.title, url },
        ]}
      />

      {/* Header — titre + métadonnées */}
      <Section pad="lg">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="type-eyebrow inline-flex items-center hover:text-[color:var(--color-ink)]"
          >
            ← Tous les articles
          </Link>
          <div className="mt-8 flex items-center gap-3">
            <Badge tone={CATEGORY_TONE[article.category]}>{article.category}</Badge>
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

      {/* Contenu — TOC sticky desktop + corps article */}
      <Section pad="md">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[1fr_240px]">
          <div data-blog-content className="min-w-0 max-w-3xl">
            <ArticleBody />
            <ArticleCTA cta={article.cta} />
            <RelatedArticles slug={slug} />
          </div>
          {/* TOC affichée uniquement si article assez long (cf. composant). */}
          {article.readingTimeMin >= 6 ? (
            <aside className="hidden lg:block">
              <TOC />
            </aside>
          ) : null}
        </div>
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
