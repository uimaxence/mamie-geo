// V0+ : agrège le funnel sources (Apparition / Fréquence / Citation) sur
// les runs.success d'une fenêtre (brand × LLM × date). Calculé en
// parallèle de `aggregateVisibility` par `recomputeMetricsForBrandLLMDate`.
//
// Vocabulaire glossaire (doc 02 § Funnel sources V0+) :
//   - Apparition = retrievedCount / totalRuns
//   - Fréquence  = retrievalsTotal / retrievedCount  (si retrievedCount > 0)
//   - Citation   = citationsCount / retrievalsTotal  (si retrievalsTotal > 0)
//
// On stocke les compteurs bruts (pas les ratios) — la division est faite
// au rendu pour éviter les arrondis prématurés.

import type { LLMSource } from "@/lib/llm/types";
import type { ParsedBrandsPayload } from "@/lib/citation/types";
import { countBrandSources } from "@/lib/citation/source-match";

export interface FunnelRun {
  parsedCitations: LLMSource[] | null;
  parsedBrands: ParsedBrandsPayload | null;
}

export interface BrandRef {
  domain: string;
  aliases: readonly string[];
}

export interface SourcesFunnelAggregate {
  retrievedCount: number;
  retrievalsTotal: number;
  citationsCount: number;
}

export function aggregateSourcesFunnel(
  runs: readonly FunnelRun[],
  brand: BrandRef,
): SourcesFunnelAggregate {
  let retrievedCount = 0;
  let retrievalsTotal = 0;
  let citationsCount = 0;

  for (const run of runs) {
    const sources = run.parsedCitations ?? [];
    const { total, hasAny } = countBrandSources(sources, brand);

    if (hasAny) retrievedCount += 1;
    retrievalsTotal += total;

    // Citation = la marque apparaît dans les sources ET est citée
    // explicitement dans le texte (le LLM l'a effectivement mentionnée
    // dans sa réponse). `brandMentioned` vient du scoring LLM.
    const scoring = run.parsedBrands?.scoring;
    const isMentioned = scoring && "brandMentioned" in scoring && scoring.brandMentioned;
    if (hasAny && isMentioned) citationsCount += 1;
  }

  return { retrievedCount, retrievalsTotal, citationsCount };
}

/**
 * Calcule les 3 ratios dérivés à partir des compteurs bruts. Retourne
 * 0 quand le dénominateur est 0 (pas de division par zéro côté UI).
 *
 * Apparition + Citation en pourcentage [0, 100]. Fréquence en multiple
 * (1.0 = 1 apparition par réponse en moyenne).
 */
export function deriveSourcesFunnelRatios(input: {
  totalRuns: number;
  retrievedCount: number;
  retrievalsTotal: number;
  citationsCount: number;
}): {
  apparitionPct: number;
  frequence: number;
  citationPct: number;
} {
  const { totalRuns, retrievedCount, retrievalsTotal, citationsCount } = input;
  return {
    apparitionPct: totalRuns > 0 ? (retrievedCount / totalRuns) * 100 : 0,
    frequence: retrievedCount > 0 ? retrievalsTotal / retrievedCount : 0,
    citationPct: retrievalsTotal > 0 ? (citationsCount / retrievalsTotal) * 100 : 0,
  };
}
