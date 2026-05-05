import { describe, expect, it } from "vitest";
import { buildIdempotencyKey } from "./types";

// Tests unit du format de l'idempotency_key. Les tests d'intégration
// (vraie BDD, vraie INSERT) viendront en Sprint 1 sur branche Neon test.
describe("buildIdempotencyKey", () => {
  it("formate execute_prompt avec date du jour ISO", () => {
    const key = buildIdempotencyKey({
      kind: "execute_prompt",
      payload: { promptId: "abc", llm: "claude", runId: "r1" },
    });
    expect(key).toMatch(/^execute_prompt:abc:claude:\d{4}-\d{2}-\d{2}$/);
  });

  it("formate score_response sur runId", () => {
    expect(buildIdempotencyKey({ kind: "score_response", payload: { runId: "r42" } })).toBe(
      "score_response:r42",
    );
  });

  it("formate send_weekly_email avec workspace + isoWeek", () => {
    expect(
      buildIdempotencyKey({
        kind: "send_weekly_email",
        payload: { workspaceId: "ws1", isoWeek: "2026-W18" },
      }),
    ).toBe("send_weekly_email:ws1:2026-W18");
  });

  it("formate recompute_metrics avec brand + date", () => {
    expect(
      buildIdempotencyKey({
        kind: "recompute_metrics",
        payload: { brandId: "b1", date: "2026-05-06" },
      }),
    ).toBe("recompute_metrics:b1:2026-05-06");
  });
});
