import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { brands, prompts, runs } from "@/db/schema";
import {
  groupRunsIntoBatches,
  type RawRunRow,
  type RunBatch,
} from "./batches-grouping";

// Aggrégation runs en « batches » (prompt × jour). 1 batch = 1 exécution
// du prompt sur tous les LLMs configurés pour le workspace (typiquement
// 5 en Phase C : ChatGPT, Claude, Perplexity, Gemini, Le Chat).
//
// Pourquoi : avec 5 LLMs, le tableau « 1 ligne = 1 run » devient
// illisible (50 lignes pour 10 batches). On surface 1 ligne = 1 batch
// dépliable pour voir le détail par LLM (cf. doc 02 § V0+ refonte UX).
//
// La logique pure de grouping vit dans batches-grouping.ts (testable
// sans DB). Ici on fait juste la query + on délègue.

// Re-exports pour que les consommateurs n'aient pas à connaître la
// séparation interne entre query et grouping.
export type { RunBatch, RunBatchEntry, RawRunRow } from "./batches-grouping";
export { LLM_ORDER } from "./batches-grouping";

export interface GetRunBatchesParams {
  /** Filtre par brand (dashboard). Mutuellement exclusif avec promptId. */
  brandId?: string;
  /** Filtre par prompt (page détail prompt). Mutuellement exclusif avec brandId. */
  promptId?: string;
  /** Nombre max de batches à retourner (défaut 10) */
  limit?: number;
}

/**
 * Récupère les N derniers batches de runs pour une brand ou un prompt.
 *
 * Stratégie : on récupère un superset large de runs récents (limit × 5 +
 * marge), on groupe par (promptId, scheduledDate UTC) côté JS, puis on
 * retourne les N premiers batches triés par latestScheduledAt DESC.
 *
 * Couvre tous les statuts (pending / running / success / failed / skipped)
 * — le batch existe dès qu'au moins un run est en queue.
 */
export async function getRunBatches(params: GetRunBatchesParams): Promise<RunBatch[]> {
  const limit = params.limit ?? 10;
  if (!params.brandId && !params.promptId) {
    throw new Error("getRunBatches: au moins brandId ou promptId doit être fourni");
  }

  // Superset : on prend ~limit × 5 + 10 runs pour s'assurer de couvrir
  // N batches même si certains ont moins que 5 LLMs (provider en down,
  // skip cache, etc.). Le surplus est jeté au slice final.
  const fetchLimit = limit * 5 + 10;

  const whereClause = params.promptId
    ? eq(runs.promptId, params.promptId)
    : and(eq(brands.id, params.brandId!), eq(prompts.brandId, brands.id));

  const rawRuns: RawRunRow[] = await db
    .select({
      id: runs.id,
      promptId: runs.promptId,
      promptText: prompts.text,
      llm: runs.llm,
      status: runs.status,
      costUsd: runs.costUsd,
      durationMs: runs.durationMs,
      scheduledAt: runs.scheduledAt,
      executedAt: runs.executedAt,
      cacheHit: runs.cacheHit,
      parsedBrands: runs.parsedBrands,
    })
    .from(runs)
    .innerJoin(prompts, eq(prompts.id, runs.promptId))
    .innerJoin(brands, eq(brands.id, prompts.brandId))
    .where(whereClause)
    .orderBy(desc(runs.scheduledAt))
    .limit(fetchLimit);

  return groupRunsIntoBatches(rawRuns, limit);
}
