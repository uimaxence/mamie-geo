import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db/client";
import { competitors, prompts, runs } from "@/db/schema";
import { getUserContext } from "@/lib/auth/user-context";
import type { LLMValue } from "@/lib/llm";
import type { ParsedBrandsPayload } from "@/lib/citation/types";
import {
  aggregateSuggestedCompetitors,
  computeBrandSelfMetrics,
  computeCompetitorMetrics,
  type BrandSelfMetrics,
  type CompetitorMetrics,
  type SuggestedCompetitor,
} from "./metrics";

// Queries pour la page /app/citations (onglet Concurrents).

export interface CompetitorRow {
  id: string;
  name: string;
  domain: string | null;
  aliases: string[];
  createdAt: Date;
}

/** CompetitorRow enrichie des métriques V0+ (cf. doc 09 § 2026-06-09). */
export interface CompetitorRowWithMetrics extends CompetitorRow, CompetitorMetrics {}

export interface CompetitorListResult {
  competitors: CompetitorRow[];
  total: number;
  brandId: string;
  plan: string;
}

export interface CompetitorListWithMetricsResult {
  competitors: CompetitorRowWithMetrics[];
  total: number;
  brandId: string;
  plan: string;
  /** Total des runs success utilisés comme dénominateur d'apparitionPct. */
  totalRuns: number;
  /** Nombre de jours sur lesquels les métriques sont calculées (=30 V0+). */
  windowDays: number;
  /** Marques citées par les IA mais pas encore suivies (auto-découverte). */
  suggestions: SuggestedCompetitor[];
  /** Métriques de ta marque, baseline pour la comparaison « vs toi ». */
  brandSelf: BrandSelfMetrics;
}

export async function listCompetitors(userId: string): Promise<CompetitorListResult | null> {
  const ctx = await getUserContext(userId);
  if (!ctx) return null;

  const rows = await db
    .select({
      id: competitors.id,
      name: competitors.name,
      domain: competitors.domain,
      aliases: competitors.aliases,
      createdAt: competitors.createdAt,
    })
    .from(competitors)
    .where(eq(competitors.brandId, ctx.brand.id))
    .orderBy(desc(competitors.createdAt));

  return {
    competitors: rows,
    total: rows.length,
    brandId: ctx.brand.id,
    plan: ctx.workspace.plan,
  };
}

/**
 * Variante de `listCompetitors` qui enrichit chaque concurrent avec les
 * métriques calculées depuis `runs.parsedBrands.scoring.competitorsMentioned`
 * sur la fenêtre `windowDays` (défaut 30j). Pas d'IA : on réutilise le
 * scoring déjà fait par le worker `score_response`.
 *
 * Pourquoi en JS et pas en SQL : le matching `scoring.name ↔ competitor.{name,aliases}`
 * est case-insensitive + tolérant aux variantes, plus simple à exprimer
 * en JS avec une fonction pure testable. La volumétrie reste OK (≤ 1000
 * runs par brand × 30j sur les plans actuels).
 */
export async function listCompetitorsWithMetrics(
  userId: string,
  windowDays = 30,
): Promise<CompetitorListWithMetricsResult | null> {
  const ctx = await getUserContext(userId);
  if (!ctx) return null;

  const competitorsRows = await db
    .select({
      id: competitors.id,
      name: competitors.name,
      domain: competitors.domain,
      aliases: competitors.aliases,
      createdAt: competitors.createdAt,
    })
    .from(competitors)
    .where(eq(competitors.brandId, ctx.brand.id))
    .orderBy(desc(competitors.createdAt));

  // Fenêtre [J-windowDays, now] : on charge les runs success de la brand
  // avec leur parsedBrands jsonb. Limite défensive 5000 pour rester
  // borné même sur des brands très actives.
  const windowStart = new Date();
  windowStart.setUTCDate(windowStart.getUTCDate() - windowDays);

  const runsRows = await db
    .select({
      llm: runs.llm,
      executedAt: runs.executedAt,
      parsedBrands: runs.parsedBrands,
    })
    .from(runs)
    .innerJoin(prompts, eq(prompts.id, runs.promptId))
    .where(
      and(
        eq(prompts.brandId, ctx.brand.id),
        eq(runs.status, "success"),
        gte(runs.executedAt, windowStart),
      ),
    )
    .limit(5000);

  const runsForMetrics = runsRows
    .filter((r) => r.executedAt !== null)
    .map((r) => ({
      llm: r.llm as LLMValue,
      executedAt: r.executedAt as Date,
      parsedBrands: r.parsedBrands as ParsedBrandsPayload | null,
    }));

  const metrics = computeCompetitorMetrics(
    competitorsRows.map((c) => ({
      id: c.id,
      name: c.name,
      aliases: c.aliases ?? [],
    })),
    runsForMetrics,
  );

  // Auto-découverte : marques citées par les IA mais pas suivies. On
  // exclut les concurrents déjà trackés (name + aliases) et ta marque.
  const normalizeToken = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const trackedTokens = new Set(
    competitorsRows.flatMap((c) => [c.name, ...(c.aliases ?? [])]).map(normalizeToken),
  );
  const brandTokens = new Set([ctx.brand.name, ...ctx.brand.aliases].map(normalizeToken));
  const suggestions = aggregateSuggestedCompetitors(runsForMetrics, {
    trackedTokens,
    brandTokens,
  });

  const brandSelf = computeBrandSelfMetrics(runsForMetrics);

  const enriched: CompetitorRowWithMetrics[] = competitorsRows.map((c) => ({
    ...c,
    ...(metrics[c.id] ?? {
      citationsCount: 0,
      apparitionPct: 0,
      topLlm: null,
      lastCitedAt: null,
    }),
  }));

  return {
    competitors: enriched,
    total: enriched.length,
    brandId: ctx.brand.id,
    plan: ctx.workspace.plan,
    totalRuns: runsRows.length,
    windowDays,
    suggestions,
    brandSelf,
  };
}
