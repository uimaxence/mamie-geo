import type { ParsedBrandsPayload } from "@/lib/citation/types";
import { aggregateVisibility } from "@/lib/metrics/visibility";

// Agrégation des métriques analytics d'UN prompt sur une fenêtre, à partir
// de ses runs déjà persistés (runs.parsedBrands). Fonction pure, sans I/O,
// pour rester testable et réutilisable côté liste (page Prompts) comme côté
// widget (carte « Mentions récentes » du dashboard).
//
// Aucune métrique n'invente de donnée absente du scoring : on ne fait que
// replier ce que le worker score_response a déjà calculé.

const TOP_COMPETITORS_LIMIT = 3;

export interface PromptRunForMetrics {
  /** scheduledAt sert de clé de jour (UTC) — toujours présent. */
  scheduledAt: Date;
  /** Dernier instant d'exécution effective, null si jamais exécuté. */
  executedAt: Date | null;
  parsedBrands: ParsedBrandsPayload | null;
}

export interface PromptTopCompetitor {
  name: string;
  citationCount: number;
}

export interface PromptMetrics {
  /**
   * Rang de la marque par fréquence de citation parmi toutes les marques
   * citées sur ce prompt (marque + concurrents). `1` = la plus citée.
   * `null` si la marque n'est jamais citée sur la fenêtre.
   */
  rang: number | null;
  /** Score visibilité 0-100 (position × sentiment), cf. visibility.ts. */
  visibilityScore: number;
  /** Nombre de runs où la marque est citée. */
  mentions: number;
  /** Nombre total de runs (inclut les runs où la marque est absente). */
  totalRuns: number;
  /** Top 3 concurrents par nombre de citations sur la fenêtre. */
  topCompetitors: PromptTopCompetitor[];
  /**
   * Constance dans le temps : part des jours-avec-run où la marque a été
   * citée au moins une fois (0-100). Distinct de la visibilité.
   */
  persistance: number;
  /** Date du dernier run exécuté (max executedAt), null si aucun. */
  lastAnalyzedAt: Date | null;
}

/**
 * Replie les runs d'un prompt en un jeu de métriques analytics.
 * Les runs passés doivent appartenir au même prompt et à la fenêtre voulue
 * (le filtrage temporel se fait en amont, côté query).
 */
export function aggregatePromptMetrics(runs: readonly PromptRunForMetrics[]): PromptMetrics {
  const visibility = aggregateVisibility(runs);
  const mentions = visibility.brandCitedCount;

  // Rang : nb de concurrents strictement plus cités que la marque, +1.
  // Si la marque n'est jamais citée, pas de rang pertinent.
  const rang =
    mentions === 0
      ? null
      : 1 + visibility.competitorsData.filter((c) => c.citationCount > mentions).length;

  const topCompetitors = visibility.competitorsData
    .slice(0, TOP_COMPETITORS_LIMIT)
    .map((c) => ({ name: c.name, citationCount: c.citationCount }));

  // Persistance : jours distincts (UTC) où la marque est citée / jours
  // distincts avec au moins un run.
  const runDays = new Set<string>();
  const citedDays = new Set<string>();
  let lastAnalyzedAt: Date | null = null;

  for (const run of runs) {
    const day = run.scheduledAt.toISOString().slice(0, 10);
    runDays.add(day);

    const scoring = run.parsedBrands?.scoring;
    if (scoring && !("skipped" in scoring) && scoring.brandMentioned) {
      citedDays.add(day);
    }

    if (run.executedAt && (!lastAnalyzedAt || run.executedAt > lastAnalyzedAt)) {
      lastAnalyzedAt = run.executedAt;
    }
  }

  const persistance = runDays.size === 0 ? 0 : Math.round((citedDays.size / runDays.size) * 100);

  return {
    rang,
    visibilityScore: visibility.visibilityScore,
    mentions,
    totalRuns: visibility.totalRuns,
    topCompetitors,
    persistance,
    lastAnalyzedAt,
  };
}
