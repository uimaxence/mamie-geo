import { env } from "@/lib/env";
import { createAnthropicClient } from "./anthropic";
import type { LLMClient, LLMValue } from "./types";

// Factory unique. Chaque LLM a son provider — on ajoute openai/perplexity/
// gemini/lechat en Sprint 1.x. Pour V0 seul Claude est implémenté
// (cf. CLAUDE.md § 9 — phase moteur sur 1 LLM avant le design pass).

export function getLLMClient(llm: LLMValue): LLMClient {
  switch (llm) {
    case "claude": {
      if (!env.ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY manquant — provider claude indisponible");
      }
      return createAnthropicClient({ apiKey: env.ANTHROPIC_API_KEY });
    }
    case "chatgpt":
    case "perplexity":
    case "gemini":
    case "lechat":
      throw new Error(`Provider ${llm} pas encore implémenté — V0 sur claude uniquement`);
  }
}

export type { LLMClient, LLMResponse, LLMSource, LLMUsage, LLMValue } from "./types";
export { LLMError } from "./types";
