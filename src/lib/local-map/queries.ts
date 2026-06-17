// Question locale posée à l'IA pour une ville donnée. Une seule question
// par ville (vs 3 pour le scan express) : la carte tire sa force du
// NOMBRE de villes, pas du nombre de questions par ville. Formulation
// « consommateur » : exactement ce qu'un client tape dans ChatGPT/Le Chat.

const MAX_CITIES = 5; // ville principale + 4 autour — borne le coût LLM.

export function buildLocalQuery(sector: string, city: string): string {
  return `Quels sont les meilleurs ${sector.trim()} à ${city.trim()} ? Donne-moi les noms les plus recommandés.`;
}

/**
 * Compose la liste finale de villes (principale d'abord), dédupliquée
 * (insensible à la casse/accents via la clé fournie) et bornée à
 * MAX_CITIES pour maîtriser le coût.
 */
export function resolveCityList(
  mainCity: string,
  surrounding: readonly string[],
  normalize: (s: string) => string,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const city of [mainCity, ...surrounding]) {
    const name = city.trim();
    if (!name) continue;
    const key = normalize(name);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
    if (out.length >= MAX_CITIES) break;
  }
  return out;
}

export { MAX_CITIES };
