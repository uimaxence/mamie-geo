import type { SourceListItem } from "./queries";

// Helpers de repli des URLs citées vers leurs domaines (hostname). Sert au
// widget « Top Sources » (dashboard + onglet Sources). Fonctions pures,
// testables, sans I/O — on replie l'agrégat par URL déjà calculé par
// `listCitedSources` plutôt que d'écrire une nouvelle requête SQL.

/** Extrait le host d'une URL, sans `www.`. Renvoie l'URL brute si invalide. */
export function extractHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export interface SourceDomain {
  domain: string;
  citationCount: number;
}

/**
 * Replie une liste de sources (par URL) en un classement par domaine,
 * trié par nombre de citations décroissant. `limit` borne le top.
 */
export function aggregateSourceDomains(
  sources: readonly SourceListItem[],
  limit = 8,
): SourceDomain[] {
  const byDomain = new Map<string, number>();
  for (const s of sources) {
    const domain = extractHost(s.url);
    byDomain.set(domain, (byDomain.get(domain) ?? 0) + s.citationCount);
  }

  return [...byDomain.entries()]
    .map(([domain, citationCount]) => ({ domain, citationCount }))
    .sort((a, b) => b.citationCount - a.citationCount)
    .slice(0, limit);
}
