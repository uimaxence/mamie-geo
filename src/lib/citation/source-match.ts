// Helper V0+ : détermine si une URL de source LLM appartient au domaine
// d'une marque suivie. Sert au funnel sources (Apparition/Fréquence/
// Citation) calculé dans recompute-metrics.
//
// Règle : on compare le hostname normalisé de l'URL avec brand.domain
// et ses aliases. Match exact OU le hostname termine par `.{domain}`
// (= un sous-domaine), pour capturer `blog.monsite.fr` quand on tracke
// `monsite.fr`.
//
// Les aliases peuvent contenir des labels libres (ex: "Mamie SEO"),
// donc on les filtre pour ne garder que ceux qui ressemblent à un
// domaine.

const DOMAIN_LIKE = /^[a-z0-9.-]+\.[a-z]{2,}$/i;

function normalizeHost(input: string): string | null {
  if (!input) return null;
  let s = input.trim().toLowerCase();
  if (!s) return null;

  // URL complète : extraire hostname via URL parser (fallback regex
  // pour les inputs déjà sous forme hostname pur).
  if (s.includes("://")) {
    try {
      s = new URL(s).hostname;
    } catch {
      return null;
    }
  } else {
    // Strip path / query éventuels
    const slashIdx = s.indexOf("/");
    if (slashIdx >= 0) s = s.slice(0, slashIdx);
  }

  if (s.startsWith("www.")) s = s.slice(4);
  return s || null;
}

/**
 * `true` si l'URL appartient au domaine de la marque (ou un sous-domaine).
 * Les aliases non-domaines (labels libres) sont ignorés.
 */
export function urlMatchesBrand(
  url: string,
  brand: { domain: string; aliases: readonly string[] },
): boolean {
  const host = normalizeHost(url);
  if (!host) return false;

  const candidateDomains = [brand.domain, ...brand.aliases]
    .filter((s) => typeof s === "string" && DOMAIN_LIKE.test(s.trim()))
    .map((s) => normalizeHost(s))
    .filter((s): s is string => s !== null);

  for (const domain of candidateDomains) {
    if (host === domain || host.endsWith(`.${domain}`)) return true;
  }
  return false;
}

/**
 * Compte les apparitions d'URLs de la marque dans un set de sources LLM.
 * Une source = 1 apparition. Retourne `total` (somme apparitions) et
 * `hasAny` (≥ 1 apparition).
 */
export function countBrandSources(
  sources: readonly { url: string }[],
  brand: { domain: string; aliases: readonly string[] },
): { total: number; hasAny: boolean } {
  let total = 0;
  for (const src of sources) {
    if (urlMatchesBrand(src.url, brand)) total += 1;
  }
  return { total, hasAny: total > 0 };
}
