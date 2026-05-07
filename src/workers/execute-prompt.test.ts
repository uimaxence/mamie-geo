import { describe, expect, it } from "vitest";
import { parseExecutePromptPayload } from "./execute-prompt-payload";

// Tests d'intégration full DB (vrai prompt → vrai run) viendront avec
// le setup branch-Neon-par-PR (cf. CLAUDE.md § Tests intégration Drizzle).
// Pour PR 2 on couvre uniquement la validation de payload, qui est la
// barrière entre la queue (jsonb arbitraire) et le worker.

describe("parseExecutePromptPayload", () => {
  it("accepte un payload valide", () => {
    const parsed = parseExecutePromptPayload({
      promptId: "prompt-uuid",
      runId: "run-uuid",
      llm: "claude",
    });
    expect(parsed).toEqual({
      promptId: "prompt-uuid",
      runId: "run-uuid",
      llm: "claude",
    });
  });

  it("rejette un payload null", () => {
    expect(() => parseExecutePromptPayload(null)).toThrow(/must be an object/);
  });

  it("rejette un payload sans promptId", () => {
    expect(() => parseExecutePromptPayload({ runId: "r", llm: "claude" })).toThrow(
      /promptId\/runId\/llm/,
    );
  });

  it("rejette un llm hors enum", () => {
    expect(() => parseExecutePromptPayload({ promptId: "p", runId: "r", llm: "fakebot" })).toThrow(
      /llm invalide/,
    );
  });

  it("ignore les champs additionnels (forward-compat)", () => {
    const parsed = parseExecutePromptPayload({
      promptId: "p",
      runId: "r",
      llm: "claude",
      experimental_metadata: { foo: "bar" },
    });
    expect(parsed.promptId).toBe("p");
    expect(parsed.runId).toBe("r");
    expect(parsed.llm).toBe("claude");
  });
});
