import { PERPLEXITY_PRICING, computeCost } from "./pricing";
import {
  LLMError,
  type LLMClient,
  type LLMExecuteParams,
  type LLMResponse,
  type LLMSource,
} from "./types";

// Provider Perplexity pour le tracking. Cible le modèle `sonar` —
// search natif inclus dans chaque requête (pas de tool séparé, contrairement
// à Anthropic/OpenAI). Pas de clé en V0+ (crédit minimum $50 chez
// Perplexity, le user achètera après ses premières ventes — cf. doc 09
// § 2026-05-18). Le code est mergé pour activation à chaud quand
// PERPLEXITY_API_KEY sera ajoutée à l'env Vercel.
//
// API doc : https://docs.perplexity.ai/api-reference/chat-completions
// API OpenAI-compatible : endpoint /chat/completions, format identique
// à OpenAI Chat Completions (pas Responses API).

const API_BASE_URL = "https://api.perplexity.ai";
const DEFAULT_MODEL = "sonar";
const DEFAULT_MAX_TOKENS = 4096;

export interface PerplexityClientOptions {
  apiKey: string;
  /** Override pour les tests (cassette JSON injectée via fake fetch) */
  fetch?: typeof fetch;
  model?: string;
  maxTokens?: number;
  /** Override pour tests sur un endpoint mock */
  baseUrl?: string;
}

interface PerplexityChatResponse {
  id: string;
  model: string;
  /** Sources web utilisées par sonar (toujours présentes, search natif) */
  citations?: string[];
  /** Sources enrichies (URL + title + date) — format récent Perplexity */
  search_results?: Array<{ url: string; title?: string; date?: string }>;
  choices: Array<{
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export function createPerplexityClient(options: PerplexityClientOptions): LLMClient {
  const model = options.model ?? DEFAULT_MODEL;
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
  const baseUrl = options.baseUrl ?? API_BASE_URL;
  const fetchImpl = options.fetch ?? fetch;
  const pricing = PERPLEXITY_PRICING[model];
  if (!pricing) {
    throw new Error(`Tarif inconnu pour le modèle Perplexity ${model} — ajouter dans pricing.ts`);
  }

  return {
    llm: "perplexity",
    async execute({ prompt, language = "fr" }: LLMExecuteParams): Promise<LLMResponse> {
      const startedAt = Date.now();
      let response: Response;
      try {
        response = await fetchImpl(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${options.apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            messages: [
              { role: "system", content: buildSystemPrompt(language) },
              { role: "user", content: prompt },
            ],
          }),
        });
      } catch (error) {
        throw mapPerplexityError(error);
      }

      if (!response.ok) {
        const body = await safeReadBody(response);
        throw mapPerplexityHttpError(response.status, body);
      }

      let data: PerplexityChatResponse;
      try {
        data = (await response.json()) as PerplexityChatResponse;
      } catch (error) {
        throw new LLMError("perplexity", "invalid_response", "réponse Perplexity non JSON", error);
      }

      const durationMs = Date.now() - startedAt;
      const text = extractText(data);
      const sources = extractSources(data);
      const usage = {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        // Search natif inclus dans chaque requête → 1 search facturé par appel
        webSearchRequests: 1,
      };
      const costUsd = computeCost(pricing, usage);

      return {
        text,
        sources,
        usage,
        costUsd,
        durationMs,
        model: data.model,
      };
    },
  };
}

function buildSystemPrompt(language: "fr" | "en"): string {
  if (language === "fr") {
    return "Réponds en français de manière naturelle et factuelle. Cite les sources sur lesquelles tu t'appuies.";
  }
  return "Answer in English in a natural, factual tone. Cite the sources you rely on.";
}

export function extractText(data: PerplexityChatResponse): string {
  const first = data.choices[0];
  if (!first) return "";
  return first.message.content.trim();
}

/**
 * Perplexity expose les sources sous 2 formats selon la version d'API :
 *   - legacy `citations: string[]` (URLs seules)
 *   - récent `search_results: { url, title?, date? }[]` (enrichi)
 * On essaye `search_results` en premier (plus riche), fallback sur
 * `citations`. Dédoublonnage côté URL.
 */
export function extractSources(data: PerplexityChatResponse): LLMSource[] {
  const seen = new Set<string>();
  const sources: LLMSource[] = [];

  if (Array.isArray(data.search_results)) {
    for (const r of data.search_results) {
      if (!r.url || seen.has(r.url)) continue;
      seen.add(r.url);
      sources.push({
        url: r.url,
        title: r.title ?? r.url,
        pageAge: r.date ?? null,
      });
    }
  }

  if (sources.length === 0 && Array.isArray(data.citations)) {
    for (const url of data.citations) {
      if (!url || seen.has(url)) continue;
      seen.add(url);
      sources.push({ url, title: url, pageAge: null });
    }
  }

  return sources;
}

async function safeReadBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "<unable to read body>";
  }
}

function mapPerplexityHttpError(status: number, body: string): LLMError {
  const truncated = body.length > 500 ? `${body.slice(0, 500)}…` : body;
  if (status === 401 || status === 403) {
    return new LLMError("perplexity", "auth", `HTTP ${status}: ${truncated}`);
  }
  if (status === 429) {
    return new LLMError("perplexity", "rate_limit", `HTTP ${status}: ${truncated}`);
  }
  if (status >= 500) {
    return new LLMError("perplexity", "transient", `HTTP ${status}: ${truncated}`);
  }
  return new LLMError("perplexity", "other", `HTTP ${status}: ${truncated}`);
}

function mapPerplexityError(error: unknown): LLMError {
  const message = error instanceof Error ? error.message : String(error);
  return new LLMError("perplexity", "other", message, error);
}
