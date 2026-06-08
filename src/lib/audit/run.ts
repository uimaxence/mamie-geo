import { randomUUID } from "node:crypto";
import * as cheerio from "cheerio";
import { runA11yChecks } from "./checks/a11y";
import { runAiBotsChecks } from "./checks/ai-bots";
import { runGeoChecks } from "./checks/geo";
import { runMobileChecks } from "./checks/mobile";
import { runOgTwitterChecks } from "./checks/og-twitter";
import { runPerfHtmlChecks } from "./checks/perf-html";
import { runPsiChecks } from "./checks/psi";
import { runSecurityChecks } from "./checks/security";
import { runSeoChecks } from "./checks/seo";
import { runSitemapRobotsChecks, type SitemapRobotsContext } from "./checks/sitemap-robots";
import type { AuditReport, AuditResult, CheckResult, SubScore } from "./types";

// Orchestrateur — fetch HTML + headers, parse cheerio, fetch
// sitemap+robots+llms.txt en parallèle, appelle tous les checks, calcule
// les scores, retourne le rapport prêt à afficher (teaser) ou à
// emailer (rapport complet).

const FETCH_TIMEOUT_MS = 8_000;
const USER_AGENT = "Mamie GEO Audit Bot 1.0 (+https://mamie-geo.fr)";

interface FetchResult {
  status: number;
  finalUrl: string;
  html: string;
  headers: Record<string, string>;
}

async function fetchPage(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
    });
    const html = await resp.text();
    const headers: Record<string, string> = {};
    resp.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    return { status: resp.status, finalUrl: resp.url, html, headers };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkUrlAccessible(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4_000);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });
    clearTimeout(timeout);
    return resp.ok;
  } catch {
    return false;
  }
}

async function fetchTextIfAccessible(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4_000);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    return await resp.text();
  } catch {
    return null;
  }
}

/** Détecte si la page semble nécessiter JavaScript pour son contenu utile. */
function detectJsRendered($: cheerio.CheerioAPI): boolean {
  // Heuristique : si le body contient < 200 mots de texte ET un script root (Next, React, etc.)
  const bodyText = $("body").text().trim();
  const wordCount = bodyText.split(/\s+/).length;
  const hasRootDiv = $("#root").length > 0 || $("#__next").length > 0 || $("#app").length > 0;
  return wordCount < 200 && hasRootDiv;
}

