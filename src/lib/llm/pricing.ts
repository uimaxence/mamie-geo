// Tarifs LLM USD par million de tokens, sourcés des pages publiques des
// providers. À mettre à jour si les tarifs bougent — toute évolution doit
// déclencher une recalibration des marges (cf. doc 04 § marges) et une
// entrée dans 09-decisions-journal.md.
//
// Dernière vérification : 2026-05-06

export interface ModelPricing {
  inputPerMtok: number;
  outputPerMtok: number;
  // Tarif par requête web_search (USD). 0 si pas applicable.
  webSearchPerCall: number;
}

export const ANTHROPIC_PRICING: Record<string, ModelPricing> = {
  // https://www.anthropic.com/pricing — Sonnet 4.6
  "claude-sonnet-4-6": {
    inputPerMtok: 3,
    outputPerMtok: 15,
    webSearchPerCall: 0.01,
  },
  // Haiku 4.5 — utilisé pour le scoring (JSON mode, pas de web_search)
  "claude-haiku-4-5-20251001": {
    inputPerMtok: 1,
    outputPerMtok: 5,
    webSearchPerCall: 0.01,
  },
};

export function computeCost(
  pricing: ModelPricing,
  usage: { inputTokens: number; outputTokens: number; webSearchRequests: number },
): number {
  const input = (usage.inputTokens * pricing.inputPerMtok) / 1_000_000;
  const output = (usage.outputTokens * pricing.outputPerMtok) / 1_000_000;
  const search = usage.webSearchRequests * pricing.webSearchPerCall;
  return input + output + search;
}
