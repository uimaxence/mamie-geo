import type { ScoringPosition, ScoringSentiment } from "@/lib/citation/score";
import type { ParsedBrandsPayload } from "@/lib/citation/types";

// Formule de visibility_score V0 — pondère chaque mention par position
// dans la réponse + sentiment. Score 0-100 où 100 = toutes les runs
// mentionnent la marque en premier paragraphe avec sentiment positif.
//
// À itérer en Phase B+ avec données réelles (cf. doc 03 § 656 sur les
// hypothèses de coût et la stratégie d'amélioration). On peut décider
// plus tard d'ajouter share-of-voice vs concurrents, ou un poids par
// LLM (Claude vs ChatGPT n'ont pas le même reach utilisateur).

export const POSITION_WEIGHT: Record<ScoringPosition, number> = {
  first_paragraph: 3,
  middle: 2,
  end: 1,
  absent: 0,
};

export const SENTIMENT_WEIGHT: Record<ScoringSentiment | "absent", number> = {
  positive: 1.5,
  neutral: 1,
  negative: 0.5,
  absent: 0,
};

// Mention parfaite : first_paragraph + positive → 3 × 1.5 = 4.5
const MAX_WEIGHT_PER_RUN = 4.5;

export interface RunScoring {
  // Le contenu de runs.parsedBrands tel que persisté par scoreResponse.
  // null si le scoring n'a pas encore tourné.
  parsedBrands: ParsedBrandsPayload | null;
}

export interface VisibilityAggregate {
  totalRuns: number;
  brandCitedCount: number;
  // Score 0-100, deux décimales (compatible decimal(5,2) du schéma)
  visibilityScore: number;
  competitorsData: CompetitorAggregate[];
}

export interface CompetitorAggregate {
  name: string;
  citationCount: number;
  // Counts par sentiment, somme = citationCount
  sentiments: Record<ScoringSentiment, number>;
}

/**
 * Agrège un ensemble de runs (typiquement même brand × même LLM × même
 * date) en un VisibilityAggregate. Inclut les runs sans scoring (skipped
 * ou pending) en `totalRuns` mais 0 en weight.
 */
export function aggregateVisibility(runs: readonly RunScoring[]): VisibilityAggregate {
  const totalRuns = runs.length;
  let totalWeight = 0;
  let brandCitedCount = 0;
  const competitorsByName = new Map<string, CompetitorAggregate>();

  for (const run of runs) {
    const scoring = run.parsedBrands?.scoring;
    if (!scoring || "skipped" in scoring) continue;

    if (scoring.brandMentioned) {
      brandCitedCount += 1;
      const positionWeight = POSITION_WEIGHT[scoring.brandPosition];
      const sentimentWeight = SENTIMENT_WEIGHT[scoring.brandSentiment];
      totalWeight += positionWeight * sentimentWeight;
    }

    for (const mention of scoring.competitorsMentioned) {
      const existing =
        competitorsByName.get(mention.name) ??
        ({
          name: mention.name,
          citationCount: 0,
          sentiments: { positive: 0, neutral: 0, negative: 0 },
        } satisfies CompetitorAggregate);
      existing.citationCount += 1;
      existing.sentiments[mention.sentiment] += 1;
      competitorsByName.set(mention.name, existing);
    }
  }

  const visibilityScore =
    totalRuns === 0 ? 0 : roundTo2((totalWeight / (totalRuns * MAX_WEIGHT_PER_RUN)) * 100);

  return {
    totalRuns,
    brandCitedCount,
    visibilityScore,
    competitorsData: [...competitorsByName.values()].sort(
      (a, b) => b.citationCount - a.citationCount,
    ),
  };
}

function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}
