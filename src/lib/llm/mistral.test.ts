import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { createMistralClient } from "./mistral";
import { LLMError } from "./types";

// Tests sans appel réseau : on injecte un fake fetch qui retourne une
// cassette JSON. Pattern identique à anthropic.test.ts pour cohérence.
// Cassettes dans tests/fixtures/llm/lechat/.

const FIXTURES_DIR = fileURLToPath(new URL("../../../tests/fixtures/llm/lechat/", import.meta.url));

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

function fakeFetchError(status: number, body: string): typeof fetch {
  return vi.fn(
    async () =>
      new Response(body, {
        status,
        headers: { "content-type": "text/plain" },
      }),
  ) as unknown as typeof fetch;
}

describe("createMistralClient", () => {
  it("extrait le texte, retourne sources vides et calcule le coût", async () => {
    const cassette = await loadCassette("sample-fr-visibility");
    const client = createMistralClient({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(cassette),
    });

    const response = await client.execute({
      prompt: "Quels sont les meilleurs outils SEO francophones en 2026 ?",
      language: "fr",
    });

    expect(response.text).toContain("Mamie SEO");
    expect(response.model).toBe("mistral-large-latest");

    // V0+ : pas de grounding natif, sources vides systématiquement
    expect(response.sources).toEqual([]);

    expect(response.usage).toEqual({
      inputTokens: 180,
      outputTokens: 240,
      webSearchRequests: 0,
    });

    // Mistral large-latest : 2.2$/Mtok input, 6.6$/Mtok output, pas de search
    // 180 × 2.2 / 1M = 0.000396
    // 240 × 6.6 / 1M = 0.001584
    // Total ≈ 0.00198
    expect(response.costUsd).toBeCloseTo(0.00198, 6);
    expect(response.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("expose le LLM identifier 'lechat'", () => {
    const client = createMistralClient({ apiKey: "test-key" });
    expect(client.llm).toBe("lechat");
  });

  it("rejette un modèle sans tarif", () => {
    expect(() => createMistralClient({ apiKey: "test-key", model: "mistral-fictif-9-9" })).toThrow(
      /Tarif inconnu/,
    );
  });

  it("mappe HTTP 401 vers LLMError code 'auth'", async () => {
    const client = createMistralClient({
      apiKey: "test-key",
      fetch: fakeFetchError(401, "Unauthorized"),
    });

    await expect(client.execute({ prompt: "test" })).rejects.toMatchObject({
      name: "LLMError",
      llm: "lechat",
      code: "auth",
    });
  });

  it("mappe HTTP 429 vers LLMError code 'rate_limit'", async () => {
    const client = createMistralClient({
      apiKey: "test-key",
      fetch: fakeFetchError(429, "Too many requests"),
    });

    await expect(client.execute({ prompt: "test" })).rejects.toBeInstanceOf(LLMError);
    await expect(client.execute({ prompt: "test" })).rejects.toMatchObject({
      code: "rate_limit",
    });
  });

  it("mappe HTTP 500+ vers LLMError code 'transient'", async () => {
    const client = createMistralClient({
      apiKey: "test-key",
      fetch: fakeFetchError(503, "Service unavailable"),
    });

    await expect(client.execute({ prompt: "test" })).rejects.toMatchObject({
      code: "transient",
    });
  });

  it("mappe une erreur réseau vers LLMError code 'other'", async () => {
    const client = createMistralClient({
      apiKey: "test-key",
      fetch: vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }) as unknown as typeof fetch,
    });

    await expect(client.execute({ prompt: "test" })).rejects.toMatchObject({
      llm: "lechat",
      code: "other",
    });
  });

  it("retourne text vide si l'API ne fournit aucun choice", async () => {
    const client = createMistralClient({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette({
        id: "x",
        object: "chat.completion",
        created: 0,
        model: "mistral-large-latest",
        choices: [],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      }),
    });

    const response = await client.execute({ prompt: "test" });
    expect(response.text).toBe("");
    expect(response.costUsd).toBe(0);
  });
});
