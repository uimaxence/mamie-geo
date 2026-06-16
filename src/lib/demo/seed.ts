import type { LLMValue } from "@/lib/llm";
import type { DashboardData, MetricsPerLLM, VisibilityTrendPoint } from "@/lib/dashboard/queries";
import type { RunBatch, RunBatchEntry } from "@/lib/runs/batches-grouping";

// Données factices pour la page /demo. Aucun appel LLM, aucune
// requête DB : tout est dérivé d'une seed pseudo-aléatoire déterministe
// pour que le rendu soit identique à chaque visite.
//
// Brand fictive : Floréal (cosmétiques bio). Concurrents : Aroma-Zone,
// Caudalie, L'Occitane, Yves Rocher. Période : 60 jours d'historique
// avec une tendance légèrement croissante (~+15 % score sur 60 j) pour
// raconter "voici ce que le tracking quotidien donne après 2 mois".

export const DEMO_BRAND_NAME = "Floréal";
export const DEMO_BRAND_DOMAIN = "floreal.fr";

const LLM_ORDER: readonly LLMValue[] = [
  "chatgpt",
  "claude",
  "perplexity",
  "gemini",
  "lechat",
] as const;

const DEMO_PROMPTS = [
  {
    id: "p1",
    text: "Quelle est la meilleure marque française de cosmétiques bio ?",
    category: "concurrence",
  },
  {
    id: "p2",
    text: "Cite-moi 3 alternatives naturelles à L'Occitane",
    category: "concurrence",
  },
  {
    id: "p3",
    text: "Quelle crème hydratante bio française me conseilles-tu ?",
    category: "produit",
  },
  {
    id: "p4",
    text: "Marques de cosmétiques éthiques basées en France ?",
    category: "concurrence",
  },
  {
    id: "p5",
    text: "Meilleur shampoing solide bio français ?",
    category: "produit",
  },
] as const;

const DEMO_COMPETITORS = [
  { name: "Aroma-Zone", weight: 1.0 },
  { name: "Caudalie", weight: 0.6 },
  { name: "L'Occitane", weight: 0.55 },
  { name: "Yves Rocher", weight: 0.5 },
];

// "Vrai" score de visibilité moyen par LLM (avant bruit + tendance).
// Realistic : Claude et ChatGPT mieux placés sur ce type de query FR,
// Perplexity et Gemini un cran derrière, Le Chat très bon sur FR.
const LLM_BASELINE_SCORE: Record<LLMValue, number> = {
  chatgpt: 64,
  claude: 71,
  perplexity: 52,
  gemini: 47,
  lechat: 68,
};

// Mulberry32 — PRNG déterministe, 1 ligne, qualité suffisante pour de
// la démo. Seed fixe ci-dessous pour un rendu reproductible.
function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDateDaysAgo(daysAgo: number, today: Date): string {
  const d = new Date(today);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Évolution visibilité par LLM sur 90 jours, pivotée pour le LineChart.
 * Tendance légèrement croissante (+0.15 / jour en moyenne) avec bruit
 * gaussien-like + un léger creux semaine 4 pour raconter une histoire.
 */
export function buildDemoTrend(today: Date = new Date()): VisibilityTrendPoint[] {
  const rand = mulberry32(424242);
  const points: VisibilityTrendPoint[] = [];
  for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
    const date = isoDateDaysAgo(daysAgo, today);
    const t = (89 - daysAgo) / 89; // 0 → 1
    const point: VisibilityTrendPoint = { date };
    for (const llm of LLM_ORDER) {
      const baseline = LLM_BASELINE_SCORE[llm];
      const trend = (t - 0.5) * 12; // -6 → +6
      // creux semaine 4 (~ jour 60 ago)
      const dip = daysAgo > 55 && daysAgo < 65 ? -4 : 0;
      const noise = (rand() - 0.5) * 8;
      const value = clamp(baseline + trend + dip + noise, 5, 95);
      point[llm] = Math.round(value * 10) / 10;
    }
    points.push(point);
  }
  return points;
}

/**
 * Métriques du jour par LLM (5 runs/LLM, ~5 prompts).
 * Construit à partir de la dernière entrée du trend pour cohérence.
 */
