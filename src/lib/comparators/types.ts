// Types du scan comparateurs (/outils/comparateurs). Le moteur vérifie
// la présence d'une marque sur les comparateurs/annuaires que les IA
// citent réellement (cf. doc 11 : 32 % des sources = comparateurs).

export interface WebSearchResult {
  title: string;
  url: string;
  /** Hostname sans `www.` (ex: "lelynx.fr"). */
  domain: string;
}

/** Fonction de recherche web injectable (Brave en prod, fake en test). */
export type SearchFn = (query: string, count?: number) => Promise<WebSearchResult[]>;

export const SITE_TYPES = [
  "comparateur",
  "annuaire",
  "presse",
  "avis",
  "blog",
  "entreprise",
  "autre",
] as const;
export type SiteType = (typeof SITE_TYPES)[number];

export interface ComparatorCheck {
  domain: string;
  label: string;
  /** "etude" = mapping curaté issu de l'étude 50 marques, "recherche" = découvert en live. */
  origin: "etude" | "recherche";
  present: boolean;
  foundUrl?: string;
  foundTitle?: string;
  /** Classification Mistral Small (cf. enrich.ts) — absente si l'enrichissement a échoué. */
  siteType?: SiteType;
  /** Conseil d'inclusion d'une phrase, personnalisé par site (Mistral Small). */
  inclusionHint?: string;
}

/** Site d'entreprise (concurrent probable) repéré dans la découverte —
 * exclu des checks de présence (un concurrent ne cite pas ta marque sur
 * son site) mais affiché comme signal concurrentiel → CTA app. */
export interface CompetitorSpotted {
  domain: string;
  label: string;
  url: string;
  title: string;
}

export interface ComparatorScanReport {
  brand: string;
  sector: string;
  /** Ville/zone si le prospect vise une visibilité locale. */
  location?: string;
  checks: ComparatorCheck[];
  presentCount: number;
  totalChecked: number;
  /** presentCount / totalChecked en % entier. */
  scorePct: number;
  /** Concurrents probables qui rankent sur les mêmes recherches. */
  competitorsSpotted: CompetitorSpotted[];
  fetchedAt: string; // ISO
}

export type ComparatorScanErrorCode =
  | "invalid_input"
  | "rate_limited"
  | "search_unavailable"
  | "no_comparators";

export type ComparatorScanResult =
  | { ok: true; report: ComparatorScanReport }
  | { ok: false; code: ComparatorScanErrorCode; message: string };
