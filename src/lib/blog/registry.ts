import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { blogFrontmatterSchema, type BlogFrontmatter } from "./schemas";

// Registry filesystem — remplace l'ancien `articles-registry.ts` hardcodé
// (cf. doc 09 § 2026-05-16). Scanne `src/content/blog/*.mdx`, parse
// le frontmatter YAML via gray-matter, valide via Zod et expose une
// API stable pour la page liste et la page détail.
//
// Le rendu MDX (composant React) est chargé séparément via dynamic
// import dans la route détail — ici on travaille uniquement avec
// le frontmatter + slug pour rester rapide et synchrone.
//
// `cache()` mémoïse par requête HTTP — appelé dans `sitemap.ts`,
// la page liste, la page détail sans surcoût filesystem.

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "blog");

export interface Article extends BlogFrontmatter {
  slug: string;
}

function parseArticleFile(filePath: string): Article | null {
  const slug = path.basename(filePath, ".mdx");
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  const parsed = blogFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    // Crash build plutôt que silencer — un article mal formé doit être
    // visible immédiatement.
    const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    throw new Error(`Frontmatter invalide dans ${slug}.mdx — ${errors}`);
  }
  return { slug, ...parsed.data };
}

/** Liste tous les articles publiés (filtre draft), triés par date DESC. */
export const listArticles = cache((): Article[] => {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx") && !f.startsWith("_"));
  const articles = files
    .map((f) => parseArticleFile(path.join(CONTENT_DIR, f)))
    .filter((a): a is Article => a !== null && !a.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
  return articles;
});

/** Liste tous les slugs publiés — utilisé par generateStaticParams. */
export const listArticleSlugs = cache((): string[] => listArticles().map((a) => a.slug));

/** Retourne un article par slug, ou null s'il n'existe pas ou est draft. */
export const getArticleBySlug = cache((slug: string): Article | null => {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const article = parseArticleFile(filePath);
  if (!article || article.draft) return null;
  return article;
});

/**
 * Retourne `max` articles liés au slug donné.
 * Tri : priorité au même `category`, ensuite overlap de `keywords`,
 * puis fallback aux plus récents. Exclut l'article courant.
 */
export const getRelatedArticles = cache((slug: string, max = 3): Article[] => {
  const all = listArticles().filter((a) => a.slug !== slug);
  const current = getArticleBySlug(slug);
  if (!current) return all.slice(0, max);

  // Score chaque article : +10 même catégorie, +3 par keyword en commun.
  const currentKeywords = new Set(current.keywords.map((k) => k.toLowerCase()));
  const scored = all.map((a) => {
    let score = 0;
    if (a.category === current.category) score += 10;
    for (const k of a.keywords) {
      if (currentKeywords.has(k.toLowerCase())) score += 3;
    }
    return { article: a, score };
  });
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.article.date.localeCompare(a.article.date);
  });
  return scored.slice(0, max).map((s) => s.article);
});