function buildMetricsToday(today: Date): MetricsPerLLM[] {
  const rand = mulberry32(8181);
  const date = isoDateDaysAgo(0, today);
  const trend = buildDemoTrend(today);
  const last = trend[trend.length - 1];
  if (!last) return [];

  return LLM_ORDER.map((llm) => {
    const score = typeof last[llm] === "number" ? (last[llm] as number) : 0;
    const totalRuns = DEMO_PROMPTS.length; // 5 prompts → 5 runs/LLM/jour
    // brandCited corrélé au score (plus le score est haut, plus la marque est citée)
    const citationRate = clamp((score - 30) / 60, 0.1, 0.9);
    const brandCitedCount = Math.round(totalRuns * citationRate);

    // Top concurrents tirés des baselines + bruit
    const topCompetitors = DEMO_COMPETITORS.map((c) => ({
      name: c.name,
      citationCount: Math.round(
        c.weight * (totalRuns - brandCitedCount + 1) * (0.7 + rand() * 0.6),
      ),
    }))
      .sort((a, b) => b.citationCount - a.citationCount)
      .slice(0, 3);

    return {
      llm,
      date,
      totalRuns,
      brandCitedCount,
      visibilityScore: score,
      topCompetitors,
      // Funnel sources : la marque est retrouvée dans les sources LLM
      // dans ~70 % des runs où elle est citée, avec en moyenne 2.5
      // apparitions, et 60 % se convertissent en citation explicite.
      retrievedCount: Math.round(brandCitedCount * 1.2),
      retrievalsTotal: Math.round(brandCitedCount * 1.2 * 2.5),
      citationsCount: brandCitedCount,
    };
  });
}

function aggregateMetrics(metricsToday: MetricsPerLLM[]) {
  const llmsCount = metricsToday.filter((m) => m.totalRuns > 0).length;
  const visibilityScore =
    llmsCount === 0
      ? 0
      : Math.round((metricsToday.reduce((sum, m) => sum + m.visibilityScore, 0) / llmsCount) * 10) /
        10;
  const brandCitedCount = metricsToday.reduce((sum, m) => sum + m.brandCitedCount, 0);
  const totalRuns = metricsToday.reduce((sum, m) => sum + m.totalRuns, 0);

  // Top concurrent tous-LLMs : somme des citationCount par name
  const competitorMap = new Map<string, number>();
  for (const m of metricsToday) {
    for (const c of m.topCompetitors) {
      competitorMap.set(c.name, (competitorMap.get(c.name) ?? 0) + c.citationCount);
    }
  }
  const sorted = Array.from(competitorMap.entries()).sort((a, b) => b[1] - a[1]);
  const topCompetitor = sorted[0] ? { name: sorted[0][0], citationCount: sorted[0][1] } : null;

  const totalCompetitorCitations = Array.from(competitorMap.values()).reduce((a, b) => a + b, 0);
  const partDeVoixDenom = brandCitedCount + totalCompetitorCitations;
  const partDeVoix =
    partDeVoixDenom === 0 ? 0 : Math.round((brandCitedCount / partDeVoixDenom) * 1000) / 10;

  return {
    visibilityScore,
    brandCitedCount,
    totalRuns,
    topCompetitor,
    partDeVoix,
    llmsCount,
    sourcesFunnel: {
      retrievedCount: metricsToday.reduce((sum, m) => sum + m.retrievedCount, 0),
      retrievalsTotal: metricsToday.reduce((sum, m) => sum + m.retrievalsTotal, 0),
      citationsCount: metricsToday.reduce((sum, m) => sum + m.citationsCount, 0),
    },
  };
}

/**
 * 10 derniers batches (prompt × jour). On utilise les 2 derniers jours
 * × 5 prompts pour avoir exactement 10 batches récents.
 */
