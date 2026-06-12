import type { SearchFn, WebSearchResult } from "./types";

// Client Brave Search API (REST, pas de SDK). Choisi pour le scan
// comparateurs (doc 09 § 2026-06-12) : 5 $ de crédits offerts/mois
// (≈ 1 000 requêtes), puis 5 $/1 000 requêtes. Rate limit 50 req/s —
// le retry unique sur 429 est une ceinture de sécurité, pas la règle.

const BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";
const RETRY_AFTER_429_MS = 1100;
const DEFAULT_COUNT = 10;

interface BraveWebResult {
  title?: string;
  url?: string;
}

interface BraveSearchResponse {
  web?: { results?: BraveWebResult[] };
}

/** Hostname sans `www.` ; null si l'URL est invalide. */
export function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

export interface BraveSearchOptions {
  apiKey: string;
  fetch?: typeof fetch;
}

export function createBraveSearch(options: BraveSearchOptions): SearchFn {
  const fetchImpl = options.fetch ?? fetch;

  async function callOnce(query: string, count: number): Promise<Response> {
    const params = new URLSearchParams({
      q: query,
      count: String(count),
      country: "FR",
      search_lang: "fr",
    });
    return fetchImpl(`${BRAVE_ENDPOINT}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": options.apiKey,
      },
    });
  }

  return async function search(query, count = DEFAULT_COUNT): Promise<WebSearchResult[]> {
    let response = await callOnce(query, count);
    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_AFTER_429_MS));
      response = await callOnce(query, count);
    }
    if (!response.ok) {
      throw new Error(`Brave Search: HTTP ${response.status} sur "${query}"`);
    }

    const data = (await response.json()) as BraveSearchResponse;
    const results = data.web?.results ?? [];
    return results.flatMap((r) => {
      if (!r.url || !r.title) return [];
      const domain = extractDomain(r.url);
      if (!domain) return [];
      return [{ title: r.title, url: r.url, domain }];
    });
  };
}
