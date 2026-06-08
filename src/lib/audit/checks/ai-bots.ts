import type { CheckResult } from "../types";

// Crawlabilité par les bots IA — V0+ (cf. doc 02 § V0+). Parse robots.txt
// pour détecter les blocs `Disallow` qui empêchent GPTBot, ClaudeBot,
// PerplexityBot, Google-Extended et autres crawlers IA de récupérer la
// page. Différenciateur fort vs SEO classique : si un site bloque GPTBot
// il n'apparaîtra jamais dans les réponses ChatGPT.
//
// Source des user agents :
//   - GPTBot         : https://platform.openai.com/docs/gptbot
//   - ChatGPT-User   : ChatGPT browsing (live)
//   - OAI-SearchBot  : SearchGPT index
//   - ClaudeBot      : https://docs.anthropic.com/en/docs/claude-code/claude-bot
//   - Claude-Web     : Anthropic search live
//   - PerplexityBot  : https://docs.perplexity.ai/guides/bots
//   - Google-Extended: opt-out Gemini training (n'affecte pas le ranking Google)
//   - CCBot          : Common Crawl, utilisé par plusieurs LLM en pre-training
//   - Bytespider     : ByteDance (Doubao)

interface AiBot {
  /** Nom officiel du user-agent (case-insensitive matching). */
  userAgent: string;
  /** Label humain. */
  label: string;
  /** Provider/produit cible — sert juste à informer le user. */
  product: string;
  /** Sévérité quand bloqué. `critical` pour les bots qui répondent aux requêtes
   * live (ChatGPT, Perplexity), `warning` pour les crawlers training-only. */
  severity: "critical" | "warning";
}

const AI_BOTS: readonly AiBot[] = [
  {
    userAgent: "GPTBot",
    label: "GPTBot",
    product: "OpenAI (training ChatGPT)",
    severity: "warning",
  },
  {
    userAgent: "ChatGPT-User",
    label: "ChatGPT-User",
    product: "ChatGPT (browsing live)",
    severity: "critical",
  },
  {
    userAgent: "OAI-SearchBot",
    label: "OAI-SearchBot",
    product: "SearchGPT",
    severity: "critical",
  },
  {
    userAgent: "ClaudeBot",
    label: "ClaudeBot",
    product: "Anthropic (training Claude)",
    severity: "warning",
  },
  {
    userAgent: "Claude-Web",
    label: "Claude-Web",
    product: "Claude (recherche live)",
    severity: "critical",
  },
  {
    userAgent: "PerplexityBot",
    label: "PerplexityBot",
    product: "Perplexity",
    severity: "critical",
  },
  {
    userAgent: "Google-Extended",
    label: "Google-Extended",
    product: "Gemini (training)",
    severity: "warning",
  },
  {
    userAgent: "CCBot",
    label: "CCBot",
    product: "Common Crawl (pre-training multi-LLM)",
    severity: "warning",
  },
] as const;

/**
 * Détermine si un user-agent est bloqué par le robots.txt fourni. Parsing
 * simple, suffisant pour détecter les patterns courants :
 *   - `User-agent: <bot>` + `Disallow: /` → bloqué
 *   - `User-agent: *` + `Disallow: /` → bloqué si pas de bloc spécifique
 *   - `User-agent: <bot>` + `Allow: /` override un wildcard bloquant
 *
 * Pas de gestion fine des wildcards / sitemap — on cible la question
 * binaire « le bot peut-il accéder à la racine ? ».
 */
export function isBotBlocked(robotsTxt: string, userAgent: string): boolean {
  const lines = robotsTxt
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  const uaLower = userAgent.toLowerCase();
  let inMatchingGroup = false;
  let inWildcardGroup = false;
  let hasSpecificGroup = false;
  let specificBlocksRoot = false;
  let specificAllowsRoot = false;
  let wildcardBlocksRoot = false;

  for (const line of lines) {
    const uaMatch = line.match(/^user-agent\s*:\s*(.+)$/i);
    if (uaMatch) {
      const value = uaMatch[1]?.trim().toLowerCase() ?? "";
      inMatchingGroup = value === uaLower;
      inWildcardGroup = value === "*";
      if (inMatchingGroup) hasSpecificGroup = true;
      continue;
    }
    const disallowMatch = line.match(/^disallow\s*:\s*(.*)$/i);
    if (disallowMatch) {
      const path = disallowMatch[1]?.trim() ?? "";
      if (path === "/" || path === "/*") {
        if (inMatchingGroup) specificBlocksRoot = true;
        if (inWildcardGroup) wildcardBlocksRoot = true;
      }
      continue;
    }
    const allowMatch = line.match(/^allow\s*:\s*(.*)$/i);
    if (allowMatch && inMatchingGroup) {
      const path = allowMatch[1]?.trim() ?? "";
      if (path === "/" || path === "") {
        specificAllowsRoot = true;
      }
    }
  }

  // Le bloc spécifique prime sur le wildcard : présence d'un groupe
  // dédié au bot ⇒ on l'utilise comme source de vérité (Allow ou Disallow).
  if (hasSpecificGroup) {
    if (specificAllowsRoot) return false;
    return specificBlocksRoot;
  }
  // Pas de bloc spécifique → fallback wildcard.
  return wildcardBlocksRoot;
}

export function runAiBotsChecks(robotsTxt: string | null): CheckResult[] {
  const results: CheckResult[] = [];

  // Pas de robots.txt → tous les bots ont accès par défaut. Le check
  // `seo.robots-missing` côté sitemap-robots.ts le signale déjà ; ici
  // on émet un info pour confirmer que les bots IA sont OK par défaut.
  if (robotsTxt === null) {
    results.push({
      id: "geo.ai-bots-default-allowed",
      category: "geo",
      severity: "info",
      status: "info",
      label: "Bots IA autorisés par défaut (pas de robots.txt)",
      found: "robots.txt absent",
      expected: "OK pour l'indexation IA",
    });
    return results;
  }

  for (const bot of AI_BOTS) {
    const blocked = isBotBlocked(robotsTxt, bot.userAgent);
    results.push({
      id: `geo.ai-bot-${bot.userAgent.toLowerCase()}`,
      category: "geo",
      severity: bot.severity,
      status: blocked ? "fail" : "pass",
      label: blocked
        ? `${bot.label} bloqué par robots.txt — ${bot.product}`
        : `${bot.label} autorisé — ${bot.product}`,
      found: blocked ? "Disallow: /" : "non bloqué",
      expected: "non bloqué (Allow: / ou pas de règle Disallow)",
    });
  }

  return results;
}