function buildRecentBatches(today: Date): RunBatch[] {
  const rand = mulberry32(31337);
  const batches: RunBatch[] = [];
  for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
    const dateStr = isoDateDaysAgo(dayOffset, today);
    const dayDate = new Date(`${dateStr}T06:00:00.000Z`);
    for (const prompt of DEMO_PROMPTS) {
      const runs: RunBatchEntry[] = LLM_ORDER.map((llm) => {
        const baseline = LLM_BASELINE_SCORE[llm];
        const cited = rand() < clamp((baseline - 30) / 60, 0.1, 0.9);
        const sentimentRoll = rand();
        const sentiment: RunBatchEntry["brandSentiment"] = cited
          ? sentimentRoll < 0.55
            ? "positive"
            : sentimentRoll < 0.85
              ? "neutral"
              : "negative"
          : "absent";
        return {
          id: `demo-${prompt.id}-${dayOffset}-${llm}`,
          llm,
          status: "success",
          costUsd: 0.012 + rand() * 0.02,
          durationMs: 1800 + Math.round(rand() * 3500),
          executedAt: new Date(dayDate.getTime() + Math.round(rand() * 600_000)),
          scheduledAt: dayDate,
          brandMentioned: cited,
          brandSentiment: sentiment,
          cacheHit: false,
        };
      });

      const citedRuns = runs.filter((r) => r.brandMentioned === true);
      const citedCount = citedRuns.length;
      const sentiments = citedRuns
        .map((r) => r.brandSentiment)
        .filter(
          (s): s is "positive" | "neutral" | "negative" =>
            s === "positive" || s === "neutral" || s === "negative",
        );
      const sentimentCounts = sentiments.reduce<Record<string, number>>(
        (acc, s) => ({ ...acc, [s]: (acc[s] ?? 0) + 1 }),
        {},
      );
      const sortedSentiments = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1]);
      const dominant = sortedSentiments[0];
      const dominantBrandSentiment: RunBatch["summary"]["dominantBrandSentiment"] =
        citedCount === 0
          ? "absent"
          : dominant && dominant[1] > runs.length / 2
            ? (dominant[0] as "positive" | "neutral" | "negative")
            : "mixed";

      batches.push({
        key: `${prompt.id}:${dateStr}`,
        promptId: prompt.id,
        promptText: prompt.text,
        scheduledDate: dateStr,
        latestScheduledAt: dayDate,
        latestExecutedAt: runs.reduce<Date | null>(
          (latest, r) =>
            r.executedAt && (!latest || r.executedAt > latest) ? r.executedAt : latest,
          null,
        ),
        summary: {
          totalRuns: runs.length,
          succeededCount: runs.length,
          failedCount: 0,
          skippedCount: 0,
          pendingCount: 0,
          citedCount,
          costSumUsd: runs.reduce((sum, r) => sum + (r.costUsd ?? 0), 0),
          durationAvgMs: Math.round(
            runs.reduce((sum, r) => sum + (r.durationMs ?? 0), 0) / runs.length,
          ),
          dominantBrandSentiment,
        },
        runs,
      });
    }
  }
  return batches.sort((a, b) => b.latestScheduledAt.getTime() - a.latestScheduledAt.getTime());
}

export interface DemoBundle {
  dashboard: DashboardData;
  trend: VisibilityTrendPoint[];
}

export function buildDemoBundle(today: Date = new Date()): DemoBundle {
  const metricsToday = buildMetricsToday(today);
  const aggregated = aggregateMetrics(metricsToday);
  const recentBatches = buildRecentBatches(today);
  const trend = buildDemoTrend(today);

  const dashboard: DashboardData = {
    workspace: { id: "demo-workspace", name: "Démo · Floréal", plan: "starter" },
    brand: { id: "demo-brand", name: DEMO_BRAND_NAME, domain: DEMO_BRAND_DOMAIN, aiPixelKey: null },
    competitorsCount: DEMO_COMPETITORS.length,
    promptsCount: DEMO_PROMPTS.length,
    metricsToday,
    metricsAggregated: aggregated,
    recentBatches,
    usage: {
      periodStart: isoDateDaysAgo(0, today).slice(0, 7) + "-01",
      llmCostUsd: 4.32,
      runsCount: 60 * 5 * 5, // 60 j × 5 LLMs × 5 prompts
    },
  };

  return { dashboard, trend };
}
