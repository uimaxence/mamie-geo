import type { LLMValue } from "@/lib/llm";
import type { ParsedBrandsPayload } from "@/lib/citation/types";

// Métriques par concurrent extraites des `runs.parsedBrands.scoring.competitorsMentioned`
// sur une fenêtre donnée. Tout est SQL/JS pur — pas d'IA — on réutilise
// la détection LLM déjà faite par le worker `score_response`.
//
// Le matching `scoring.name` ↔ `competitor.{name, aliases}` est
// case-insensitive et tolérant aux espaces. Le LLM peut renvoyer
// "Profound" alors que la DB stocke "profound.so" ou "Profound Inc.",
// donc on normalise des deux côtés avant comparaison.

export interface CompetitorMetricsInput {
  id: string;
  name: string;
  aliases: readonly string[];
}

export interface RunForMetrics {
  llm: LLMValue;
  executedAt: Date | string;
  parsedBrands: ParsedBrandsPayload | null;
}

export interface CompetitorMetrics {
  /** Nombre de runs distincts où le concurrent est mentionné sur la fenêtre. */
  citationsCount: number;
  /** Pourcentage de runs où le concurrent apparaît, sur le total des runs success. */
  apparitionPct: number;
  /** LLM qui mentionne le plus le concurrent (ex aequo : premier dans l'ordre ChatGPT/Claude/Perplexity/Gemini/Le Chat). */
  topLlm: LLMValue | null;
  /** Date ISO du dernier run où le concurrent apparaît, ou null si jamais. */
  lastCitedAt: string | null;
}

export type CompetitorMetricsMap = Record<string, CompetitorMetrics>;

const EMPTY_METRICS: CompetitorMetrics = {
  citationsCount: 0,
  apparitionPct: 0,
  topLlm: null,
  lastCitedAt: null,
};

// Ordre canonique pour le tie-break sur Top LLM. Aligné avec
// LLM_ORDER ailleurs dans le code (cf. `src/lib/runs/batches-grouping.ts`).
const LLM_TIE_BREAK_ORDER: LLMValue[] = ["chatgpt", "claude", "perplexity", "gemini", "lechat"];

export function computeCompetitorMetrics(
  competitors: readonly CompetitorMetricsInput[],
  runs: readonly RunForMetrics[],
): CompetitorMetricsMap {
  const totalRuns = runs.length;
  const result: CompetitorMetricsMap = {};

  // Pre-build : pour chaque concurrent, le set de tokens normalisés à matcher
  // (name + aliases). Tokens stockés en lower-case, espaces collapsés.
  const matchersByCompetitor = competitors.map((c) => ({
    competitor: c,
    tokens: new Set([c.name, ...c.aliases].map(normalize)),
  }));

  // État accumulé par concurrent : compteur LLM, count global, last date.
  type Accum = {
    citationsCount: number;
    perLlm: Map<LLMValue, number>;
    lastCitedAt: Date | null;
  };
  const accumByCompetitorId = new Map<string, Accum>();
  for (const c of competitors) {
    accumByCompetitorId.set(c.id, {
      citationsCount: 0,
      perLlm: new Map(),
      lastCitedAt: null,
    });
  }

  for (const run of runs) {
    const scoring = run.parsedBrands?.scoring;
    if (!scoring || "skipped" in scoring) continue;
    if (scoring.competitorsMentioned.length === 0) continue;

    const executedDate =
      run.executedAt instanceof Date ? run.executedAt : new Date(run.executedAt);

    // Set des concurrents déjà comptés POUR CE RUN. Un concurrent
    // mentionné plusieurs fois dans la même réponse compte pour 1 run.
    const matchedInThisRun = new Set<string>();

    for (const mention of scoring.competitorsMentioned) {
      const mentionToken = normalize(mention.name);
      if (!mentionToken) continue;

      for (const { competitor, tokens } of matchersByCompetitor) {
        if (matchedInThisRun.has(competitor.id)) continue;
        if (!tokens.has(mentionToken)) continue;

        const accum = accumByCompetitorId.get(competitor.id);
        if (!accum) continue;

        accum.citationsCount += 1;
        accum.perLlm.set(run.llm, (accum.perLlm.get(run.llm) ?? 0) + 1);
        if (!accum.lastCitedAt || executedDate > accum.lastCitedAt) {
          accum.lastCitedAt = executedDate;
        }
        matchedInThisRun.add(competitor.id);
      }
    }
  }

  for (const c of competitors) {
    const accum = accumByCompetitorId.get(c.id);
    if (!accum || accum.citationsCount === 0) {
      result[c.id] = EMPTY_METRICS;
      continue;
    }
    result[c.id] = {
      citationsCount: accum.citationsCount,
      apparitionPct:
        totalRuns === 0 ? 0 : Math.round((accum.citationsCount / totalRuns) * 1000) / 10,
      topLlm: pickTopLlm(accum.perLlm),
      lastCitedAt: accum.lastCitedAt ? accum.lastCitedAt.toISOString() : null,
    };
  }

  return result;
}

/**
 * Concurrent détecté par les IA mais PAS encore suivi. Extrait de
 * `scoring.competitorsMentioned` — donc déjà payé (aucun appel LLM en
 * plus). Sert à proposer à l'utilisateur d'ajouter des marques que les
 * IA citent sur son marché et qu'il ne traque pas.
 */
export interface SuggestedCompetitor {
  /** Forme d'affichage la plus fréquente renvoyée par les LLMs. */
  name: string;
  /** Nombre de runs distincts où la marque apparaît. */
  citationsCount: number;
  /** LLM qui la mentionne le plus (même tie-break que les métriques). */
  topLlm: LLMValue | null;
  /** Date ISO de la dernière apparition. */
  lastCitedAt: string | null;
}

