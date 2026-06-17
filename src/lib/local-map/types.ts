// Types de la « Carte de visibilité IA locale » (/outils/visibilite-locale).
// Le prospect entre site + email : on déduit marque/secteur/ville, on
// génère 4-5 villes autour, et on demande à Le Chat « meilleur {secteur}
// à {ville} ? » pour CHAQUE ville. Verdict par ville → carte qui s'allume
// (recommandé = vert, concurrent à ta place = rouge). Concept GEO local
// (doc 09 § 2026-06-17) : personne d'autre ne track l'intention locale.

export interface CityVisibility {
  /** Ville interrogée (« Tours »). */
  name: string;
  /** Coordonnées pour la carte (null si non géocodée → absente de la carte). */
  lat: number | null;
  lng: number | null;
  /** La marque est-elle recommandée par l'IA à cette ville ? */
  recommended: boolean;
  /** Marques/concurrents que l'IA cite à cette ville (hors la marque cible). */
  rivals: string[];
  /** Concurrent n°1 cité « à ta place » (premier rival), null si recommandé/aucun. */
  topRival: string | null;
  /** La question exacte posée à l'IA (affichée au prospect). */
  query: string;
}

export interface LocalMapReport {
  brand: string;
  sector: string;
  /** Ville principale (centre de la carte). */
  mainCity: string;
  /** LLM interrogé (V0 : Le Chat via mistral-small). */
  llmLabel: string;
  /** Ville centrale + villes autour, dans l'ordre d'affichage. */
  cities: CityVisibility[];
  /** Nombre de villes où la marque est recommandée. */
  recommendedCount: number;
  totalCities: number;
  fetchedAt: string; // ISO
}

export type LocalMapErrorCode =
  | "invalid_input"
  | "rate_limited"
  | "llm_unavailable"
  | "no_location";

export type LocalMapResult =
  | { ok: true; report: LocalMapReport }
  | { ok: false; code: LocalMapErrorCode; message: string };
