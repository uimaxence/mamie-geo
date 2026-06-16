import { LLM_VALUES } from "@/db/schema";

// Détection de l'origine IA d'une visite, à partir du `document.referrer` et
// des paramètres d'URL. Pur et testable (aucun I/O) : le snippet l'appelle
// côté navigateur, l'endpoint d'ingestion ne refait pas confiance au client
// (il revalide la valeur `s` contre LLM_VALUES via zod).
//
// `source` = une valeur de LLM_VALUES pour pouvoir superposer le trafic au
// score de visibilité Mamie. Copilot (Microsoft) est fusionné sur "chatgpt"
// (même moteur GPT) — décision doc 09 § 2026-06-15.

export type AiSource = (typeof LLM_VALUES)[number];

// Hôtes referrer → source. Le matching est STRICT sur le host (égalité ou
// sous-domaine), jamais un `includes` naïf : `evil-chatgpt.com.attacker.net`
// ne doit pas matcher "chatgpt.com".
// Exporté pour que le snippet client (servi par /api/ai-pixel/[key]) réutilise
// EXACTEMENT les mêmes règles — source de vérité unique, pas de drift.
export const HOST_RULES: ReadonlyArray<{ source: AiSource; hosts: readonly string[] }> = [
  { source: "chatgpt", hosts: ["chatgpt.com", "chat.openai.com", "copilot.microsoft.com"] },
  { source: "perplexity", hosts: ["perplexity.ai"] },
  { source: "gemini", hosts: ["gemini.google.com", "bard.google.com"] },
  { source: "claude", hosts: ["claude.ai"] },
  { source: "lechat", hosts: ["chat.mistral.ai"] },
];

// Valeurs `utm_source` / `ref` → source. Prioritaire sur le referrer : les
// apps natives (ChatGPT/Perplexity mobile) strippent souvent le referrer mais
// ajoutent un `utm_source` (ex. OpenAI ajoute `?utm_source=chatgpt.com`).
export const UTM_RULES: ReadonlyArray<{ source: AiSource; values: readonly string[] }> = [
  { source: "chatgpt", values: ["chatgpt.com", "chatgpt", "openai", "copilot"] },
  { source: "perplexity", values: ["perplexity.ai", "perplexity"] },
  { source: "gemini", values: ["gemini", "google-gemini", "bard"] },
  { source: "claude", values: ["claude.ai", "claude", "anthropic"] },
  { source: "lechat", values: ["mistral", "lechat", "le-chat"] },
];

function parseHost(referrer: string): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Retourne la source IA de la visite, ou `null` si l'origine n'est pas une IA
 * connue. Le snippet n'émet un beacon que si le résultat est non-null (on ne
 * compte QUE le trafic IA).
 */
export function detectAiSource(referrer: string, params: URLSearchParams): AiSource | null {
  // 1. UTM / ref prioritaire (cf. commentaire UTM_RULES).
  const utm = (params.get("utm_source") ?? params.get("ref") ?? "").trim().toLowerCase();
  if (utm) {
    for (const rule of UTM_RULES) {
      if (rule.values.includes(utm)) return rule.source;
    }
  }

  // 2. Host du referrer (égalité stricte ou sous-domaine).
  const host = parseHost(referrer);
  if (host) {
    for (const rule of HOST_RULES) {
      if (rule.hosts.some((h) => host === h || host.endsWith(`.${h}`))) return rule.source;
    }
  }

  return null;
}

// Normalise un domaine de marque (nu, ou avec protocole/chemin) en host
// comparable, sans `www.` de tête.
function normalizeDomain(value: string): string {
  return value
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "")
    .trim()
    .toLowerCase();
}

/**
 * Vrai si le beacon provient bien du domaine de la marque (égalité exacte ou
 * sous-domaine). Lie la clé du pixel à UN projet : la copier sur un autre site
 * ne compte pas — il faut créer une nouvelle marque (nouvelle clé).
 *
 * `origin` = header `Origin` (ou fallback `Referer`) de la requête d'ingestion.
 * Binding STRICT : origine absente ou illisible → `false` (pas de host
 * vérifiable = rejet). Le matching écarte `marque.fr.attaquant.com` et
 * `evil-marque.fr` (pas un `includes` naïf).
 */
export function isAllowedOrigin(origin: string | null, brandDomain: string): boolean {
  if (!origin) return false;
  const rawHost = parseHost(origin);
  if (!rawHost) return false;
  const host = rawHost.replace(/^www\./, "");
  const domain = normalizeDomain(brandDomain);
  if (!host || !domain) return false;
  return host === domain || host.endsWith(`.${domain}`);
}
