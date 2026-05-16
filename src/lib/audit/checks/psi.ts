import { env } from "@/lib/env";
import type { CheckResult } from "../types";

// Google PageSpeed Insights — vraies données Core Web Vitals (LCP, CLS,
// INP). Endpoint public, fonctionne sans clé jusqu'à 25K req/jour
// partagés par IP. Avec clé : illimité.
//
// Timeout 12s pour ne pas bloquer l'audit ; en cas de timeout / 5xx,
// on retourne un warning "psi_unavailable" et le reste de l'audit
// reste valide.

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const PSI_TIMEOUT_MS = 12_000;

interface PsiAudit {
  numericValue?: number;
  score?: number | null;
}

interface PsiResponse {
  lighthouseResult?: {
    categories?: {
      performance?: { score?: number };
      accessibility?: { score?: number };
      "best-practices"?: { score?: number };
      seo?: { score?: number };
    };
    audits?: {
      "largest-contentful-paint"?: PsiAudit;
      "cumulative-layout-shift"?: PsiAudit;
      "interaction-to-next-paint"?: PsiAudit;
      "first-contentful-paint"?: PsiAudit;
    };
  };
}

export interface PsiResult {
  ok: boolean;
  /** 0-100 performance score from Lighthouse */
  performanceScore: number | null;
  checks: CheckResult[];
}

export async function runPsiChecks(url: string): Promise<PsiResult> {
  const params = new URLSearchParams({
    url,
    strategy: "mobile",
  });
  params.append("category", "performance");
  params.append("category", "seo");
  params.append("category", "accessibility");
  params.append("category", "best-practices");
  if (env.GOOGLE_PAGESPEED_API_KEY) params.append("key", env.GOOGLE_PAGESPEED_API_KEY);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PSI_TIMEOUT_MS);
  let data: PsiResponse | null = null;
  try {
    const resp = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!resp.ok) throw new Error(`PSI HTTP ${resp.status}`);
    data = (await resp.json()) as PsiResponse;
  } catch {
    return {
      ok: false,
      performanceScore: null,
      checks: [
        {
          id: "psi.unavailable",
          category: "perf",
          severity: "info",
          status: "warn",
          label: "Données Core Web Vitals indisponibles (PageSpeed Insights timeout)",
        },
      ],
    };
  } finally {
    clearTimeout(timeout);
  }

  const lighthouse = data.lighthouseResult;
  const audits = lighthouse?.audits ?? {};
  const checks: CheckResult[] = [];

  const performanceScore = lighthouse?.categories?.performance?.score ?? null;

  // LCP
  const lcpMs = audits["largest-contentful-paint"]?.numericValue;
  if (typeof lcpMs === "number") {
    const lcpS = lcpMs / 1000;
    checks.push(buildLcpCheck(lcpS));
  }

  // CLS
  const cls = audits["cumulative-layout-shift"]?.numericValue;
  if (typeof cls === "number") {
    checks.push(buildClsCheck(cls));
  }

  // INP
  const inpMs = audits["interaction-to-next-paint"]?.numericValue;
  if (typeof inpMs === "number") {
    checks.push(buildInpCheck(inpMs));
  }

  // FCP
  const fcpMs = audits["first-contentful-paint"]?.numericValue;
  if (typeof fcpMs === "number") {
    const fcpS = fcpMs / 1000;
    checks.push({
      id: fcpS < 1.8 ? "psi.fcp-good" : "psi.fcp-slow",
      category: "perf",
      severity: fcpS < 1.8 ? "info" : "warning",
      status: fcpS < 1.8 ? "pass" : "warn",
      label: `First Contentful Paint : ${fcpS.toFixed(2)} s`,
      found: `${fcpS.toFixed(2)} s`,
      expected: "< 1,8 s",
    });
  }

  return {
    ok: true,
    performanceScore: typeof performanceScore === "number" ? performanceScore * 100 : null,
    checks,
  };
}

function buildLcpCheck(lcpS: number): CheckResult {
  if (lcpS < 2.5) {
    return {
      id: "psi.lcp-good",
      category: "perf",
      severity: "info",
      status: "pass",
      label: `LCP rapide : ${lcpS.toFixed(2)} s`,
      found: `${lcpS.toFixed(2)} s`,
      expected: "< 2,5 s",
    };
  }
  if (lcpS < 4) {
    return {
      id: "psi.lcp-needs-improvement",
      category: "perf",
      severity: "warning",
      status: "warn",
      label: `LCP à améliorer : ${lcpS.toFixed(2)} s`,
      found: `${lcpS.toFixed(2)} s`,
      expected: "< 2,5 s",
    };
  }
  return {
    id: "psi.lcp-poor",
    category: "perf",
    severity: "critical",
    status: "fail",
    label: `LCP lent : ${lcpS.toFixed(2)} s`,
    found: `${lcpS.toFixed(2)} s`,
    expected: "< 2,5 s",
  };
}

function buildClsCheck(cls: number): CheckResult {
  if (cls < 0.1) {
    return {
      id: "psi.cls-good",
      category: "perf",
      severity: "info",
      status: "pass",
      label: `CLS stable : ${cls.toFixed(3)}`,
      found: cls.toFixed(3),
      expected: "< 0,1",
    };
  }
  if (cls < 0.25) {
    return {
      id: "psi.cls-needs-improvement",
      category: "perf",
      severity: "warning",
      status: "warn",
      label: `CLS à améliorer : ${cls.toFixed(3)}`,
      found: cls.toFixed(3),
      expected: "< 0,1",
    };
  }
  return {
    id: "psi.cls-poor",
    category: "perf",
    severity: "critical",
    status: "fail",
    label: `CLS instable : ${cls.toFixed(3)}`,
    found: cls.toFixed(3),
    expected: "< 0,1",
  };
}

function buildInpCheck(inpMs: number): CheckResult {
  if (inpMs < 200) {
    return {
      id: "psi.inp-good",
      category: "perf",
      severity: "info",
      status: "pass",
      label: `INP rapide : ${Math.round(inpMs)} ms`,
      found: `${Math.round(inpMs)} ms`,
      expected: "< 200 ms",
    };
  }
  if (inpMs < 500) {
    return {
      id: "psi.inp-needs-improvement",
      category: "perf",
      severity: "warning",
      status: "warn",
      label: `INP à améliorer : ${Math.round(inpMs)} ms`,
      found: `${Math.round(inpMs)} ms`,
      expected: "< 200 ms",
    };
  }
  return {
    id: "psi.inp-poor",
    category: "perf",
    severity: "critical",
    status: "fail",
    label: `INP lent : ${Math.round(inpMs)} ms`,
    found: `${Math.round(inpMs)} ms`,
    expected: "< 200 ms",
  };
}
