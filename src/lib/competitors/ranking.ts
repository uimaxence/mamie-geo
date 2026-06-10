import type { LLMValue } from "@/lib/llm";
import type { CompetitorAggregate } from "@/lib/metrics/visibility";
import { normalizeBrandToken } from "./metrics";

// Ranking concurrentiel (cf. doc 02 § Ranking concurrentiel, étapes 1+2).
// Classe ta marque, tes concurrents trackés et les marques détectées non
// suivies par nombre de mentions sur une fenêtre glissante, avec delta de
// rang vs la même fenêtre décalée de `deltaDays`.
//
// Source de données : `citation_metrics_daily` — `brandCitedCount` pour ta
// marque et `competitorsData` (jsonb agrégé par le worker recompute depuis
// la Phase A) pour toutes les marques mentionnées. Tout est SQL/JS pur,
// zéro appel LLM : l'historisation existait déjà, on ne fait que la lire.

export interface RankingDailyRow {
  llm: LLMValue;
  /** YYYY-MM-DD (UTC) — comparée lexicalement, format ISO trié. */
  date: string;
  totalRuns: number;
  brandCitedCount: number;
  competitorsData: CompetitorAggregate[] | null;
}

export interface RankingCompetitorInput {
  id: string;
  name: string;
  aliases: readonly string[];
  domain: string | null;
}

export type RankingEntityType = "you" | "competitor" | "discovered";

export interface RankingEntry {
  /** "you" | competitor.id | "discovered:<token>" — stable pour le rendu. */
  key: string;
  name: string;
  type: RankingEntityType;
  domain: string | null;
  /** Runs de la fenêtre courante où l'entité est mentionnée. */
  mentions: number;
  /** mentions / totalRuns fenêtre courante, 1 décimale. */
  apparitionPct: number;
  /** 1-based, après tri mentions desc. */
  rank: number;
  /**
   * Rang sur la fenêtre précédente (même durée, décalée de deltaDays),
   * null si aucune donnée sur cette fenêtre.
   */
  previousRank: number | null;
}

export interface ComputeRankingOptions {
  rows: readonly RankingDailyRow[];
  windowDays: number;
  deltaDays: number;
  brand: { name: string; aliases: readonly string[]; domain: string | null };
  competitors: readonly RankingCompetitorInput[];
  /** Filtre optionnel sur un seul LLM. */
  llm?: LLMValue;
  /** Cap des marques détectées non suivies dans le classement (déf. 5). */
  maxDiscovered?: number;
  /** Injectable pour les tests. */
  now: Date;
}

const DEFAULT_MAX_DISCOVERED = 5;

export function computeRanking(options: ComputeRankingOptions): RankingEntry[] {
  const { windowDays, deltaDays, brand, competitors, now } = options;
  const maxDiscovered = options.maxDiscovered ?? DEFAULT_MAX_DISCOVERED;

  const rows = options.llm ? options.rows.filter((r) => r.llm === options.llm) : options.rows;

  // Bornes de fenêtres en YYYY-MM-DD (comparaison lexicale ISO).
  const currentStart = isoDaysAgo(now, windowDays);
  const previousStart = isoDaysAgo(now, windowDays + deltaDays);
  const previousEnd = isoDaysAgo(now, deltaDays);

  const currentRows = rows.filter((r) => r.date > currentStart);
  const previousRows = rows.filter((r) => r.date > previousStart && r.date <= previousEnd);

  const current = aggregateWindow(currentRows, brand, competitors);
  const previous = aggregateWindow(previousRows, brand, competitors);

  // Marques détectées : cap aux top N de la fenêtre courante.
  const keptDiscovered = new Set(
    [...current.entities.values()]
      .filter((e) => e.type === "discovered")
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, maxDiscovered)
      .map((e) => e.key),
  );

  const currentEntries = [...current.entities.values()].filter(
    (e) => e.type !== "discovered" || keptDiscovered.has(e.key),
  );
  sortEntities(currentEntries);

  // Rang précédent : classement complet de la fenêtre précédente (sans
  // cap discovered — un rang précédent doit refléter la réalité d'alors).
  const previousSorted = [...previous.entities.values()];
  sortEntities(previousSorted);
  const previousRankByKey = new Map(previousSorted.map((e, i) => [e.key, i + 1]));
  const hasPreviousData = previousRows.some((r) => r.totalRuns > 0);

  return currentEntries.map((e, i) => ({
    key: e.key,
    name: e.name,
    type: e.type,
    domain: e.domain,
    mentions: e.mentions,
    apparitionPct:
      current.totalRuns === 0 ? 0 : Math.round((e.mentions / current.totalRuns) * 1000) / 10,
    rank: i + 1,
    previousRank: hasPreviousData ? (previousRankByKey.get(e.key) ?? null) : null,
  }));
}

interface WindowEntity {
  key: string;
  name: string;
  type: RankingEntityType;
  domain: string | null;
  mentions: number;
}

function aggregateWindow(
  rows: readonly RankingDailyRow[],
  brand: { name: string; aliases: readonly string[]; domain: string | null },
  competitors: readonly RankingCompetitorInput[],
): { totalRuns: number; entities: Map<string, WindowEntity> } {
  const entities = new Map<string, WindowEntity>();

  // Ta marque et les concurrents trackés sont toujours présents, même à
  // zéro mention — un classement qui fait disparaître les absents masque
  // l'info la plus importante (« tu n'es pas cité »).
  entities.set("you", { key: "you", name: brand.name, type: "you", domain: brand.domain, mentions: 0 });
  const competitorKeyByToken = new Map<string, string>();
  for (const c of competitors) {
    entities.set(c.id, { key: c.id, name: c.name, type: "competitor", domain: c.domain, mentions: 0 });
    for (const token of [c.name, ...c.aliases].map(normalizeBrandToken)) {
      if (token) competitorKeyByToken.set(token, c.id);
    }
  }
  const brandTokens = new Set([brand.name, ...brand.aliases].map(normalizeBrandToken));

  let totalRuns = 0;
  for (const row of rows) {
    totalRuns += row.totalRuns;
    const you = entities.get("you");
    if (you) you.mentions += row.brandCitedCount;

    for (const agg of row.competitorsData ?? []) {
      const token = normalizeBrandToken(agg.name);
      if (!token || brandTokens.has(token)) continue;

      const trackedKey = competitorKeyByToken.get(token);
      const key = trackedKey ?? `discovered:${token}`;
      let entity = entities.get(key);
      if (!entity) {
        entity = { key, name: agg.name, type: "discovered", domain: null, mentions: 0 };
        entities.set(key, entity);
      }
      entity.mentions += agg.citationCount;
    }
  }

  return { totalRuns, entities };
}

// Tri du classement : mentions desc, puis ta marque avant à égalité
// (lisibilité : la ligne « toi » remonte), puis alphabétique stable.
function sortEntities(entities: WindowEntity[]): void {
  entities.sort((a, b) => {
    if (b.mentions !== a.mentions) return b.mentions - a.mentions;
    if (a.type === "you") return -1;
    if (b.type === "you") return 1;
    return a.name.localeCompare(b.name, "fr");
  });
}

function isoDaysAgo(now: Date, days: number): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}
