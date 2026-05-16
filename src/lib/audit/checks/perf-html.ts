import type { CheerioAPI } from "cheerio";
import type { CheckResult } from "../types";

// Signaux de performance lus depuis le HTML brut + headers. Pas les
// Core Web Vitals (qui viennent de PSI) mais des indicateurs précoces :
// taille HTML, nombre de scripts, compression.

const MAX_HTML_SIZE_KB = 150;
const MAX_SCRIPTS = 15;

export function runPerfHtmlChecks(
  $: CheerioAPI,
  htmlSizeKb: number,
  headers: Record<string, string>,
): CheckResult[] {
  const results: CheckResult[] = [];

  // Taille HTML
  if (htmlSizeKb > MAX_HTML_SIZE_KB) {
    results.push({
      id: "perf.html-size-large",
      category: "perf",
      severity: "warning",
      status: "warn",
      label: "HTML brut volumineux",
      found: `${htmlSizeKb.toFixed(1)} KB`,
      expected: `< ${MAX_HTML_SIZE_KB} KB`,
    });
  } else {
    results.push({
      id: "perf.html-size-ok",
      category: "perf",
      severity: "info",
      status: "pass",
      label: "Taille HTML raisonnable",
      found: `${htmlSizeKb.toFixed(1)} KB`,
    });
  }

  // Nombre de scripts externes
  const scripts = $("script[src]").length;
  if (scripts > MAX_SCRIPTS) {
    results.push({
      id: "perf.scripts-many",
      category: "perf",
      severity: "warning",
      status: "warn",
      label: "Beaucoup de scripts externes",
      found: `${scripts}`,
      expected: `< ${MAX_SCRIPTS}`,
    });
  } else {
    results.push({
      id: "perf.scripts-ok",
      category: "perf",
      severity: "info",
      status: "pass",
      label: "Nombre de scripts raisonnable",
      found: `${scripts}`,
    });
  }

  // Compression Content-Encoding
  const encoding = headers["content-encoding"]?.toLowerCase();
  if (encoding === "gzip" || encoding === "br" || encoding === "zstd") {
    results.push({
      id: "perf.compression-present",
      category: "perf",
      severity: "info",
      status: "pass",
      label: `Compression ${encoding} active`,
    });
  } else {
    results.push({
      id: "perf.compression-missing",
      category: "perf",
      severity: "warning",
      status: "fail",
      label: "Pas de compression HTML détectée",
      expected: "Content-Encoding: gzip ou br",
    });
  }

  return results;
}
