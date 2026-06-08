import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { brands, citationMetricsDaily } from "@/db/schema";
import type { ParsedBrandsPayload } from "@/lib/citation/types";
import type { LLMValue, LLMSource } from "@/lib/llm";
import { aggregateVisibility, type RunScoring } from "./visibility";
import { aggregateSourcesFunnel, type FunnelRun } from "./sources-funnel";

// Agrège les runs.success d'un (brandId, llm, date) et UPSERT dans
// citation_metrics_daily. Appelé inline depuis le worker score_response
// après chaque persistence parsedBrands → la métrique est toujours
// fraîche, sans gestion de queue/idempotency.
//
// V0+ 2026-06-08 : calcule aussi le funnel sources (Apparition / Fréquence /
// Citation) à partir de runs.parsedCitations. Lookup brand pour ses
// domain + aliases.
//
// Coût : SQL pur (1 SELECT + 1 INSERT...ON CONFLICT). Pas d'appel LLM.

export interface RecomputeMetricsInput {
  brandId: string;
  llm: LLMValue;
  // Date YYYY-MM-DD (UTC) — clé du window agrégation
  date: string;
}

export async function recomputeMetricsForBrandLLMDate(input: RecomputeMetricsInput): Promise<void> {
  const { brandId, llm, date } = input;

  // Lookup brand domain + aliases pour le funnel sources.
  const brandRow = await db
    .select({ domain: brands.domain, aliases: brands.aliases })
    .from(brands)
    .where(eq(brands.id, brandId))
    .limit(1);
  const brand = brandRow[0];
  if (!brand) return; // brand supprimée entre-temps, no-op

  // SELECT tous les runs success de ce (brand, llm, date). On joint via
  // prompts.brandId puisque runs n'a pas brandId en direct.
  // executed_at::date = date filtre la fenêtre journalière.
  const rows = await db.execute<{ parsed_brands: unknown; parsed_citations: unknown }>(sql`
    SELECT r.parsed_brands, r.parsed_citations
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
  const funnelRuns: FunnelRun[] = rows.rows.map((r) => ({
    parsedBrands: r.parsed_brands as ParsedBrandsPayload | null,
    parsedCitations: r.parsed_citations as LLMSource[] | null,
  }));

  const aggregate = aggregateVisibility(runScorings);
  const funnel = aggregateSourcesFunnel(funnelRuns, brand);

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
      retrievedCount: funnel.retrievedCount,
      retrievalsTotal: funnel.retrievalsTotal,
      citationsCount: funnel.citationsCount,
    })
    .onConflictDoUpdate({
      target: [citationMetricsDaily.brandId, citationMetricsDaily.llm, citationMetricsDaily.date],
      set: {
        totalRuns: aggregate.totalRuns,
        brandCitedCount: aggregate.brandCitedCount,
        visibilityScore: aggregate.visibilityScore.toFixed(2),
        competitorsData: aggregate.competitorsData,
        retrievedCount: funnel.retrievedCount,
        retrievalsTotal: funnel.retrievalsTotal,
        citationsCount: funnel.citationsCount,
      },
    });
}

// Validation payload extraite dans recompute-payload.ts pour rester
// testable sans dep DB. Re-exportée ici pour la commodité du dispatcher.

export { parseRecomputeMetricsPayload, type RecomputeMetricsPayload } from "./recompute-payload";
