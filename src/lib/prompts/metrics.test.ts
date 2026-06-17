import { describe, expect, it } from "vitest";
import { aggregatePromptMetrics, type PromptRunForMetrics } from "./metrics";

// Helper : fabrique un run scoré pour un jour donné (YYYY-MM-DD).
function run(opts: {
  day: string;
  brandMentioned: boolean;
  brandSentiment?: "positive" | "neutral" | "negative" | "absent";
  brandPosition?: "first_paragraph" | "middle" | "end" | "absent";
  competitors?: Array<{ name: string; sentiment: "positive" | "neutral" | "negative" }>;
  executed?: boolean;
}): PromptRunForMetrics {
  return {
    scheduledAt: new Date(`${opts.day}T06:00:00Z`),
    executedAt: opts.executed === false ? null : new Date(`${opts.day}T06:05:00Z`),
    parsedBrands: {
      detection: [],
      scoring: {
        brandMentioned: opts.brandMentioned,
        brandSentiment: opts.brandSentiment ?? (opts.brandMentioned ? "neutral" : "absent"),
        brandPosition: opts.brandPosition ?? (opts.brandMentioned ? "middle" : "absent"),
        competitorsMentioned: opts.competitors ?? [],
        costUsd: 0,
        durationMs: 0,
        model: "test",
      },
      scoredAt: `${opts.day}T06:05:00Z`,
    },
  };
}

function runSkipped(day: string): PromptRunForMetrics {
  return {
    scheduledAt: new Date(`${day}T06:00:00Z`),
    executedAt: new Date(`${day}T06:05:00Z`),
    parsedBrands: {
      detection: [],
      scoring: { skipped: true, reason: "no_mention_detected_by_regex" },
      scoredAt: `${day}T06:05:00Z`,
    },
  };
}

describe("aggregatePromptMetrics", () => {
  it("retourne des métriques neutres sur une fenêtre vide", () => {
    const m = aggregatePromptMetrics([]);
    expect(m).toEqual({
      rang: null,
      visibilityScore: 0,
      mentions: 0,
      totalRuns: 0,
      topCompetitors: [],
      persistance: 0,
      lastAnalyzedAt: null,
    });
  });

  it("rang = 1 quand la marque est la plus citée", () => {
    const runs = [
      run({ day: "2026-06-01", brandMentioned: true, competitors: [{ name: "Asics", sentiment: "neutral" }] }),
      run({ day: "2026-06-02", brandMentioned: true, competitors: [{ name: "Asics", sentiment: "neutral" }] }),
      run({ day: "2026-06-03", brandMentioned: true }),
    ];
    const m = aggregatePromptMetrics(runs);
    expect(m.mentions).toBe(3);
    expect(m.rang).toBe(1); // marque 3, Asics 2
  });

  it("rang = 3 quand deux concurrents sont plus cités", () => {
    const runs = [
      run({
        day: "2026-06-01",
        brandMentioned: true,
        competitors: [
          { name: "Asics", sentiment: "neutral" },
          { name: "Nike", sentiment: "neutral" },
        ],
      }),
      run({
        day: "2026-06-02",
        brandMentioned: false,
        competitors: [
          { name: "Asics", sentiment: "neutral" },
          { name: "Nike", sentiment: "neutral" },
        ],
      }),
    ];
    const m = aggregatePromptMetrics(runs);
    expect(m.mentions).toBe(1); // marque citée 1×
    expect(m.rang).toBe(3); // Asics 2 et Nike 2 strictement > 1
  });

  it("rang null si la marque n'est jamais citée", () => {
    const runs = [
      run({ day: "2026-06-01", brandMentioned: false, competitors: [{ name: "Asics", sentiment: "neutral" }] }),
      runSkipped("2026-06-02"),
    ];
    const m = aggregatePromptMetrics(runs);
    expect(m.mentions).toBe(0);
    expect(m.rang).toBeNull();
  });

  it("tronque les top concurrents à 3", () => {
    const runs = [
      run({
        day: "2026-06-01",
        brandMentioned: true,
        competitors: [
          { name: "A", sentiment: "neutral" },
          { name: "B", sentiment: "neutral" },
          { name: "C", sentiment: "neutral" },
          { name: "D", sentiment: "neutral" },
        ],
      }),
    ];
    const m = aggregatePromptMetrics(runs);
    expect(m.topCompetitors).toHaveLength(3);
  });

  it("persistance = part des jours-avec-run où la marque est citée", () => {
    const runs = [
      run({ day: "2026-06-01", brandMentioned: true }),
      run({ day: "2026-06-02", brandMentioned: false }),
      runSkipped("2026-06-03"), // jour avec run, marque non citée
      run({ day: "2026-06-04", brandMentioned: true }),
    ];
    const m = aggregatePromptMetrics(runs);
    // 2 jours cités / 4 jours avec run = 50
    expect(m.persistance).toBe(50);
  });

  it("dédoublonne les jours et garde le dernier executedAt", () => {
    const runs = [
      run({ day: "2026-06-01", brandMentioned: true }),
      run({ day: "2026-06-01", brandMentioned: true }), // même jour, 2e LLM
      run({ day: "2026-06-02", brandMentioned: false, executed: false }),
    ];
    const m = aggregatePromptMetrics(runs);
    expect(m.persistance).toBe(50); // 1 jour cité / 2 jours
    expect(m.lastAnalyzedAt).toEqual(new Date("2026-06-01T06:05:00Z"));
  });
});
