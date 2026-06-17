import { z } from "zod";

// Dérive 1-2 intentions de recherche LOCALES à partir de l'activité
// détectée (secteur + proposition). On interroge l'IA avec ces intentions
// + la ville (« {intention} à {ville} ») plutôt qu'un générique « meilleur
// {secteur} » : un client tape « pose de fenêtres à Angers », pas
// « meilleure menuiserie ». Plus pertinent = la marque a plus de chances
// d'émerger. 1 appel Mistral Small (~0,0003 €), best effort (fallback
// générique). Les intentions ne contiennent JAMAIS de ville (ajoutée après).

const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest";
const MAX_TOKENS = 160;

const intentsSchema = z.object({
  intentions: z.array(z.string().min(3).max(70)).max(4),
});

interface MistralChatResponse {
  choices?: { message?: { content?: string } }[];
}

export interface DeriveLocalIntentsOptions {
  apiKey: string;
  sector: string;
  proposition?: string;
  /** Nombre d'intentions souhaité (déf. 2). */
  count?: number;
  fetch?: typeof fetch;
}

const CITY_HINT = /\b(à|a|en|dans|sur)\s+[A-ZÀ-Ý]/; // « ... à Angers » résiduel

/** Intention générique de secours (toujours présente en 1ʳᵉ position). */
function genericIntent(sector: string): string {
  return `meilleur ${sector.trim()}`;
}

export async function deriveLocalIntents(options: DeriveLocalIntentsOptions): Promise<string[]> {
  const fetchImpl = options.fetch ?? fetch;
  const count = options.count ?? 2;
  const generic = genericIntent(options.sector);
  const propositionHint = options.proposition?.trim()
    ? `\nCe que propose l'entreprise : ${options.proposition.trim()}`
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
            content: `Secteur : ${options.sector.trim()}${propositionHint}

Donne ${count} expressions de recherche COURTES qu'un client local taperait à une IA pour trouver ce type de professionnel/produit (ex pour un menuisier : « meilleur menuisier », « pose de fenêtres », « porte d'entrée sur mesure »). N'inclus JAMAIS de ville ni de lieu. Concret, du point de vue du client.

Réponds uniquement en JSON : {"intentions": ["...", "..."]}`,
          },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Mistral intents: HTTP ${response.status}`);
    const data = (await response.json()) as MistralChatResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Mistral intents: réponse vide");
    const parsed = intentsSchema.parse(JSON.parse(content));

    const cleaned = parsed.intentions
      .map((s) => s.trim())
      .filter((s) => s.length >= 3 && !CITY_HINT.test(s));

    // L'intention générique d'abord, puis les spécifiques, dédupliquées.
    const out: string[] = [];
    const seen = new Set<string>();
    for (const intent of [generic, ...cleaned]) {
      const key = intent.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(intent);
      if (out.length >= count) break;
    }
    return out;
  } catch {
    return [generic];
  }
}
