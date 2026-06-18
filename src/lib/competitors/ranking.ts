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

/**
 * Nombre de jours de données à partir duquel le classement est considéré
 * fiable. En dessous, l'UI affiche un hint discret « résultats encore
 * jeunes » qui disparaît de lui-même une fois le seuil atteint (cf.
 * doc 09 § 2026-06-10 ranking suite). 14 j = 2 cycles hebdo complets,
 * assez pour lisser les prompts en cadence weekly.
 */
export const RANKING_RELIABLE_AFTER_DAYS = 14;

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

// ── Évolution du rang (chart, doc 02 § Ranking étape 2 « reporté ») ──

export interface RankHistoryPoint {
  /** YYYY-MM-DD (UTC). */
  date: string;
  /** Rang de ta marque ce jour-là (fenêtre glissante), 1-based. */
  rank: number;
  /** Taille du classement ce jour-là (toi + marques citées + trackés). */
  outOf: number;
}

export interface ComputeRankHistoryOptions {
  rows: readonly RankingDailyRow[];
  /** Nombre de jours d'historique à produire (déf. 30). */
  windowDays: number;
  /** Fenêtre glissante de lissage pour le rang d'un jour (déf. 7). */
  smoothDays?: number;
  brand: { name: string; aliases: readonly string[]; domain: string | null };
  competitors: readonly RankingCompetitorInput[];
  llm?: LLMValue;
  now: Date;
}

const DEFAULT_SMOOTH_DAYS = 7;

/**
 * Série quotidienne du rang de ta marque sur les `windowDays` derniers
 * jours. Le rang d'un jour J est calculé sur la sous-fenêtre glissante
 * ]J-smoothDays, J] pour lisser les prompts en cadence weekly — même
 * logique d'agrégation que le leaderboard (computeRanking). Les jours
 * sans aucun run dans leur sous-fenêtre ne produisent pas de point
 * (pas de donnée ≠ rang stable).
 */
export function computeRankHistory(options: ComputeRankHistoryOptions): RankHistoryPoint[] {
  const { windowDays, brand, competitors, now } = options;
  const smoothDays = options.smoothDays ?? DEFAULT_SMOOTH_DAYS;
  const rows = options.llm ? options.rows.filter((r) => r.llm === options.llm) : options.rows;

  const points: RankHistoryPoint[] = [];
  for (let daysAgo = windowDays - 1; daysAgo >= 0; daysAgo--) {
    const dayEnd = isoDaysAgo(now, daysAgo);
    const dayStart = isoDaysAgo(now, daysAgo + smoothDays);
    const windowRows = rows.filter((r) => r.date > dayStart && r.date <= dayEnd);
    if (!windowRows.some((r) => r.totalRuns > 0)) continue;

    const { entities } = aggregateWindow(windowRows, brand, competitors);
    const sorted = [...entities.values()];
    sortEntities(sorted);
    const rank = sorted.findIndex((e) => e.key === "you") + 1;
    if (rank === 0) continue;
    points.push({ date: dayEnd, rank, outOf: sorted.length });
  }
  return points;
}

// ── Statut compétitif (phrase « où tu en es ») ───────────────────────
// Source de vérité UNIQUE de la phrase de rang, partagée par l'onglet
// Classement (citations) et la carte de rang du dashboard (cf. doc 09
// § 2026-06-17 — remontée du rang). Pur : rendu côté UI.

export type RankStatusKind = "leader" | "ranked" | "uncited-others" | "uncited-none";

export interface RankStatus {
  kind: RankStatusKind;
  /** Lecture relative : success = tu mènes, warning = on te précède/remplace. */
  tone: "success" | "neutral" | "warning";
  /** Icône suggérée pour l'UI. */
  icon: "trophy" | "target";
  /** Rang de ta marque (null si pas encore citée). */
  rank: number | null;
  /** Taille du classement (toi + concurrents + marques citées). */
  outOf: number;
  /** Rang sur la fenêtre précédente, pour le delta. */
  previousRank: number | null;
  /** Partie mise en gras (« Ta marque est n°2 »), vide pour les cas non cités. */
  headline: string;
  /** Reste de la phrase (« sur 8 tous LLMs confondus — à 3 citations de X (n°1) »). */
  detail: string;
}

/**
 * Construit la phrase de statut compétitif à partir d'un classement déjà
 * trié (`computeRanking`). `scopeLabel` = « tous LLMs confondus » ou
 * « sur ChatGPT ». Reproduit à l'identique le wording de l'onglet
 * Classement pour rester cohérent partout.
 */
export function buildRankStatus(entries: RankingEntry[], scopeLabel: string): RankStatus {
  const you = entries.find((e) => e.type === "you");

  if (!you || you.mentions === 0) {
    const someoneCited = entries.some((e) => e.mentions > 0);
    return {
      kind: someoneCited ? "uncited-others" : "uncited-none",
      tone: someoneCited ? "warning" : "neutral",
      icon: "target",
      rank: null,
      outOf: entries.length,
      previousRank: you?.previousRank ?? null,
      headline: "",
      detail: someoneCited
        ? `Ta marque n'a pas encore été citée sur la fenêtre, ${scopeLabel}. Le classement montre qui est recommandé à ta place : c'est ton point de départ.`
        : `Ta marque n'a pas encore été citée sur la fenêtre, ${scopeLabel}. Aucune marque suivie n'a été citée non plus : les IA répondent sans recommander de marque sur tes prompts actuels, ou les marques citées ne sont pas encore détectées.`,
    };
  }

  const above = entries.find((e) => e.rank === you.rank - 1);
  const below = entries.find((e) => e.rank === you.rank + 1);

  if (you.rank === 1) {
    const lead = below
      ? you.mentions === below.mentions
        ? `, à égalité de citations avec ${below.name}.`
        : `, ${you.mentions - below.mentions} citation${you.mentions - below.mentions > 1 ? "s" : ""} d'avance sur ${below.name}.`
      : ".";
    return {
      kind: "leader",
      tone: "success",
      icon: "trophy",
      rank: 1,
      outOf: entries.length,
      previousRank: you.previousRank,
      headline: "Ta marque est n°1",
      detail: ` ${scopeLabel}${lead}`,
    };
  }

  const gapDetail = above
    ? above.mentions === you.mentions
      ? `, à égalité de citations avec ${above.name} (n°${above.rank}).`
      : `, à ${above.mentions - you.mentions} citation${above.mentions - you.mentions > 1 ? "s" : ""} de ${above.name} (n°${above.rank}).`
    : ".";
  return {
    kind: "ranked",
    tone: "neutral",
    icon: "target",
    rank: you.rank,
    outOf: entries.length,
    previousRank: you.previousRank,
    headline: `Ta marque est n°${you.rank}`,
    detail: ` sur ${entries.length} ${scopeLabel}${gapDetail}`,
  };
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
  entities.set("you", {
    key: "you",
    name: brand.name,
    type: "you",
    domain: brand.domain,
    mentions: 0,
  });
  const competitorKeyByToken = new Map<string, string>();
  for (const c of competitors) {
    entities.set(c.id, {
      key: c.id,
      name: c.name,
      type: "competitor",
      domain: c.domain,
      mentions: 0,
    });
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
