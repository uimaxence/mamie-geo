import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Routes `.mdx` traitées comme des pages App Router. cf. PR 10a.
  pageExtensions: ["ts", "tsx", "mdx"],
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

const withMDX = createMDX({
  // Pas de plugin remark/rehype pour V0 — on garde le pipeline minimal.
  // À ajouter en PR 10b si besoin : rehype-slug (anchors), rehype-pretty-code
  // (syntax highlighting), remark-gfm (tables, strikethrough).
});

export default withMDX(nextConfig);
