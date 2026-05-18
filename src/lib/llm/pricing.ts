// Tarifs LLM USD par million de tokens, sourcés des pages publiques des
// providers. À mettre à jour si les tarifs bougent — toute évolution doit
// déclencher une recalibration des marges (cf. doc 04 § marges) et une
// entrée dans 09-decisions-journal.md.
//
// Dernière vérification : 2026-05-18 (Mistral pricing ajouté pour PR2)

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

// OpenAI Platform — https://openai.com/api/pricing/
// gpt-4o-mini : modèle V0+ pour le tracking. Coût agressif (input
// $0.15/Mtok), web_search tool natif via Responses API ($10/1000 calls
// = $0.01/call, identique à Anthropic).
export const OPENAI_PRICING: Record<string, ModelPricing> = {
  "gpt-4o-mini": {
    inputPerMtok: 0.15,
    outputPerMtok: 0.6,
    webSearchPerCall: 0.01,
  },
  "gpt-4o-mini-2024-07-18": {
    inputPerMtok: 0.15,
    outputPerMtok: 0.6,
    webSearchPerCall: 0.01,
  },
};

// Mistral La Plateforme — https://mistral.ai/pricing
// Tarifs en EUR convertis en USD au taux ~1.10 (date de vérif 2026-05-18).
// V0+ : on tracke Le Chat sans web_search (Mistral n'expose pas encore de
// tool serveur natif type web_search Anthropic). Bascule vers Mistral
// Agents API + connector web prévue dès qu'elle quitte la beta — sinon
// la fidélité « ce que voit l'utilisateur dans Le Chat » n'est pas totale.
export const MISTRAL_PRICING: Record<string, ModelPricing> = {
  "mistral-large-latest": {
    inputPerMtok: 2.2, // ~€2/Mtok
    outputPerMtok: 6.6, // ~€6/Mtok
    webSearchPerCall: 0, // pas de web_search natif en V0+
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
