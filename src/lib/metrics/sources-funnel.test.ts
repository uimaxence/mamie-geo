import { describe, expect, it } from "vitest";
import {
  aggregateSourcesFunnel,
  deriveSourcesFunnelRatios,
  type FunnelRun,
} from "./sources-funnel";
import type { LLMSource } from "@/lib/llm/types";
import type { ParsedBrandsPayload } from "@/lib/citation/types";

const BRAND = { domain: "mamie-geo.fr", aliases: [] };

function source(url: string): LLMSource {
  return { url, title: "", pageAge: null };
}

function mentionedScoring(): ParsedBrandsPayload {
  return {
    detection: [],
    scoring: {
      brandMentioned: true,
      brandSentiment: "positive",
      brandPosition: "first_paragraph",
      competitorsMentioned: [],
      costUsd: 0,
      durationMs: 0,
      model: "test",
    },
    scoredAt: "2026-06-08T00:00:00.000Z",
  };
}

function notMentionedScoring(): ParsedBrandsPayload {
  return {
    detection: [],
    scoring: {
      brandMentioned: false,
      brandSentiment: "absent",
      brandPosition: "absent",
      competitorsMentioned: [],
      costUsd: 0,
      durationMs: 0,
      model: "test",
    },
    scoredAt: "2026-06-08T00:00:00.000Z",
  };
}

describe("aggregateSourcesFunnel", () => {
  it("compte retrievedCount par run, retrievalsTotal somme des apparitions", () => {
    const runs: FunnelRun[] = [
      {
        parsedCitations: [source("https://mamie-geo.fr/a"), source("https://mamie-geo.fr/b")],
        parsedBrands: mentionedScoring(),
      },
      {
        parsedCitations: [source("https://example.com/")],
        parsedBrands: notMentionedScoring(),
      },
      {
        parsedCitations: [source("https://www.mamie-geo.fr/c")],
        parsedBrands: mentionedScoring(),
      },
    ];
    const agg = aggregateSourcesFunnel(runs, BRAND);
    expect(agg.retrievedCount).toBe(2); // runs 1 et 3
    expect(agg.retrievalsTotal).toBe(3); // 2 + 0 + 1
  });

  it("citation = apparition + brandMentioned (les deux)", () => {
    const runs: FunnelRun[] = [
      // Apparait + mentionnée → +1 citation
      {
        parsedCitations: [source("https://mamie-geo.fr/")],
        parsedBrands: mentionedScoring(),
      },
      // Apparait mais pas mentionnée explicitement
      {
        parsedCitations: [source("https://mamie-geo.fr/")],
        parsedBrands: notMentionedScoring(),
      },
      // Mentionnée mais pas sourcée (pas de URL)
      { parsedCitations: [], parsedBrands: mentionedScoring() },
    ];
    const agg = aggregateSourcesFunnel(runs, BRAND);
    expect(agg.citationsCount).toBe(1);
  });

  it("gère parsedCitations / parsedBrands null", () => {
    const runs: FunnelRun[] = [
      { parsedCitations: null, parsedBrands: null },
      { parsedCitations: null, parsedBrands: mentionedScoring() },
    ];
    expect(aggregateSourcesFunnel(runs, BRAND)).toEqual({
      retrievedCount: 0,
      retrievalsTotal: 0,
      citationsCount: 0,
    });
  });

  it("retourne 0,0,0 sur une fenêtre vide", () => {
    expect(aggregateSourcesFunnel([], BRAND)).toEqual({
      retrievedCount: 0,
      retrievalsTotal: 0,
      citationsCount: 0,
    });
  });
});

describe("deriveSourcesFunnelRatios", () => {
  it("calcule Apparition, Fréquence et Citation correctement", () => {
    const r = deriveSourcesFunnelRatios({
      totalRuns: 10,
      retrievedCount: 4,
      retrievalsTotal: 12,
      citationsCount: 3,
    });
    expect(r.apparitionPct).toBe(40); // 4/10
    expect(r.frequence).toBe(3); // 12/4
    expect(r.citationPct).toBe(25); // 3/12
  });

  it("retourne 0 quand les dénominateurs sont 0 (pas de NaN)", () => {
    const r = deriveSourcesFunnelRatios({
      totalRuns: 0,
      retrievedCount: 0,
      retrievalsTotal: 0,
      citationsCount: 0,
    });
    expect(r.apparitionPct).toBe(0);
    expect(r.frequence).toBe(0);
    expect(r.citationPct).toBe(0);
  });
});
