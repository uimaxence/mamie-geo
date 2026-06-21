import { and, eq, or } from "drizzle-orm";
import { db } from "@/db/client";
import { technicalAudits, weeklyActionStates } from "@/db/schema";
import type { CheckResult } from "@/lib/audit/types";
import { getDashboardData, type MetricsAggregated } from "@/lib/dashboard/queries";
import { getRankSummary, type RankSummary } from "@/lib/competitors/queries";
import { bestWorstLlm } from "@/lib/metrics/interpret";
import { LLM_LABELS } from "@/components/charts/llm-colors";
import { isoWeekFromDate } from "@/workers/send-weekly-email-payload";
import type { ActionContext } from "./catalog";
import { selectWeeklyActions, type SelectedAction } from "./select";

// Couche données des « Actions de la semaine ». Le moteur (catalog/select) est
// pur ; ici on (1) lit les décisions persistées de la semaine ISO courante pour
// filtrer ce qui a déjà été traité, et (2) assemble l'ActionContext depuis les
// métriques déjà calculées. Deux points d'entrée :
//   - buildActionContext(...) : pur, alimenté par le dashboard avec ses données
//     déjà chargées (zéro requête en plus).
//   - getWeeklyActions(userId) : autonome, pour le worker email (pas de session).

export interface AuditSignal {
  everRun: boolean;
  criticalIssues: number;
}

/**
 * Signal audit pour le moteur : un audit a-t-il déjà tourné, et combien de
 * blocages critiques non résolus sur le dernier audit par URL ? Même logique
 * que la bulle de notif sidebar (latest-par-URL), une seule requête.
 */
export async function loadAuditSignal(workspaceId: string): Promise<AuditSignal> {
  const audits = await db
    .select({
      url: technicalAudits.url,
      checks: technicalAudits.checks,
    })
    .from(technicalAudits)
    .where(
      and(eq(technicalAudits.workspaceId, workspaceId), eq(technicalAudits.isCompetitor, false)),
    )
    .orderBy(technicalAudits.createdAt)
    .limit(100);

  if (audits.length === 0) return { everRun: false, criticalIssues: 0 };

  // Garde le dernier audit par URL (ORDER BY createdAt asc → le dernier vu gagne).
  const latestByUrl = new Map<string, (typeof audits)[number]>();
  for (const a of audits) latestByUrl.set(a.url, a);

  let criticalIssues = 0;
  for (const a of latestByUrl.values()) {
    const checks = (a.checks ?? []) as CheckResult[];
    for (const c of checks) {
      if (c.severity === "critical" && c.status === "fail") criticalIssues += 1;
    }
  }
  return { everRun: true, criticalIssues };
}

/**
 * Construit l'ActionContext (pur) à partir des agrégats déjà calculés. Appelé
 * par le dashboard avec ses propres données (pas de re-fetch) et par
 * getWeeklyActions pour le worker.
 */
export function buildActionContext(input: {
  promptsCount: number;
  competitorsCount: number;
  agg: MetricsAggregated;
  llmReading: { best: { label: string; value: number }; worst: { label: string; value: number } | null } | null;
  rankSummary: RankSummary | null;
  audit: AuditSignal | null;
}): ActionContext {
  const { agg, rankSummary } = input;
  return {
    promptsCount: input.promptsCount,
    competitorsCount: input.competitorsCount,
    totalRuns: agg.totalRuns,
    brandCitedCount: agg.brandCitedCount,
    topCompetitor: agg.topCompetitor,
    sources: {
      retrievedCount: agg.sourcesFunnel.retrievedCount,
      retrievalsTotal: agg.sourcesFunnel.retrievalsTotal,
      citationsCount: agg.sourcesFunnel.citationsCount,
    },
    bestLlm: input.llmReading?.best ?? null,
    worstLlm: input.llmReading?.worst ?? null,
    rank: rankSummary
      ? {
          rank: rankSummary.status.rank,
          outOf: rankSummary.status.outOf,
          previousRank: rankSummary.status.previousRank,
          reliable: rankSummary.reliable,
          aheadName: rankSummary.aheadName,
          gapToAhead: rankSummary.gapToAhead,
        }
      : null,
    audit: input.audit,
  };
}

/**
 * Slugs déjà traités cette semaine (done/dismissed, ou snoozed encore actif,
 * ou done permanent quelle que soit la semaine), à exclure de la sélection.
 */
export async function getDismissedActionSlugs(
  brandId: string,
  isoWeek: string,
  now: Date = new Date(),
): Promise<Set<string>> {
  const rows = await db
    .select({
      actionSlug: weeklyActionStates.actionSlug,
      status: weeklyActionStates.status,
      snoozeUntil: weeklyActionStates.snoozeUntil,
      scope: weeklyActionStates.scope,
    })
    .from(weeklyActionStates)
    .where(
      and(
        eq(weeklyActionStates.brandId, brandId),
        or(eq(weeklyActionStates.isoWeek, isoWeek), eq(weeklyActionStates.scope, "permanent")),
      ),
    );

  const dismissed = new Set<string>();
  for (const r of rows) {
    // Un snooze expiré ne masque plus l'action (elle peut revenir).
    if (r.status === "snoozed" && r.snoozeUntil && r.snoozeUntil <= now) continue;
    dismissed.add(r.actionSlug);
  }
  return dismissed;
}

/**
 * Sélectionne les actions de la semaine pour une marque : applique le moteur
 * sur le contexte, filtré par les décisions persistées de la semaine courante.
 */
export async function selectActionsForBrand(
  brandId: string,
  ctx: ActionContext,
  max = 2,
  now: Date = new Date(),
): Promise<SelectedAction[]> {
  const isoWeek = isoWeekFromDate(now);
  const dismissed = await getDismissedActionSlugs(brandId, isoWeek, now);
  return selectWeeklyActions(ctx, dismissed, max);
}

/**
 * Point d'entrée autonome (worker email, ou tout appelant sans données
 * pré-chargées) : charge le contexte depuis l'utilisateur et retourne les
 * actions sélectionnées. Retourne [] si l'utilisateur n'a pas de workspace.
 */
export async function getWeeklyActions(userId: string, max = 2): Promise<SelectedAction[]> {
  const data = await getDashboardData(userId);
  if (!data) return [];

  const [rankSummary, audit] = await Promise.all([
    getRankSummary(userId),
    loadAuditSignal(data.workspace.id),
  ]);

  const llmReading = bestWorstLlm(
    data.metricsToday.map((m) => ({
      label: LLM_LABELS[m.llm] ?? m.llm,
      value: Math.round(m.visibilityScore * 10) / 10,
    })),
  );

  const ctx = buildActionContext({
    promptsCount: data.promptsCount,
    competitorsCount: data.competitorsCount,
    agg: data.metricsAggregated,
    llmReading,
    rankSummary,
    audit,
  });

  return selectActionsForBrand(data.brand.id, ctx, max);
}
