import { and, desc, eq, gte, lt } from "drizzle-orm";
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
import { getRunBatches, type RunBatch } from "@/lib/runs/batches";
import { computePartDeVoix } from "@/lib/metrics/part-de-voix";

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
  /** Détail par LLM — alimente le BreakdownBars (Visibilité par LLM) */
  metricsToday: MetricsPerLLM[];
  /** Agrégat tous LLMs — alimente les 4 stats cards (cf. PR6 2026-05-18) */
  metricsAggregated: MetricsAggregated;
  recentBatches: RunBatch[];
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

/**
 * Agrégat tous-LLMs du jour pour les 4 stats cards du dashboard.
 * `visibilityScore` = moyenne arithmétique sur les LLMs ayant ≥1 run aujourd'hui
 * (les LLMs sans run sont skipés, sinon ils tirent la moyenne vers le bas).
 * `brandCitedCount` / `totalRuns` = sommes simples tous LLMs.
 * `topCompetitor` = somme citations par nom agrégée tous LLMs, top 1.
 * `partDeVoix` = `brand / (brand + Σ concurrents) × 100` sur les runs success
 * du jour (cf. doc 02 § Glossaire).
 * `llmsCount` = nb de LLMs distincts ayant tourné aujourd'hui (pour le hint).
 */
export interface MetricsAggregated {
  visibilityScore: number;
  brandCitedCount: number;
  totalRuns: number;
  topCompetitor: { name: string; citationCount: number } | null;
  partDeVoix: number;
  llmsCount: number;
}

export interface UsagePeriod {
  periodStart: string;
  /**
   * @internal Cost en USD du mois courant. Source de vérité pour le hard-cap
   * quota interne. Plus exposé côté UI client depuis PR6 (cf. 2026-05-18).
   * Le champ reste dans le type pour l'admin / debug future.
   */
  llmCostUsd: number;
  runsCount: number;
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

  // 5. Métriques agrégées tous-LLMs du jour pour les 4 stats cards
  //    (cf. PR6 2026-05-18 — fini les stats Claude-only de la Phase A).
  //    - visibilityScore = moyenne arithmétique des LLMs avec ≥ 1 run
  //    - brandCitedCount / totalRuns = sommes
  //    - topCompetitor = agrégation des competitorsData JSONB
  //    - partDeVoix = calculé sur les runs success du jour
  const metricsAggregated = await computeMetricsAggregated(brand.id, today, metricsToday);

  // 6. 10 derniers batches (groupés prompt × jour, cf. src/lib/runs/batches.ts).
  //    Couvre tous les statuts pour afficher pending/running aussi.
  const recentBatches = await getRunBatches({ brandId: brand.id, limit: 10 });

  // 7. Usage du mois courant
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
    metricsAggregated,
    recentBatches,
    usage,
  };
}

/**
 * Calcule l'agrégat tous-LLMs des métriques du jour. Combine :
 * - `citationMetricsDaily` (1 row par LLM × jour) pour visibility/runs/cited
 * - `runs` + `parsedBrands` pour la part de voix (formule glossaire)
 *
 * @internal — utilisé uniquement par getDashboardData. Exporté pas nécessaire.
 */
async function computeMetricsAggregated(
  brandId: string,
  today: string,
  metricsToday: MetricsPerLLM[],
): Promise<MetricsAggregated> {
  // visibilityScore moyen sur les LLMs ayant au moins 1 run aujourd'hui.
  // Skip ceux à 0 run pour ne pas tirer la moyenne vers le bas (un provider
  // en panne ce jour-là ne doit pas faire chuter le score perçu).
  const activeMetrics = metricsToday.filter((m) => m.totalRuns > 0);
  const visibilityScore =
    activeMetrics.length === 0
      ? 0
      : Math.round(
          (activeMetrics.reduce((sum, m) => sum + m.visibilityScore, 0) / activeMetrics.length) *
            10,
        ) / 10;

  const brandCitedCount = metricsToday.reduce((sum, m) => sum + m.brandCitedCount, 0);
  const totalRuns = metricsToday.reduce((sum, m) => sum + m.totalRuns, 0);
  const llmsCount = activeMetrics.length;

  // Top concurrent agrégé : on somme citationCount par name sur tous les LLMs
  const competitorMap = new Map<string, number>();
  for (const m of metricsToday) {
    for (const c of m.topCompetitors) {
      competitorMap.set(c.name, (competitorMap.get(c.name) ?? 0) + c.citationCount);
    }
  }
  const competitorEntries = [...competitorMap.entries()].sort((a, b) => b[1] - a[1]);
  const topCompetitor =
    competitorEntries.length > 0 && competitorEntries[0]
      ? { name: competitorEntries[0][0], citationCount: competitorEntries[0][1] }
      : null;

  // Part de voix : on doit recharger les runs success du jour pour
  // compter brand + competitors citations. citationMetricsDaily ne
  // suffit pas (competitorsData JSONB est tronqué aux top par row).
  const todayStart = new Date(`${today}T00:00:00Z`);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  const runsToday = await db
    .select({ parsedBrands: runs.parsedBrands })
    .from(runs)
    .innerJoin(prompts, eq(prompts.id, runs.promptId))
    .where(
      and(
        eq(prompts.brandId, brandId),
        eq(runs.status, "success"),
        gte(runs.executedAt, todayStart),
        lt(runs.executedAt, tomorrowStart),
      ),
    )
    .orderBy(desc(runs.executedAt))
    .limit(1000);
  const partDeVoix = computePartDeVoix(
    runsToday.map((r) => ({
      parsedBrands: r.parsedBrands as ParsedBrandsPayload | null,
    })),
  ).percentage;

  return {
    visibilityScore,
    brandCitedCount,
    totalRuns,
    topCompetitor,
    partDeVoix,
    llmsCount,
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

// ─────────────────────────────────────────────────────────────────────
// Évolution 30j — pour le LineChart du dashboard
// ─────────────────────────────────────────────────────────────────────

export interface VisibilityTrendPoint {
  /** ISO date YYYY-MM-DD */
  date: string;
  /** Score par LLM (clé = `llm`, valeur = visibility score 0-100) */
  [llm: string]: number | string;
}

/**
 * Calcule une variation relative en % (today - prev) / prev. Renvoie
 * `null` si `prev` vaut 0 ou est absent (rapport non défini), 0 si
 * identique. Arrondi à 1 décimale.
 */
export function computeDelta(current: number, previous: number | null | undefined): number | null {
  if (previous === null || previous === undefined) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  const pct = ((current - previous) / previous) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * Récupère l'évolution visibilité sur les `days` derniers jours pour la
 * brand donnée, pivoté par LLM. Retourne `[]` si pas d'historique
 * suffisant (cas onboarding récent) — l'UI affiche alors un EmptyState.
 */
export async function getVisibilityTrend(
  brandId: string,
  days = 30,
): Promise<VisibilityTrendPoint[]> {
  // Fenêtre [J-days, J0]
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - (days - 1));
  const startStr = start.toISOString().slice(0, 10);

  const rows = await db
    .select({
      date: citationMetricsDaily.date,
      llm: citationMetricsDaily.llm,
      visibilityScore: citationMetricsDaily.visibilityScore,
    })
    .from(citationMetricsDaily)
    .where(and(eq(citationMetricsDaily.brandId, brandId), gte(citationMetricsDaily.date, startStr)))
    .orderBy(citationMetricsDaily.date);

  // Pivot : { date → { llm → score } }
  const byDate = new Map<string, Record<string, number>>();
  for (const row of rows) {
    const slot = byDate.get(row.date) ?? {};
    slot[row.llm] = row.visibilityScore ? Number(row.visibilityScore) : 0;
    byDate.set(row.date, slot);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, scores]) => ({ date, ...scores }));
}

