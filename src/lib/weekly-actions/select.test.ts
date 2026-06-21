import { describe, expect, it } from "vitest";
import type { ActionContext } from "./catalog";
import { selectWeeklyActions } from "./select";

function ctx(overrides: Partial<ActionContext> = {}): ActionContext {
  return {
    promptsCount: 5,
    competitorsCount: 3,
    totalRuns: 20,
    brandCitedCount: 15,
    topCompetitor: { name: "Globex", citationCount: 8 },
    sources: { retrievedCount: 10, retrievalsTotal: 12, citationsCount: 9 },
    bestLlm: { label: "Claude", value: 60 },
    worstLlm: { label: "ChatGPT", value: 45 },
    rank: { rank: 1, outOf: 6, previousRank: 1, reliable: true, aheadName: null, gapToAhead: null },
    audit: { everRun: true, criticalIssues: 0 },
    ...overrides,
  };
}

const EMPTY = new Set<string>();

describe("selectWeeklyActions", () => {
  it("retourne [] quand rien n'est applicable", () => {
    expect(selectWeeklyActions(ctx(), EMPTY)).toEqual([]);
  });

  it("priorise add-first-prompts en n°1 pour un compte vide", () => {
    const result = selectWeeklyActions(ctx({ promptsCount: 0, competitorsCount: 0 }), EMPTY);
    expect(result[0]?.slug).toBe("add-first-prompts");
  });

  it("cap le nombre d'actions à `max`", () => {
    // Contexte qui déclenche plusieurs familles distinctes.
    const multi = ctx({
      promptsCount: 1,
      competitorsCount: 0,
      brandCitedCount: 1,
      topCompetitor: { name: "Globex", citationCount: 9 },
      worstLlm: { label: "Gemini", value: 5 },
      audit: { everRun: true, criticalIssues: 4 },
    });
    expect(selectWeeklyActions(multi, EMPTY, 2)).toHaveLength(2);
    expect(selectWeeklyActions(multi, EMPTY, 1)).toHaveLength(1);
  });

  it("exclut les slugs déjà traités (dismissedSlugs)", () => {
    const c = ctx({ promptsCount: 0 });
    const dismissed = new Set(["add-first-prompts"]);
    const result = selectWeeklyActions(c, dismissed);
    expect(result.find((a) => a.slug === "add-first-prompts")).toBeUndefined();
  });

  it("ne retient qu'une action par famille (rank : defend > climb)", () => {
    // Rang qui a reculé ET > 1 → defend-rank-loss (high) et climb-one-rank
    // (medium) déclenchent tous deux, famille "rank". Une seule sort.
    const c = ctx({
      rank: { rank: 4, outOf: 8, previousRank: 2, reliable: true, aheadName: "Hooli", gapToAhead: 3 },
    });
    const result = selectWeeklyActions(c, EMPTY, 5);
    const rankSlugs = result.filter((a) => a.slug === "defend-rank-loss" || a.slug === "climb-one-rank");
    expect(rankSlugs).toHaveLength(1);
    expect(rankSlugs[0]?.slug).toBe("defend-rank-loss");
  });

  it("trie par impact × applicabilité décroissant", () => {
    const c = ctx({
      competitorsCount: 0,
      brandCitedCount: 0,
      topCompetitor: { name: "Globex", citationCount: 10 },
    });
    const result = selectWeeklyActions(c, EMPTY, 5);
    const scores = result.map((a) => a.priorityScore);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it("résout le geoTip lié quand présent", () => {
    const c = ctx({ competitorsCount: 0, topCompetitor: { name: "Globex", citationCount: 5 } });
    const result = selectWeeklyActions(c, EMPTY);
    const track = result.find((a) => a.slug === "track-competitors");
    expect(track?.geoTip?.slug).toBe("branding");
  });
});
