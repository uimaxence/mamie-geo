import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db/client";
import { citationMetricsDaily, competitors, prompts, runs } from "@/db/schema";
import { getUserContext } from "@/lib/auth/user-context";
import type { LLMValue } from "@/lib/llm";
import type { ParsedBrandsPayload } from "@/lib/citation/types";
import type { CompetitorAggregate } from "@/lib/metrics/visibility";
import {
  aggregateSuggestedCompetitors,
  computeBrandSelfMetrics,
  computeCompetitorMetrics,
  type BrandSelfMetrics,
  type CompetitorMetrics,
  type SuggestedCompetitor,
} from "./metrics";
import {
  buildRankStatus,
  computeRanking,
  computeRankHistory,
  RANKING_RELIABLE_AFTER_DAYS,
  type RankHistoryPoint,
  type RankingDailyRow,
  type RankingEntry,
  type RankStatus,
} from "./ranking";

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

// ── Ranking concurrentiel (cf. doc 02 § Ranking, étapes 1+2) ──────────

export interface RankingData {
  windowDays: number;
  deltaDays: number;
  /** Runs success de la fenêtre courante, tous LLMs (dénominateur). */
  totalRuns: number;
  /** Jours distincts avec ≥ 1 run sur la fenêtre courante — pilote le
   *  hint de fiabilité (cf. RANKING_RELIABLE_AFTER_DAYS). */
  dataDays: number;
  /** LLMs présents dans la fenêtre courante, pour le filtre. */
  llms: LLMValue[];
  /** Classement tous LLMs confondus. */
  all: RankingEntry[];
  /** Classement par LLM (clés = `llms`). */
  byLlm: Record<string, RankingEntry[]>;
  /** Évolution quotidienne du rang de ta marque, tous LLMs confondus. */
  history: RankHistoryPoint[];
  /** Évolution du rang par LLM (clés = `llms`). */
  historyByLlm: Record<string, RankHistoryPoint[]>;
}

/**
 * Classement marque + concurrents trackés + marques détectées sur la
 * fenêtre `windowDays`, avec rang précédent (fenêtre décalée de
 * `deltaDays`). Lit `citation_metrics_daily` — historisation déjà
 * remplie quotidiennement par le worker recompute, zéro appel LLM.
 */
export async function getRankingData(
  userId: string,
  windowDays = 30,
  deltaDays = 7,
): Promise<RankingData | null> {
  const ctx = await getUserContext(userId);
  if (!ctx) return null;

  const windowStart = new Date();
  windowStart.setUTCDate(windowStart.getUTCDate() - (windowDays + deltaDays));
  const windowStartIso = windowStart.toISOString().slice(0, 10);

  const [competitorsRows, dailyRows] = await Promise.all([
    db
      .select({
        id: competitors.id,
        name: competitors.name,
        aliases: competitors.aliases,
        domain: competitors.domain,
      })
      .from(competitors)
      .where(eq(competitors.brandId, ctx.brand.id)),
    db
      .select({
        llm: citationMetricsDaily.llm,
        date: citationMetricsDaily.date,
        totalRuns: citationMetricsDaily.totalRuns,
        brandCitedCount: citationMetricsDaily.brandCitedCount,
        competitorsData: citationMetricsDaily.competitorsData,
      })
      .from(citationMetricsDaily)
      .where(
        and(
          eq(citationMetricsDaily.brandId, ctx.brand.id),
          gte(citationMetricsDaily.date, windowStartIso),
        ),
      ),
  ]);

  const rows: RankingDailyRow[] = dailyRows.map((r) => ({
    llm: r.llm as LLMValue,
    date: r.date,
    totalRuns: r.totalRuns,
    brandCitedCount: r.brandCitedCount,
    competitorsData: r.competitorsData as CompetitorAggregate[] | null,
  }));

  const now = new Date();
  const base = {
    rows,
    windowDays,
    deltaDays,
    brand: { name: ctx.brand.name, aliases: ctx.brand.aliases, domain: ctx.brand.domain },
    competitors: competitorsRows.map((c) => ({
      id: c.id,
      name: c.name,
      aliases: c.aliases ?? [],
      domain: c.domain,
    })),
    now,
  };

  const currentStartIso = (() => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - windowDays);
    return d.toISOString().slice(0, 10);
  })();
  const currentRows = rows.filter((r) => r.date > currentStartIso);
  const llms = [...new Set(currentRows.map((r) => r.llm))];

  return {
    windowDays,
    deltaDays,
    totalRuns: currentRows.reduce((sum, r) => sum + r.totalRuns, 0),
    dataDays: new Set(currentRows.filter((r) => r.totalRuns > 0).map((r) => r.date)).size,
    llms,
    all: computeRanking(base),
    byLlm: Object.fromEntries(llms.map((llm) => [llm, computeRanking({ ...base, llm })])),
    // Les rows chargées remontent à windowDays+deltaDays — assez pour la
    // sous-fenêtre de lissage (7 j) du premier point d'historique.
    history: computeRankHistory(base),
    historyByLlm: Object.fromEntries(
      llms.map((llm) => [llm, computeRankHistory({ ...base, llm })]),
    ),
  };
}

// ── Résumé de rang pour le dashboard (« se situer ») ─────────────────

export interface RankSummary {
  /** Phrase de statut (même source que l'onglet Classement). */
  status: RankStatus;
  /** Runs success de la fenêtre (0 → le dashboard masque la carte). */
  totalRuns: number;
  /** Jours distincts de données — pilote le hint de fiabilité. */
  dataDays: number;
  /** dataDays >= RANKING_RELIABLE_AFTER_DAYS. */
  reliable: boolean;
  windowDays: number;
  deltaDays: number;
  /** Nom de l'entité juste au-dessus de toi (rang - 1), null si tu es n°1 ou
   *  pas encore classé. Sert au moteur d'actions (« viser une place »). */
  aheadName: string | null;
  /** Écart de citations avec l'entité juste au-dessus, null si non applicable. */
  gapToAhead: number | null;
}

/**
 * Version compacte du classement pour le dashboard : juste la phrase de
 * statut « tu es n°X sur N — à Y citations du n°X-1 » + fiabilité.
 * Réutilise `getRankingData` (même chargement, zéro appel LLM).
 */
export async function getRankSummary(
  userId: string,
  windowDays = 30,
  deltaDays = 7,
): Promise<RankSummary | null> {
  const data = await getRankingData(userId, windowDays, deltaDays);
  if (!data) return null;

  // Entité juste au-dessus de toi dans le classement tous-LLMs : sert au
  // moteur d'actions (« passer n°X → n°X-1 ») et reste cohérent avec la phrase.
  const you = data.all.find((e) => e.type === "you");
  const ahead =
    you && you.rank > 1 ? (data.all.find((e) => e.rank === you.rank - 1) ?? null) : null;

  return {
    status: buildRankStatus(data.all, "tous LLMs confondus"),
    totalRuns: data.totalRuns,
    dataDays: data.dataDays,
    reliable: data.dataDays >= RANKING_RELIABLE_AFTER_DAYS,
    windowDays: data.windowDays,
    deltaDays: data.deltaDays,
    aheadName: ahead?.name ?? null,
    gapToAhead: ahead && you ? ahead.mentions - you.mentions : null,
  };
}
