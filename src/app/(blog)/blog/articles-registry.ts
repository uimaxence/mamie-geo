// Registry manuel des articles publiés. À mettre à jour à la main quand
// un nouveau .mdx est ajouté dans /src/app/(blog)/blog/<slug>/page.mdx.
// V0 : 3 articles plus le lead magnet. À 20+ articles on passera à un
// scan filesystem ou un content-collection (contentlayer/velite).

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  // ISO date YYYY-MM-DD pour l'affichage et le tri
  date: string;
  // Catégorie pour les pills colorés (cf. doc 10 § Patterns DA)
  category: "Tutoriel" | "Étude" | "Méthodo" | "Comparatif" | "Actualité";
  // Auteur (V0 = un seul auteur, Max)
  author: string;
  // Estimation temps de lecture en minutes
  readingTimeMin: number;
}

export const ARTICLES: ArticleMeta[] = [
  {
    slug: "qu-est-ce-que-le-geo",
    title: "Qu'est-ce que le GEO (Generative Engine Optimization) ?",
    description:
      "Définition, enjeux et méthode du GEO en 2026 — la discipline qui consiste à optimiser ta visibilité dans les réponses des IA génératives, à côté du SEO classique.",
    date: "2026-05-11",
    category: "Méthodo",
    author: "Maxence Cailleau",
    readingTimeMin: 8,
  },
];

export function getArticleBySlug(slug: string): ArticleMeta | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

// Pill couleur par catégorie — réutilise les tones du composant Badge.
export const CATEGORY_TONE: Record<ArticleMeta["category"], string> = {
  Tutoriel: "blue",
  Étude: "purple",
  Méthodo: "green",
  Comparatif: "orange",
  Actualité: "pink",
};
