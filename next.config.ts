import createMDX from "@next/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Routes `.mdx` traitées comme des pages App Router. cf. PR 10a.
  pageExtensions: ["ts", "tsx", "mdx"],
  // Requis par PostHog pour les trailing slash des API requests.
  skipTrailingSlashRedirect: true,
  // Reverse proxy PostHog EU — réduit le blocage par les ad-blockers.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://eu-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  // Empêche l'indexation des domaines techniques *.vercel.app (preview ET
  // production auto-assignés type `mamie-geo.vercel.app`). Vercel ne pose
  // PAS de noindex sur les .vercel.app de production → sans ça, Google peut
  // indexer un clone complet du site en doublon du domaine canonique
  // mamie-geo.fr. Le seul host indexable est mamie-geo.fr.
  // cf. doc 09 § 2026-06-10 (audit indexation GSC).
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "(.*\\.)?vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
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

// MDX pipeline — ajouté 2026-05-16 (cf. doc 09 § Sprint 2 blog) :
//   - remark-frontmatter : reconnait + RETIRE le YAML du contenu rendu
//     (sinon il serait rendu comme texte brut au top de chaque article)
//   - remark-gfm : tables, strikethrough, autolinks markdown
//   - rehype-slug : id auto sur h1/h2/h3 (basé sur le texte)
//   - rehype-autolink-headings (behavior: wrap) : ajoute un <a> autour
//     du heading avec classe `.heading-anchor` pour styler une icône
//     lien au hover (cf. globals.css)
const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkFrontmatter, remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: { className: "heading-anchor" },
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
