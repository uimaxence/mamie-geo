import type { MetadataRoute } from "next";
import { listArticles } from "@/lib/blog/registry";
import { env } from "@/lib/env";

// Sitemap dynamique, généré au build à partir du registry blog +
// routes statiques connues. Génère `/sitemap.xml` auto via la
// convention Next.js App Router.
//
// Mise à jour automatique quand un .mdx est ajouté à `src/content/blog/`.

const BASE_URL = env.NEXT_PUBLIC_APP_URL ?? "https://mamie-geo.fr";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/outils/test-visibilite-ia", priority: 0.7, changeFrequency: "monthly" },
  { path: "/outils/audit-technique", priority: 0.7, changeFrequency: "monthly" },
  { path: "/legal/cgu", priority: 0.3, changeFrequency: "monthly" },
  { path: "/legal/privacy", priority: 0.3, changeFrequency: "monthly" },
  { path: "/legal/mentions", priority: 0.3, changeFrequency: "monthly" },
  { path: "/legal/dpa", priority: 0.3, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const articleEntries: MetadataRoute.Sitemap = listArticles().map((article) => ({
    url: `${BASE_URL}/blog/${article.slug}`,
    lastModified: new Date(`${article.date}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...articleEntries];
}
