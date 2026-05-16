import type { CheerioAPI } from "cheerio";
import type { CheckResult } from "../types";

// Checks SEO classiques — title, description, headings, canonical, etc.
// Travaillent uniquement sur le DOM via cheerio. Pas de fetch externe.

export function runSeoChecks($: CheerioAPI, finalUrl: string): CheckResult[] {
  const results: CheckResult[] = [];

  // title
  const title = $("head > title").first().text().trim();
  if (!title) {
    results.push({
      id: "seo.title-missing",
      category: "seo",
      severity: "critical",
      status: "fail",
      label: "Titre de page manquant",
      found: null,
      expected: "Un `<title>` 30-60 caractères",
    });
  } else {
    results.push({
      id: "seo.title-present",
      category: "seo",
      severity: "info",
      status: "pass",
      label: "Titre de page présent",
      found: `${title.length} caractères`,
    });
    if (title.length < 30 || title.length > 60) {
      results.push({
        id: "seo.title-length",
        category: "seo",
        severity: "warning",
        status: "warn",
        label: "Longueur du titre hors range",
        found: `${title.length} caractères`,
        expected: "30-60 caractères",
      });
    }
  }

  // meta description
  const description = $('head > meta[name="description"]').attr("content")?.trim() ?? "";
  if (!description) {
    results.push({
      id: "seo.meta-description-missing",
      category: "seo",
      severity: "critical",
      status: "fail",
      label: "Meta description manquante",
      found: null,
      expected: "120-160 caractères",
    });
  } else {
    results.push({
      id: "seo.meta-description-present",
      category: "seo",
      severity: "info",
      status: "pass",
      label: "Meta description présente",
      found: `${description.length} caractères`,
    });
    if (description.length < 120 || description.length > 160) {
      results.push({
        id: "seo.meta-description-length",
        category: "seo",
        severity: "warning",
        status: "warn",
        label: "Longueur meta description hors range",
        found: `${description.length} caractères`,
        expected: "120-160 caractères",
      });
    }
  }

  // canonical
  const canonical = $('head > link[rel="canonical"]').attr("href")?.trim() ?? "";
  if (!canonical) {
    results.push({
      id: "seo.canonical-missing",
      category: "seo",
      severity: "warning",
      status: "fail",
      label: "URL canonique manquante",
      found: null,
      expected: 'Un `<link rel="canonical" href="...">`',
    });
  } else {
    results.push({
      id: "seo.canonical-present",
      category: "seo",
      severity: "info",
      status: "pass",
      label: "URL canonique posée",
      found: canonical,
    });
  }

  // h1
  const h1s = $("h1");
  if (h1s.length === 0) {
    results.push({
      id: "seo.h1-missing",
      category: "seo",
      severity: "critical",
      status: "fail",
      label: "Aucun `<h1>` trouvé",
      found: "0",
      expected: "1",
    });
  } else if (h1s.length > 1) {
    results.push({
      id: "seo.h1-multiple",
      category: "seo",
      severity: "warning",
      status: "warn",
      label: "Plusieurs `<h1>` trouvés",
      found: `${h1s.length}`,
      expected: "1",
    });
  } else {
    results.push({
      id: "seo.h1-present",
      category: "seo",
      severity: "info",
      status: "pass",
      label: "Un seul `<h1>` présent",
      found: $(h1s[0]!).text().trim().slice(0, 80),
    });
  }

  // Hiérarchie headings — vérifie qu'on ne saute pas un niveau.
  const headings = $("h1, h2, h3, h4, h5, h6")
    .toArray()
    .map((el) => Number(el.tagName.slice(1)));
  let hierarchyBroken = false;
  for (let i = 1; i < headings.length; i++) {
    const current = headings[i]!;
    const prev = headings[i - 1]!;
    if (current > prev + 1) {
      hierarchyBroken = true;
      break;
    }
  }
  if (hierarchyBroken) {
    results.push({
      id: "seo.heading-hierarchy",
      category: "seo",
      severity: "warning",
      status: "warn",
      label: "Hiérarchie de headings cassée (saut de niveau)",
      expected: "h1 → h2 → h3, pas de saut",
    });
  }

  // meta robots noindex
  const robots = $('head > meta[name="robots"]').attr("content")?.toLowerCase() ?? "";
  if (robots.includes("noindex")) {
    results.push({
      id: "seo.meta-robots-noindex",
      category: "seo",
      severity: "critical",
      status: "warn",
      label: "Page marquée `noindex` (intentionnel ?)",
      found: robots,
    });
  }

  // <html lang>
  const lang = $("html").attr("lang")?.trim() ?? "";
  if (!lang) {
    results.push({
      id: "seo.html-lang-missing",
      category: "seo",
      severity: "warning",
      status: "fail",
      label: "Attribut `lang` manquant sur `<html>`",
      found: null,
      expected: 'ex: `lang="fr"`',
    });
  } else {
    results.push({
      id: "seo.html-lang-present",
      category: "seo",
      severity: "info",
      status: "pass",
      label: "Attribut `lang` présent",
      found: lang,
    });
  }

  // Doublons title vs h1 (signal cannibalisation)
  if (title && h1s.length === 1) {
    const h1Text = $(h1s[0]!).text().trim();
    if (h1Text === title) {
      results.push({
        id: "seo.title-h1-identical",
        category: "seo",
        severity: "info",
        status: "info",
        label:
          "Title et H1 sont identiques (OK mais une différence apporte de la diversité sémantique)",
      });
    }
  }

  // Note la finalUrl pour info
  void finalUrl;

  return results;
}
