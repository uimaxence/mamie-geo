import type { LLMValue } from "@/lib/llm";
import type { ParsedBrandsPayload } from "@/lib/citation/types";
import type { ScoringSentiment } from "@/lib/citation/score";

// Logique pure de groupement runs → batches. Pas d'import DB ici pour
// rester testable sans `DATABASE_URL` (cf. batches.test.ts).
// La query DB elle-même vit dans batches.ts, qui appelle cette fonction.

/**
 * Sentiment normalisé pour la couche UI :
 * - "positive" | "neutral" | "negative" : scoring abouti, marque citée
 * - "absent" : scoring abouti mais marque non citée par ce LLM
 * - "skipped" : pre-screening regex 0 → on n'a pas appelé le scoring
 * - "unscored" : pas de payload parsedBrands en DB (run pas encore scoré)
 */
export type BatchEntrySentiment = ScoringSentiment | "absent" | "skipped" | "unscored";

/**
 * Sentiment agrégé d'un batch (majorité simple parmi les runs success cités).
 * - "mixed" : aucune majorité stricte (>50%)
 * - "absent" : marque non citée par aucun LLM scoré du batch
 * - null : aucun scoring exploitable
 */
export type BatchDominantSentiment = ScoringSentiment | "absent" | "mixed" | null;

export interface RunBatchEntry {
  id: string;
  llm: LLMValue;
  status: string;
  costUsd: number | null;
  durationMs: number | null;
  executedAt: Date | null;
  scheduledAt: Date;
  brandMentioned: boolean | "skipped" | "unscored";
  brandSentiment: BatchEntrySentiment;
  cacheHit: boolean;
}

export interface RunBatch {
  /** Clé React stable : `${promptId}:${scheduledDate}` */
  key: string;
  promptId: string;
  promptText: string;
  /** Date UTC du batch (YYYY-MM-DD) */
  scheduledDate: string;
  /** Timestamp le plus tardif parmi les runs (pour tri + affichage relatif) */
  latestScheduledAt: Date;
  /** Plus récent executedAt parmi les runs, null si aucun n'a executé */
  latestExecutedAt: Date | null;
  summary: {
    totalRuns: number;
    succeededCount: number;
    failedCount: number;
    skippedCount: number;
    pendingCount: number;
    /** brandMentioned === true */
    citedCount: number;
    costSumUsd: number;
    /** Moyenne sur les runs avec durationMs non null, null si aucun */
    durationAvgMs: number | null;
    /**
     * Sentiment dominant des LLMs ayant cité la marque dans ce batch.
     * Calculé en post-aggregation (cf. computeDominantSentiment).
     */
    dominantBrandSentiment: BatchDominantSentiment;
  };
  /** Détail par LLM, ordre fixe selon LLM_ORDER */
  runs: RunBatchEntry[];
}

/**
 * Forme attendue par {@link groupRunsIntoBatches} pour une row run brute.
 * Les types matchent ce que retourne le `db.select(...)` dans batches.ts.
 */
export interface RawRunRow {
  id: string;
  promptId: string;
  promptText: string;
  llm: string;
  status: string;
  costUsd: string | null;
  durationMs: number | null;
  scheduledAt: Date;
  executedAt: Date | null;
  cacheHit: boolean;
  parsedBrands: unknown;
}

// Ordre canonique d'affichage des LLMs (matche LLM_LABELS dans
// src/components/charts/llm-colors.ts). ChatGPT en 1 parce que le plus
// connu côté grand public, Le Chat en 5 parce qu'on le surface ailleurs
// comme USP FR.
export const LLM_ORDER: LLMValue[] = ["chatgpt", "claude", "perplexity", "gemini", "lechat"];

const LLM_ORDER_INDEX: Record<LLMValue, number> = {
  chatgpt: 0,
  claude: 1,
  perplexity: 2,
  gemini: 3,
  lechat: 4,
};

/**
 * Logique pure de groupement runs → batches. Group par
 * `(promptId, scheduledDate UTC)`, aggrège, trie par latestScheduledAt
 * DESC, slice à `limit` batches.
 */
