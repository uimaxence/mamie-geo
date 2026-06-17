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
  /** Les questions exactes posées à l'IA pour cette ville (1 par intention). */
  queries: string[];
}

/** Concurrent agrégé sur toute la zone (pour le chart « top concurrents »). */
export interface CompetitorTally {
  name: string;
  /** Nombre de villes où ce concurrent est cité. */
  cityCount: number;
}

export interface LocalMapReport {
  brand: string;
  sector: string;
  /** Ville principale (centre de la carte). */
  mainCity: string;
  /** LLM interrogé (V0 : Le Chat via mistral-small). */
  llmLabel: string;
  /** Intentions de recherche utilisées (« meilleur menuisier », « pose de fenêtres »…). */
  intents: string[];
  /** Ville centrale + villes autour, dans l'ordre d'affichage. */
  cities: CityVisibility[];
  /** Concurrents les plus cités dans la zone, triés (pour le chart). */
  topCompetitors: CompetitorTally[];
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