export interface SuggestedCompetitorsOptions {
  /** Tokens normalisés des concurrents déjà suivis (name + aliases). */
  trackedTokens: ReadonlySet<string>;
  /** Tokens normalisés de ta marque (name + aliases) — exclus du bruit. */
  brandTokens: ReadonlySet<string>;
  /** Nombre max de suggestions renvoyées (défaut 8). */
  limit?: number;
}

const DEFAULT_SUGGESTIONS_LIMIT = 8;

/**
 * Agrège les marques citées dans `scoring.competitorsMentioned` qui ne
 * correspondent ni à un concurrent suivi ni à ta marque, classées par
 * nombre de runs décroissant. Pure / testable, zéro IA. La normalisation
 * de matching est volontairement minimale (lower + collapse espaces) :
 * le LLM peut renvoyer des variantes ("Profound" / "Profound Inc."), un
 * dédup plus fin viendra avec le classifier V1.
 */
export function aggregateSuggestedCompetitors(
  runs: readonly RunForMetrics[],
  options: SuggestedCompetitorsOptions,
): SuggestedCompetitor[] {
  const limit = options.limit ?? DEFAULT_SUGGESTIONS_LIMIT;

  type Accum = {
    citationsCount: number;
    perLlm: Map<LLMValue, number>;
    lastCitedAt: Date | null;
    /** Compteur des formes d'affichage pour choisir la plus fréquente. */
    surfaceForms: Map<string, number>;
  };
  const byToken = new Map<string, Accum>();

  for (const run of runs) {
    const scoring = run.parsedBrands?.scoring;
    if (!scoring || "skipped" in scoring) continue;
    if (scoring.competitorsMentioned.length === 0) continue;

    const executedDate =
      run.executedAt instanceof Date ? run.executedAt : new Date(run.executedAt);

    // Un token compté 1× par run même mentionné plusieurs fois.
    const countedInThisRun = new Set<string>();

    for (const mention of scoring.competitorsMentioned) {
      const token = normalize(mention.name);
      if (!token) continue;
      if (options.trackedTokens.has(token) || options.brandTokens.has(token)) continue;

      let accum = byToken.get(token);
      if (!accum) {
        accum = { citationsCount: 0, perLlm: new Map(), lastCitedAt: null, surfaceForms: new Map() };
        byToken.set(token, accum);
      }

      const surface = mention.name.trim();
      accum.surfaceForms.set(surface, (accum.surfaceForms.get(surface) ?? 0) + 1);

      if (!countedInThisRun.has(token)) {
        accum.citationsCount += 1;
        accum.perLlm.set(run.llm, (accum.perLlm.get(run.llm) ?? 0) + 1);
        if (!accum.lastCitedAt || executedDate > accum.lastCitedAt) {
          accum.lastCitedAt = executedDate;
        }
        countedInThisRun.add(token);
      }
    }
  }

  const suggestions: SuggestedCompetitor[] = Array.from(byToken.values()).map((accum) => ({
    name: pickMostFrequent(accum.surfaceForms),
    citationsCount: accum.citationsCount,
    topLlm: pickTopLlm(accum.perLlm),
    lastCitedAt: accum.lastCitedAt ? accum.lastCitedAt.toISOString() : null,
  }));

  suggestions.sort((a, b) => {
    if (b.citationsCount !== a.citationsCount) return b.citationsCount - a.citationsCount;
    return (b.lastCitedAt ?? "").localeCompare(a.lastCitedAt ?? "");
  });

  return suggestions.slice(0, limit);
}

function pickMostFrequent(forms: Map<string, number>): string {
  let best = "";
  let bestCount = -1;
  for (const [form, count] of forms) {
    if (count > bestCount) {
      best = form;
      bestCount = count;
    }
  }
  return best;
}

/** Métriques de ta propre marque, baseline pour la comparaison « vs toi ». */
export interface BrandSelfMetrics {
  /** Nombre de runs où ta marque est citée (scoring.brandMentioned). */
  citationsCount: number;
  /** % de runs success où ta marque apparaît — même dénominateur que les
   *  concurrents, donc directement comparable. */
  apparitionPct: number;
}

/**
 * Calcule l'apparition de ta marque sur la même fenêtre/dénominateur que
 * `computeCompetitorMetrics`, pour afficher la ligne « Vous » en référence
 * et le delta « vs toi » sur chaque concurrent. Pur, zéro IA.
 */
export function computeBrandSelfMetrics(runs: readonly RunForMetrics[]): BrandSelfMetrics {
  const totalRuns = runs.length;
  let citationsCount = 0;
  for (const run of runs) {
    const scoring = run.parsedBrands?.scoring;
    if (!scoring || "skipped" in scoring) continue;
    if (scoring.brandMentioned) citationsCount += 1;
  }
  return {
    citationsCount,
    apparitionPct: totalRuns === 0 ? 0 : Math.round((citationsCount / totalRuns) * 1000) / 10,
  };
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Normalisation de matching marque ↔ mention LLM (lower + collapse
 * espaces), partagée avec le ranking (`ranking.ts`) pour garantir que
 * les deux features matchent exactement pareil.
 */
export const normalizeBrandToken = normalize;

function pickTopLlm(perLlm: Map<LLMValue, number>): LLMValue | null {
  if (perLlm.size === 0) return null;
  let bestLlm: LLMValue | null = null;
  let bestCount = -1;
  // On itère dans l'ordre canonique pour résoudre les ex aequo de manière
  // stable (déterministe, indépendant de l'ordre d'insertion).
  for (const llm of LLM_TIE_BREAK_ORDER) {
    const count = perLlm.get(llm) ?? 0;
    if (count > bestCount) {
      bestLlm = llm;
      bestCount = count;
    }
  }
  return bestLlm;
}
