// Types de la « Carte de visibilité IA locale » (/outils/visibilite-locale).
// Le prospect entre site + email : on déduit marque/secteur/ville, on
// génère ~6 villes autour, et on demande à une IA grounded « meilleurs
// {secteur} à {ville} ? » pour CHAQUE ville. Verdict par ville sur 3 états
// (retour Max 2026-06-18) → carte qui s'allume :
//   - top       = l'IA te cite EN TÊTE              → vert
//   - mentioned = l'IA te cite, mais pas en premier → orange (score partiel)
//   - absent    = l'IA ne te cite pas du tout       → rouge
// Concept GEO local (doc 09 § 2026-06-17) : personne d'autre ne track
// l'intention locale.

export type CityStatus = "top" | "mentioned" | "absent";

export interface CityVisibility {
  /** Ville interrogée (« Tours »). */
  name: string;
  /** Coordonnées pour la carte (null si non géocodée → absente de la carte). */
  lat: number | null;
  lng: number | null;
  /** Statut de la marque à cette ville (3 états, cf. CityStatus). */
  status: CityStatus;
  /** Raccourci `status === "top"` — conservé pour l'email lead et la copy. */
  recommended: boolean;
  /** Contribution au score local : top=1, mentioned=0,45-0,7, absent=0. */
  score: number;
  /** Marques/concurrents que l'IA cite à cette ville (hors la marque cible). */
  rivals: string[];
  /** Concurrent cité devant toi (premier rival), null si tu es en tête / aucun. */
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
  /** Libellé de l'IA interrogée (affiché à l'utilisateur). */
  llmLabel: string;
  /** Ville centrale + villes autour, dans l'ordre d'affichage. */
  cities: CityVisibility[];
  /** Concurrents les plus cités dans la zone, triés (pour le chart). */
  topCompetitors: CompetitorTally[];
  /** Nombre de villes où la marque est citée EN TÊTE (statut top). */
  recommendedCount: number;
  /** Nombre de villes où la marque est citée mais pas en tête (statut mentioned). */
  mentionedCount: number;
  totalCities: number;
  /** Score local 0-100 pondéré (moyenne des contributions par ville). */
  score: number;
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
