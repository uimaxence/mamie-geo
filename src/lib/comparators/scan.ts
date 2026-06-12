import {
  findCuratedComparators,
  isBlockedDomain,
  labelFromDomain,
} from "./sectors";
import type {
  ComparatorCheck,
  ComparatorScanReport,
  ComparatorScanResult,
  SearchFn,
} from "./types";

// Moteur du scan comparateurs, en 2 temps :
//   1. Découverte — recherches web "meilleur {secteur}" / "{secteur}
//      comparatif avis" : les pages qui rankent là sont précisément
//      celles que les IA lisent avant de répondre (doc 11). Fusion
//      avec le mapping curaté de l'étude (curaté d'abord).
//   2. Présence — `site:{domaine} "{marque}"` par comparateur.
// Chaque étape est parallélisée (rate limit Brave 50 req/s, on en fait
// 8 max). Aucun LLM — déterministe, coût = ~10 requêtes search/scan.

const MAX_COMPARATORS = 8;
const DISCOVERY_RESULT_COUNT = 10;
const PRESENCE_RESULT_COUNT = 3;

function discoveryQueries(sector: string): string[] {
  return [`meilleur ${sector}`, `${sector} comparatif avis`];
}

/** Les guillemets casseraient la requête exacte `"{marque}"`. */
function sanitizeBrandForQuery(brand: string): string {
  return brand.replace(/["«»]/g, "").trim();
}

function matchesDomain(resultDomain: string, domain: string): boolean {
  return resultDomain === domain || resultDomain.endsWith(`.${domain}`);
}

export interface ComparatorScanParams {
  brand: string;
  sector: string;
  /** Domaine du site de la marque, exclu de la découverte. */
  websiteDomain?: string;
  search: SearchFn;
}

export async function runComparatorScan(
  params: ComparatorScanParams,
): Promise<ComparatorScanResult> {
  const brand = sanitizeBrandForQuery(params.brand);
  const sector = params.sector.trim();
  const ownDomain = params.websiteDomain?.replace(/^www\./, "").toLowerCase();

  // 1. Découverte live + fusion curaté.
  const candidates = new Map<string, ComparatorCheck>();
  for (const curated of findCuratedComparators(sector)) {
    candidates.set(curated.domain, {
      domain: curated.domain,
      label: curated.label,
      origin: "etude",
      present: false,
    });
  }

  const discoveries = await Promise.allSettled(
    discoveryQueries(sector).map((query) => params.search(query, DISCOVERY_RESULT_COUNT)),
  );
  // Sans découverte ET sans curaté on ne peut rien vérifier ; avec du
  // curaté on continue en mode dégradé.
  if (candidates.size === 0 && discoveries.every((d) => d.status === "rejected")) {
    const firstError = discoveries[0];
    const reason = firstError?.status === "rejected" ? firstError.reason : undefined;
    return {
      ok: false,
      code: "search_unavailable",
      message: `Recherche web indisponible: ${reason instanceof Error ? reason.message : String(reason)}`,
    };
  }
  for (const discovery of discoveries) {
    if (discovery.status !== "fulfilled") continue;
    for (const result of discovery.value) {
      if (candidates.size >= MAX_COMPARATORS) break;
      if (candidates.has(result.domain)) continue;
      if (isBlockedDomain(result.domain)) continue;
      if (ownDomain && matchesDomain(result.domain, ownDomain)) continue;
      candidates.set(result.domain, {
        domain: result.domain,
        label: labelFromDomain(result.domain),
        origin: "recherche",
        present: false,
      });
    }
  }

  const checks = [...candidates.values()].slice(0, MAX_COMPARATORS);
  if (checks.length === 0) {
    return {
      ok: false,
      code: "no_comparators",
      message:
        "Aucun comparateur trouvé pour ce secteur. Reformule-le plus simplement (ex: « agence seo », « logiciel de caisse », « plombier »).",
    };
  }

  // 2. Vérification de présence, en parallèle (8 max, loin des 50 req/s).
  await Promise.all(
    checks.map(async (check) => {
      try {
        const results = await params.search(
          `site:${check.domain} "${brand}"`,
          PRESENCE_RESULT_COUNT,
        );
        const hit = results.find((r) => matchesDomain(r.domain, check.domain));
        if (hit) {
          check.present = true;
          check.foundUrl = hit.url;
          check.foundTitle = hit.title;
        }
      } catch {
        // Un check qui échoue reste "absent" plutôt que de faire
        // échouer tout le scan.
      }
    }),
  );

  const presentCount = checks.filter((c) => c.present).length;
  const report: ComparatorScanReport = {
    brand,
    sector,
    checks,
    presentCount,
    totalChecked: checks.length,
    scorePct: Math.round((presentCount / checks.length) * 100),
    fetchedAt: new Date().toISOString(),
  };
  return { ok: true, report };
}
