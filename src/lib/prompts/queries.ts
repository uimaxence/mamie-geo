import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  brands,
  citationMetricsDaily,
  competitors,
  prompts,
  runs,
  workspaceMembers,
} from "@/db/schema";
import { getUserContext } from "@/lib/auth/user-context";
import type { LLMValue } from "@/lib/llm";
import type { ParsedBrandsPayload } from "@/lib/citation/types";
import { getRunBatches, type RunBatch } from "@/lib/runs/batches";

// Queries pour les pages /app/prompts (liste + détail).
// Toutes les queries appliquent un auth check par userId — pas de
// fuite cross-workspace possible.

export interface PromptRow {
  id: string;
  text: string;
  category: string | null;
  language: string;
  isActive: boolean;
  createdAt: Date;
  /** Dernier run.executedAt (success ou failed), null si jamais run */
  lastRunAt: Date | null;
  /** Status du dernier run */
  lastStatus: string | null;
  /** Nombre total de runs success enregistrés sur ce prompt */
  successCount: number;
}

export interface PromptListResult {
  prompts: PromptRow[];
  total: number;
  brandId: string;
  plan: string;
}

/**
 * Liste les prompts de la brand de l'utilisateur, avec metadata
 * runs agrégée (dernier run + count success). Trié par createdAt DESC.
 */
