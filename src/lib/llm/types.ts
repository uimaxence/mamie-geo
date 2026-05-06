// Interface unifiée pour les 5 LLMs trackés. Une seule shape de réponse
// côté worker — chaque provider implémente la conversion depuis sa propre
// API vers cette interface.
// cf. geo-project/03-architecture-technique.md § Tracking LLMs

import type { LLM_VALUES } from "@/db/schema";

export type LLMValue = (typeof LLM_VALUES)[number];

export interface LLMSource {
  url: string;
  title: string;
  // ISO date string ou null si le provider ne fournit pas l'âge de la page
  pageAge: string | null;
}

export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
  // Nombre d'appels web_search (Anthropic, Perplexity) — 0 si LLM ne search pas
  webSearchRequests: number;
}

export interface LLMResponse {
  text: string;
  sources: LLMSource[];
  usage: LLMUsage;
  // Coût USD calculé localement à partir de l'usage et des prix du provider
  costUsd: number;
  durationMs: number;
  model: string;
}

export interface LLMExecuteParams {
  prompt: string;
  language?: "fr" | "en";
}

export interface LLMClient {
  readonly llm: LLMValue;
  execute(params: LLMExecuteParams): Promise<LLMResponse>;
}

// Erreur typée pour distinguer les échecs LLM des autres erreurs côté worker
export type LLMErrorCode = "rate_limit" | "auth" | "transient" | "invalid_response" | "other";

export class LLMError extends Error {
  constructor(
    public readonly llm: LLMValue,
    public readonly code: LLMErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "LLMError";
  }
}
