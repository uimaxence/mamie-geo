import type { ComponentType } from "react";
import { CoverSlide } from "@/components/admin/visuals/seo-vs-geo/cover-slide";
import { TableSlide } from "@/components/admin/visuals/seo-vs-geo/table-slide";
import { CtaSlide } from "@/components/admin/visuals/seo-vs-geo/cta-slide";
import { CoverSlide as GeminiCoverSlide } from "@/components/admin/visuals/etre-cite-par-gemini/cover-slide";
import { BotsSlide as GeminiBotsSlide } from "@/components/admin/visuals/etre-cite-par-gemini/bots-slide";
import { RobotsSlide as GeminiRobotsSlide } from "@/components/admin/visuals/etre-cite-par-gemini/robots-slide";
import { ExtractionSlide as GeminiExtractionSlide } from "@/components/admin/visuals/etre-cite-par-gemini/extraction-slide";
import { CtaSlide as GeminiCtaSlide } from "@/components/admin/visuals/etre-cite-par-gemini/cta-slide";

// Registry des visuels marketing (LinkedIn carousels, OG images, blog
// covers). Source de vérité pour /app/admin/visuals.
//
// Format carousel par défaut (cf. doc 09 § 2026-06-04) :
//   - Slide 01 : COVER HOOK (stat punchy, fond ink)
//   - Slide 02..N-1 : CONTENU (table, stats, comparaison, fond cream)
//   - Slide N : CTA Mamie GEO (test gratuit, fond bleu brand)
//
// Chaque slide reçoit `{ index, total }` automatiquement injectés par
// la page détail pour afficher `01 / N` sans hardcoder.

export interface VisualFormat {
  width: number;
  height: number;
  /** Étiquette d'usage (ex: "LinkedIn portrait", "Twitter 16:9"). */
  label: string;
}

export interface SlideMeta {
  /** Nom court de la slide (cover, table, cta…) — utilisé pour le filename PNG. */
  key: string;
  /** Libellé humain affiché en preview. */
  label: string;
  Component: ComponentType<{ index: number; total: number }>;
}

export interface VisualMeta {
  slug: string;
  title: string;
  description: string;
  format: VisualFormat;
  postedOn?: string;
  slides: SlideMeta[];
}

export const FORMATS = {
  linkedinPortrait: { width: 1080, height: 1350, label: "LinkedIn portrait" },
  linkedinSquare: { width: 1080, height: 1080, label: "LinkedIn carré" },
  ogImage: { width: 1200, height: 630, label: "Open Graph 1.91:1" },
} as const satisfies Record<string, VisualFormat>;

export const VISUALS: VisualMeta[] = [
  {
    slug: "seo-vs-geo-comparatif",
    title: "SEO vs GEO — Carousel 3 slides",
    description:
      "Carousel LinkedIn d'amplification de l'article geo-vs-seo : cover hook (40 % des prospects sur IA, fond ink) + table comparée 6 lignes (fond crème) + CTA test gratuit (fond bleu brand).",
    format: FORMATS.linkedinPortrait,
    postedOn: "2026-06-02",
    slides: [
      { key: "cover", label: "Cover hook (40 %)", Component: CoverSlide },
      { key: "table", label: "Tableau comparatif", Component: TableSlide },
      { key: "cta", label: "CTA test gratuit", Component: CtaSlide },
    ],
  },
  {
    slug: "etre-cite-par-gemini",
    title: "Être cité par Gemini — Carousel 5 slides",
    description:
      "Carousel LinkedIn d'amplification du post Gemini (2026-06-09), DA bleu nuit dédiée (hors persona chaude Mamie) : cover hook + schéma Googlebot ≠ Google-Extended + erreur robots.txt + 3 réflexes d'extraction + CTA guide complet. Accents vert (OK) / orange (attention).",
    format: FORMATS.linkedinPortrait,
    postedOn: "2026-06-09",
    slides: [
      { key: "cover", label: "Cover hook", Component: GeminiCoverSlide },
      { key: "bots", label: "Googlebot ≠ Google-Extended", Component: GeminiBotsSlide },
      { key: "robots", label: "Erreur robots.txt", Component: GeminiRobotsSlide },
      { key: "extraction", label: "3 réflexes d'extraction", Component: GeminiExtractionSlide },
      { key: "cta", label: "CTA guide complet", Component: GeminiCtaSlide },
    ],
  },
];

export function getVisual(slug: string): VisualMeta | null {
  return VISUALS.find((v) => v.slug === slug) ?? null;
}
