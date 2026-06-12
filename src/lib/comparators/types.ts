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

export interface ComparatorCheck {
  domain: string;
  label: string;
  /** "etude" = mapping curaté issu de l'étude 50 marques, "recherche" = découvert en live. */
  origin: "etude" | "recherche";
  present: boolean;
  foundUrl?: string;
  foundTitle?: string;
}

export interface ComparatorScanReport {
  brand: string;
  sector: string;
  checks: ComparatorCheck[];
  presentCount: number;
  totalChecked: number;
  /** presentCount / totalChecked en % entier. */
  scorePct: number;
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
