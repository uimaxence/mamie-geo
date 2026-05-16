import type { CheckResult } from "../types";

// Checks sécurité — basés sur les response headers HTTP captés au fetch
// initial. Pas de cheerio nécessaire ici, juste un Record<string, string>
// normalisé en lowercase.

export function runSecurityChecks(
  headers: Record<string, string>,
  finalUrl: string,
): CheckResult[] {
  const results: CheckResult[] = [];

  // HTTPS — devrait toujours être OK car le Zod URL refuse HTTP
  if (!finalUrl.startsWith("https://")) {
    results.push({
      id: "security.https-missing",
      category: "security",
      severity: "critical",
      status: "fail",
      label: "Site servi en HTTP (non sécurisé)",
      found: finalUrl,
      expected: "https://",
    });
  } else {
    results.push({
      id: "security.https-present",
      category: "security",
      severity: "info",
      status: "pass",
      label: "Site servi en HTTPS",
    });
  }

  // HSTS
  if (!headers["strict-transport-security"]) {
    results.push({
      id: "security.hsts-missing",
      category: "security",
      severity: "warning",
      status: "fail",
      label: "Header HSTS manquant",
      expected: "Strict-Transport-Security: max-age=63072000; includeSubDomains",
    });
  } else {
    results.push({
      id: "security.hsts-present",
      category: "security",
      severity: "info",
      status: "pass",
      label: "HSTS configuré",
    });
  }

  // X-Content-Type-Options
  if (headers["x-content-type-options"] !== "nosniff") {
    results.push({
      id: "security.x-content-type-options-missing",
      category: "security",
      severity: "warning",
      status: "fail",
      label: "Header X-Content-Type-Options manquant",
      expected: "X-Content-Type-Options: nosniff",
    });
  } else {
    results.push({
      id: "security.x-content-type-options-present",
      category: "security",
      severity: "info",
      status: "pass",
      label: "X-Content-Type-Options posé",
    });
  }

  // Referrer-Policy
  if (!headers["referrer-policy"]) {
    results.push({
      id: "security.referrer-policy-missing",
      category: "security",
      severity: "warning",
      status: "fail",
      label: "Header Referrer-Policy manquant",
      expected: "Referrer-Policy: strict-origin-when-cross-origin",
    });
  } else {
    results.push({
      id: "security.referrer-policy-present",
      category: "security",
      severity: "info",
      status: "pass",
      label: "Referrer-Policy posée",
      found: headers["referrer-policy"],
    });
  }

  // CSP — bonus, pas critique
  if (headers["content-security-policy"]) {
    results.push({
      id: "security.csp-present",
      category: "security",
      severity: "info",
      status: "pass",
      label: "Content-Security-Policy posée",
    });
  }

  return results;
}
