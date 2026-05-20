import { ImageResponse } from "next/og";
import { getArticleBySlug, listArticleSlugs } from "@/lib/blog/registry";
import { CATEGORY_TONE } from "@/lib/blog/schemas";

// OG image dynamique générée au build pour chaque article. Format
// Twitter/OG standard 1200×630. Pas de webfont (charge longue), on
// utilise system-ui pour rester rapide et lisible.
//
// Next.js gère le caching et la génération via le pattern conventionnel
// `opengraph-image.tsx` colocalisé avec la route paramétrée.

export const alt = "Mamie GEO, article du blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateImageMetadata() {
  return listArticleSlugs().map((slug) => ({ id: slug, alt: `Mamie GEO, ${slug}` }));
}

const CATEGORY_COLOR_HEX: Record<keyof typeof CATEGORY_TONE, string> = {
  Tutoriel: "#2563eb",
  Étude: "#7c3aed",
  Méthodo: "#16a34a",
  Comparatif: "#ea580c",
  Actualité: "#db2777",
};

export default async function Image({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  const title = article?.title ?? "Mamie GEO";
  const category = article?.category ?? "Méthodo";
  const date = article ? formatDate(article.date) : "";
  const categoryColor = CATEGORY_COLOR_HEX[category];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#fafafa",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
      }}
    >
      {/* Halo gradient ambient discret en haut à droite */}
      <div
        style={{
          position: "absolute",
          top: -160,
          right: -160,
          width: 640,
          height: 640,
          borderRadius: "50%",
          background: `radial-gradient(circle at center, ${categoryColor}22 0%, transparent 60%)`,
        }}
      />

      {/* Header : badge catégorie + logo Mamie GEO */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 20px",
            borderRadius: 999,
            background: `${categoryColor}22`,
            color: categoryColor,
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          {category}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 24,
            fontWeight: 600,
            color: "#171717",
          }}
        >
          <span
            style={{
              display: "flex",
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#329cff",
              color: "#fff",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            M
          </span>
          Mamie GEO
        </div>
      </div>

      {/* Titre */}
      <div
        style={{
          display: "flex",
          fontSize: title.length > 60 ? 56 : 72,
          fontWeight: 700,
          color: "#0a0a0a",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </div>

      {/* Footer : date + URL */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#737373",
          fontSize: 22,
        }}
      >
        <span>{date}</span>
        <span>mamie-geo.fr/blog</span>
      </div>
    </div>,
    { ...size },
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
