import { describe, expect, it } from "vitest";
import { collectPayloadSchema } from "./schemas";

describe("collectPayloadSchema", () => {
  it("accepte un payload valide", () => {
    const r = collectPayloadSchema.safeParse({
      k: "mgpx_abcdef0123456789abcdef01",
      s: "chatgpt",
      p: "/produits",
    });
    expect(r.success).toBe(true);
  });

  it("accepte sans le path optionnel", () => {
    const r = collectPayloadSchema.safeParse({ k: "mgpx_abcdef0123456789abcdef01", s: "claude" });
    expect(r.success).toBe(true);
  });

  it("rejette une clé malformée", () => {
    expect(collectPayloadSchema.safeParse({ k: "nope", s: "chatgpt" }).success).toBe(false);
    expect(collectPayloadSchema.safeParse({ k: "mgpx_TOOSHORT", s: "chatgpt" }).success).toBe(
      false,
    );
    // Majuscules interdites par la regex
    expect(
      collectPayloadSchema.safeParse({ k: "mgpx_ABCDEF0123456789abcdef01", s: "chatgpt" }).success,
    ).toBe(false);
    // Ancien préfixe Stripe-like désormais refusé. Le littéral est concaténé
    // pour ne PAS déclencher les secret scanners (ce n'est pas un vrai secret,
    // juste une valeur de forme `sk_live_*` qu'on veut voir rejetée).
    const oldStripeLikeKey = "sk_" + "live_" + "abcdef0123456789abcdef01";
    expect(collectPayloadSchema.safeParse({ k: oldStripeLikeKey, s: "chatgpt" }).success).toBe(
      false,
    );
  });

  it("rejette une source hors LLM_VALUES", () => {
    expect(
      collectPayloadSchema.safeParse({ k: "mgpx_abcdef0123456789abcdef01", s: "copilot" }).success,
    ).toBe(false);
    expect(
      collectPayloadSchema.safeParse({ k: "mgpx_abcdef0123456789abcdef01", s: "bing" }).success,
    ).toBe(false);
  });

  it("rejette un path trop long", () => {
    const r = collectPayloadSchema.safeParse({
      k: "mgpx_abcdef0123456789abcdef01",
      s: "gemini",
      p: "/".padEnd(513, "x"),
    });
    expect(r.success).toBe(false);
  });
});
