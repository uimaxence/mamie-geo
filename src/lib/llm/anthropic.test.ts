import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { createAnthropicClient } from "./anthropic";

// Tests sans appel réseau : on injecte un fake fetch dans le SDK Anthropic
// qui retourne une cassette JSON enregistrée préalablement.
// Cassettes dans tests/fixtures/llm/claude/.
// Pour réenregistrer une cassette : `pnpm tsx scripts/record-llm-cassette.ts claude <name>`.

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

describe("createAnthropicClient", () => {
  it("extrait le texte, les sources citées et calcule le coût", async () => {
    const cassette = await loadCassette("sample-fr-visibility");
    const client = createAnthropicClient({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(cassette),
    });

    const response = await client.execute({
      prompt: "Quels sont les meilleurs outils SEO francophones en 2026 ?",
      language: "fr",
    });

    expect(response.text).toContain("Mamie SEO");
    expect(response.model).toBe("claude-sonnet-4-6");

    // Sources prioritaires : celles citées dans le text block (2/3 résultats)
    expect(response.sources).toHaveLength(2);
    expect(response.sources[0]?.url).toBe("https://www.mamie-seo.fr/outils-seo-2026");
    expect(response.sources[1]?.url).toBe("https://abondance.com/comparatif-outils-seo-fr");

    expect(response.usage).toEqual({
      inputTokens: 245,
      outputTokens: 312,
      webSearchRequests: 1,
    });

    // Coût attendu (Sonnet 4.6) :
    // 245 × 3$/Mtok = 0.000735
    // 312 × 15$/Mtok = 0.00468
    // 1 search × 0.01$ = 0.01
    // Total ≈ 0.015415
    expect(response.costUsd).toBeCloseTo(0.015415, 6);
    expect(response.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("retombe sur les web_search_tool_result quand le modèle ne cite rien", async () => {
    const cassette = await loadCassette("sample-no-citations");
    const client = createAnthropicClient({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(cassette),
    });

    const response = await client.execute({
      prompt: "Test prompt",
    });

    // Pas de citations dans le text block → fallback sur les résultats de recherche
    expect(response.sources).toHaveLength(1);
    expect(response.sources[0]?.url).toBe("https://example.com/result");
    expect(response.sources[0]?.pageAge).toBeNull();
  });

  it("expose le LLM identifier 'claude'", () => {
    const client = createAnthropicClient({ apiKey: "test-key" });
    expect(client.llm).toBe("claude");
  });

  it("rejette un modèle sans tarif", () => {
    expect(() => createAnthropicClient({ apiKey: "test-key", model: "claude-fictif-9-9" })).toThrow(
      /Tarif inconnu/,
    );
  });

  // Cassette enregistrée le 2026-05-06 contre l'API réelle. Sert de garde-fou
  // si l'API évolue ou si on touche au parser. À régénérer avec
  // `pnpm llm:record real-fr-visibility "..."` quand le shape de réponse change.
  it("parse une réponse réelle de l'API Anthropic (cassette enregistrée)", async () => {
    const cassette = await loadCassette("real-fr-visibility");
    const client = createAnthropicClient({
      apiKey: "test-key",
      fetch: fakeFetchFromCassette(cassette),
    });

    const response = await client.execute({
      prompt: "Quels sont les meilleurs outils SEO francophones en 2026 ?",
      language: "fr",
    });

    expect(response.text.length).toBeGreaterThan(500);
    expect(response.sources.length).toBeGreaterThan(0);
    // Tous les sources doivent avoir une URL valide
    for (const source of response.sources) {
      expect(source.url).toMatch(/^https?:\/\//);
      expect(source.title).toBeTruthy();
    }
    // Cost réel à ~10¢ — utile pour tracker que la tarification est appliquée
    expect(response.costUsd).toBeGreaterThan(0.05);
    expect(response.costUsd).toBeLessThan(0.5);
  });
});
