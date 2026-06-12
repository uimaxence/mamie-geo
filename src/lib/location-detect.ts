import * as cheerio from "cheerio";

// Détection de la zone d'une PME depuis la home de son site, pour
// pré-remplir le champ « Ta ville » des scans (modifiable par le
// prospect — on ne localise jamais en silence, un SaaS national
// scanné en local donnerait un faux verdict). Deux signaux, par ordre
// de fiabilité :
//   1. JSON-LD `addressLocality` (PostalAddress de LocalBusiness/
//      Organization — la donnée déclarée par le site lui-même)
//   2. Regex code postal FR + ville dans le footer (puis la page)
// Best effort strict : tout échec → null.

const FETCH_TIMEOUT_MS = 5_000;
const USER_AGENT = "Mamie GEO Audit Bot 1.0 (+https://mamie-geo.fr)";

// Code postal FR (01000-98999) suivi du nom de ville. Capture la ville,
// lettres/espaces/tirets/apostrophes, en s'arrêtant avant une coupure.
const POSTAL_CITY_REGEX =
  /\b(?:0[1-9]|[1-8]\d|9[0-8])\d{3}\s+([A-ZÀ-Ý][A-Za-zÀ-ÿ'’-]+(?:[\s-][A-ZÀ-Ý][A-Za-zÀ-ÿ'’-]+)*)/u;

/** Cherche récursivement `addressLocality` dans un objet JSON-LD. */
function findAddressLocality(node: unknown): string | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findAddressLocality(item);
      if (found) return found;
    }
    return null;
  }
  const record = node as Record<string, unknown>;
  const locality = record["addressLocality"];
  if (typeof locality === "string" && locality.trim()) return locality.trim();
  for (const value of Object.values(record)) {
    const found = findAddressLocality(value);
    if (found) return found;
  }
  return null;
}

function cleanCity(raw: string): string | null {
  // "Tours Cedex 9" → "Tours" ; coupe aussi les captures trop longues
  // (la regex peut avaler un début de phrase en Title Case).
  const city = raw
    .replace(/\s+Cedex.*$/i, "")
    .replace(/\s+France$/i, "")
    .trim();
  if (!city || city.length > 40 || city.split(/\s+/).length > 4) return null;
  return city;
}

/** Récupère la home d'un domaine, null si inaccessible. */
export async function fetchHomeHtml(
  domain: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetchImpl(`https://${domain}/`, {
        headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
        signal: controller.signal,
        redirect: "follow",
      });
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

/** Signaux de localisation déterministes d'une home déjà parsée. */
export function extractLocalityFromHtml($: cheerio.CheerioAPI): string | null {
  // 1. JSON-LD — la source déclarative.
  for (const el of $('script[type="application/ld+json"]').toArray()) {
    try {
      const data: unknown = JSON.parse($(el).text());
      const locality = findAddressLocality(data);
      if (locality) {
        const city = cleanCity(locality);
        if (city) return city;
      }
    } catch {
      // JSON-LD malformé — fréquent, on passe au suivant.
    }
  }

  // 2. Code postal + ville, footer d'abord (l'adresse y vit), page entière sinon.
  for (const scope of [$("footer").text(), $("body").text()]) {
    const match = POSTAL_CITY_REGEX.exec(scope);
    if (match?.[1]) {
      const city = cleanCity(match[1]);
      if (city) return city;
    }
  }
  return null;
}

/**
 * Détecte la ville principale d'un site depuis sa home page.
 * Retourne null si rien de fiable n'est trouvé (site national, SaaS,
 * page inaccessible…).
 */
export async function detectSiteLocation(
  domain: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const html = await fetchHomeHtml(domain, fetchImpl);
  if (!html) return null;
  return extractLocalityFromHtml(cheerio.load(html));
}
