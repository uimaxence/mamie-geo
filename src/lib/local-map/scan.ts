import { detectMentions } from "@/lib/citation/detect";
import { normalizeText } from "@/lib/comparators/sectors";
import type { BrandExtraction } from "@/lib/express-scan/extract";
import { brandPatterns, buildLocalQuery, dedupeCities, type ScanCity } from "./queries";
import type { CityVisibility, CompetitorTally, LocalMapReport, LocalMapResult } from "./types";

// Moteur de la carte locale : pour chaque ville, on pose 1 question par
// INTENTION (« meilleur menuisier à Angers », « pose de fenêtres à
// Angers »…) à Le Chat. Verdict « recommandé » = regex (detectMentions,
// patterns tolérants & ↔ et) OU jugement de l'extraction. Réutilise
// l'extraction marques du scan express. Agrège les concurrents sur la zone.

export interface LocalMapExecuteResult {
  text: string;
}

export interface RunLocalMapParams {
  brand: string;
  sector: string;
  /** Villes à analyser, ville principale en premier, avec coords (ou null). */
  cities: readonly ScanCity[];
  /** Intentions de recherche (≥ 1) appliquées à chaque ville. */
  intents: readonly string[];
  execute: (prompt: string) => Promise<LocalMapExecuteResult>;
  extractBrands: (responseTexts: string[]) => Promise<BrandExtraction>;
  llmLabel?: string;
}

/**
 * Vrai concurrent ? On jette les libellés génériques « {métier} {ville} »
 * (ex : « Menuiserie Cholet ») : un nom qui CONTIENT la ville comme mot est
 * presque toujours une description de catégorie, pas une marque.
 */
function isGenericForCity(rivalNormalized: string, cityNormalized: string): boolean {
  if (!cityNormalized) return false;
  const escaped = cityNormalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(rivalNormalized);
}

export async function runLocalMapScan(params: RunLocalMapParams): Promise<LocalMapResult> {
  const brand = params.brand.trim();
  const brandNormalized = normalizeText(brand);
  const patterns = brandPatterns(brand);
  const patternNorms = patterns.map(normalizeText).filter((p) => p.length >= 3);
  const cities = dedupeCities(params.cities, normalizeText);
  const intents = params.intents.length > 0 ? params.intents : [`meilleur ${params.sector.trim()}`];

  if (cities.length === 0) {
    return { ok: false, code: "no_location", message: "Aucune ville à analyser." };
  }

  // Liste plate (ville × intention) → 1 appel LLM par item.
  const items = cities.flatMap((city) =>
    intents.map((intent) => ({ city, query: buildLocalQuery(intent, city.name) })),
  );

  let texts: string[];
  try {
    const responses = await Promise.all(items.map((it) => params.execute(it.query)));
    texts = responses.map((r) => r.text);
  } catch (error) {
    return {
      ok: false,
      code: "llm_unavailable",
      message: `LLM indisponible: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const extraction = await params.extractBrands(texts);

  // Détection par item.
  const perItem = items.map((it, i) => {
    const text = texts[i] ?? "";
    const detected = detectMentions(text, [{ id: "brand", name: brand, type: "brand", patterns }]);
    const recommended = detected.length > 0 || (extraction.targetCitedPerResponse[i] ?? false);
    const cityNormalized = normalizeText(it.city.name);
    const rivals = (extraction.brandsPerResponse[i] ?? []).filter((name) => {
      const n = normalizeText(name);
      // Exclut la marque cible, même citée sous un nom étendu (« ACB
      // Portes et Fenêtres INTERNORM… » contient « acb portes et fenetres »).
      if (n === brandNormalized || patternNorms.some((p) => n.includes(p))) return false;
      return !isGenericForCity(n, cityNormalized);
    });
    return { city: it.city, query: it.query, recommended, rivals };
  });

  // Regroupe par ville (recommandé = cité dans AU MOINS une intention).
  const cityResults: CityVisibility[] = cities.map((city) => {
    const itemsForCity = perItem.filter((p) => p.city === city);
    const recommended = itemsForCity.some((p) => p.recommended);
    const rivals: string[] = [];
    const seen = new Set<string>();
    for (const p of itemsForCity) {
      for (const r of p.rivals) {
        const key = normalizeText(r);
        if (seen.has(key)) continue;
        seen.add(key);
        rivals.push(r);
      }
    }
    return {
      name: city.name,
      lat: city.lat,
      lng: city.lng,
      recommended,
      rivals,
      topRival: recommended ? null : (rivals[0] ?? null),
      queries: itemsForCity.map((p) => p.query),
    };
  });

  // Agrège les concurrents sur la zone : dans combien de villes chacun est cité.
  const tally = new Map<string, { name: string; cities: Set<string> }>();
  for (const c of cityResults) {
    for (const r of c.rivals) {
      const key = normalizeText(r);
      const entry = tally.get(key) ?? { name: r, cities: new Set<string>() };
      entry.cities.add(normalizeText(c.name));
      tally.set(key, entry);
    }
  }
  const topCompetitors: CompetitorTally[] = [...tally.values()]
    .map((e) => ({ name: e.name, cityCount: e.cities.size }))
    .sort((a, b) => b.cityCount - a.cityCount || a.name.localeCompare(b.name, "fr"))
    .slice(0, 6);

  const report: LocalMapReport = {
    brand,
    sector: params.sector.trim(),
    mainCity: cities[0]!.name,
    llmLabel: params.llmLabel ?? "Le Chat (Mistral)",
    intents: [...intents],
    cities: cityResults,
    topCompetitors,
    recommendedCount: cityResults.filter((c) => c.recommended).length,
    totalCities: cityResults.length,
    fetchedAt: new Date().toISOString(),
  };
  return { ok: true, report };
}
