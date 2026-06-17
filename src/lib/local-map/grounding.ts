import { z } from "zod";
import type { WebSearchResult } from "@/lib/comparators/types";

// Extraction « grounded » : à partir des RÉSULTATS DE RECHERCHE WEB (Brave)
// pour « meilleur {métier} à {ville} », un seul appel Mistral liste les
// vraies entreprises locales nommées (vs l'invention « from knowledge » de
// Le Chat sans web). Mime ce que fait ChatGPT : il lit le web. Best effort.

const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest";
const MAX_TOKENS = 1100;

// Domaines à ne jamais prendre pour des « entreprises » (annuaires, plateformes).
const DIRECTORY_DOMAINS =
  /(pagesjaunes|google\.|maps\.|yelp|facebook|instagram|leboncoin|tripadvisor|trustpilot|houzz|starofservice|travaux\.com|ootravaux|hellopro|europages|kompass|societe\.com|verif\.com|infogreffe|linkedin|youtube|wikipedia)/i;

export interface CityGrounding {
  city: string;
  /** Entreprises locales réellement nommées (hors la marque, hors annuaires). */
  businesses: string[];
  /** La marque cible apparaît-elle (nom ou domaine) ? */
  present: boolean;
}

const groundingSchema = z.object({
  villes: z.array(
    z.object({
      entreprises: z.array(z.string().max(80)).max(15),
      cible_presente: z.boolean().catch(false),
    }),
  ),
});

interface MistralChatResponse {
  choices?: { message?: { content?: string } }[];
}

export interface ExtractLocalBusinessesOptions {
  apiKey: string;
  brand: string;
  /** Domaine de la marque — match direct = présence certaine. */
  brandDomain?: string;
  sector: string;
  /** Résultats Brave par ville (ordre conservé). */
  perCity: { city: string; results: WebSearchResult[] }[];
  fetch?: typeof fetch;
}

export async function extractLocalBusinesses(
  options: ExtractLocalBusinessesOptions,
): Promise<CityGrounding[]> {
  const fetchImpl = options.fetch ?? fetch;
  const brandDomain = options.brandDomain?.replace(/^www\./, "").toLowerCase();

  // Présence certaine si le domaine de la marque apparaît dans les résultats.
  const domainPresent = options.perCity.map((c) =>
    brandDomain ? c.results.some((r) => r.domain === brandDomain) : false,
  );

  const empty: CityGrounding[] = options.perCity.map((c, i) => ({
    city: c.city,
    businesses: [],
    present: domainPresent[i] ?? false,
  }));

  try {
    const blocks = options.perCity
      .map((c, i) => {
        const lines = c.results.map((r) => `- ${r.title} (${r.domain})`).join("\n");
        return `### Ville ${i + 1} : ${c.city}\nRésultats web pour « meilleur ${options.sector} à ${c.city} » :\n${lines || "(aucun résultat)"}`;
      })
      .join("\n\n");

    const response = await fetchImpl(MISTRAL_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${options.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `La marque cible est « ${options.brand} »${brandDomain ? ` (site ${brandDomain})` : ""}.

Ci-dessous, pour ${options.perCity.length} villes, les résultats d'une recherche web locale. Pour CHAQUE ville, dans l'ordre :
1. "entreprises" : liste les noms propres d'entreprises/artisans LOCAUX réellement nommés dans ces résultats (déduits des titres). EXCLUS les annuaires et plateformes (PagesJaunes, Google, Yelp, Trustpilot, Houzz, Leboncoin…), les catégories et les libellés génériques « métier + ville » (« Menuiserie Angers »). Garde le nom commercial propre (ex : « C'Charron Menuiserie » et pas la phrase entière du titre).
2. "cible_presente" : true si la marque cible apparaît (par son nom ou son site), sinon false.

Réponds uniquement en JSON : {"villes": [{"entreprises": ["..."], "cible_presente": true|false}, ...]} avec exactement ${options.perCity.length} entrées, dans le même ordre.

${blocks}`,
          },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Mistral grounding: HTTP ${response.status}`);
    const data = (await response.json()) as MistralChatResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Mistral grounding: réponse vide");
    const parsed = groundingSchema.parse(JSON.parse(content));

    return options.perCity.map((c, i) => {
      const entry = parsed.villes[i];
      const businesses = (entry?.entreprises ?? [])
        .map((b) => b.trim())
        .filter((b) => b.length >= 2 && !DIRECTORY_DOMAINS.test(b));
      return {
        city: c.city,
        businesses,
        present: (entry?.cible_presente ?? false) || (domainPresent[i] ?? false),
      };
    });
  } catch {
    return empty;
  }
}
