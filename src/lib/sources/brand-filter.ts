// Helpers pour parser le search param ?brands=id1,id2 de /app/sources
// et filtrer la sélection contre les brands réellement présentes dans
// le workspace (évite l'injection d'IDs externes).

export function parseBrandIdsFromSearchParam(
  raw: string | string[] | undefined,
  availableBrandIds: readonly string[],
): string[] {
  if (!raw) return [...availableBrandIds];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return [...availableBrandIds];

  const requested = value
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  const available = new Set(availableBrandIds);
  const filtered = requested.filter((id) => available.has(id));
  // Si après filtrage rien ne reste (IDs invalides), on retombe sur all
  // pour éviter d'afficher une page vide silencieusement.
  if (filtered.length === 0) return [...availableBrandIds];
  return filtered;
}

export function serializeBrandIdsToSearchParam(
  selected: readonly string[],
  available: readonly string[],
): string | null {
  // Si tout est sélectionné, on omet le param pour garder une URL propre.
  if (selected.length === available.length) return null;
  if (selected.length === 0) return null;
  return selected.join(",");
}
