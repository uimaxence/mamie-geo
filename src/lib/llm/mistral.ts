import { MISTRAL_PRICING, computeCost } from "./pricing";
import {
  LLMError,
  type LLMClient,
  type LLMExecuteParams,
  type LLMResponse,
  type LLMSource,
} from "./types";

// Provider Mistral pour le tracking. Cible Le Chat (= Mistral La Plateforme
// + modèle mistral-large-latest). USP FR du produit (cf. doc 09 § 2026-05-07
// — Le Chat dès Starter sans condition).
//
// Limitation V0+ : Mistral n'expose pas encore de tool serveur web_search
// natif comparable à Anthropic / Perplexity / Gemini. On appelle donc
// `chat/completions` standard sans grounding. La fidélité « ce que voit
// l'utilisateur dans Le Chat (app consumer) » n'est donc PAS totale en
// V0+ — à upgrader vers Mistral Agents API + connector web dès qu'il
// sort de beta (suivi : doc 09 / GitHub Mistral). Pour l'instant, on
// tracke ce que Le Chat répondrait « from knowledge » sans search.
//
// API doc : https://docs.mistral.ai/api/#tag/chat
// Endpoint : POST https://api.mistral.ai/v1/chat/completions

const API_BASE_URL = "https://api.mistral.ai/v1";
const DEFAULT_MODEL = "mistral-large-latest";
const DEFAULT_MAX_TOKENS = 4096;

export interface MistralClientOptions {
  apiKey: string;
  /** Override pour les tests (cassette JSON injectée via fake fetch) */
  fetch?: typeof fetch;
  model?: string;
  maxTokens?: number;
  /** Override pour tests sur un endpoint mock */
  baseUrl?: string;
}

interface MistralChatResponse {
  id: string;
  model: string;
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

export function createMistralClient(options: MistralClientOptions): LLMClient {
  const model = options.model ?? DEFAULT_MODEL;
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
  const baseUrl = options.baseUrl ?? API_BASE_URL;
  const fetchImpl = options.fetch ?? fetch;
  const pricing = MISTRAL_PRICING[model];
  if (!pricing) {
    throw new Error(`Tarif inconnu pour le modèle Mistral ${model} — ajouter dans pricing.ts`);
  }

  return {
    llm: "lechat",
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
        throw mapMistralError(error);
      }

      if (!response.ok) {
        const body = await safeReadBody(response);
        throw mapMistralHttpError(response.status, body);
      }

      let data: MistralChatResponse;
      try {
        data = (await response.json()) as MistralChatResponse;
      } catch (error) {
        throw new LLMError("lechat", "invalid_response", "réponse Mistral non JSON", error);
      }

      const durationMs = Date.now() - startedAt;
      const text = extractText(data);
      // Mistral chat/completions ne retourne pas de sources web (pas de
      // grounding natif). Liste vide jusqu'à upgrade vers Agents API.
      const sources: LLMSource[] = [];
      const usage = {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        webSearchRequests: 0,
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
    return "Réponds en français de manière naturelle et factuelle. Cite les marques et sources que tu connais si c'est pertinent.";
  }
  return "Answer in English in a natural, factual tone. Mention brands and sources you're aware of when relevant.";
}

function extractText(data: MistralChatResponse): string {
  const first = data.choices[0];
  if (!first) return "";
  return first.message.content.trim();
}

async function safeReadBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "<unable to read body>";
  }
}

function mapMistralHttpError(status: number, body: string): LLMError {
  const truncated = body.length > 500 ? `${body.slice(0, 500)}…` : body;
  if (status === 401 || status === 403) {
    return new LLMError("lechat", "auth", `HTTP ${status}: ${truncated}`);
  }
  if (status === 429) {
    return new LLMError("lechat", "rate_limit", `HTTP ${status}: ${truncated}`);
  }
  if (status >= 500) {
    return new LLMError("lechat", "transient", `HTTP ${status}: ${truncated}`);
  }
  return new LLMError("lechat", "other", `HTTP ${status}: ${truncated}`);
}

function mapMistralError(error: unknown): LLMError {
  const message = error instanceof Error ? error.message : String(error);
  return new LLMError("lechat", "other", message, error);
}
