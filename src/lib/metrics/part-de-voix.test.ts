import { describe, expect, it } from "vitest";
import { computePartDeVoix, type RunWithScoring } from "./part-de-voix";
import type { ParsedBrandsPayload } from "@/lib/citation/types";

// Tests sur la formule glossaire :
//   percentage = brand / (brand + Σ competitor) × 100

function runScored(opts: {
  brandMentioned: boolean;
  competitors?: string[];
}): RunWithScoring {
  const parsedBrands: ParsedBrandsPayload = {
    detection: [],
    scoring: {
      brandMentioned: opts.brandMentioned,
      brandSentiment: opts.brandMentioned ? "neutral" : "absent",
      brandPosition: opts.brandMentioned ? "middle" : "absent",
      competitorsMentioned: (opts.competitors ?? []).map((name) => ({
        name,
        sentiment: "neutral" as const,
      })),
      costUsd: 0.001,
      durationMs: 100,
      model: "test",
    },
    scoredAt: "2026-05-18T10:00:00Z",
  };
  return { parsedBrands };
}

function runSkipped(): RunWithScoring {
  return {
    parsedBrands: {
      detection: [],
      scoring: { skipped: true, reason: "regex 0 match" },
      scoredAt: "2026-05-18T10:00:00Z",
    },
  };
}

describe("computePartDeVoix", () => {
  it("0 brand + 0 competitor → percentage = 0 (pas de division par 0)", () => {
    const result = computePartDeVoix([
      runScored({ brandMentioned: false }),
      runScored({ brandMentioned: false }),
    ]);
    expect(result.brandCitations).toBe(0);
    expect(result.competitorCitations).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it("brand citée 5×, 0 concurrent → 100%", () => {
    const result = computePartDeVoix([
      runScored({ brandMentioned: true }),
      runScored({ brandMentioned: true }),
      runScored({ brandMentioned: true }),
      runScored({ brandMentioned: true }),
      runScored({ brandMentioned: true }),
    ]);
    expect(result.brandCitations).toBe(5);
    expect(result.competitorCitations).toBe(0);
    expect(result.percentage).toBe(100);
  });

  it("brand 2× / concurrents 8× → 20%", () => {
    const result = computePartDeVoix([
      runScored({ brandMentioned: true, competitors: ["A", "B", "C", "D"] }),
      runScored({ brandMentioned: true, competitors: ["A", "B", "C", "D"] }),
    ]);
    expect(result.brandCitations).toBe(2);
    expect(result.competitorCitations).toBe(8);
    expect(result.percentage).toBe(20);
  });

  it("ignore les runs skipped (pre-screening regex 0 match)", () => {
    const result = computePartDeVoix([
      runScored({ brandMentioned: true, competitors: ["A"] }),
      runSkipped(),
      runSkipped(),
    ]);
    expect(result.brandCitations).toBe(1);
    expect(result.competitorCitations).toBe(1);
    expect(result.percentage).toBe(50);
  });

  it("ignore les runs sans parsedBrands (pending)", () => {
    const result = computePartDeVoix([
      runScored({ brandMentioned: true }),
      { parsedBrands: null },
    ]);
    expect(result.brandCitations).toBe(1);
    expect(result.competitorCitations).toBe(0);
    expect(result.percentage).toBe(100);
  });

  it("plusieurs concurrents par run sont sommés", () => {
    const result = computePartDeVoix([
      runScored({ brandMentioned: true, competitors: ["A", "B", "C"] }),
    ]);
    // 1 brand + 3 concurrents → 25%
    expect(result.competitorCitations).toBe(3);
    expect(result.percentage).toBe(25);
  });

  it("arrondit à 1 décimale", () => {
    // 1 brand / (1 + 2) = 33.333… → arrondi à 33.3
    const result = computePartDeVoix([
      runScored({ brandMentioned: true, competitors: ["A", "B"] }),
    ]);
    expect(result.percentage).toBe(33.3);
  });

  it("retourne 0 si tableau vide", () => {
    expect(computePartDeVoix([])).toEqual({
      brandCitations: 0,
      competitorCitations: 0,
      percentage: 0,
    });
  });
});