// ─────────────────────────────────────────────────────────────────────
// Détail d'un run (PR 14) — pour la page /app/runs/[id]
// ─────────────────────────────────────────────────────────────────────

export interface RunDetail {
  id: string;
  llm: LLMValue;
  status: string;
  costUsd: number | null;
  durationMs: number | null;
  scheduledAt: Date;
  executedAt: Date | null;
  rawResponse: string | null;
  sources: Array<{ url: string; title: string; pageAge: string | null }>;
  parsedBrands: ParsedBrandsPayload | null;
  error: string | null;
  model: string | null;
  prompt: {
    id: string;
    text: string;
    language: string;
  };
  brand: {
    id: string;
    name: string;
    domain: string;
  };
}

/**
 * Charge le détail d'un run + sa hiérarchie (prompt → brand → workspace).
 * Vérifie en même temps que l'utilisateur appartient au workspace qui
 * possède ce run — si non (ou run absent), retourne null pour qu'on
 * 404 proprement.
 */
export async function getRunDetail(runId: string, userId: string): Promise<RunDetail | null> {
  const rows = await db
    .select({
      runId: runs.id,
      llm: runs.llm,
      status: runs.status,
      costUsd: runs.costUsd,
      durationMs: runs.durationMs,
      scheduledAt: runs.scheduledAt,
      executedAt: runs.executedAt,
      rawResponse: runs.rawResponse,
      parsedCitations: runs.parsedCitations,
      parsedBrands: runs.parsedBrands,
      runError: runs.error,
      promptId: prompts.id,
      promptText: prompts.text,
      promptLanguage: prompts.language,
      brandId: brands.id,
      brandName: brands.name,
      brandDomain: brands.domain,
      workspaceId: brands.workspaceId,
    })
    .from(runs)
    .innerJoin(prompts, eq(prompts.id, runs.promptId))
    .innerJoin(brands, eq(brands.id, prompts.brandId))
    .where(eq(runs.id, runId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  // Auth : vérifie que le user appartient au workspace propriétaire du run
  const membership = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(
      and(eq(workspaceMembers.workspaceId, row.workspaceId), eq(workspaceMembers.userId, userId)),
    )
    .limit(1);
  if (!membership[0]) return null;

  const sources = Array.isArray(row.parsedCitations)
    ? (row.parsedCitations as Array<{ url: string; title: string; pageAge: string | null }>)
    : [];
  const parsedBrands = row.parsedBrands as ParsedBrandsPayload | null;

  // Le model exact utilisé est stocké dans le scoring si présent ; sinon
  // on n'a pas l'info (V0 n'écrit pas le model sur la row runs elle-même).
  const model =
    parsedBrands && "model" in parsedBrands.scoring && parsedBrands.scoring.model
      ? parsedBrands.scoring.model
      : null;

  return {
    id: row.runId,
    llm: row.llm as LLMValue,
    status: row.status,
    costUsd: row.costUsd ? Number(row.costUsd) : null,
    durationMs: row.durationMs,
    scheduledAt: row.scheduledAt,
    executedAt: row.executedAt,
    rawResponse: row.rawResponse,
    sources,
    parsedBrands,
    error: row.runError,
    model,
    prompt: {
      id: row.promptId,
      text: row.promptText,
      language: row.promptLanguage,
    },
    brand: {
      id: row.brandId,
      name: row.brandName,
      domain: row.brandDomain,
    },
  };
}

// Suppress lint warning : `competitors` and `citationMetricsDaily` and
// `usageCounters` are used in `getDashboardData` above. Pas d'unused.
