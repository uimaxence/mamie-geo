import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// robots.txt généré dynamiquement, `/robots.txt` via convention App
// Router. Indexable partout sauf les zones privées (app, api, debug).

const BASE_URL = env.NEXT_PUBLIC_APP_URL ?? "https://mamie-geo.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/app/", // espace authentifié, pas d'intérêt SEO
          "/api/", // endpoints API
          "/login", // login obligatoire
          "/styleguide", // référence interne design system
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