export async function listPrompts(userId: string): Promise<PromptListResult | null> {
  const ctx = await getUserContext(userId);
  if (!ctx) return null;

  // LEFT JOIN runs pour récupérer le dernier executedAt par prompt.
  // GROUP BY prompts.id pour éviter cartesian product. Postgres supporte
  // MAX/COUNT sur jointure avec FILTER pour les conditions.
  const rows = await db
    .select({
      id: prompts.id,
      text: prompts.text,
      category: prompts.category,
      language: prompts.language,
      isActive: prompts.isActive,
      createdAt: prompts.createdAt,
      lastRunAt: sql<Date | null>`MAX(${runs.executedAt})`.as("last_run_at"),
      lastStatus: sql<string | null>`(
        SELECT status FROM ${runs} r2
        WHERE r2.prompt_id = ${prompts.id}
        ORDER BY r2.scheduled_at DESC
        LIMIT 1
      )`.as("last_status"),
      successCount: sql<number>`COUNT(${runs.id}) FILTER (WHERE ${runs.status} = 'success')`.as(
        "success_count",
      ),
    })
    .from(prompts)
    .leftJoin(runs, eq(runs.promptId, prompts.id))
    .where(eq(prompts.brandId, ctx.brand.id))
    .groupBy(prompts.id)
    .orderBy(desc(prompts.createdAt));

  return {
    prompts: rows.map((r) => ({
      ...r,
      successCount: Number(r.successCount ?? 0),
    })),
    total: rows.length,
    brandId: ctx.brand.id,
    plan: ctx.workspace.plan,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Détail prompt — /app/prompts/[id]
// ─────────────────────────────────────────────────────────────────────

export interface PromptDetail {
  id: string;
  text: string;
  category: string | null;
  language: string;
  isActive: boolean;
  createdAt: Date;
  brand: { id: string; name: string; domain: string };
  /** Score moyen visibilité sur ce prompt, par LLM, fenêtre 30j */
  byLlm: Array<{
    llm: LLMValue;
    avgScore: number;
    citationCount: number;
    totalRuns: number;
  }>;
  /** Top 5 concurrents cités sur ce prompt (sur la fenêtre 30j) */
  topCompetitors: Array<{ name: string; citationCount: number }>;
  /** Compteur total : runs success + brand cited sur la fenêtre */
  totals: {
    totalRuns: number;
    brandCited: number;
    citationRate: number; // %
  };
  /** Sentiment dominant (positive/neutral/negative/absent) sur la fenêtre */
  dominantSentiment: string;
  /** 10 derniers batches (prompt × jour) sur ce prompt, tous statuts */
  recentBatches: RunBatch[];
}

export async function getPromptDetail(
  promptId: string,
  userId: string,
): Promise<PromptDetail | null> {
  // Charge prompt + vérifie ownership via brand → workspace → user
  const rows = await db
    .select({
      promptId: prompts.id,
      text: prompts.text,
      category: prompts.category,
      language: prompts.language,
      isActive: prompts.isActive,
      createdAt: prompts.createdAt,
      brandId: brands.id,
      brandName: brands.name,
      brandDomain: brands.domain,
      workspaceId: brands.workspaceId,
    })
    .from(prompts)
    .innerJoin(brands, eq(brands.id, prompts.brandId))
    .where(eq(prompts.id, promptId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  // Auth : user appartient au workspace propriétaire de la brand ?
  const membership = await db
    .select({ wsId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(
      and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.workspaceId, row.workspaceId)),
    )
    .limit(1);
  if (!membership[0]) return null;

  // Score moyen par LLM sur fenêtre 30j via citation_metrics_daily
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 30);
  const sinceStr = since.toISOString().slice(0, 10);

  // Note : citation_metrics_daily est agrégée par brand + llm + date,
  // pas par prompt. Pour avoir le score par prompt × LLM on doit passer
  // par runs + parsed_brands. SQL pur.
  const runsRows = await db
    .select({
      id: runs.id,
      llm: runs.llm,
      status: runs.status,
      executedAt: runs.executedAt,
      costUsd: runs.costUsd,
      durationMs: runs.durationMs,
      parsedBrands: runs.parsedBrands,
    })
    .from(runs)
    .where(and(eq(runs.promptId, promptId)))
    .orderBy(desc(runs.scheduledAt));

  // Agrégation côté JS par LLM (volume faible, ~5 LLMs × N runs)
  const byLlmMap = new Map<
    LLMValue,
    { citationCount: number; totalRuns: number; scoreSum: number }
  >();
  const competitorMap = new Map<string, number>();
  let totalRuns = 0;
  let brandCited = 0;
  const sentimentCount: Record<string, number> = {
    positive: 0,
    neutral: 0,
    negative: 0,
    absent: 0,
  };

  for (const r of runsRows) {
    if (r.status !== "success") continue;
    const llm = r.llm as LLMValue;
    const slot = byLlmMap.get(llm) ?? { citationCount: 0, totalRuns: 0, scoreSum: 0 };
    slot.totalRuns += 1;
    totalRuns += 1;

    const parsed = r.parsedBrands as ParsedBrandsPayload | null;
    if (parsed) {
      const scoring = parsed.scoring;
      if (!("skipped" in scoring) && scoring.brandMentioned) {
        slot.citationCount += 1;
        brandCited += 1;
      }
      if (!("skipped" in scoring)) {
        sentimentCount[scoring.brandSentiment] = (sentimentCount[scoring.brandSentiment] ?? 0) + 1;
      }
      // Concurrents cités
      if (!("skipped" in scoring)) {
        for (const c of scoring.competitorsMentioned) {
          competitorMap.set(c.name, (competitorMap.get(c.name) ?? 0) + 1);
        }
      }
    }
    byLlmMap.set(llm, slot);
  }

  // Score visibility moyen par LLM via citation_metrics_daily (pré-agrégé)
  const metricsRows = await db
    .select({
      llm: citationMetricsDaily.llm,
      visibilityScore: citationMetricsDaily.visibilityScore,
    })
    .from(citationMetricsDaily)
    .where(
      and(
        eq(citationMetricsDaily.brandId, row.brandId),
        sql`${citationMetricsDaily.date} >= ${sinceStr}`,
      ),
    );
  const scoreByLlm = new Map<LLMValue, { sum: number; count: number }>();
  for (const m of metricsRows) {
    const llm = m.llm as LLMValue;
    const slot = scoreByLlm.get(llm) ?? { sum: 0, count: 0 };
    slot.sum += m.visibilityScore ? Number(m.visibilityScore) : 0;
    slot.count += 1;
    scoreByLlm.set(llm, slot);
  }

  const byLlm: PromptDetail["byLlm"] = [];
  for (const [llm, stats] of byLlmMap.entries()) {
    const scoreSlot = scoreByLlm.get(llm);
    byLlm.push({
      llm,
      avgScore: scoreSlot && scoreSlot.count > 0 ? scoreSlot.sum / scoreSlot.count : 0,
      citationCount: stats.citationCount,
      totalRuns: stats.totalRuns,
    });
  }

  const topCompetitors = Array.from(competitorMap.entries())
    .map(([name, count]) => ({ name, citationCount: count }))
    .sort((a, b) => b.citationCount - a.citationCount)
    .slice(0, 5);

  // Sentiment dominant
  let dominantSentiment = "absent";
  let maxCount = 0;
  for (const [sentiment, count] of Object.entries(sentimentCount)) {
    if (count > maxCount) {
      maxCount = count;
      dominantSentiment = sentiment;
    }
  }

  // Recent batches (10 derniers batches prompt × jour, tous statuts)
  const recentBatches = await getRunBatches({ promptId, limit: 10 });

  return {
    id: row.promptId,
    text: row.text,
    category: row.category,
    language: row.language,
    isActive: row.isActive,
    createdAt: row.createdAt,
    brand: {
      id: row.brandId,
      name: row.brandName,
      domain: row.brandDomain,
    },
    byLlm,
    topCompetitors,
    totals: {
      totalRuns,
      brandCited,
      citationRate: totalRuns > 0 ? (brandCited / totalRuns) * 100 : 0,
    },
    dominantSentiment,
    recentBatches,
  };
}

// Note : `competitors` import est utilisé indirectement via le schema
// dans le scope JS — on garde pour permettre un futur enrichissement
// (résolution name → id concurrent dans topCompetitors).
void competitors;
