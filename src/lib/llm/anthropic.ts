import Anthropic from "@anthropic-ai/sdk";
import type {
  ContentBlock,
  Message,
  TextBlock,
  TextCitation,
  WebSearchToolResultBlock,
} from "@anthropic-ai/sdk/resources/messages/messages";
import { ANTHROPIC_PRICING, computeCost } from "./pricing";
import {
  LLMError,
  type LLMClient,
  type LLMExecuteParams,
  type LLMResponse,
  type LLMSource,
} from "./types";

// Provider Anthropic pour le tracking. Utilise le tool serveur web_search
// pour mimer ce qu'un utilisateur reçoit sur claude.ai (réponse + citations).
//
// Conversion API → LLMResponse :
//   - text       = concat des content blocks de type "text"
//   - sources    = URLs/titres extraits des citations dans les text blocks
//                  (pas des web_search_tool_result bruts → on garde uniquement
//                  ce que le modèle a vraiment cité dans sa réponse finale)
//   - usage      = input_tokens, output_tokens, server_tool_use.web_search_requests
//   - costUsd    = computeCost à partir des prix pricing.ts
//   - durationMs = mesuré côté client autour de l'appel API

// Phase A : tracking sur Haiku 4.5 pour garder un coût dev raisonnable.
// Bascule Sonnet 4.6 prévue en Phase C (cf. 09-decisions-journal § 2026-05-07).
// max_uses=2 limite l'inflation des input tokens (chaque search injecte
// ~5 ko de résultats en input). max_tokens=4096 évite les réponses
// truncated qu'on voyait avec 2048.
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_MAX_WEB_SEARCHES = 2;

export interface AnthropicClientOptions {
  apiKey: string;
  // Override pour les tests (cassettes JSON injectées via fake fetch)
  fetch?: typeof fetch;
  model?: string;
  maxTokens?: number;
  maxWebSearches?: number;
}

export function createAnthropicClient(options: AnthropicClientOptions): LLMClient {
  const model = options.model ?? DEFAULT_MODEL;
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
  const maxWebSearches = options.maxWebSearches ?? DEFAULT_MAX_WEB_SEARCHES;
  const pricing = ANTHROPIC_PRICING[model];
  if (!pricing) {
    throw new Error(`Tarif inconnu pour le modèle Anthropic ${model} — ajouter dans pricing.ts`);
  }

  const sdk = new Anthropic({
    apiKey: options.apiKey,
    fetch: options.fetch,
  });

  return {
    llm: "claude",
    async execute({ prompt, language = "fr" }: LLMExecuteParams): Promise<LLMResponse> {
      const startedAt = Date.now();
      let response: Message;
      try {
        response = await sdk.messages.create({
          model,
          max_tokens: maxTokens,
          system: buildSystemPrompt(language),
          messages: [{ role: "user", content: prompt }],
          tools: [
            {
              type: "web_search_20250305",
              name: "web_search",
              max_uses: maxWebSearches,
            },
          ],
        });
      } catch (error) {
        throw mapAnthropicError(error);
      }
      const durationMs = Date.now() - startedAt;

      const text = extractText(response.content);
      const sources = extractSources(response.content);
      const usage = {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        webSearchRequests: response.usage.server_tool_use?.web_search_requests ?? 0,
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

// Prompt système minimal : on veut une réponse naturelle avec citations,
// pas un préambule du modèle qui se présente. Langue calée sur celle du
// prompt pour rester représentatif de ce qu'un user FR ou EN reçoit.
function buildSystemPrompt(language: "fr" | "en"): string {
  if (language === "fr") {
    return "Réponds en français de manière naturelle et factuelle. Utilise web_search pour appuyer ta réponse sur des sources actuelles et cite-les explicitement.";
  }
  return "Answer in English in a natural, factual tone. Use web_search to ground your answer on current sources and cite them explicitly.";
}

function extractText(content: ContentBlock[]): string {
  return content
    .filter((block): block is TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n\n")
    .trim();
}

function extractSources(content: ContentBlock[]): LLMSource[] {
  const seen = new Set<string>();
  const sources: LLMSource[] = [];

  // Sources prioritaires : celles que le modèle a citées dans sa réponse
  // finale (text block citations). Plus précis que de prendre toutes les
  // URLs cherchées car ça reflète ce que l'utilisateur final voit.
  for (const block of content) {
    if (block.type !== "text") continue;
    const citations: TextCitation[] = block.citations ?? [];
    for (const cit of citations) {
      if (cit.type !== "web_search_result_location") continue;
      if (seen.has(cit.url)) continue;
      seen.add(cit.url);
      sources.push({
        url: cit.url,
        title: cit.title ?? cit.url,
        pageAge: null,
      });
    }
  }

  // Fallback : si aucune citation explicite (modèle a recherché mais n'a pas
  // attaché les citations), récupérer depuis les web_search_tool_result blocks.
  // Préserve l'info même quand le modèle est laxiste sur les citations.
  if (sources.length === 0) {
    for (const block of content) {
      if (block.type !== "web_search_tool_result") continue;
      const toolResult = block as WebSearchToolResultBlock;
      if (!Array.isArray(toolResult.content)) continue;
      for (const result of toolResult.content) {
        if (result.type !== "web_search_result") continue;
        if (seen.has(result.url)) continue;
        seen.add(result.url);
        sources.push({
          url: result.url,
          title: result.title,
          pageAge: result.page_age,
        });
      }
    }
  }

  return sources;
}

function mapAnthropicError(error: unknown): LLMError {
  if (error instanceof Anthropic.APIError) {
    if (error.status === 401 || error.status === 403) {
      return new LLMError("claude", "auth", error.message, error);
    }
    if (error.status === 429) {
      return new LLMError("claude", "rate_limit", error.message, error);
    }
    if (error.status && error.status >= 500) {
      return new LLMError("claude", "transient", error.message, error);
    }
  }
  const message = error instanceof Error ? error.message : String(error);
  return new LLMError("claude", "other", message, error);
}
