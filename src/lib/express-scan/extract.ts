import { z } from "zod";

// Extraction des marques citées dans les réponses du scan express : un
// seul appel Mistral Small en JSON mode pour les 3 réponses (~0,001 €).
// L'appel juge AUSSI si la marque cible est citée sous une variante de
// nom (ancien nom, orthographe, raison sociale) — la regex seule rate
// ces cas (constaté 2026-06-12 : « BoursoBank » vs « Boursorama
// Banque » dans les réponses). Best effort : toute erreur retourne des
// listes vides + cible non citée, le verdict regex reste le plancher.

const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest";
const MAX_TOKENS = 800;

const extractionSchema = z.object({
  reponses: z.array(
    z.object({
      marques: z.array(z.string().max(80)).max(15),
      cible_citee: z.boolean().catch(false),
    }),
  ),
});

interface MistralChatResponse {
  choices?: { message?: { content?: string } }[];
}

export interface BrandExtraction {
  /** Marques citées, par réponse (alignées sur l'ordre d'entrée). */
  brandsPerResponse: string[][];
  /** La marque cible est-elle citée (variantes de nom incluses), par réponse. */
  targetCitedPerResponse: boolean[];
}

export interface ExtractBrandsOptions {
  apiKey: string;
  targetBrand: string;
  responseTexts: string[];
  fetch?: typeof fetch;
}

export async function extractBrandsCited(options: ExtractBrandsOptions): Promise<BrandExtraction> {
  const fetchImpl = options.fetch ?? fetch;
  const empty: BrandExtraction = {
    brandsPerResponse: options.responseTexts.map(() => []),
    targetCitedPerResponse: options.responseTexts.map(() => false),
  };
  try {
    const numbered = options.responseTexts
      .map((text, i) => `--- Réponse ${i + 1} ---\n${text}`)
      .join("\n\n");
    const response = await fetchImpl(MISTRAL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `La marque cible est « ${options.targetBrand} ».

Pour chacune des réponses suivantes :
1. liste les marques, entreprises ou produits commerciaux explicitement cités (noms propres uniquement, ordre d'apparition, sans doublon) ;
2. indique si la marque cible est citée, y compris sous un autre nom (ancien nom, variante d'orthographe, raison sociale — ex : « BoursoBank » et « Boursorama Banque » sont la même marque).

Réponds uniquement en JSON : {"reponses": [{"marques": ["..."], "cible_citee": true|false}, ...]} avec exactement ${options.responseTexts.length} entrées.

${numbered}`,
          },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Mistral extract: HTTP ${response.status}`);
    const data = (await response.json()) as MistralChatResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Mistral extract: réponse vide");

    const parsed = extractionSchema.parse(JSON.parse(content));
    return {
      brandsPerResponse: options.responseTexts.map(
        (_, i) => parsed.reponses[i]?.marques.map((m) => m.trim()).filter(Boolean) ?? [],
      ),
      targetCitedPerResponse: options.responseTexts.map(
        (_, i) => parsed.reponses[i]?.cible_citee ?? false,
      ),
    };
  } catch {
    return empty;
  }
}
