// Forme persistée dans runs.parsed_brands (jsonb). Sert de contrat
// stable entre le worker score_response (écriture), le worker
// recompute_metrics (lecture pour agrégation) et plus tard le dashboard
// (lecture pour affichage). Extrait dans un fichier dédié pour éviter
// le cycle d'imports score-response.ts ↔ metrics/visibility.ts.

import type { DetectedMention } from "./detect";
import type { ScoringResult } from "./score";

export interface ParsedBrandsPayload {
  detection: DetectedMention[];
  // soit le scoring LLM complet, soit un signal explicite que le scoring
  // a été skipé suite au pre-screening regex (raison stockée pour audit)
  scoring: ScoringResult | { skipped: true; reason: string };
  scoredAt: string;
}
