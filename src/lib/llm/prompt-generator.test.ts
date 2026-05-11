import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { createAnthropicPromptGenerator } from "./prompt-generator";

// Tests sans appel réseau — même pattern que anthropic.test.ts et
// citation/score.test.ts. Cassette JSON injectée via fake fetch.

const FIXTURES_DIR = fileURLToPath(new URL("../../../tests/fixtures/llm/claude/", import.meta.url));

async function loadCassette(name: string) {
  const raw = await readFile(`${FIXTURES_DIR}${name}.json`, "utf-8");
  return JSON.parse(raw);
}

function fakeFetchFromCassette(cassette: unknown): typeof fetch {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(cassette), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
  ) as unknown as typeof fetch;
}

describe("createAnthropicPromptGenerator", () => {
  it("génère 5 prompts à partir d'une marque + domaine", async () => {
    const cassette = await loadCassette("prompt-suggestion");
    const generator = createAnthropicPromptGenerator({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(cassette),
    });

    const result = await generator.suggest({
      brandName: "Mamie GEO",
      domain: "mamie-geo.fr",
      language: "fr",
      competitors: ["Profound", "Peec AI", "RankIQ"],
    });

    expect(result.prompts).toHaveLength(5);
    expect(result.prompts[0]).toMatch(/SEO francophones/);
    expect(result.prompts.every((p) => p.length >= 8 && p.length <= 280)).toBe(true);
    expect(result.model).toBe("claude-haiku-4-5-20251001");
    // Coût attendu Haiku : 380 × 1$/Mtok + 220 × 5$/Mtok ≈ 0.00148
    expect(result.costUsd).toBeCloseTo(0.00148, 5);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("tronque si Haiku renvoie plus que count demandé", async () => {
    const cassette = await loadCassette("prompt-suggestion");
    const generator = createAnthropicPromptGenerator({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(cassette),
    });

    const result = await generator.suggest({
      brandName: "Mamie GEO",
      domain: "mamie-geo.fr",
      language: "fr",
      count: 3,
    });
    expect(result.prompts).toHaveLength(3);
  });

  it("clamp count entre 3 et 10", async () => {
    const cassette = await loadCassette("prompt-suggestion");
    const generator = createAnthropicPromptGenerator({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(cassette),
    });

    // count=20 → clamp à 10 ; comme la cassette a 5 prompts, on récupère 5.
    const result = await generator.suggest({
      brandName: "X",
      domain: "x.fr",
      language: "fr",
      count: 20,
    });
    expect(result.prompts.length).toBeLessThanOrEqual(10);
  });

  it("lève si la réponse contient < 3 prompts valides", async () => {
    const badCassette = {
      id: "msg_01",
      type: "message",
      role: "assistant",
      model: "claude-haiku-4-5-20251001",
      stop_reason: "tool_use",
      content: [
        {
          type: "tool_use",
          id: "tu_01",
          name: "report_prompts",
          input: { prompts: ["trop", 42, null, ""] },
        },
      ],
      usage: { input_tokens: 100, output_tokens: 30, server_tool_use: null },
    };
    const generator = createAnthropicPromptGenerator({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(badCassette),
    });

    await expect(
      generator.suggest({
        brandName: "X",
        domain: "x.fr",
        language: "fr",
      }),
    ).rejects.toThrow(/min 3/);
  });

  it("rejette un modèle sans tarif", () => {
    expect(() =>
      createAnthropicPromptGenerator({ apiKey: "test-key", model: "claude-fictif-9-9" }),
    ).toThrow(/Tarif inconnu/);
  });
});
