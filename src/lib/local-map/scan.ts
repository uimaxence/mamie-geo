import { detectMentions } from "@/lib/citation/detect";
import { normalizeText } from "@/lib/comparators/sectors";
import type { BrandExtraction } from "@/lib/express-scan/extract";
import { buildLocalQuery, resolveCityList } from "./queries";
import type { CityVisibility, LocalMapReport, LocalMapResult } from "./types";

// Moteur de la carte locale : 1 question localisée par ville, posée en
// parallèle à 1 LLM (Le Chat / mistral-small). Verdict « recommandé » =
// regex (detectMentions, la même que le tracking) OU jugement de
// l'extraction (qui attrape les variantes de nom). Réutilise
// l'extraction marques du scan express (même forme BrandExtraction).

export interface LocalMapExecuteResult {
  text: string;
}

export interface RunLocalMapParams {
  brand: string;
  sector: string;
  mainCity: string;
  surroundingCities: readonly string[];
  /** Appel LLM (Le Chat / mistral-small en prod, fake en test). */
  execute: (prompt: string) => Promise<LocalMapExecuteResult>;
  /** Extraction marques citées + jugement variante de nom (par réponse/ville). */
  extractBrands: (responseTexts: string[]) => Promise<BrandExtraction>;
  llmLabel?: string;
}

export async function runLocalMapScan(params: RunLocalMapParams): Promise<LocalMapResult> {
  const brand = params.brand.trim();
  const brandNormalized = normalizeText(brand);
  const cities = resolveCityList(params.mainCity, params.surroundingCities, normalizeText);

  if (cities.length === 0) {
    return { ok: false, code: "no_location", message: "Aucune ville à analyser." };
  }

  const queries = cities.map((city) => buildLocalQuery(params.sector, city));

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
    // Concurrents = marques citées qui ne sont pas la marque cible.
    const rivals = (extraction.brandsPerResponse[i] ?? [])
      .filter((name) => normalizeText(name) !== brandNormalized)
      .filter(
        (name, idx, arr) => arr.findIndex((n) => normalizeText(n) === normalizeText(name)) === idx,
      );
    return {
      name: city,
      recommended,
      rivals,
      topRival: recommended ? null : (rivals[0] ?? null),
      query: queries[i]!,
    };
  });

  const report: LocalMapReport = {
    brand,
    sector: params.sector.trim(),
    mainCity: cities[0]!,
    llmLabel: params.llmLabel ?? "Le Chat (Mistral)",
    cities: cityResults,
    recommendedCount: cityResults.filter((c) => c.recommended).length,
    totalCities: cityResults.length,
    fetchedAt: new Date().toISOString(),
  };
  return { ok: true, report };
}
