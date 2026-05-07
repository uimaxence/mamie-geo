import { describe, expect, it } from "vitest";
import { aggregateVisibility, type RunScoring } from "./visibility";

// Helper pour fabriquer un RunScoring avec scoring complet
function runWithScoring(scoring: {
  brandMentioned: boolean;
  brandSentiment: "positive" | "neutral" | "negative" | "absent";
  brandPosition: "first_paragraph" | "middle" | "end" | "absent";
  competitors?: Array<{ name: string; sentiment: "positive" | "neutral" | "negative" }>;
}): RunScoring {
  return {
    parsedBrands: {
      detection: [],
      scoring: {
        brandMentioned: scoring.brandMentioned,
        brandSentiment: scoring.brandSentiment,
        brandPosition: scoring.brandPosition,
        competitorsMentioned: scoring.competitors ?? [],
        costUsd: 0,
        durationMs: 0,
        model: "test",
      },
      scoredAt: "2026-05-07T00:00:00Z",
    },
  };
}

function runSkipped(): RunScoring {
  return {
    parsedBrands: {
      detection: [],
      scoring: { skipped: true, reason: "no_mention_detected_by_regex" },
      scoredAt: "2026-05-07T00:00:00Z",
    },
  };
}

describe("aggregateVisibility", () => {
  it("retourne tout à 0 sur un ensemble vide", () => {
    const agg = aggregateVisibility([]);
    expect(agg).toEqual({
      totalRuns: 0,
      brandCitedCount: 0,
      visibilityScore: 0,
      competitorsData: [],
    });
  });

  it("score 100 si toutes les runs mentionnent en first_paragraph + positive", () => {
    const runs = [
      runWithScoring({
        brandMentioned: true,
        brandSentiment: "positive",
        brandPosition: "first_paragraph",
      }),
      runWithScoring({
        brandMentioned: true,
        brandSentiment: "positive",
        brandPosition: "first_paragraph",
      }),
    ];
    const agg = aggregateVisibility(runs);
    expect(agg.totalRuns).toBe(2);
    expect(agg.brandCitedCount).toBe(2);
    expect(agg.visibilityScore).toBe(100);
  });

  it("score 0 si aucune run ne mentionne la marque", () => {
    const runs = [
      runWithScoring({
        brandMentioned: false,
        brandSentiment: "absent",
        brandPosition: "absent",
      }),
      runSkipped(),
    ];
    const agg = aggregateVisibility(runs);
    expect(agg.totalRuns).toBe(2);
    expect(agg.brandCitedCount).toBe(0);
    expect(agg.visibilityScore).toBe(0);
  });

  it("compte les runs skipped dans totalRuns mais pas dans weight", () => {
    const runs = [
      runWithScoring({
        brandMentioned: true,
        brandSentiment: "positive",
        brandPosition: "first_paragraph",
      }),
      runSkipped(),
    ];
    const agg = aggregateVisibility(runs);
    expect(agg.totalRuns).toBe(2);
    expect(agg.brandCitedCount).toBe(1);
    // 1 run pleine (4.5) sur 2 runs × 4.5 max = 50
    expect(agg.visibilityScore).toBe(50);
  });

  it("pondère par position et sentiment correctement", () => {
    const runs = [
      // Run 1 : middle + neutral = 2 × 1 = 2
      runWithScoring({
        brandMentioned: true,
        brandSentiment: "neutral",
        brandPosition: "middle",
      }),
      // Run 2 : end + negative = 1 × 0.5 = 0.5
      runWithScoring({
        brandMentioned: true,
        brandSentiment: "negative",
        brandPosition: "end",
      }),
    ];
    const agg = aggregateVisibility(runs);
    expect(agg.brandCitedCount).toBe(2);
    // Total weight = 2.5 / (2 × 4.5) × 100 = 27.78
    expect(agg.visibilityScore).toBe(27.78);
  });

  it("agrège les concurrents par nom avec breakdown sentiments", () => {
    const runs = [
      runWithScoring({
        brandMentioned: true,
        brandSentiment: "positive",
        brandPosition: "first_paragraph",
        competitors: [
          { name: "Profound", sentiment: "positive" },
          { name: "Peec AI", sentiment: "neutral" },
        ],
      }),
      runWithScoring({
        brandMentioned: false,
        brandSentiment: "absent",
        brandPosition: "absent",
        competitors: [
          { name: "Profound", sentiment: "neutral" },
          { name: "Profound", sentiment: "negative" },
        ],
      }),
    ];
    const agg = aggregateVisibility(runs);
    expect(agg.competitorsData).toHaveLength(2);
    // Trié par citationCount desc
    expect(agg.competitorsData[0]?.name).toBe("Profound");
    expect(agg.competitorsData[0]?.citationCount).toBe(3);
    expect(agg.competitorsData[0]?.sentiments).toEqual({
      positive: 1,
      neutral: 1,
      negative: 1,
    });
    expect(agg.competitorsData[1]?.name).toBe("Peec AI");
    expect(agg.competitorsData[1]?.citationCount).toBe(1);
  });

  it("score arrondi à 2 décimales", () => {
    // 1 run avec middle + positive = 2 × 1.5 = 3 / 4.5 = 66.666... → 66.67
    const runs = [
      runWithScoring({
        brandMentioned: true,
        brandSentiment: "positive",
        brandPosition: "middle",
      }),
    ];
    expect(aggregateVisibility(runs).visibilityScore).toBe(66.67);
  });
});
