import type { CheckResult } from "../types";

// Sitemap + robots.txt — fetch séparés depuis run.ts qui passe le
// résultat ici. On évite de doubler les fetch en testant les checks
// stateful.

export interface SitemapRobotsContext {
  robotsTxt: string | null;
  sitemapAccessible: boolean;
  sitemapReferencedInRobots: boolean;
}

export function runSitemapRobotsChecks(ctx: SitemapRobotsContext): CheckResult[] {
  const results: CheckResult[] = [];

  if (ctx.robotsTxt === null) {
    results.push({
      id: "seo.robots-missing",
      category: "seo",
      severity: "warning",
      status: "fail",
      label: "`/robots.txt` introuvable",
      expected: "Un robots.txt à la racine",
    });
  } else {
    results.push({
      id: "seo.robots-present",
      category: "seo",
      severity: "info",
      status: "pass",
      label: "/robots.txt accessible",
    });
  }

  if (!ctx.sitemapAccessible) {
    results.push({
      id: "seo.sitemap-missing",
      category: "seo",
      severity: "warning",
      status: "fail",
      label: "`/sitemap.xml` introuvable",
      expected: "Un sitemap.xml à la racine",
    });
  } else {
    results.push({
      id: "seo.sitemap-present",
      category: "seo",
      severity: "info",
      status: "pass",
      label: "/sitemap.xml accessible",
    });
  }

  if (ctx.robotsTxt && !ctx.sitemapReferencedInRobots && ctx.sitemapAccessible) {
    results.push({
      id: "seo.sitemap-not-in-robots",
      category: "seo",
      severity: "info",
      status: "warn",
      label: "Sitemap non référencé dans robots.txt",
      expected: "Ligne `Sitemap: https://.../sitemap.xml` dans robots.txt",
    });
  }

  return results;
}
