import { normalizeText } from "@/lib/comparators/sectors";
import type { SearchFn } from "@/lib/comparators/types";
import { brandPatterns, dedupeCities, type ScanCity } from "./queries";
import type { CityGrounding } from "./grounding";
import type { CityVisibility, CompetitorTally, LocalMapReport, LocalMapResult } from "./types";

// Moteur de la carte locale, version GROUNDED (2026-06-17, retour Max) :
// pour chaque ville on fait une vraie recherche web (Brave) « meilleur
// {métier} à {ville} », puis Mistral extrait les entreprises locales
// réellement nommées dans les résultats. Fini les marques inventées « from
// knowledge » : on lit le web, comme ChatGPT. Agrège les concurrents.

export interface RunGroundedScanParams {
  brand: string;
  /** Domaine de la marque — présence certaine si trouvé dans les résultats. */
  brandDomain?: string;
  sector: string;
  /** Villes à analyser, ville principale en premier, géocodées. */
  cities: readonly ScanCity[];
  /** Recherche web (Brave en prod, fake en test). */
  search: SearchFn;
  /** Extraction grounded des entreprises par ville (Mistral en prod, fake en test). */
  ground: (
    perCity: { city: string; results: Awaited<ReturnType<SearchFn>> }[],
  ) => Promise<CityGrounding[]>;
  /** Nombre de résultats web par ville (déf. 8). */
  resultsPerCity?: number;
  llmLabel?: string;
}

function buildQuery(sector: string, city: string): string {
  return `meilleur ${sector.trim()} à ${city.trim()}`;
}

/**
 * Vrai concurrent ? On jette les libellés « {métier} {ville} » génériques.
 */
function isGenericForCity(rivalNormalized: string, cityNormalized: string): boolean {
  if (!cityNormalized) return false;
  const escaped = cityNormalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(rivalNormalized);
}

export async function runGroundedLocalScan(params: RunGroundedScanParams): Promise<LocalMapResult> {
  const brand = params.brand.trim();
  const brandNormalized = normalizeText(brand);
  const patternNorms = brandPatterns(brand)
    .map(normalizeText)
    .filter((p) => p.length >= 3);
  const cities = dedupeCities(params.cities, normalizeText);
  if (cities.length === 0) {
    return { ok: false, code: "no_location", message: "Aucune ville à analyser." };
  }

  const queries = cities.map((c) => buildQuery(params.sector, c.name));

  // 1 recherche web par ville (en parallèle).
  let perCity: { city: string; results: Awaited<ReturnType<SearchFn>> }[];
  try {
    perCity = await Promise.all(
      cities.map(async (c, i) => ({
        city: c.name,
        results: await params.search(queries[i]!, params.resultsPerCity ?? 8),
      })),
    );
  } catch (error) {
    return {
      ok: false,
      code: "llm_unavailable",
      message: `Recherche indisponible: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const grounding = await params.ground(perCity);
  const byCity = new Map(grounding.map((g) => [normalizeText(g.city), g]));

  const cityResults: CityVisibility[] = cities.map((city, i) => {
    const g = byCity.get(normalizeText(city.name)) ?? grounding[i];
    const cityNormalized = normalizeText(city.name);
    const rivals: string[] = [];
    const seen = new Set<string>();
    for (const name of g?.businesses ?? []) {
      const n = normalizeText(name);
      if (n === brandNormalized || patternNorms.some((p) => n.includes(p))) continue;
      if (isGenericForCity(n, cityNormalized) || seen.has(n)) continue;
      seen.add(n);
      rivals.push(name);
    }
    const recommended = g?.present ?? false;
    return {
      name: city.name,
      lat: city.lat,
      lng: city.lng,
      recommended,
      rivals,
      topRival: recommended ? null : (rivals[0] ?? null),
      queries: [queries[i]!],
    };
  });

  // Agrège les concurrents : dans combien de villes chacun est cité.
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
    llmLabel: params.llmLabel ?? "recherche web en direct",
    cities: cityResults,
    topCompetitors,
    recommendedCount: cityResults.filter((c) => c.recommended).length,
    totalCities: cityResults.length,
    fetchedAt: new Date().toISOString(),
  };
  return { ok: true, report };
}
