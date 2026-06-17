// Question locale posée à l'IA pour une ville donnée. Une seule question
// par ville (vs 3 pour le scan express) : la carte tire sa force du
// NOMBRE de villes, pas du nombre de questions par ville. Formulation
// « consommateur » : exactement ce qu'un client tape dans ChatGPT/Le Chat.

const MAX_CITIES = 9; // ville principale + jusqu'à 8 autour — borne le coût.

export interface ScanCity {
  name: string;
  lat: number | null;
  lng: number | null;
}

export function buildLocalQuery(sector: string, city: string): string {
  return `Quels sont les meilleurs ${sector.trim()} à ${city.trim()} ? Donne-moi les noms les plus recommandés.`;
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
