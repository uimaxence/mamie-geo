import type { ComponentType } from "react";
import { SeoVsGeoVisual } from "@/components/admin/visuals/seo-vs-geo-visual";

// Registry des visuels marketing (LinkedIn, OG images, blog covers).
// Source de vérité pour /app/admin/visuals. Ajouter une nouvelle entrée
// ici suffit à la faire apparaître dans l'index + la rendre téléchargeable
// au format défini.

export interface VisualFormat {
  width: number;
  height: number;
  /** Étiquette d'usage (ex: "LinkedIn portrait", "Twitter 16:9"). */
  label: string;
}

export interface VisualMeta {
  slug: string;
  title: string;
  description: string;
  format: VisualFormat;
  postedOn?: string;
  Component: ComponentType;
}

export const FORMATS = {
  linkedinPortrait: { width: 1080, height: 1350, label: "LinkedIn portrait" },
  linkedinSquare: { width: 1080, height: 1080, label: "LinkedIn carré" },
  ogImage: { width: 1200, height: 630, label: "Open Graph 1.91:1" },
} as const satisfies Record<string, VisualFormat>;

export const VISUALS: VisualMeta[] = [
  {
    slug: "seo-vs-geo-comparatif",
    title: "SEO vs GEO — Tableau comparatif",
    description:
      "Tableau 6 lignes côté SEO (gris) vs GEO (bleu brand), bandeau bas '~80 % des signaux sont communs'. Post LinkedIn d'amplification de l'article geo-vs-seo.",
    format: FORMATS.linkedinPortrait,
    postedOn: "2026-06-02",
    Component: SeoVsGeoVisual,
  },
];

export function getVisual(slug: string): VisualMeta | null {
  return VISUALS.find((v) => v.slug === slug) ?? null;
}
