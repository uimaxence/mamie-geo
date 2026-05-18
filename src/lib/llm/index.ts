import { env } from "@/lib/env";
import { LLM_VALUES } from "@/db/schema";
import { createAnthropicClient } from "./anthropic";
import { createMistralClient } from "./mistral";
import { createOpenAIClient } from "./openai";
import type { LLMClient, LLMValue } from "./types";

// Factory unique des providers LLM. Chaque LLM mappe vers son env var
// d'auth + sa factory dédiée. Si l'env var est absente, le provider est
// considéré comme « non configuré » et le scheduler le skip plutôt que de
// throw (cf. getConfiguredLLMs() + scheduler use case Perplexity en V0+).

const LLM_TO_ENV_KEY = {
  claude: "ANTHROPIC_API_KEY",
  chatgpt: "OPENAI_API_KEY",
  perplexity: "PERPLEXITY_API_KEY",
  gemini: "GOOGLE_AI_API_KEY",
  lechat: "MISTRAL_API_KEY",
} as const satisfies Record<LLMValue, keyof typeof env>;

// IMPLEMENTED_LLMS tient à jour la liste des providers réellement codés.
// Permet à isLLMConfigured de retourner false même si la clé existe mais
// que le client throw "pas encore implémenté" (cas PR3-5 entre les merges).
const IMPLEMENTED_LLMS: Record<LLMValue, boolean> = {
  claude: true,
  lechat: true, // PR2
  chatgpt: true, // PR3 — ce commit
  gemini: false, // PR4
  perplexity: false, // PR5
};

/**
 * Retourne le client LLM correspondant. Throw si la clé API est absente
 * ou si le provider n'est pas encore implémenté. Les callers (worker
 * execute_prompt) doivent attraper LLMError pour gérer gracieusement les
 * providers indisponibles. En amont, le scheduler utilise
 * {@link getConfiguredLLMs} pour ne pas créer de runs vers des providers
 * non configurés.
 */
export function getLLMClient(llm: LLMValue): LLMClient {
  const apiKey = env[LLM_TO_ENV_KEY[llm]];
  if (!apiKey) {
    throw new Error(
      `${LLM_TO_ENV_KEY[llm]} manquant — provider ${llm} indisponible`,
    );
  }
  if (!IMPLEMENTED_LLMS[llm]) {
    throw new Error(`Provider ${llm} pas encore implémenté (PR3-5 multi-LLM en cours)`);
  }

  switch (llm) {
    case "claude":
      return createAnthropicClient({ apiKey });
    case "lechat":
      return createMistralClient({ apiKey });
    case "chatgpt":
      return createOpenAIClient({ apiKey });
    case "perplexity":
    case "gemini":
      // Unreachable : protégé par IMPLEMENTED_LLMS ci-dessus. Garde pour
      // l'exhaustivité TypeScript du switch.
      throw new Error(`Provider ${llm} pas encore implémenté`);
  }
}

/**
 * Vrai si le provider est implémenté ET sa clé API est présente.
 * Utilisé par le scheduler pour décider quels runs créer.
 */
export function isLLMConfigured(llm: LLMValue): boolean {
  if (!IMPLEMENTED_LLMS[llm]) return false;
  return Boolean(env[LLM_TO_ENV_KEY[llm]]);
}

/**
 * Liste les LLMs **configurés et implémentés** dans l'env courante.
 * Source de vérité pour le scheduler : on ne crée des runs que pour ces
 * LLMs. Permet de lancer un nouveau plan en prod sans avoir toutes les
 * clés (ex : V0+ sans Perplexity tant que le crédit min 50$ n'est pas
 * payé — cf. doc 09 § 2026-05-18).
 */
export function getConfiguredLLMs(): readonly LLMValue[] {
  return LLM_VALUES.filter((llm) => isLLMConfigured(llm));
}

export type { LLMClient, LLMResponse, LLMSource, LLMUsage, LLMValue } from "./types";
export { LLMError } from "./types";
