import OpenAI from "openai";
import { OPENAI_PRICING, computeCost } from "./pricing";
import {
  LLMError,
  type LLMClient,
  type LLMExecuteParams,
  type LLMResponse,
  type LLMSource,
} from "./types";

// Provider OpenAI pour le tracking. Cible ChatGPT (= gpt-4o-mini +
// web_search tool natif via Responses API). Reproduit ce qu'un user voit
// dans ChatGPT consumer (free tier + recherche web active).
//
// Choix Responses API plutôt que Chat Completions :
//   - web_search tool natif (équivalent du web_search Anthropic)
//   - Citations structurées (URL + titre) dans les output items
//   - URL grouping plus propre que Chat Completions + function calling
//     manuel + SERP API tiers
// cf. https://platform.openai.com/docs/guides/tools-web-search

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_MAX_OUTPUT_TOKENS = 4096;

export interface OpenAIClientOptions {
  apiKey: string;
  /** Override pour les tests (cassette JSON injectée via fake fetch) */
  fetch?: typeof fetch;
  model?: string;
  maxOutputTokens?: number;
}

export function createOpenAIClient(options: OpenAIClientOptions): LLMClient {
  const model = options.model ?? DEFAULT_MODEL;
  const maxOutputTokens = options.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS;
  const pricing = OPENAI_PRICING[model];
  if (!pricing) {
    throw new Error(`Tarif inconnu pour le modèle OpenAI ${model} — ajouter dans pricing.ts`);
  }

  const sdk = new OpenAI({
    apiKey: options.apiKey,
    fetch: options.fetch,
  });

  return {
    llm: "chatgpt",
    async execute({ prompt, language = "fr" }: LLMExecuteParams): Promise<LLMResponse> {
      const startedAt = Date.now();
      let response: OpenAI.Responses.Response;
      try {
        response = await sdk.responses.create({
          model,
          max_output_tokens: maxOutputTokens,
          instructions: buildSystemPrompt(language),
          input: prompt,
          tools: [{ type: "web_search" }],
        });
      } catch (error) {
        throw mapOpenAIError(error);
      }
      const durationMs = Date.now() - startedAt;

      const text = extractText(response);
      const sources = extractSources(response);
      const usage = {
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
        webSearchRequests: countWebSearchCalls(response),
      };
      const costUsd = computeCost(pricing, usage);

      return {
        text,
        sources,
        usage,
        costUsd,
        durationMs,
        model: response.model,
      };
    },
  };
}

function buildSystemPrompt(language: "fr" | "en"): string {
  if (language === "fr") {
    return "Réponds en français de manière naturelle et factuelle. Utilise web_search pour appuyer ta réponse sur des sources actuelles et cite-les explicitement.";
  }
  return "Answer in English in a natural, factual tone. Use web_search to ground your answer on current sources and cite them explicitly.";
}

/**
 * Concatène les `output_text` des items de type "message". L'API Responses
 * retourne un array d'items hétérogène (web_search_call, message, etc.),
 * on garde uniquement le texte final adressé à l'utilisateur.
 */
function extractText(response: OpenAI.Responses.Response): string {
  const parts: string[] = [];
  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type === "output_text") {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n\n").trim();
}

/**
 * Extrait les URLs des annotations `url_citation` dans les output_text.
 * L'API Responses attache les citations directement aux portions de texte
 * pertinentes — on garde URL + titre + dédoublonnage.
 */
function extractSources(response: OpenAI.Responses.Response): LLMSource[] {
  const seen = new Set<string>();
  const sources: LLMSource[] = [];

  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type !== "output_text") continue;
      for (const annotation of content.annotations ?? []) {
        if (annotation.type !== "url_citation") continue;
        if (seen.has(annotation.url)) continue;
        seen.add(annotation.url);
        sources.push({
          url: annotation.url,
          title: annotation.title ?? annotation.url,
          pageAge: null,
        });
      }
    }
  }

  return sources;
}

/**
 * Compte les appels web_search via les items `web_search_call`. Utilisé
 * pour le pricing (chaque call coûte $0.01 chez OpenAI, équivalent
 * Anthropic).
 */
function countWebSearchCalls(response: OpenAI.Responses.Response): number {
  let count = 0;
  for (const item of response.output ?? []) {
    if (item.type === "web_search_call") count += 1;
  }
  return count;
}

function mapOpenAIError(error: unknown): LLMError {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401 || error.status === 403) {
      return new LLMError("chatgpt", "auth", error.message, error);
    }
    if (error.status === 429) {
      return new LLMError("chatgpt", "rate_limit", error.message, error);
    }
    if (error.status && error.status >= 500) {
      return new LLMError("chatgpt", "transient", error.message, error);
    }
  }
  const message = error instanceof Error ? error.message : String(error);
  return new LLMError("chatgpt", "other", message, error);
}
