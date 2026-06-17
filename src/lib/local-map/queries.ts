// Construction des questions locales : une intention de recherche
// (« meilleur menuisier », « pose de fenêtres ») × une ville → la question
// posée à l'IA. La carte tire sa force du NOMBRE de villes × intentions.

const MAX_CITIES = 7; // ville principale + jusqu'à 6 autour — borne le coût.

export interface ScanCity {
  name: string;
  lat: number | null;
  lng: number | null;
}

/**
 * Variantes de matching d'une marque pour la détection regex : on gère
 * « & » ↔ « et » (les IA réécrivent souvent « ACB Portes & Fenêtres » en
 * « ... Portes et Fenêtres ») et l'inverse. Dédupliqué.
 */
export function brandPatterns(brand: string): string[] {
  const b = brand.trim();
  const variants = new Set<string>([b]);
  if (b.includes("&")) variants.add(b.replace(/\s*&\s*/g, " et "));
  if (/\bet\b/i.test(b)) variants.add(b.replace(/\bet\b/gi, "&"));
  return [...variants].map((v) => v.replace(/\s+/g, " ").trim()).filter(Boolean);
}

/**
 * Déduplique (insensible casse/accents via `normalize`) en gardant l'ordre
 * (ville principale d'abord) et borne à MAX_CITIES.
 */
export function dedupeCities(
  cities: readonly ScanCity[],
  normalize: (s: string) => string,
): ScanCity[] {
  const out: ScanCity[] = [];
  const seen = new Set<string>();
  for (const city of cities) {
    const name = city.name.trim();
    if (!name) continue;
    const key = normalize(name);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name, lat: city.lat, lng: city.lng });
    if (out.length >= MAX_CITIES) break;
  }
  return out;
}

export { MAX_CITIES };