export async function runAudit(url: string): Promise<AuditResult> {
  let fetchResult: FetchResult;
  try {
    fetchResult = await fetchPage(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    if (message.includes("aborted") || message.includes("AbortError")) {
      return {
        ok: false,
        code: "fetch_timeout",
        message: "La page a mis trop de temps à répondre.",
      };
    }
    return {
      ok: false,
      code: "fetch_failed",
      message: `Impossible de récupérer la page : ${message}`,
    };
  }

  if (fetchResult.status >= 400) {
    return {
      ok: false,
      code: "not_found",
      message: `La page a retourné un statut HTTP ${fetchResult.status}.`,
    };
  }

  const contentType = (fetchResult.headers["content-type"] ?? "").toLowerCase();
  if (!contentType.includes("html")) {
    return {
      ok: false,
      code: "non_html",
      message: `La page n'est pas du HTML (content-type: ${contentType || "inconnu"}).`,
    };
  }

  const $ = cheerio.load(fetchResult.html);
  const htmlSizeKb = new TextEncoder().encode(fetchResult.html).length / 1024;
  const jsRendered = detectJsRendered($);

  // Origin pour les fetch externes (sitemap, robots, llms.txt)
  const origin = new URL(fetchResult.finalUrl).origin;

  // Fetchs externes en parallèle pour réduire la latence totale.
  const [psiResult, robotsTxt, sitemapAccessible, llmsTxtAccessible] = await Promise.all([
    runPsiChecks(fetchResult.finalUrl),
    fetchTextIfAccessible(`${origin}/robots.txt`),
    checkUrlAccessible(`${origin}/sitemap.xml`),
    checkUrlAccessible(`${origin}/llms.txt`),
  ]);

  const sitemapRobots: SitemapRobotsContext = {
    robotsTxt,
    sitemapAccessible,
    sitemapReferencedInRobots: robotsTxt ? /sitemap\s*:/i.test(robotsTxt) : false,
  };

  // Run all checks (synchrones)
  const checks: CheckResult[] = [
    ...runSeoChecks($, fetchResult.finalUrl),
    ...runGeoChecks($, fetchResult.finalUrl, { llmsTxtAccessible }),
    ...runOgTwitterChecks($),
    ...runA11yChecks($),
    ...runSecurityChecks(fetchResult.headers, fetchResult.finalUrl),
    ...runMobileChecks($),
    ...runPerfHtmlChecks($, htmlSizeKb, fetchResult.headers),
    ...runSitemapRobotsChecks(sitemapRobots),
    ...runAiBotsChecks(robotsTxt),
    ...psiResult.checks,
  ];

  const subScores = computeSubScores(checks, psiResult.performanceScore);
  const scoreGlobal = computeGlobalScore(subScores);

  const report: AuditReport = {
    url,
    finalUrl: fetchResult.finalUrl,
    fetchedAt: new Date().toISOString(),
    scoreGlobal,
    subScores,
    checks,
    htmlSizeKb,
    httpStatus: fetchResult.status,
    token: randomUUID(),
    psiUnavailable: !psiResult.ok,
    jsRendered,
  };

  return { ok: true, report };
}

// ── Scoring ──────────────────────────────────────────────────────────

interface ScoringBucket {
  passed: number;
  total: number;
}

function computeSubScores(checks: CheckResult[], psiPerformanceScore: number | null): SubScore[] {
  const buckets: Record<"seo" | "geo" | "a11y" | "perf", ScoringBucket> = {
    seo: { passed: 0, total: 0 },
    geo: { passed: 0, total: 0 },
    a11y: { passed: 0, total: 0 },
    perf: { passed: 0, total: 0 },
  };

  for (const c of checks) {
    if (c.status === "info") continue; // info-only ne compte pas dans le score
    // map category → bucket
    const bucket =
      c.category === "seo"
        ? "seo"
        : c.category === "geo"
          ? "geo"
          : c.category === "a11y"
            ? "a11y"
            : c.category === "perf"
              ? "perf"
              : null;
    if (!bucket) continue; // og/security/mobile pas dans le sub-score 4 axes
    buckets[bucket].total += 1;
    if (c.status === "pass") {
      buckets[bucket].passed += 1;
    } else if (c.status === "warn") {
      buckets[bucket].passed += 0.5; // demi-point pour les warn
    }
  }

  const subScores: SubScore[] = (["seo", "geo", "a11y", "perf"] as const).map((cat) => {
    const b = buckets[cat];
    let score = b.total > 0 ? Math.round((b.passed / b.total) * 100) : 100;
    // Pour `perf`, on intègre le score PSI (plus précis qu'un comptage de checks)
    if (cat === "perf" && psiPerformanceScore !== null) {
      score = Math.round((score + psiPerformanceScore) / 2);
    }
    return { category: cat, score, passed: b.passed, total: b.total };
  });

  return subScores;
}

function computeGlobalScore(subScores: SubScore[]): number {
  // Pondération : SEO 30 %, GEO 35 % (différenciateur), A11Y 15 %, Perf 20 %
  const weights: Record<SubScore["category"], number> = {
    seo: 0.3,
    geo: 0.35,
    a11y: 0.15,
    perf: 0.2,
  };
  let sum = 0;
  let weightSum = 0;
  for (const sub of subScores) {
    const w = weights[sub.category];
    sum += sub.score * w;
    weightSum += w;
  }
  return Math.round(sum / weightSum);
}
