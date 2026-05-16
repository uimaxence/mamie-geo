import type { CheerioAPI } from "cheerio";
import type { CheckResult } from "../types";

// Accessibilité basique côté HTML statique. Les vrais checks a11y
// (contraste, focus order) nécessitent un browser — couverts par PSI.

export function runA11yChecks($: CheerioAPI): CheckResult[] {
  const results: CheckResult[] = [];

  // Images sans alt
  const imgs = $("img");
  const imgsWithoutAlt = imgs.filter((_, el) => {
    const alt = $(el).attr("alt");
    return alt === undefined;
  });
  if (imgs.length > 0 && imgsWithoutAlt.length > 0) {
    results.push({
      id: "a11y.img-alt-missing",
      category: "a11y",
      severity: "warning",
      status: "fail",
      label: `${imgsWithoutAlt.length} image(s) sans attribut \`alt\``,
      found: `${imgsWithoutAlt.length}/${imgs.length}`,
      expected: "Toutes les images ont un `alt` (vide accepté pour décoratives)",
    });
  } else if (imgs.length > 0) {
    results.push({
      id: "a11y.img-alt-present",
      category: "a11y",
      severity: "info",
      status: "pass",
      label: `Toutes les images ont un \`alt\` (${imgs.length} images)`,
    });
  }

  // Skip-link (lien d'évitement vers le contenu principal)
  const firstLink = $("body a[href]").first();
  const firstHref = firstLink.attr("href") ?? "";
  const firstText = firstLink.text().toLowerCase();
  const hasSkipLink =
    firstHref.startsWith("#") &&
    (firstText.includes("contenu") ||
      firstText.includes("content") ||
      firstText.includes("aller") ||
      firstText.includes("skip"));

  if (hasSkipLink) {
    results.push({
      id: "a11y.skip-link-present",
      category: "a11y",
      severity: "info",
      status: "pass",
      label: "Skip-link détecté",
    });
  } else {
    results.push({
      id: "a11y.skip-link-missing",
      category: "a11y",
      severity: "info",
      status: "warn",
      label: "Skip-link absent (lien « Aller au contenu »)",
    });
  }

  return results;
}
