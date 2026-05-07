import { describe, expect, it } from "vitest";
import { parseRecomputeMetricsPayload } from "./recompute-payload";

// Tests intégration DB (vrai SELECT + UPSERT) attendent le setup
// branch-Neon-par-PR. Pour PR 4 on couvre la validation payload.

describe("parseRecomputeMetricsPayload", () => {
  it("accepte un payload valide", () => {
    expect(
      parseRecomputeMetricsPayload({
        brandId: "uuid",
        llm: "claude",
        date: "2026-05-07",
      }),
    ).toEqual({
      brandId: "uuid",
      llm: "claude",
      date: "2026-05-07",
    });
  });

  it("rejette un payload null ou non-objet", () => {
    expect(() => parseRecomputeMetricsPayload(null)).toThrow(/must be an object/);
    expect(() => parseRecomputeMetricsPayload("nope")).toThrow(/must be an object/);
  });

  it("rejette un champ manquant", () => {
    expect(() => parseRecomputeMetricsPayload({ brandId: "u", llm: "claude" })).toThrow(
      /brandId\/llm\/date/,
    );
  });

  it("rejette un format de date invalide", () => {
    expect(() =>
      parseRecomputeMetricsPayload({ brandId: "u", llm: "claude", date: "07/05/2026" }),
    ).toThrow(/YYYY-MM-DD/);
  });

  it("rejette un LLM hors enum", () => {
    expect(() =>
      parseRecomputeMetricsPayload({ brandId: "u", llm: "fakebot", date: "2026-05-07" }),
    ).toThrow(/llm invalide/);
  });
});
