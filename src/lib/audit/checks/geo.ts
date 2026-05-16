import type { CheerioAPI } from "cheerio";
import type { CheckResult } from "../types";

// Checks GEO-specific — différenciateur Mamie GEO. Vérifie les signaux
// que les LLM regardent en priorité quand ils décident de citer une
// marque : FAQPage JSON-LD, Article JSON-LD, llms.txt, author info,
// dates publication, E-E-A-T pages liées.

interface JsonLdNode {
  "@type"?: string | string[];
  [key: string]: unknown;
}

function extractJsonLd($: CheerioAPI): JsonLdNode[] {
  const nodes: JsonLdNode[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text().trim();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      // Le JSON-LD peut être un objet seul ou un array ou avoir un @graph.
      const items: JsonLdNode[] = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item && typeof item === "object") {
          const graph = (item as { "@graph"?: unknown })["@graph"];
          if (Array.isArray(graph)) {
            for (const g of graph) {
              if (g && typeof g === "object") nodes.push(g as JsonLdNode);
            }
          } else {
            nodes.push(item);
          }
        }
      }
    } catch {
      // ignore JSON-LD invalide
    }
  });
  return nodes;
}

function hasType(nodes: JsonLdNode[], type: string): boolean {
  return nodes.some((n) => {
    const t = n["@type"];
    if (Array.isArray(t)) return t.includes(type);
    return t === type;
  });
}

export interface GeoSideChecks {
  /** Présence de /llms.txt — résolu par fetch externe dans run.ts. */
  llmsTxtAccessible: boolean;
}

export function runGeoChecks($: CheerioAPI, finalUrl: string, side: GeoSideChecks): CheckResult[] {
  const results: CheckResult[] = [];
  const jsonLd = extractJsonLd($);
  const types = jsonLd
    .map((n) => n["@type"])
    .flat()
    .filter(Boolean) as string[];

  // Article JSON-LD
  if (
    hasType(jsonLd, "Article") ||
    hasType(jsonLd, "BlogPosting") ||
    hasType(jsonLd, "NewsArticle")
  ) {
    results.push({
      id: "geo.article-jsonld-present",
      category: "geo",
      severity: "info",
      status: "pass",
      label: "Schéma Article JSON-LD détecté",
    });
  } else {
    results.push({
      id: "geo.article-jsonld-missing",
      category: "geo",
      severity: "warning",
      status: "fail",
      label: "Schéma Article JSON-LD manquant",
      expected: 'Un `<script type="application/ld+json">` avec `"@type": "Article"`',
    });
  }

  // FAQPage JSON-LD — boost GEO majeur
  if (hasType(jsonLd, "FAQPage")) {
    results.push({
      id: "geo.faqpage-jsonld-present",
      category: "geo",
      severity: "info",
      status: "pass",
      label: "Schéma FAQPage JSON-LD détecté (boost GEO majeur)",
    });
  } else {
    results.push({
      id: "geo.faqpage-jsonld-missing",
      category: "geo",
      severity: "critical",
      status: "fail",
      label: "Schéma FAQPage JSON-LD manquant",
      expected: "Un schéma FAQPage avec 4-8 Q/R typiques",
    });
  }

  // Organization JSON-LD
  if (hasType(jsonLd, "Organization") || hasType(jsonLd, "LocalBusiness")) {
    results.push({
      id: "geo.organization-jsonld-present",
      category: "geo",
      severity: "info",
      status: "pass",
      label: "Schéma Organization JSON-LD détecté",
    });
  } else {
    results.push({
      id: "geo.organization-jsonld-missing",
      category: "geo",
      severity: "warning",
      status: "fail",
      label: "Schéma Organization JSON-LD manquant",
      expected: "Un schéma Organization avec name, url, logo",
    });
  }

  // Author info visible — heuristique : présence de "Par X" ou meta author
  const bodyText = $("body").text().toLowerCase();
  const hasAuthorByline =
    /\bpar\s+[A-ZÀ-Ÿ]/i.test($("body").text()) || /\bby\s+[A-Z]/i.test($("body").text());
  const hasMetaAuthor = $('head > meta[name="author"]').attr("content")?.trim();
  const hasPersonJsonLd = hasType(jsonLd, "Person");

  if (hasAuthorByline || hasMetaAuthor || hasPersonJsonLd) {
    results.push({
      id: "geo.author-present",
      category: "geo",
      severity: "info",
      status: "pass",
      label: "Auteur identifiable (byline / meta / Person JSON-LD)",
    });
  } else {
    results.push({
      id: "geo.author-missing",
      category: "geo",
      severity: "warning",
      status: "fail",
      label: "Aucun auteur visible (byline, meta ou Person JSON-LD)",
      expected: 'Une signature "Par X" + meta author ou Person JSON-LD',
    });
  }

  // Date publication — heuristique : meta article:published_time ou time elem
  const articleTime = $('head > meta[property="article:published_time"]').attr("content");
  const timeTag = $("time[datetime]").first().attr("datetime");
  if (articleTime || timeTag) {
    results.push({
      id: "geo.date-present",
      category: "geo",
      severity: "info",
      status: "pass",
      label: "Date de publication détectée",
      found: articleTime ?? timeTag ?? "",
    });
  } else {
    results.push({
      id: "geo.date-missing",
      category: "geo",
      severity: "warning",
      status: "fail",
      label: "Date de publication non détectée",
      expected: '`<meta property="article:published_time">` ou `<time datetime="">`',
    });
  }

  // llms.txt — déjà fetché par run.ts
  if (side.llmsTxtAccessible) {
    results.push({
      id: "geo.llms-txt-present",
      category: "geo",
      severity: "info",
      status: "pass",
      label: "/llms.txt accessible (avance compétitive)",
    });
  } else {
    results.push({
      id: "geo.llms-txt-missing",
      category: "geo",
      severity: "warning",
      status: "fail",
      label: "/llms.txt manquant",
      expected: "Un fichier llms.txt à la racine de ton site",
    });
  }

  // E-E-A-T signals : about / contact / author pages liées depuis le DOM
  const links = $("a[href]")
    .toArray()
    .map((el) => $(el).attr("href")?.toLowerCase() ?? "");
  const hasAbout = links.some((h) => /\/(?:about|a-propos|qui-(?:sommes-nous|suis-je))/i.test(h));
  const hasContact = links.some((h) => /\/contact/i.test(h));
  if (hasAbout && hasContact) {
    results.push({
      id: "geo.eeat-signals-present",
      category: "geo",
      severity: "info",
      status: "pass",
      label: "Pages E-E-A-T (about + contact) liées depuis la page",
    });
  } else {
    results.push({
      id: "geo.eeat-signals-missing",
      category: "geo",
      severity: "warning",
      status: "fail",
      label: "Pages E-E-A-T manquantes ou non liées",
      found: `about: ${hasAbout ? "✓" : "✗"}, contact: ${hasContact ? "✓" : "✗"}`,
      expected: "Lien `/a-propos` ET `/contact` depuis la page",
    });
  }

  // Note les types JSON-LD vus pour info
  void finalUrl;
  void bodyText;
  void types;

  return results;
}
