import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { citationMetricsDaily } from "@/db/schema";
import type { ParsedBrandsPayload } from "@/lib/citation/types";
import type { LLMValue } from "@/lib/llm";
import { aggregateVisibility, type RunScoring } from "./visibility";

// Agrège les runs.success d'un (brandId, llm, date) et UPSERT dans
// citation_metrics_daily. Appelé inline depuis le worker score_response
// après chaque persistence parsedBrands → la métrique est toujours
// fraîche, sans gestion de queue/idempotency.
//
// Coût : SQL pur (1 SELECT + 1 INSERT...ON CONFLICT). Pas d'appel LLM.
//
// Phase A : 1 LLM ("claude") donc 1 row par (brandId, date) en pratique.
// L'API supporte déjà le multi-LLM pour Phase C sans rework.

export interface RecomputeMetricsInput {
  brandId: string;
  llm: LLMValue;
  // Date YYYY-MM-DD (UTC) — clé du window agrégation
  date: string;
}

export async function recomputeMetricsForBrandLLMDate(input: RecomputeMetricsInput): Promise<void> {
  const { brandId, llm, date } = input;

  // SELECT tous les runs success de ce (brand, llm, date). On joint via
  // prompts.brandId puisque runs n'a pas brandId en direct.
  // executed_at::date = date filtre la fenêtre journalière.
  const rows = await db.execute<{ parsed_brands: unknown }>(sql`
    SELECT r.parsed_brands
    FROM runs r
    INNER JOIN prompts p ON p.id = r.prompt_id
    WHERE p.brand_id = ${brandId}
      AND r.llm = ${llm}
      AND r.status = 'success'
      AND r.executed_at::date = ${date}::date
  `);

  const runScorings: RunScoring[] = rows.rows.map((r) => ({
    parsedBrands: r.parsed_brands as ParsedBrandsPayload | null,
  }));

  const aggregate = aggregateVisibility(runScorings);

  // UPSERT par PK (brandId, llm, date). Le schéma a un primaryKey composite
  // déclaré dans drizzle/schema.ts → Drizzle laisse passer onConflictDoUpdate.
  await db
    .insert(citationMetricsDaily)
    .values({
      brandId,
      llm,
      date,
      totalRuns: aggregate.totalRuns,
      brandCitedCount: aggregate.brandCitedCount,
      visibilityScore: aggregate.visibilityScore.toFixed(2),
      competitorsData: aggregate.competitorsData,
    })
    .onConflictDoUpdate({
      target: [citationMetricsDaily.brandId, citationMetricsDaily.llm, citationMetricsDaily.date],
      set: {
        totalRuns: aggregate.totalRuns,
        brandCitedCount: aggregate.brandCitedCount,
        visibilityScore: aggregate.visibilityScore.toFixed(2),
        competitorsData: aggregate.competitorsData,
      },
    });
}

// Validation payload extraite dans recompute-payload.ts pour rester
// testable sans dep DB. Re-exportée ici pour la commodité du dispatcher.

export { parseRecomputeMetricsPayload, type RecomputeMetricsPayload } from "./recompute-payload";
