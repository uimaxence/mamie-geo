import type { CheerioAPI } from "cheerio";
import type { CheckResult } from "../types";

// Mobile-friendly basique — uniquement la présence du viewport meta.
// Les vrais tests mobile (rendering effectif) sont couverts par PSI.

export function runMobileChecks($: CheerioAPI): CheckResult[] {
  const results: CheckResult[] = [];

  const viewport = $('head > meta[name="viewport"]').attr("content")?.trim();
  if (!viewport) {
    results.push({
      id: "mobile.viewport-missing",
      category: "mobile",
      severity: "critical",
      status: "fail",
      label: "Meta viewport manquant",
      expected: '`<meta name="viewport" content="width=device-width, initial-scale=1">`',
    });
  } else {
    results.push({
      id: "mobile.viewport-present",
      category: "mobile",
      severity: "info",
      status: "pass",
      label: "Meta viewport présent",
      found: viewport,
    });
    if (!/width\s*=\s*device-width/.test(viewport)) {
      results.push({
        id: "mobile.viewport-not-responsive",
        category: "mobile",
        severity: "warning",
        status: "warn",
        label: "Meta viewport ne contient pas `width=device-width`",
        found: viewport,
      });
    }
  }

  return results;
}
