import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Redirect défensif mamie-seo.fr → mamie-geo.fr (le redirect principal
  // est configuré DNS-level via Vercel Domains ; ce hook est un filet de
  // sécurité au cas où une requête atteindrait l'app avec le mauvais host).
  // cf. geo-project/09-decisions-journal.md décision du 2026-05-05.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "mamie-seo.fr" }],
        destination: "https://mamie-geo.fr/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.mamie-seo.fr" }],
        destination: "https://mamie-geo.fr/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
