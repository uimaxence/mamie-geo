import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { createPerplexityClient, extractSources, extractText } from "./perplexity";
import { LLMError } from "./types";

// Tests sans appel réseau : on injecte un fake fetch qui retourne une
// cassette JSON. Pattern identique à anthropic.test.ts et mistral.test.ts.
// Cassettes dans tests/fixtures/llm/perplexity/.
//
// Note : pas de smoke test live au merge de ce PR — pas de clé
// PERPLEXITY_API_KEY en V0+ (crédit min $50 chez Perplexity). Le smoke
// sera fait quand l'utilisateur ajoutera la clé après ses premières
// ventes. cf. doc 09 § 2026-05-18.

const FIXTURES_DIR = fileURLToPath(
  new URL("../../../tests/fixtures/llm/perplexity/", import.meta.url),
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

function fakeFetchError(status: number, body: string): typeof fetch {
  return vi.fn(
    async () =>
      new Response(body, {
        status,
        headers: { "content-type": "text/plain" },
      }),
  ) as unknown as typeof fetch;
}

describe("createPerplexityClient", () => {
  it("extrait le texte, les sources et calcule le coût (sonar)", async () => {
    const cassette = await loadCassette("sample-fr-visibility");
    const client = createPerplexityClient({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(cassette),
    });

    const response = await client.execute({
      prompt: "Quels sont les meilleurs outils SEO francophones en 2026 ?",
      language: "fr",
    });

    expect(response.text).toContain("Mamie SEO");
    expect(response.model).toBe("sonar");

    // search_results prioritaire sur citations (3 sources vs 2)
    expect(response.sources).toHaveLength(3);
    expect(response.sources[0]?.url).toBe("https://www.mamie-seo.fr/outils-seo-2026");
    expect(response.sources[0]?.pageAge).toBe("2026-03-15");

    expect(response.usage).toEqual({
      inputTokens: 90,
      outputTokens: 175,
      webSearchRequests: 1, // search natif inclus dans chaque requête
    });

    // sonar : 1$/Mtok input, 1$/Mtok output, 0.005$/call
    // 90 * 1 / 1M = 0.00009
    // 175 * 1 / 1M = 0.000175
    // 1 * 0.005 = 0.005
    // Total = 0.005265
    expect(response.costUsd).toBeCloseTo(0.005265, 6);
  });

  it("expose le LLM identifier 'perplexity'", () => {
    const client = createPerplexityClient({ apiKey: "test-key" });
    expect(client.llm).toBe("perplexity");
  });

  it("rejette un modèle sans tarif", () => {
    expect(() => createPerplexityClient({ apiKey: "test-key", model: "sonar-fictif" })).toThrow(
      /Tarif inconnu/,
    );
  });

  it("mappe HTTP 401 vers code 'auth'", async () => {
    const client = createPerplexityClient({
      apiKey: "test-key",
      fetch: fakeFetchError(401, "Unauthorized"),
    });
    await expect(client.execute({ prompt: "test" })).rejects.toMatchObject({
      llm: "perplexity",
      code: "auth",
    });
  });

  it("mappe HTTP 429 vers code 'rate_limit'", async () => {
    const client = createPerplexityClient({
      apiKey: "test-key",
      fetch: fakeFetchError(429, "Too many requests"),
    });
    await expect(client.execute({ prompt: "test" })).rejects.toMatchObject({
      code: "rate_limit",
    });
  });

  it("mappe HTTP 500+ vers code 'transient'", async () => {
    const client = createPerplexityClient({
      apiKey: "test-key",
      fetch: fakeFetchError(503, "Service unavailable"),
    });
    await expect(client.execute({ prompt: "test" })).rejects.toMatchObject({
      code: "transient",
    });
  });

  it("erreur réseau → LLMError code 'other'", async () => {
    const client = createPerplexityClient({
      apiKey: "test-key",
      fetch: vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }) as unknown as typeof fetch,
    });
    await expect(client.execute({ prompt: "test" })).rejects.toBeInstanceOf(LLMError);
  });
});

describe("extractText / extractSources helpers", () => {
  it("extractText retourne '' si pas de choices", () => {
    expect(extractText({ choices: [] } as never)).toBe("");
  });

  it("extractSources fallback sur citations[] si pas de search_results", () => {
    const sources = extractSources({
      citations: ["https://a.com", "https://b.com"],
      choices: [],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      id: "x",
      model: "sonar",
    } as never);
    expect(sources).toHaveLength(2);
    expect(sources[0]).toEqual({
      url: "https://a.com",
      title: "https://a.com",
      pageAge: null,
    });
  });

  it("extractSources dédoublonne entre search_results et citations", () => {
    const sources = extractSources({
      search_results: [{ url: "https://a.com", title: "A", date: "2026-01-01" }],
      citations: ["https://a.com", "https://b.com"],
      choices: [],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      id: "x",
      model: "sonar",
    } as never);
    // search_results prioritaire → on prend uniquement le format enrichi
    expect(sources).toHaveLength(1);
    expect(sources[0]?.url).toBe("https://a.com");
    expect(sources[0]?.title).toBe("A");
  });
});
