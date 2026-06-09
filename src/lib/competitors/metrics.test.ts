import { describe, expect, it } from "vitest";
import {
  aggregateSuggestedCompetitors,
  computeBrandSelfMetrics,
  computeCompetitorMetrics,
  type RunForMetrics,
} from "./metrics";
import type { ParsedBrandsPayload } from "@/lib/citation/types";

const COMPETITORS = [
  { id: "c1", name: "Profound", aliases: ["Profound Inc.", "profound.so"] },
  { id: "c2", name: "Peec AI", aliases: ["Peec", "peec.ai"] },
  { id: "c3", name: "Otterly", aliases: [] },
];

function makeRun(
  llm: RunForMetrics["llm"],
  executedAt: string,
  competitorsMentioned: Array<{ name: string; sentiment: "positive" | "neutral" | "negative" }>,
): RunForMetrics {
  const parsed: ParsedBrandsPayload = {
    detection: [],
    scoring: {
      brandMentioned: true,
      brandSentiment: "positive",
      brandPosition: "first_paragraph",
      competitorsMentioned,
      costUsd: 0,
      durationMs: 0,
      model: "claude-haiku-4-5-20251001",
    },
    scoredAt: executedAt,
  };
  return { llm, executedAt, parsedBrands: parsed };
}

describe("computeCompetitorMetrics", () => {
  it("renvoie des métriques vides quand pas de runs", () => {
    const result = computeCompetitorMetrics(COMPETITORS, []);
    expect(result).toEqual({
      c1: { citationsCount: 0, apparitionPct: 0, topLlm: null, lastCitedAt: null },
      c2: { citationsCount: 0, apparitionPct: 0, topLlm: null, lastCitedAt: null },
      c3: { citationsCount: 0, apparitionPct: 0, topLlm: null, lastCitedAt: null },
    });
  });

  it("compte chaque concurrent mentionné une fois par run, même cité plusieurs fois", () => {
    const runs: RunForMetrics[] = [
      makeRun("chatgpt", "2026-06-01T10:00:00Z", [
        { name: "Profound", sentiment: "positive" },
        { name: "Profound", sentiment: "positive" }, // doublon dans le même run
      ]),
      makeRun("claude", "2026-06-02T10:00:00Z", [{ name: "Profound", sentiment: "neutral" }]),
    ];
    const result = computeCompetitorMetrics(COMPETITORS, runs);
    expect(result.c1?.citationsCount).toBe(2); // 2 runs, pas 3
  });

  it("matche les aliases case-insensitive", () => {
    const runs: RunForMetrics[] = [
      makeRun("chatgpt", "2026-06-01T10:00:00Z", [{ name: "PROFOUND INC.", sentiment: "positive" }]),
      makeRun("claude", "2026-06-02T10:00:00Z", [{ name: "profound.so", sentiment: "positive" }]),
      makeRun("gemini", "2026-06-03T10:00:00Z", [{ name: "Peec", sentiment: "positive" }]),
    ];
    const result = computeCompetitorMetrics(COMPETITORS, runs);
    expect(result.c1?.citationsCount).toBe(2);
    expect(result.c2?.citationsCount).toBe(1);
    expect(result.c3?.citationsCount).toBe(0);
  });

  it("calcule apparitionPct sur le total des runs", () => {
    const runs: RunForMetrics[] = [
      makeRun("chatgpt", "2026-06-01T10:00:00Z", [{ name: "Profound", sentiment: "positive" }]),
      makeRun("claude", "2026-06-02T10:00:00Z", [{ name: "Profound", sentiment: "positive" }]),
      makeRun("perplexity", "2026-06-03T10:00:00Z", []),
      makeRun("gemini", "2026-06-04T10:00:00Z", []),
    ];
    const result = computeCompetitorMetrics(COMPETITORS, runs);
    expect(result.c1?.apparitionPct).toBe(50); // 2/4
  });

  it("identifie le top LLM", () => {
    const runs: RunForMetrics[] = [
      makeRun("chatgpt", "2026-06-01T10:00:00Z", [{ name: "Profound", sentiment: "positive" }]),
      makeRun("perplexity", "2026-06-02T10:00:00Z", [{ name: "Profound", sentiment: "positive" }]),
      makeRun("perplexity", "2026-06-03T10:00:00Z", [{ name: "Profound", sentiment: "positive" }]),
    ];
    const result = computeCompetitorMetrics(COMPETITORS, runs);
    expect(result.c1?.topLlm).toBe("perplexity");
  });

  it("résout les ex aequo via l'ordre canonique (ChatGPT > Claude > Perplexity > Gemini > Le Chat)", () => {
    const runs: RunForMetrics[] = [
      makeRun("gemini", "2026-06-01T10:00:00Z", [{ name: "Profound", sentiment: "positive" }]),
      makeRun("claude", "2026-06-02T10:00:00Z", [{ name: "Profound", sentiment: "positive" }]),
    ];
    const result = computeCompetitorMetrics(COMPETITORS, runs);
    // 1 vote claude, 1 vote gemini → claude gagne (canonical order)
    expect(result.c1?.topLlm).toBe("claude");
  });

  it("retient la dernière citation", () => {
    const runs: RunForMetrics[] = [
      makeRun("chatgpt", "2026-06-01T10:00:00Z", [{ name: "Profound", sentiment: "positive" }]),
      makeRun("claude", "2026-06-05T14:30:00Z", [{ name: "Profound", sentiment: "positive" }]),
      makeRun("gemini", "2026-06-03T10:00:00Z", [{ name: "Profound", sentiment: "positive" }]),
    ];
    const result = computeCompetitorMetrics(COMPETITORS, runs);
    expect(result.c1?.lastCitedAt).toBe("2026-06-05T14:30:00.000Z");
  });

  it("ignore les runs scoring.skipped et parsedBrands=null", () => {
    const runs: RunForMetrics[] = [
      {
        llm: "chatgpt",
        executedAt: "2026-06-01T10:00:00Z",
        parsedBrands: {
          detection: [],
          scoring: { skipped: true, reason: "regex 0" },
          scoredAt: "2026-06-01T10:00:00Z",
        },
      },
      {
        llm: "claude",
        executedAt: "2026-06-02T10:00:00Z",
        parsedBrands: null,
      },
      makeRun("gemini", "2026-06-03T10:00:00Z", [{ name: "Profound", sentiment: "positive" }]),
    ];
    const result = computeCompetitorMetrics(COMPETITORS, runs);
    expect(result.c1?.citationsCount).toBe(1);
    // apparitionPct = 1/3 ≈ 33.3 (les runs skipés comptent dans le dénominateur
    // pour rester cohérent avec « part des runs qui le citent »)
    expect(result.c1?.apparitionPct).toBe(33.3);
  });

  it("supporte les Date objects pour executedAt (pas que les strings ISO)", () => {
    const runs: RunForMetrics[] = [
      makeRun("chatgpt", "2026-06-01T10:00:00Z", [{ name: "Profound", sentiment: "positive" }]),
    ];
    runs[0]!.executedAt = new Date("2026-06-01T10:00:00Z");
    const result = computeCompetitorMetrics(COMPETITORS, runs);
    expect(result.c1?.lastCitedAt).toBe("2026-06-01T10:00:00.000Z");
  });
});

