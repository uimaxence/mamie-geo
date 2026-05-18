import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";
import { GOOGLE_PRICING, computeCost } from "./pricing";
import {
  LLMError,
  type LLMClient,
  type LLMExecuteParams,
  type LLMResponse,
  type LLMSource,
} from "./types";

// Provider Google AI Studio pour le tracking. Cible Gemini consumer
// (= gemini-2.5-flash + grounding Google Search natif).
// Reproduit ce qu'un user voit dans gemini.google.com / dans les
// AI Overviews de Google Search.
//
// SDK : @google/genai (nouveau, remplace @google/generative-ai legacy).
// Grounding actif via `tools: [{ googleSearch: {} }]` dans config.
//
// API doc : https://ai.google.dev/gemini-api/docs/grounding

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_MAX_OUTPUT_TOKENS = 4096;

export interface GoogleClientOptions {
  apiKey: string;
  model?: string;
  maxOutputTokens?: number;
}

export function createGoogleClient(options: GoogleClientOptions): LLMClient {
  const model = options.model ?? DEFAULT_MODEL;
  const maxOutputTokens = options.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS;
  const pricing = GOOGLE_PRICING[model];
  if (!pricing) {
    throw new Error(`Tarif inconnu pour le modèle Google ${model} — ajouter dans pricing.ts`);
  }

  const ai = new GoogleGenAI({ apiKey: options.apiKey });

  return {
    llm: "gemini",
    async execute({ prompt, language = "fr" }: LLMExecuteParams): Promise<LLMResponse> {
      const startedAt = Date.now();
      let response: GenerateContentResponse;
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: buildSystemPrompt(language),
            maxOutputTokens,
            tools: [{ googleSearch: {} }],
          },
        });
      } catch (error) {
        throw mapGoogleError(error);
      }
      const durationMs = Date.now() - startedAt;

      const text = extractText(response);
      const sources = extractSources(response);
      // Google ne nous dit pas combien de search requests ont été faites,
      // mais facture une grounding request par appel quand `googleSearch`
      // est activé et que des sources reviennent. Si pas de sources →
      // pas de grounding facturé.
      const webSearchRequests = sources.length > 0 ? 1 : 0;
      const usage = {
        inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
        webSearchRequests,
      };
      const costUsd = computeCost(pricing, usage);

      return {
        text,
        sources,
        usage,
        costUsd,
        durationMs,
        model: response.modelVersion ?? model,
      };
    },
  };
}

function buildSystemPrompt(language: "fr" | "en"): string {
  if (language === "fr") {
    return "Réponds en français de manière naturelle et factuelle. Utilise Google Search pour appuyer ta réponse sur des sources actuelles et cite-les explicitement.";
  }
  return "Answer in English in a natural, factual tone. Use Google Search to ground your answer on current sources and cite them explicitly.";
}

// Exposés pour tests (sans mocker tout le SDK). Le client `execute()`
// fait ses appels via le SDK ; nos parsers/mappers de réponses Google
// sont testés isolément contre des fixtures JSON.
export function extractText(response: GenerateContentResponse): string {
  const parts: string[] = [];
  for (const candidate of response.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (typeof part.text === "string") {
        parts.push(part.text);
      }
    }
  }
  return parts.join("\n\n").trim();
}

/**
 * Extrait les sources web depuis groundingMetadata.groundingChunks[*].web.
 * Chaque chunk peut être de plusieurs types (web, image, maps, etc.) — on
 * garde uniquement les web pour rester homogène avec les autres providers.
 */
export function extractSources(response: GenerateContentResponse): LLMSource[] {
  const seen = new Set<string>();
  const sources: LLMSource[] = [];

  for (const candidate of response.candidates ?? []) {
    const chunks = candidate.groundingMetadata?.groundingChunks ?? [];
    for (const chunk of chunks) {
      const web = chunk.web;
      if (!web?.uri) continue;
      if (seen.has(web.uri)) continue;
      seen.add(web.uri);
      sources.push({
        url: web.uri,
        title: web.title ?? web.uri,
        pageAge: null,
      });
    }
  }

  return sources;
}

export function mapGoogleError(error: unknown): LLMError {
  // Le SDK Google n'expose pas une classe d'erreur typée comme Anthropic
  // — on inspecte le message + status si fourni.
  const message = error instanceof Error ? error.message : String(error);
  const status = extractStatus(error);
  if (status === 401 || status === 403) {
    return new LLMError("gemini", "auth", message, error);
  }
  if (status === 429) {
    return new LLMError("gemini", "rate_limit", message, error);
  }
  if (status && status >= 500) {
    return new LLMError("gemini", "transient", message, error);
  }
  // 400 ou pas de status → fallback "other"
  return new LLMError("gemini", "other", message, error);
}

function extractStatus(error: unknown): number | null {
  if (typeof error === "object" && error !== null) {
    const maybeStatus = (error as { status?: unknown }).status;
    if (typeof maybeStatus === "number") return maybeStatus;
  }
  // Les erreurs Google contiennent souvent "[HTTP 429]" ou "code 401" dans
  // le message — heuristique simple en fallback.
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/\b(401|403|429|500|502|503|504)\b/);
  if (match) return Number.parseInt(match[1]!, 10);
  return null;
}
