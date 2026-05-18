import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { GenerateContentResponse } from "@google/genai";
import { extractSources, extractText, mapGoogleError } from "./google";
import { LLMError } from "./types";

// Tests sur les helpers de parsing/mapping. Pour les tests d'intégration
// end-to-end on lance le smoke test live (scripts/smoke-llm.ts gemini) —
// le SDK @google/genai n'expose pas d'injection fetch propre comme
// Anthropic/OpenAI, donc on teste séparément la couche de transformation.

const FIXTURES_DIR = fileURLToPath(
  new URL("../../../tests/fixtures/llm/gemini/", import.meta.url),
);

async function loadCassette(name: string): Promise<GenerateContentResponse> {
  const raw = await readFile(`${FIXTURES_DIR}${name}.json`, "utf-8");
  return JSON.parse(raw) as GenerateContentResponse;
}

describe("google parsing helpers", () => {
  it("extractText concatène tous les text parts du premier candidat", async () => {
    const response = await loadCassette("sample-fr-visibility");
    const text = extractText(response);
    expect(text).toContain("Mamie SEO");
    expect(text).toContain("Abondance");
  });

  it("extractText retourne string vide si pas de candidate", () => {
    expect(extractText({ candidates: [] } as unknown as GenerateContentResponse)).toBe("");
    expect(extractText({} as GenerateContentResponse)).toBe("");
  });

  it("extractSources extrait les groundingChunks.web avec dédoublonnage", async () => {
    const response = await loadCassette("sample-fr-visibility");
    const sources = extractSources(response);
    expect(sources).toHaveLength(3);
    expect(sources[0]?.url).toBe("https://www.mamie-seo.fr/outils-seo-2026");
    expect(sources[0]?.title).toBe("Les meilleurs outils SEO francophones en 2026 — Mamie SEO");
    expect(sources[0]?.pageAge).toBeNull();
  });

  it("extractSources dédoublonne les chunks pointant sur la même URL", () => {
    const dup = {
      candidates: [
        {
          groundingMetadata: {
            groundingChunks: [
              { web: { uri: "https://example.com/a", title: "A" } },
              { web: { uri: "https://example.com/a", title: "A bis" } },
              { web: { uri: "https://example.com/b", title: "B" } },
            ],
          },
        },
      ],
    } as unknown as GenerateContentResponse;

    const sources = extractSources(dup);
    expect(sources).toHaveLength(2);
    expect(sources.map((s) => s.url)).toEqual(["https://example.com/a", "https://example.com/b"]);
  });

  it("extractSources ignore les chunks sans uri", () => {
    const partial = {
      candidates: [
        {
          groundingMetadata: {
            groundingChunks: [
              { web: { title: "no uri" } },
              { web: { uri: "https://example.com/ok", title: "ok" } },
            ],
          },
        },
      ],
    } as unknown as GenerateContentResponse;

    const sources = extractSources(partial);
    expect(sources).toHaveLength(1);
    expect(sources[0]?.url).toBe("https://example.com/ok");
  });
});

describe("mapGoogleError", () => {
  it("mappe HTTP 401 vers code 'auth'", () => {
    const err = mapGoogleError({ status: 401, message: "Invalid API key" });
    expect(err).toBeInstanceOf(LLMError);
    expect(err.llm).toBe("gemini");
    expect(err.code).toBe("auth");
  });

  it("mappe HTTP 429 vers code 'rate_limit'", () => {
    const err = mapGoogleError({ status: 429, message: "Quota exceeded" });
    expect(err.code).toBe("rate_limit");
  });

  it("mappe HTTP 500+ vers code 'transient'", () => {
    const err = mapGoogleError({ status: 503, message: "Service unavailable" });
    expect(err.code).toBe("transient");
  });

  it("détecte un code HTTP dans un message d'erreur sans status field", () => {
    const err = mapGoogleError(new Error("Request failed with 429 — too many requests"));
    expect(err.code).toBe("rate_limit");
  });

  it("retourne 'other' pour les erreurs sans status ni code dans le message", () => {
    const err = mapGoogleError(new Error("Unknown network failure"));
    expect(err.code).toBe("other");
  });
});