describe("aggregateSuggestedCompetitors", () => {
  const tracked = new Set(["profound", "profound inc.", "profound.so"]);
  const brand = new Set(["ma marque", "mamarque"]);

  it("propose les marques citées non suivies, triées par citations", () => {
    const runs: RunForMetrics[] = [
      makeRun("chatgpt", "2026-06-01T10:00:00Z", [
        { name: "Profound", sentiment: "positive" }, // suivi → exclu
        { name: "Ma Marque", sentiment: "positive" }, // soi → exclu
        { name: "Semrush", sentiment: "neutral" },
        { name: "Otterly", sentiment: "neutral" },
      ]),
      makeRun("claude", "2026-06-02T10:00:00Z", [{ name: "Semrush", sentiment: "positive" }]),
    ];
    const result = aggregateSuggestedCompetitors(runs, {
      trackedTokens: tracked,
      brandTokens: brand,
    });
    expect(result.map((r) => r.name)).toEqual(["Semrush", "Otterly"]);
    expect(result[0]?.citationsCount).toBe(2);
    expect(result[1]?.citationsCount).toBe(1);
  });

  it("compte 1× par run et garde la forme d'affichage la plus fréquente", () => {
    const runs: RunForMetrics[] = [
      makeRun("chatgpt", "2026-06-01T10:00:00Z", [
        { name: "semrush", sentiment: "positive" },
        { name: "Semrush", sentiment: "positive" }, // même run + variante de casse
      ]),
      makeRun("claude", "2026-06-02T10:00:00Z", [{ name: "Semrush", sentiment: "positive" }]),
    ];
    const result = aggregateSuggestedCompetitors(runs, {
      trackedTokens: new Set(),
      brandTokens: new Set(),
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Semrush"); // 2 occurrences vs 1
    expect(result[0]?.citationsCount).toBe(2); // 2 runs
  });

  it("respecte la limite", () => {
    const runs: RunForMetrics[] = [
      makeRun("chatgpt", "2026-06-01T10:00:00Z", [
        { name: "A", sentiment: "neutral" },
        { name: "B", sentiment: "neutral" },
        { name: "C", sentiment: "neutral" },
      ]),
    ];
    const result = aggregateSuggestedCompetitors(runs, {
      trackedTokens: new Set(),
      brandTokens: new Set(),
      limit: 2,
    });
    expect(result).toHaveLength(2);
  });

  it("renvoie un tableau vide sans mentions exploitables", () => {
    expect(
      aggregateSuggestedCompetitors([], { trackedTokens: new Set(), brandTokens: new Set() }),
    ).toEqual([]);
  });
});

describe("computeBrandSelfMetrics", () => {
  function runMentioned(mentioned: boolean): RunForMetrics {
    return {
      llm: "chatgpt",
      executedAt: "2026-06-01T10:00:00Z",
      parsedBrands: {
        detection: [],
        scoring: {
          brandMentioned: mentioned,
          brandSentiment: mentioned ? "positive" : "absent",
          brandPosition: mentioned ? "first_paragraph" : "absent",
          competitorsMentioned: [],
          costUsd: 0,
          durationMs: 0,
          model: "claude-haiku-4-5-20251001",
        },
        scoredAt: "2026-06-01T10:00:00Z",
      },
    };
  }

  it("calcule l'apparition sur le total des runs", () => {
    const result = computeBrandSelfMetrics([
      runMentioned(true),
      runMentioned(true),
      runMentioned(false),
      runMentioned(false),
    ]);
    expect(result.citationsCount).toBe(2);
    expect(result.apparitionPct).toBe(50);
  });

  it("ignore le scoring skipped/null dans le compteur mais pas le dénominateur", () => {
    const result = computeBrandSelfMetrics([
      runMentioned(true),
      { llm: "claude", executedAt: "2026-06-02T10:00:00Z", parsedBrands: null },
    ]);
    expect(result.citationsCount).toBe(1);
    expect(result.apparitionPct).toBe(50); // 1/2
  });

  it("renvoie 0 sans runs", () => {
    expect(computeBrandSelfMetrics([])).toEqual({ citationsCount: 0, apparitionPct: 0 });
  });
});
