import { z } from "zod";

// Construit le « cluster » local : la ville principale + N communes autour,
// chacune géocodée avec des coordonnées EXACTES via l'API officielle
// adresse.data.gouv.fr (gratuite, française, sans clé). Le LLM ne sert plus
// qu'à PROPOSER des noms de communes proches (pas les coords, qu'il
// hallucinait) ; chaque nom est ensuite géocodé puis filtré par distance
// réelle à la ville principale (rayon ~45 km).

const ADRESSE_ENDPOINT = "https://api-adresse.data.gouv.fr/search/";
const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest";
const MAX_RADIUS_KM = 45;

export interface GeoCity {
  name: string;
  lat: number;
  lng: number;
}

interface AdresseResponse {
  features?: { geometry?: { coordinates?: [number, number] }; properties?: { city?: string } }[];
}

/** Géocode une commune française → {name, lat, lng}, null si introuvable. */
export async function geocodeCommune(
  name: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GeoCity | null> {
  try {
    const params = new URLSearchParams({ q: name, type: "municipality", limit: "1" });
    const response = await fetchImpl(`${ADRESSE_ENDPOINT}?${params.toString()}`);
    if (!response.ok) return null;
    const data = (await response.json()) as AdresseResponse;
    const feat = data.features?.[0];
    const coords = feat?.geometry?.coordinates;
    if (!coords) return null;
    const [lng, lat] = coords; // GeoJSON = [lng, lat]
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    return { name: feat?.properties?.city?.trim() || name.trim(), lat, lng };
  } catch {
    return null;
  }
}

function haversineKm(a: GeoCity, b: GeoCity): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

const namesSchema = z.object({ villes: z.array(z.string().min(2).max(80)).max(16) });

interface MistralChatResponse {
  choices?: { message?: { content?: string } }[];
}

/** Propose des noms de communes proches (LLM, noms uniquement). */
async function suggestNearbyNames(opts: {
  apiKey: string;
  city: string;
  sector?: string;
  count: number;
  fetch: typeof fetch;
}): Promise<string[]> {
  const sectorHint = opts.sector?.trim()
    ? ` où un professionnel du secteur « ${opts.sector.trim()} » aurait des clients`
    : "";
  try {
    const response = await opts.fetch(MISTRAL_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${opts.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        max_tokens: 200,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `Donne ${opts.count} communes françaises réelles proches de « ${opts.city}» (rayon ~40 km)${sectorHint}. N'inclus PAS « ${opts.city} ». Noms seulement.

Réponds uniquement en JSON : {"villes": ["...", "..."]}`,
          },
        ],
      }),
    });
    if (!response.ok) return [];
    const data = (await response.json()) as MistralChatResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) return [];
    return namesSchema
      .parse(JSON.parse(content))
      .villes.map((v) => v.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export interface BuildCityClusterOptions {
  apiKey: string;
  city: string;
  sector?: string;
  /** Nombre de communes AUTOUR souhaité (déf. 6). */
  count?: number;
  fetch?: typeof fetch;
}

/**
 * [ville principale géocodée, ...communes proches géocodées], dans l'ordre
 * de proximité. Coords EXACTES (adresse.data.gouv). Retourne [] si la ville
 * principale est introuvable (l'appelant gère le fallback).
 */
export async function buildCityCluster(options: BuildCityClusterOptions): Promise<GeoCity[]> {
  const fetchImpl = options.fetch ?? fetch;
  const count = options.count ?? 6;

  const main = await geocodeCommune(options.city, fetchImpl);
  if (!main) return [];

  const names = await suggestNearbyNames({
    apiKey: options.apiKey,
    city: main.name,
    sector: options.sector,
    count: count + 4, // marge : certaines ne géocoderont pas / seront trop loin
    fetch: fetchImpl,
  });

  const geocoded = await Promise.all(names.map((n) => geocodeCommune(n, fetchImpl)));
  const seen = new Set<string>([main.name.toLowerCase()]);
  const around = geocoded
    .filter((c): c is GeoCity => c !== null)
    .filter((c) => {
      const key = c.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return haversineKm(main, c) <= MAX_RADIUS_KM;
    })
    .sort((a, b) => haversineKm(main, a) - haversineKm(main, b))
    .slice(0, count);

  return [main, ...around];
}
