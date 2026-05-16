import { z } from "zod";

// Schéma Zod du frontmatter YAML attendu en tête de chaque article
// `src/content/blog/*.mdx`. Validation au scan filesystem : un article
// mal formé fait crasher le build (mieux qu'un crash en prod).
//
// Catégories alignées sur l'ancien registry (cf. doc 10 § Patterns DA),
// mappées vers les tones Badge pour l'UI (cf. CATEGORY_TONE).

export const BLOG_CATEGORIES = ["Tutoriel", "Étude", "Méthodo", "Comparatif", "Actualité"] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_CTAS = ["solo", "starter", "pro", "audit-gratuit"] as const;
export type BlogCta = (typeof BLOG_CTAS)[number];

export const blogFrontmatterSchema = z.object({
  title: z.string().min(1, "title requis").max(200),
  description: z.string().min(20, "description trop courte (min 20 char.)").max(300),
  // ISO date YYYY-MM-DD (gray-matter renvoie une string ou un Date selon le YAML).
  date: z
    .union([z.string(), z.date()])
    .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
    .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date doit être YYYY-MM-DD")),
  category: z.enum(BLOG_CATEGORIES),
  author: z.string().min(1).default("Mamie GEO"),
  readingTimeMin: z.number().int().positive().max(60),
  keywords: z.array(z.string().min(1)).default([]),
  cta: z.enum(BLOG_CTAS).default("audit-gratuit"),
  draft: z.boolean().default(false),
});

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;

// Pill couleur par catégorie — réutilise les tones du composant Badge.
// Les valeurs doivent matcher l'enum `tone` de `<Badge>` (cf. badge.tsx).
export const CATEGORY_TONE: Record<BlogCategory, "blue" | "purple" | "green" | "orange" | "pink"> =
  {
    Tutoriel: "blue",
    Étude: "purple",
    Méthodo: "green",
    Comparatif: "orange",
    Actualité: "pink",
  };
