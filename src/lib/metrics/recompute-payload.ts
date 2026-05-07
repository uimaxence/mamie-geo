import type { LLMValue } from "@/lib/llm";

// Validation isolée du payload jsonb pour le worker recompute_metrics.
// Sans dep DB → testable sans setup env complet (même pattern que les
// autres workers).

export interface RecomputeMetricsPayload {
  brandId: string;
  llm: LLMValue;
  date: string;
}

const ALLOWED_LLMS: readonly LLMValue[] = [
  "claude",
  "chatgpt",
  "perplexity",
  "gemini",
  "lechat",
] as const;

export function parseRecomputeMetricsPayload(raw: unknown): RecomputeMetricsPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("recompute_metrics payload must be an object");
  }
  const r = raw as Record<string, unknown>;
  if (typeof r.brandId !== "string" || typeof r.llm !== "string" || typeof r.date !== "string") {
    throw new Error("recompute_metrics payload manque brandId/llm/date string");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) {
    throw new Error(`recompute_metrics date doit être YYYY-MM-DD : ${r.date}`);
  }
  if (!ALLOWED_LLMS.includes(r.llm as LLMValue)) {
    throw new Error(`recompute_metrics llm invalide : ${r.llm}`);
  }
  return {
    brandId: r.brandId,
    llm: r.llm as LLMValue,
    date: r.date,
  };
}
