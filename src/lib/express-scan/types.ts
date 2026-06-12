// Types du scan express visibilité IA (/outils/test-visibilite-ia).
// 3 prompts templates × 1 LLM (Le Chat / mistral-small) en live, le
// reste des 5 IA est verrouillé → CTA trial. Cf. doc 06 § n°1bis et
// doc 09 § 2026-06-12.

export type ExpressPosition = "debut" | "milieu" | "fin";

export interface ExpressPromptResult {
  /** La question posée à l'IA, affichée telle quelle au prospect. */
  prompt: string;
  cited: boolean;
  /** Position de la 1re mention quand cited — null sinon. */
  position: ExpressPosition | null;
  /** Marques citées par l'IA dans la réponse (extraction Mistral, best effort). */
  brandsCited: string[];
}

export interface ExpressScanReport {
  brand: string;
  sector: string;
  /** Ville/zone si le prospect vise une visibilité locale. */
  location?: string;
  /** LLM réellement interrogé (V0 : Le Chat via mistral-small). */
  llmLabel: string;
  results: ExpressPromptResult[];
  citedCount: number;
  totalPrompts: number;
  fetchedAt: string; // ISO
}

export type ExpressScanErrorCode = "invalid_input" | "rate_limited" | "llm_unavailable";

export type ExpressScanResult =
  | { ok: true; report: ExpressScanReport }
  | { ok: false; code: ExpressScanErrorCode; message: string };