export function groupRunsIntoBatches(rawRuns: RawRunRow[], limit: number): RunBatch[] {
  const batchesMap = new Map<string, RunBatch>();
  for (const r of rawRuns) {
    const scheduledDate = toUtcDate(r.scheduledAt);
    const key = `${r.promptId}:${scheduledDate}`;
    let batch = batchesMap.get(key);
    if (!batch) {
      batch = {
        key,
        promptId: r.promptId,
        promptText: r.promptText,
        scheduledDate,
        latestScheduledAt: r.scheduledAt,
        latestExecutedAt: null,
        summary: {
          totalRuns: 0,
          succeededCount: 0,
          failedCount: 0,
          skippedCount: 0,
          pendingCount: 0,
          citedCount: 0,
          costSumUsd: 0,
          durationAvgMs: null,
          dominantBrandSentiment: null,
        },
        runs: [],
      };
      batchesMap.set(key, batch);
    }

    if (r.scheduledAt > batch.latestScheduledAt) {
      batch.latestScheduledAt = r.scheduledAt;
    }
    if (r.executedAt && (!batch.latestExecutedAt || r.executedAt > batch.latestExecutedAt)) {
      batch.latestExecutedAt = r.executedAt;
    }

    const parsed = r.parsedBrands as ParsedBrandsPayload | null;
    let brandMentioned: RunBatchEntry["brandMentioned"];
    let brandSentiment: BatchEntrySentiment;
    if (!parsed) {
      brandMentioned = "unscored";
      brandSentiment = "unscored";
    } else if ("skipped" in parsed.scoring) {
      brandMentioned = "skipped";
      brandSentiment = "skipped";
    } else {
      brandMentioned = parsed.scoring.brandMentioned;
      brandSentiment = parsed.scoring.brandSentiment;
    }

    batch.runs.push({
      id: r.id,
      llm: r.llm as LLMValue,
      status: r.status,
      costUsd: r.costUsd ? Number(r.costUsd) : null,
      durationMs: r.durationMs,
      executedAt: r.executedAt,
      scheduledAt: r.scheduledAt,
      brandMentioned,
      brandSentiment,
      cacheHit: r.cacheHit,
    });

    batch.summary.totalRuns += 1;
    if (r.status === "success") batch.summary.succeededCount += 1;
    else if (r.status === "failed") batch.summary.failedCount += 1;
    else if (r.status === "skipped") batch.summary.skippedCount += 1;
    else if (r.status === "pending" || r.status === "running") batch.summary.pendingCount += 1;
    if (brandMentioned === true) batch.summary.citedCount += 1;
    if (r.costUsd) batch.summary.costSumUsd += Number(r.costUsd);
  }

  for (const batch of batchesMap.values()) {
    const durations = batch.runs.map((r) => r.durationMs).filter((d): d is number => d !== null);
    batch.summary.durationAvgMs =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null;

    batch.summary.dominantBrandSentiment = computeDominantSentiment(batch.runs);

    batch.runs.sort((a, b) => (LLM_ORDER_INDEX[a.llm] ?? 999) - (LLM_ORDER_INDEX[b.llm] ?? 999));
  }

  return Array.from(batchesMap.values())
    .sort((a, b) => b.latestScheduledAt.getTime() - a.latestScheduledAt.getTime())
    .slice(0, limit);
}

/**
 * Convertit un timestamp en date UTC YYYY-MM-DD pour le group key.
 * UTC parce que le scheduling cron Vercel utilise UTC — éviter les
 * bugs DST côté client.
 */
function toUtcDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Calcule le sentiment dominant parmi les runs où la marque est citée.
 * Majorité stricte (>50%) requise sinon "mixed". Si aucun run cité
 * avec sentiment exploitable → "absent" (ou null si zéro scoring).
 */
function computeDominantSentiment(runs: RunBatchEntry[]): BatchDominantSentiment {
  const scoredSentiments = runs
    .filter((r) => r.brandMentioned === true)
    .map((r) => r.brandSentiment)
    .filter((s): s is ScoringSentiment => s === "positive" || s === "neutral" || s === "negative");

  // Vérifie qu'il y a au moins un scoring abouti (cité ou non) pour
  // distinguer "absent" (scored, pas cité) de null (aucun scoring).
  const hasAnyScoring = runs.some((r) => r.brandMentioned === true || r.brandMentioned === false);
  if (!hasAnyScoring) return null;

  if (scoredSentiments.length === 0) return "absent";

  const counts = { positive: 0, neutral: 0, negative: 0 };
  for (const s of scoredSentiments) counts[s]++;
  const max = Math.max(counts.positive, counts.neutral, counts.negative);

  // Majorité stricte requise (>50%) — sinon mixed pour rester honnête.
  if (max <= scoredSentiments.length / 2) return "mixed";

  if (counts.positive === max) return "positive";
  if (counts.neutral === max) return "neutral";
  return "negative";
}
