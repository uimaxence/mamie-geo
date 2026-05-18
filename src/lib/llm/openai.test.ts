import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { createOpenAIClient } from "./openai";

// Tests sans appel réseau : on injecte un fake fetch qui retourne une
// cassette JSON. Pattern identique à anthropic.test.ts.
// Cassettes dans tests/fixtures/llm/chatgpt/.

const FIXTURES_DIR = fileURLToPath(
  new URL("../../../tests/fixtures/llm/chatgpt/", import.meta.url),
);

async function loadCassette(name: string) {
  const raw = await readFile(`${FIXTURES_DIR}${name}.json`, "utf-8");
  return JSON.parse(raw);
}

function fakeFetchFromCassette(cassette: unknown, status = 200): typeof fetch {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(cassette), {
        status,
        headers: { "content-type": "application/json" },
      }),
  ) as unknown as typeof fetch;
}

describe("createOpenAIClient", () => {
  it("extrait le texte, les sources citées et calcule le coût", async () => {
    const cassette = await loadCassette("sample-fr-visibility");
    const client = createOpenAIClient({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(cassette),
    });

    const response = await client.execute({
      prompt: "Quels sont les meilleurs outils SEO francophones en 2026 ?",
      language: "fr",
    });

    expect(response.text).toContain("Mamie SEO");
    expect(response.model).toBe("gpt-4o-mini-2024-07-18");

    expect(response.sources).toHaveLength(2);
    expect(response.sources[0]?.url).toBe("https://www.mamie-seo.fr/outils-seo-2026");
    expect(response.sources[1]?.url).toBe("https://www.abondance.com/comparatif-outils-seo-fr");

    expect(response.usage).toEqual({
      inputTokens: 230,
      outputTokens: 145,
      webSearchRequests: 1,
    });

    // gpt-4o-mini : 0.15$/Mtok input, 0.6$/Mtok output, 0.01$/web_search
    // 230 * 0.15 / 1M = 0.0000345
    // 145 * 0.6 / 1M = 0.000087
    // 1 search * 0.01 = 0.01
    // Total = 0.0101215
    expect(response.costUsd).toBeCloseTo(0.0101215, 6);
    expect(response.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("dédoublonne les sources citées plusieurs fois", async () => {
    const dup = {
      id: "resp_dup",
      object: "response",
      created_at: 0,
      status: "completed",
      model: "gpt-4o-mini-2024-07-18",
      output: [
        {
          type: "message",
          id: "m1",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              text: "test",
              annotations: [
                { type: "url_citation", url: "https://example.com/a", title: "A" },
                { type: "url_citation", url: "https://example.com/a", title: "A bis" },
                { type: "url_citation", url: "https://example.com/b", title: "B" },
              ],
            },
          ],
        },
      ],
      usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
    };
    const client = createOpenAIClient({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(dup),
    });

    const response = await client.execute({ prompt: "test" });
    expect(response.sources).toHaveLength(2);
    expect(response.sources.map((s) => s.url)).toEqual([
      "https://example.com/a",
      "https://example.com/b",
    ]);
  });

  it("expose le LLM identifier 'chatgpt'", () => {
    const client = createOpenAIClient({ apiKey: "test-key" });
    expect(client.llm).toBe("chatgpt");
  });

  it("rejette un modèle sans tarif", () => {
    expect(() => createOpenAIClient({ apiKey: "test-key", model: "gpt-fictif-9-9" })).toThrow(
      /Tarif inconnu/,
    );
  });

  it("compte 0 web_search si pas d'items web_search_call dans la réponse", async () => {
    const noSearch = {
      id: "resp_no_search",
      object: "response",
      created_at: 0,
      status: "completed",
      model: "gpt-4o-mini-2024-07-18",
      output: [
        {
          type: "message",
          id: "m1",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: "from knowledge", annotations: [] }],
        },
      ],
      usage: { input_tokens: 10, output_tokens: 20, total_tokens: 30 },
    };
    const client = createOpenAIClient({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(noSearch),
    });

    const response = await client.execute({ prompt: "test" });
    expect(response.usage.webSearchRequests).toBe(0);
    // Pas de web_search → coût = uniquement input + output tokens
    expect(response.costUsd).toBeCloseTo(0.0000135, 7);
  });
});
