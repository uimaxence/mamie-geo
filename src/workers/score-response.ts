import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { brands, competitors, prompts, runs, usageCounters } from "@/db/schema";
import { detectMentions, shouldScoreWithLLM, type MentionTarget } from "@/lib/citation/detect";
import { createAnthropicScoringClient, type ScoringClient } from "@/lib/citation/score";
import type { ParsedBrandsPayload } from "@/lib/citation/types";
import { env } from "@/lib/env";
import { recomputeMetricsForBrandLLMDate } from "@/lib/metrics/recompute";
import type { LLMValue } from "@/lib/llm";
import type { ScoreResponsePayload } from "./score-response-payload";

export { parseScoreResponsePayload, type ScoreResponsePayload } from "./score-response-payload";

// Worker score_response — étape 2 du pipeline (cf. doc 03 § 690).
//
// Flow :
//   1. Load run.success → prompt → brand + concurrents
//   2. Pre-screening regex (detectMentions, gratuit). Si 0 mention,
//      on persiste le résultat "neutre" sans appeler le LLM (économie
//      ~$0,003/run sur les prompts qui ne ramènent pas la marque).
//   3. Sinon, appel Haiku 4.5 en tool_use forcé pour scoring qualitatif
//      (sentiment, position, concurrents avec sentiment).
//   4. UPDATE runs.parsedBrands (jsonb) avec detection + scoring +
//      coût scoring. UPSERT usage_counters pour refléter le coût.
//
// Auto-enqueue : execute_prompt enqueue ce job après UPDATE run.success.

export interface ScoreResponseOptions {
  // Override pour tests : injecter un fake ScoringClient sans clé API
  scoringClient?: ScoringClient;
}

export async function scoreResponse(
  payload: ScoreResponsePayload,
  options: ScoreResponseOptions = {},
): Promise<void> {
  const { runId } = payload;

  // 1. Charger le run avec rawResponse. Si pas de raw → rien à scorer.
  const run = await db.query.runs.findFirst({ where: eq(runs.id, runId) });
  if (!run) throw new Error(`Run ${runId} introuvable`);
  if (run.status !== "success" || !run.rawResponse) {
    throw new Error(
      `Run ${runId} pas en status success (status=${run.status}) ou sans rawResponse — score_response skipé`,
    );
  }

  // 2. Charger prompt → brand → workspace (pour usage_counters) +
  //    concurrents (pour la détection)
  const prompt = await db.query.prompts.findFirst({
    where: eq(prompts.id, run.promptId),
  });
  if (!prompt) throw new Error(`Prompt ${run.promptId} introuvable pour run ${runId}`);
  const brand = await db.query.brands.findFirst({
    where: eq(brands.id, prompt.brandId),
  });
  if (!brand) throw new Error(`Brand ${prompt.brandId} introuvable pour run ${runId}`);
  const competitorRows = await db.query.competitors.findMany({
    where: eq(competitors.brandId, brand.id),
  });

  // 3. Pre-screening regex
  const targets: MentionTarget[] = [
    {
      id: brand.id,
      name: brand.name,
      type: "brand",
      patterns: [brand.name, ...brand.aliases],
    },
    ...competitorRows.map((c) => ({
      id: c.id,
      name: c.name,
      type: "competitor" as const,
      patterns: [c.name, ...c.aliases],
    })),
  ];
  const detection = detectMentions(run.rawResponse, targets);

  // 4. Skip scoring LLM si rien à analyser
  if (!shouldScoreWithLLM(detection)) {
    const payload: ParsedBrandsPayload = {
      detection,
      scoring: { skipped: true, reason: "no_mention_detected_by_regex" },
      scoredAt: new Date().toISOString(),
    };
    await db.update(runs).set({ parsedBrands: payload }).where(eq(runs.id, runId));
    // Recompute metrics inline — capture cette run dans l'agrégat même
    // si pas de mention détectée (totalRuns inclut tous les runs).
    await recomputeMetricsForBrandLLMDate({
      brandId: brand.id,
      llm: run.llm as LLMValue,
      date: today(),
    });
    return;
  }

  // 5. Appel scoring LLM. Client injectable pour tests, sinon construit
  //    avec ANTHROPIC_API_KEY (Haiku 4.5).
  const scoringClient =
    options.scoringClient ??
    (() => {
      if (!env.ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY manquant — scoring indisponible");
      }
      return createAnthropicScoringClient({ apiKey: env.ANTHROPIC_API_KEY });
    })();
  const scoring = await scoringClient.score({
    rawText: run.rawResponse,
    brand: { name: brand.name, aliases: brand.aliases },
    competitors: competitorRows.map((c) => ({ name: c.name, aliases: c.aliases })),
    language: prompt.language as "fr" | "en",
  });

  // 6. Persister
  const persisted: ParsedBrandsPayload = {
    detection,
    scoring,
    scoredAt: new Date().toISOString(),
  };
  await db.update(runs).set({ parsedBrands: persisted }).where(eq(runs.id, runId));

  // 7. Compter le coût scoring dans usage_counters (séparé du coût
  //    tracking pour pouvoir distinguer les deux postes plus tard).
  const periodStart = startOfCurrentMonth();
  await db
    .insert(usageCounters)
    .values({
      workspaceId: brand.workspaceId,
      periodStart,
      promptsCount: 0,
      runsCount: 0,
      llmCostUsd: scoring.costUsd.toFixed(4),
    })
    .onConflictDoUpdate({
      target: [usageCounters.workspaceId, usageCounters.periodStart],
      set: {
        llmCostUsd: sql`${usageCounters.llmCostUsd} + ${scoring.costUsd.toFixed(4)}`,
      },
    });

  // 8. Recompute des metrics quotidiens. Inline car la queue ne peut pas
  //    garantir l'ordre des messages : si on enqueuait recompute_metrics
  //    après chaque score_response, l'idempotency_key bloquerait les
  //    suivants alors qu'ils ont des données plus à jour. Inline = simple
  //    et toujours frais. SQL-only, ~1ms.
  await recomputeMetricsForBrandLLMDate({
    brandId: brand.id,
    llm: run.llm as LLMValue,
    date: today(),
  });
}

function today(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

function startOfCurrentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}
