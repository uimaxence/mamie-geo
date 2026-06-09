import type { EntityType } from "@/components/ui";

// Classification d'un domaine source en type d'entité, pour l'onglet
// Sources de /app/citations. Fonction pure et testable — sortie du
// composant pour pouvoir tagger les domaines concurrents (qu'on a en
// base) en plus de "you" / "reference" / "ugc".
//
// Heuristique minimale en attendant le classifier LLM V1 (cf. doc 02
// § Domain Types classification) qui automatisera "editorial" /
// "corporate". Pour l'instant on tague ce qu'on peut sans IA :
//   - "you"        : host = ton domaine (ou sous-domaine)
//   - "competitor" : host = un domaine concurrent suivi
//   - "reference"  : Wikipedia / Wikidata
//   - "ugc"        : Reddit / HN / StackExchange / Quora
//   - "other"      : fallback neutre

export interface ClassifySourceOptions {
  /** Domaine de ta marque (peut contenir protocole / slash, on normalise). */
  brandDomain: string | null;
  /** Domaines des concurrents suivis (mêmes tolérances). */
  competitorDomains: readonly (string | null)[];
}

export function classifySource(host: string, options: ClassifySourceOptions): EntityType {
  const h = normalizeDomain(host);
  if (!h) return "other";

  if (options.brandDomain && domainMatches(h, normalizeDomain(options.brandDomain))) {
    return "you";
  }
  for (const competitorDomain of options.competitorDomains) {
    const cd = competitorDomain ? normalizeDomain(competitorDomain) : "";
    if (cd && domainMatches(h, cd)) return "competitor";
  }

  if (h === "wikipedia.org" || h.endsWith(".wikipedia.org") || h === "wikidata.org") {
    return "reference";
  }
  if (
    h === "reddit.com" ||
    h.endsWith(".reddit.com") ||
    h === "ycombinator.com" ||
    h.endsWith(".ycombinator.com") ||
    h === "quora.com" ||
    h.endsWith(".quora.com") ||
    h === "stackoverflow.com" ||
    h.endsWith(".stackexchange.com") ||
    h === "stackexchange.com"
  ) {
    return "ugc";
  }
  return "other";
}

/** Retire protocole, `www.`, chemin/slash final ; lowercase. */
export function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

// Match exact ou sous-domaine, avec garde de frontière : "brand.com"
// matche "brand.com" et "blog.brand.com" mais PAS "notbrand.com".
function domainMatches(host: string, domain: string): boolean {
  if (!domain) return false;
  return host === domain || host.endsWith(`.${domain}`);
}
