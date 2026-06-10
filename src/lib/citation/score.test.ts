import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { createAnthropicScoringClient } from "./score";

// Tests sans appel réseau — fake fetch + cassettes JSON, même approche
// que src/lib/llm/anthropic.test.ts.

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

describe("createAnthropicScoringClient", () => {
  it("parse une réponse tool_use en ScoringResult", async () => {
    const cassette = await loadCassette("scoring-mamie-cited");
    const client = createAnthropicScoringClient({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(cassette),
    });

    const result = await client.score({
      rawText: "Selon Mamie GEO, le tracking GEO est essentiel… Profound et Peec AI…",
      brand: { name: "Mamie GEO", aliases: ["MamieGEO"] },
      competitors: [
        { name: "Profound", aliases: [] },
        { name: "Peec AI", aliases: ["Peec"] },
      ],
      language: "fr",
    });

    expect(result.brandMentioned).toBe(true);
    expect(result.brandSentiment).toBe("positive");
    expect(result.brandPosition).toBe("first_paragraph");
    expect(result.competitorsMentioned).toEqual([
      { name: "Profound", sentiment: "neutral" },
      { name: "Peec AI", sentiment: "positive" },
    ]);
    expect(result.model).toBe("claude-haiku-4-5-20251001");
    // Coût attendu Haiku 4.5 : 1240 × 1$/Mtok + 156 × 5$/Mtok = 0.001240 + 0.000780 ≈ 0.00202
    expect(result.costUsd).toBeCloseTo(0.00202, 5);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("rejette un modèle sans tarif", () => {
    expect(() =>
      createAnthropicScoringClient({ apiKey: "test-key", model: "claude-fictif-9-9" }),
    ).toThrow(/Tarif inconnu/);
  });

  it("lève une erreur si la réponse ne contient pas de tool_use report_scoring", async () => {
    const cassette = {
      id: "msg_01",
      type: "message",
      role: "assistant",
      model: "claude-haiku-4-5-20251001",
      stop_reason: "end_turn",
      content: [{ type: "text", text: "Je ne peux pas analyser cette réponse." }],
      usage: { input_tokens: 100, output_tokens: 20, server_tool_use: null },
    };
    const client = createAnthropicScoringClient({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(cassette),
    });

    await expect(
      client.score({
        rawText: "Test",
        brand: { name: "X", aliases: [] },
        competitors: [],
        language: "fr",
      }),
    ).rejects.toThrow(/sans tool_use/);
  });

  it("filtre les entrées competitorsMentioned malformées (defensive)", async () => {
    const cassette = {
      id: "msg_02",
      type: "message",
      role: "assistant",
      model: "claude-haiku-4-5-20251001",
      stop_reason: "tool_use",
      content: [
        {
          type: "tool_use",
          id: "tu_01",
          name: "report_scoring",
          input: {
            brandMentioned: false,
            brandSentiment: "absent",
            brandPosition: "absent",
            competitorsMentioned: [
              { name: "Valid", sentiment: "positive" },
              { name: 42, sentiment: "positive" }, // invalide
              { sentiment: "positive" }, // pas de name
              null,
              { name: "Valid2", sentiment: "wat" }, // sentiment hors enum
            ],
          },
        },
      ],
      usage: { input_tokens: 100, output_tokens: 20, server_tool_use: null },
    };
    const client = createAnthropicScoringClient({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(cassette),
    });

    const result = await client.score({
      rawText: "Test",
      brand: { name: "X", aliases: [] },
      competitors: [],
      language: "fr",
    });

    expect(result.competitorsMentioned).toEqual([{ name: "Valid", sentiment: "positive" }]);
  });

  it("parse la position des concurrents quand présente, l'omet sinon (compat anciens payloads)", async () => {
    const cassette = {
      id: "msg_03",
      type: "message",
      role: "assistant",
      model: "claude-haiku-4-5-20251001",
      stop_reason: "tool_use",
      content: [
        {
          type: "tool_use",
          id: "tu_02",
          name: "report_scoring",
          input: {
            brandMentioned: true,
            brandSentiment: "positive",
            brandPosition: "middle",
            competitorsMentioned: [
              { name: "Profound", sentiment: "neutral", position: "first_paragraph" },
              { name: "Peec AI", sentiment: "positive" }, // position omise
              { name: "Athena", sentiment: "neutral", position: "absent" }, // hors enum mention
            ],
          },
        },
      ],
      usage: { input_tokens: 100, output_tokens: 20, server_tool_use: null },
    };
    const client = createAnthropicScoringClient({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(cassette),
    });

    const result = await client.score({
      rawText: "Test",
      brand: { name: "X", aliases: [] },
      competitors: [],
      language: "fr",
    });

    expect(result.competitorsMentioned).toEqual([
      { name: "Profound", sentiment: "neutral", position: "first_paragraph" },
      { name: "Peec AI", sentiment: "positive" },
      { name: "Athena", sentiment: "neutral" },
    ]);
  });
});
