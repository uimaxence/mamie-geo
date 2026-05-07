import { describe, expect, it } from "vitest";
import { parseScoreResponsePayload } from "./score-response-payload";

// Comme execute-prompt.test.ts : on couvre la validation payload.
// L'intégration full DB attend le setup branch-Neon-par-PR.

describe("parseScoreResponsePayload", () => {
  it("accepte un payload valide", () => {
    expect(parseScoreResponsePayload({ runId: "uuid" })).toEqual({ runId: "uuid" });
  });

  it("rejette null", () => {
    expect(() => parseScoreResponsePayload(null)).toThrow(/must be an object/);
  });

  it("rejette un payload sans runId", () => {
    expect(() => parseScoreResponsePayload({ foo: "bar" })).toThrow(/runId string/);
  });

  it("rejette un runId non-string", () => {
    expect(() => parseScoreResponsePayload({ runId: 42 })).toThrow(/runId string/);
  });

  it("ignore les champs additionnels (forward-compat)", () => {
    const parsed = parseScoreResponsePayload({ runId: "uuid", future_field: "xyz" });
    expect(parsed).toEqual({ runId: "uuid" });
  });
});
