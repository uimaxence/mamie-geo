import type { LLMValue } from "@/lib/llm";

// Validation isolée du payload jsonb venant de la queue. Extrait dans un
// fichier sans dépendance DB pour pouvoir être unit-testé sans setup
// d'env complet (env.ts crash si DATABASE_URL absent).

export interface ExecutePromptPayload {
  promptId: string;
  llm: LLMValue;
  runId: string;
}

const ALLOWED_LLMS: readonly LLMValue[] = [
  "claude",
  "chatgpt",
  "perplexity",
  "gemini",
  "lechat",
] as const;

export function parseExecutePromptPayload(raw: unknown): ExecutePromptPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("execute_prompt payload must be an object");
  }
  const r = raw as Record<string, unknown>;
  if (typeof r.promptId !== "string" || typeof r.runId !== "string" || typeof r.llm !== "string") {
    throw new Error("execute_prompt payload manque promptId/runId/llm string");
  }
  if (!ALLOWED_LLMS.includes(r.llm as LLMValue)) {
    throw new Error(`execute_prompt payload llm invalide : ${r.llm}`);
  }
  return {
    promptId: r.promptId,
    runId: r.runId,
    llm: r.llm as LLMValue,
  };
}
