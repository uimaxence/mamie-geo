import { detectMentions } from "@/lib/citation/detect";
import { normalizeText } from "@/lib/comparators/sectors";
import type { BrandExtraction } from "@/lib/express-scan/extract";
import { brandPatterns, dedupeCities, type ScanCity } from "./queries";
import type {
  CityStatus,
  CityVisibility,
  CompetitorTally,
  LocalMapReport,
  LocalMapResult,
} from "./types";

// Moteur de la carte locale (2026-06-17, retour Max) : on mesure du vrai
// GEO, pas du SEO. Pour chaque ville on pose la question « meilleur
// {métier} à {ville} ? » à une IA GROUNDED (Perplexity sonar, qui cherche
// le web en direct) et on parse SA réponse — exactement comme un client le
// vivrait. Le Chat (Mistral) via API n'a pas de search natif → on ne mesure
// donc pas Le Chat ici mais Perplexity (affiché tel quel). Parsing des
// marques réutilisé du scan express (extractBrandsCited, Mistral).

export interface LocalExecuteResult {
  text: string;
}

export interface RunLocalScanParams {
  brand: string;
  sector: string;
  /** Villes à analyser, ville principale en premier, géocodées. */
  cities: readonly ScanCity[];
  /** Appel IA grounded (Perplexity en prod, fake en test). */
  execute: (prompt: string) => Promise<LocalExecuteResult>;
  /** Extraction marques citées + variantes de nom (Mistral en prod, fake en test). */
  extractBrands: (responseTexts: string[]) => Promise<BrandExtraction>;
  llmLabel?: string;
}

function buildQuery(sector: string, city: string): string {
  return `Quels sont les meilleurs ${sector.trim()} à ${city.trim()} ? Donne-moi les noms les plus recommandés.`;
}

/** Jette les libellés génériques « {métier} {ville} » (pas une marque). */
function isGenericForCity(rivalNormalized: string, cityNormalized: string): boolean {
  if (!cityNormalized) return false;
  const escaped = cityNormalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(rivalNormalized);
}

/**
 * Rang de la marque dans la liste des marques citées (ordre d'apparition),
 * variantes de nom incluses. -1 si absente de la liste. Pour « meilleurs
 * {métier} à {ville} », l'ordre d'apparition ≈ la prééminence : index 0 =
 * recommandation de tête.
 */
function findBrandRank(
  brands: readonly string[],
  brandNormalized: string,
  patternNorms: readonly string[],
): number {
  for (let k = 0; k < brands.length; k++) {
    const n = normalizeText(brands[k] ?? "");
    if (n === brandNormalized || patternNorms.some((p) => n.includes(p))) return k;
  }
  return -1;
}

/**
 * Contribution d'une ville au score local (retour Max 2026-06-18) : on ne
 * compte plus 0 ou 1, mais un score partiel quand la marque est citée sans
 * être en tête. Le rang fait baisser progressivement la note.
 */
function cityScore(status: CityStatus, rank: number): number {
  if (status === "top") return 1;
  if (status === "absent") return 0;
  // mentioned : pondéré par le rang (rank=-1 → citée via variante, rang inconnu).
  if (rank === 1) return 0.7;
  if (rank === 2) return 0.55;
  if (rank >= 3) return 0.45;
  return 0.5;
}

export async function runLocalScan(params: RunLocalScanParams): Promise<LocalMapResult> {
  const brand = params.brand.trim();
  const brandNormalized = normalizeText(brand);
  const patterns = brandPatterns(brand);
  const patternNorms = patterns.map(normalizeText).filter((p) => p.length >= 3);
  const cities = dedupeCities(params.cities, normalizeText);
  if (cities.length === 0) {
    return { ok: false, code: "no_location", message: "Aucune ville à analyser." };
  }

  const queries = cities.map((c) => buildQuery(params.sector, c.name));

  let texts: string[];
  try {
    const responses = await Promise.all(queries.map((q) => params.execute(q)));
    texts = responses.map((r) => r.text);
  } catch (error) {
    return {
      ok: false,
      code: "llm_unavailable",
      message: `IA indisponible: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const extraction = await params.extractBrands(texts);

  const cityResults: CityVisibility[] = cities.map((city, i) => {
    const text = texts[i] ?? "";
    const detected = detectMentions(text, [{ id: "brand", name: brand, type: "brand", patterns }]);
    const citedList = extraction.brandsPerResponse[i] ?? [];
    const rank = findBrandRank(citedList, brandNormalized, patternNorms);
    const citedAnywhere =
      rank >= 0 || detected.length > 0 || (extraction.targetCitedPerResponse[i] ?? false);

    // 3 états (retour Max 2026-06-18) : cité en tête (rang 0) = top, cité
    // ailleurs = mentioned (score partiel), pas cité = absent. Le rang ne
    // vaut que via l'extraction ordonnée ; une détection regex/variante sans
    // rang connu reste « mentioned » (on ne survend pas le vert).
    const status: CityStatus = !citedAnywhere ? "absent" : rank === 0 ? "top" : "mentioned";

    const cityNormalized = normalizeText(city.name);
    const rivals: string[] = [];
    const seen = new Set<string>();
    for (const name of citedList) {
      const n = normalizeText(name);
      // Exclut la marque (même étendue) et les génériques « métier ville ».
      if (n === brandNormalized || patternNorms.some((p) => n.includes(p))) continue;
      if (isGenericForCity(n, cityNormalized) || seen.has(n)) continue;
      seen.add(n);
      rivals.push(name);
    }
    return {
      name: city.name,
      lat: city.lat,
      lng: city.lng,
      status,
      recommended: status === "top",
      score: cityScore(status, rank),
      rivals,
      // Concurrent cité devant toi : pertinent dès que tu n'es pas en tête.
      topRival: status === "top" ? null : (rivals[0] ?? null),
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

  const totalCities = cityResults.length;
  const scoreSum = cityResults.reduce((acc, c) => acc + c.score, 0);

  const report: LocalMapReport = {
    brand,
    sector: params.sector.trim(),
    mainCity: cities[0]!.name,
    llmLabel: params.llmLabel ?? "Perplexity",
    cities: cityResults,
    topCompetitors,
    recommendedCount: cityResults.filter((c) => c.status === "top").length,
    mentionedCount: cityResults.filter((c) => c.status === "mentioned").length,
    totalCities,
    score: totalCities > 0 ? Math.round((scoreSum / totalCities) * 100) : 0,
    fetchedAt: new Date().toISOString(),
  };
  return { ok: true, report };
}
