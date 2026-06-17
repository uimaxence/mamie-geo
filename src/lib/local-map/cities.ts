import { z } from "zod";

// Géocode un « cluster » local : la ville principale + N communes autour,
// chacune avec ses coordonnées (1 appel Mistral Small JSON, ~0,0005 €).
// Les coordonnées servent à tracer une VRAIE carte (Leaflet) avec des
// zones autour de chaque ville. Best effort : toute erreur ou ville hors
// de France métropolitaine est filtrée ; cluster vide → la carte tombe en
// fallback liste (cf. action).

const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest";
const MAX_TOKENS = 700;

// Bornes France métropolitaine (Corse incluse) — filtre les hallucinations
// de coordonnées (ville à l'étranger, lat/lng inversées…).
const FR_BOUNDS = { latMin: 41, latMax: 51.6, lngMin: -5.4, lngMax: 9.8 };

export interface GeoCity {
  name: string;
  lat: number;
  lng: number;
}

const clusterSchema = z.object({
  villes: z
    .array(
      z.object({
        nom: z.string().min(2).max(80),
        lat: z.number(),
        lng: z.number(),
      }),
    )
    .max(16),
});

interface MistralChatResponse {
  choices?: { message?: { content?: string } }[];
}

function inFrance(lat: number, lng: number): boolean {
  return (
    lat >= FR_BOUNDS.latMin &&
    lat <= FR_BOUNDS.latMax &&
    lng >= FR_BOUNDS.lngMin &&
    lng <= FR_BOUNDS.lngMax
  );
}

export interface GeocodeCityClusterOptions {
  apiKey: string;
  city: string;
  sector?: string;
  /** Nombre de communes AUTOUR souhaité (déf. 8). */
  count?: number;
  fetch?: typeof fetch;
}

/**
 * Retourne [ville principale, ...communes autour], chacune géocodée. La
 * ville principale est toujours en première position quand l'IA la
 * renvoie ; sinon elle est absente (le caller la gère).
 */
export async function geocodeCityCluster(options: GeocodeCityClusterOptions): Promise<GeoCity[]> {
  const fetchImpl = options.fetch ?? fetch;
  const count = options.count ?? 8;
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
            content: `Donne « ${city} » EN PREMIER, puis ${count} communes françaises réelles autour (rayon ~50 km)${sectorHint}, chacune avec ses coordonnées géographiques (latitude, longitude en degrés décimaux). Villes réelles uniquement, pas de doublon.

Réponds uniquement en JSON : {"villes": [{"nom": "${city}", "lat": 0.0, "lng": 0.0}, ...]}`,
          },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Mistral cluster: HTTP ${response.status}`);
    const data = (await response.json()) as MistralChatResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Mistral cluster: réponse vide");
    const parsed = clusterSchema.parse(JSON.parse(content));

    const seen = new Set<string>();
    const cities: GeoCity[] = [];
    for (const v of parsed.villes) {
      const name = v.nom.trim();
      const key = name.toLowerCase();
      if (!name || seen.has(key)) continue;
      if (!inFrance(v.lat, v.lng)) continue;
      seen.add(key);
      cities.push({ name, lat: v.lat, lng: v.lng });
      if (cities.length >= count + 1) break;
    }
    return cities;
  } catch {
    return [];
  }
}
