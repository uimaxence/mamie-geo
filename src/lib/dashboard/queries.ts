import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  brands,
  citationMetricsDaily,
  competitors,
  prompts,
  runs,
  usageCounters,
  workspaceMembers,
  workspaces,
} from "@/db/schema";
import type { ParsedBrandsPayload } from "@/lib/citation/types";
import type { LLMValue } from "@/lib/llm";

// Server-side queries pour le dashboard. Chargées dans des React Server
// Components, donc accès direct DB sans surcouche API. La session a déjà
// été validée par (app)/layout.tsx — on reçoit juste le userId.
//
// Retourne null si l'utilisateur n'a pas (encore) de workspace —
// l'onboarding vient en PR 6, en attendant le seed:dev fournit la
// donnée de dev.

export interface DashboardData {
  workspace: {
    id: string;
    name: string;
    plan: string;
  };
  brand: {
    id: string;
    name: string;
    domain: string;
  };
  competitorsCount: number;
  promptsCount: number;
  metricsToday: MetricsPerLLM[];
  recentRuns: RecentRun[];
  usage: UsagePeriod;
}

export interface MetricsPerLLM {
  llm: LLMValue;
  date: string;
  totalRuns: number;
  brandCitedCount: number;
  // Décimal stocké en string Postgres → on parse en number côté client
  visibilityScore: number;
  topCompetitors: Array<{ name: string; citationCount: number }>;
}

export interface RecentRun {
  id: string;
  llm: LLMValue;
  status: string;
  costUsd: number | null;
  durationMs: number | null;
  executedAt: Date | null;
  promptText: string;
  brandMentioned: boolean | "skipped" | "unscored";
}

export interface UsagePeriod {
  periodStart: string;
  runsCount: number;
  llmCostUsd: number;
}

/**
 * Charge les données du dashboard pour le workspace de l'utilisateur.
 * Retourne null si pas de workspace (cas : nouveau user pré-onboarding).
 */
export async function getDashboardData(userId: string): Promise<DashboardData | null> {
  // 1. Workspace de l'utilisateur. V0 = 1 user → 1 workspace via
  //    workspace_members. Si plusieurs, on prend le plus ancien — la
  //    notion "workspace courant" arrive avec le multi-workspace en V1.
  const membership = await db
    .select({
      workspaceId: workspaceMembers.workspaceId,
      workspaceName: workspaces.name,
      workspacePlan: workspaces.plan,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(workspaceMembers.createdAt)
    .limit(1);

  const ws = membership[0];
  if (!ws) return null;

  // 2. Brand du workspace. V0 = 1 brand par workspace.
  const brand = await db.query.brands.findFirst({
    where: eq(brands.workspaceId, ws.workspaceId),
  });
  if (!brand) return null;

  // 3. Counts (concurrents + prompts actifs)
  const [competitorsCount, promptsCount] = await Promise.all([
    db.$count(competitors, eq(competitors.brandId, brand.id)),
    db.$count(prompts, and(eq(prompts.brandId, brand.id), eq(prompts.isActive, true))),
  ]);

  // 4. Métriques agrégées du jour (par LLM). Plus tard on étendra à
  //    la fenêtre 7j/30j pour le graphique d'évolution.
  const today = todayUTC();
  const metricsRows = await db
    .select()
    .from(citationMetricsDaily)
    .where(and(eq(citationMetricsDaily.brandId, brand.id), eq(citationMetricsDaily.date, today)));

  const metricsToday: MetricsPerLLM[] = metricsRows.map((row) => {
    const competitorsData = (row.competitorsData ?? []) as Array<{
      name: string;
      citationCount: number;
    }>;
    return {
      llm: row.llm as LLMValue,
      date: row.date,
      totalRuns: row.totalRuns,
      brandCitedCount: row.brandCitedCount,
      visibilityScore: row.visibilityScore ? Number(row.visibilityScore) : 0,
      topCompetitors: competitorsData.slice(0, 3).map((c) => ({
        name: c.name,
        citationCount: c.citationCount,
      })),
    };
  });

  // 5. 10 derniers runs (toutes statuts confondus pour voir le pending)
  const recentRunsRaw = await db
    .select({
      id: runs.id,
      llm: runs.llm,
      status: runs.status,
      costUsd: runs.costUsd,
      durationMs: runs.durationMs,
      executedAt: runs.executedAt,
      promptText: prompts.text,
      parsedBrands: runs.parsedBrands,
    })
    .from(runs)
    .innerJoin(prompts, eq(prompts.id, runs.promptId))
    .where(eq(prompts.brandId, brand.id))
    .orderBy(desc(runs.scheduledAt))
    .limit(10);

  const recentRuns: RecentRun[] = recentRunsRaw.map((r) => {
    const parsed = r.parsedBrands as ParsedBrandsPayload | null;
    let brandMentioned: RecentRun["brandMentioned"];
    if (!parsed) {
      brandMentioned = "unscored";
    } else if ("skipped" in parsed.scoring) {
      brandMentioned = "skipped";
    } else {
      brandMentioned = parsed.scoring.brandMentioned;
    }
    return {
      id: r.id,
      llm: r.llm as LLMValue,
      status: r.status,
      costUsd: r.costUsd ? Number(r.costUsd) : null,
      durationMs: r.durationMs,
      executedAt: r.executedAt,
      promptText: r.promptText,
      brandMentioned,
    };
  });

  // 6. Usage du mois courant
  const periodStart = startOfCurrentMonthUTC();
  const usageRows = await db
    .select()
    .from(usageCounters)
    .where(
      and(
        eq(usageCounters.workspaceId, ws.workspaceId),
        eq(usageCounters.periodStart, periodStart),
      ),
    )
    .limit(1);

  const usageRow = usageRows[0];
  const usage: UsagePeriod = usageRow
    ? {
        periodStart,
        runsCount: usageRow.runsCount,
        llmCostUsd: Number(usageRow.llmCostUsd),
      }
    : { periodStart, runsCount: 0, llmCostUsd: 0 };

  return {
    workspace: {
      id: ws.workspaceId,
      name: ws.workspaceName,
      plan: ws.workspacePlan,
    },
    brand: {
      id: brand.id,
      name: brand.name,
      domain: brand.domain,
    },
    competitorsCount,
    promptsCount,
    metricsToday,
    recentRuns,
    usage,
  };
}

function todayUTC(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

function startOfCurrentMonthUTC(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}
