import { z } from "zod";

// Déduit les villes autour de la ville principale (1 appel Mistral Small
// JSON, ~0,0003 €) : on demande des communes proches et de taille notable
// où un pro du secteur aurait des clients. Best effort — toute erreur
// retourne [] et le scan tourne sur la seule ville principale.

const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest";
const MAX_TOKENS = 200;

const citiesSchema = z.object({
  villes: z.array(z.string().min(2).max(80)).max(8),
});

interface MistralChatResponse {
  choices?: { message?: { content?: string } }[];
}

export interface SuggestNearbyCitiesOptions {
  apiKey: string;
  city: string;
  sector?: string;
  /** Nombre de villes autour souhaité (déf. 4). */
  count?: number;
  fetch?: typeof fetch;
}

export async function suggestNearbyCities(options: SuggestNearbyCitiesOptions): Promise<string[]> {
  const fetchImpl = options.fetch ?? fetch;
  const count = options.count ?? 4;
  const city = options.city.trim();
  const sectorHint = options.sector?.trim()
    ? ` où un professionnel du secteur « ${options.sector.trim()} » aurait des clients`
    : "";
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
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `Donne ${count} communes françaises proches de « ${city} » (rayon d'environ 40 km), de taille notable${sectorHint}. N'inclus PAS « ${city} » elle-même. Villes réelles uniquement.

Réponds uniquement en JSON : {"villes": ["...", "..."]}`,
          },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Mistral cities: HTTP ${response.status}`);
    const data = (await response.json()) as MistralChatResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Mistral cities: réponse vide");
    const parsed = citiesSchema.parse(JSON.parse(content));
    return parsed.villes
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, count);
  } catch {
    return [];
  }
}
