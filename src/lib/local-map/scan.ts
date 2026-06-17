import { detectMentions } from "@/lib/citation/detect";
import { normalizeText } from "@/lib/comparators/sectors";
import type { BrandExtraction } from "@/lib/express-scan/extract";
import { buildLocalQuery, dedupeCities, type ScanCity } from "./queries";
import type { CityVisibility, LocalMapReport, LocalMapResult } from "./types";

// Moteur de la carte locale : 1 question localisée par ville, posée en
// parallèle à 1 LLM (Le Chat / mistral-small). Verdict « recommandé » =
// regex (detectMentions) OU jugement de l'extraction (variantes de nom).
// Réutilise l'extraction marques du scan express (forme BrandExtraction).
// Les coordonnées (géocodées en amont) sont propagées pour la carte.

/**
 * Vrai concurrent ? On jette les libellés génériques « {métier} {ville} »
 * (ex : « Menuiserie Cholet ») : pour une question sur la ville X, un nom
 * qui CONTIENT X comme mot est presque toujours une description de
 * catégorie, pas une marque (filet de sécurité en plus du prompt).
 */
function isGenericForCity(rivalNormalized: string, cityNormalized: string): boolean {
  if (!cityNormalized) return false;
  const escaped = cityNormalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(rivalNormalized);
}

export interface LocalMapExecuteResult {
  text: string;
}

export interface RunLocalMapParams {
  brand: string;
  sector: string;
  /** Villes à analyser, ville principale en premier, avec coords (ou null). */
  cities: readonly ScanCity[];
  execute: (prompt: string) => Promise<LocalMapExecuteResult>;
  extractBrands: (responseTexts: string[]) => Promise<BrandExtraction>;
  llmLabel?: string;
}

export async function runLocalMapScan(params: RunLocalMapParams): Promise<LocalMapResult> {
  const brand = params.brand.trim();
  const brandNormalized = normalizeText(brand);
  const cities = dedupeCities(params.cities, normalizeText);

  if (cities.length === 0) {
    return { ok: false, code: "no_location", message: "Aucune ville à analyser." };
  }

  const queries = cities.map((c) => buildLocalQuery(params.sector, c.name));

  let texts: string[];
  try {
    const responses = await Promise.all(queries.map((q) => params.execute(q)));
    texts = responses.map((r) => r.text);
  } catch (error) {
    return {
      ok: false,
      code: "llm_unavailable",
      message: `LLM indisponible: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const extraction = await params.extractBrands(texts);

  const cityResults: CityVisibility[] = cities.map((city, i) => {
    const text = texts[i] ?? "";
    const detected = detectMentions(text, [
      { id: "brand", name: brand, type: "brand", patterns: [brand] },
    ]);
    const recommended = detected.length > 0 || (extraction.targetCitedPerResponse[i] ?? false);
    const cityNormalized = normalizeText(city.name);
    const rivals = (extraction.brandsPerResponse[i] ?? [])
      .filter((name) => {
        const n = normalizeText(name);
        return n !== brandNormalized && !isGenericForCity(n, cityNormalized);
      })
      .filter(
        (name, idx, arr) => arr.findIndex((n) => normalizeText(n) === normalizeText(name)) === idx,
      );
    return {
      name: city.name,
      lat: city.lat,
      lng: city.lng,
      recommended,
      rivals,
      topRival: recommended ? null : (rivals[0] ?? null),
      query: queries[i]!,
    };
  });

  const report: LocalMapReport = {
    brand,
    sector: params.sector.trim(),
    mainCity: cities[0]!.name,
    llmLabel: params.llmLabel ?? "Le Chat (Mistral)",
    cities: cityResults,
    recommendedCount: cityResults.filter((c) => c.recommended).length,
    totalCities: cityResults.length,
    fetchedAt: new Date().toISOString(),
  };
  return { ok: true, report };
}
