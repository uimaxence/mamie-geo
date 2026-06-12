import { z } from "zod";
import { SITE_TYPES, type ComparatorCheck } from "./types";

// Enrichissement LLM du scan comparateurs : classe chaque site
// (comparateur/annuaire/presse/avis/blog) et génère un conseil
// d'inclusion d'une phrase par site. Mistral Small (cf. doc 09 §
// 2026-06-12 : le moins cher des providers déjà intégrés, EU —
// DeepSeek refusé) : ~500 tokens aller-retour ≈ 0,0001 $/scan.
//
// Best effort strict : toute erreur (clé absente, HTTP, JSON invalide)
// retourne les checks inchangés — la vérification de présence reste la
// valeur du tool, l'enrichissement est un bonus.

const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest";
const MAX_TOKENS = 1000;

const enrichmentSchema = z.object({
  sites: z.array(
    z.object({
      domain: z.string(),
      type: z.enum(SITE_TYPES).catch("autre"),
      conseil: z.string().max(300),
    }),
  ),
});

function buildPrompt(sector: string, checks: ComparatorCheck[]): string {
  const lines = checks
    .map((c) => `- ${c.domain} (marque ${c.present ? "déjà référencée" : "ABSENTE"})`)
    .join("\n");
  return `Tu aides une PME française du secteur « ${sector} » à être citée par les IA (ChatGPT, Perplexity…), qui s'appuient sur les comparateurs et annuaires.

Pour chaque site ci-dessous :
1. classe-le : "comparateur", "annuaire", "presse", "avis", "blog" ou "autre" ;
2. donne un conseil d'inclusion d'UNE phrase, concret et spécifique au site (ex : formulaire d'ajout d'établissement, contact rédaction, programme partenaire, fiche à revendiquer). Si la marque est déjà référencée, le conseil porte sur l'optimisation de sa fiche.

Sites :
${lines}

Réponds uniquement en JSON : {"sites": [{"domain": "...", "type": "...", "conseil": "..."}]}`;
}

interface MistralChatResponse {
  choices?: { message?: { content?: string } }[];
}

export interface EnrichOptions {
  apiKey: string;
  sector: string;
  checks: ComparatorCheck[];
  fetch?: typeof fetch;
}

/** Retourne une copie enrichie des checks (ou les checks intacts en cas d'échec). */
export async function enrichChecks(options: EnrichOptions): Promise<ComparatorCheck[]> {
  const fetchImpl = options.fetch ?? fetch;
  try {
    const response = await fetchImpl(MISTRAL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: buildPrompt(options.sector, options.checks) }],
      }),
    });
    if (!response.ok) {
      throw new Error(`Mistral enrich: HTTP ${response.status}`);
    }
    const data = (await response.json()) as MistralChatResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Mistral enrich: réponse vide");

    const parsed = enrichmentSchema.parse(JSON.parse(content));
    const byDomain = new Map(parsed.sites.map((s) => [s.domain.toLowerCase(), s]));

    return options.checks.map((check) => {
      const enrichment = byDomain.get(check.domain.toLowerCase());
      if (!enrichment) return check;
      return {
        ...check,
        siteType: enrichment.type,
        inclusionHint: enrichment.conseil.trim() || undefined,
      };
    });
  } catch {
    return options.checks;
  }
}
