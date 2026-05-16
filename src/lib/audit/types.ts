// Types partagés du pipeline audit technique. Pas de dépendance ni DB ni
// LLM — purement métier. Les server actions et les composants UI les
// importent pour ne pas hardcoder de strings.

export type CheckCategory = "seo" | "geo" | "og" | "a11y" | "security" | "mobile" | "perf";

export type CheckSeverity = "critical" | "warning" | "info";

export type CheckStatus = "pass" | "fail" | "warn" | "info";

export interface CheckResult {
  /** Identifiant stable du check (ex: "seo.title", "geo.faq-jsonld"). Utilisé comme clé recommandations. */
  id: string;
  category: CheckCategory;
  severity: CheckSeverity;
  status: CheckStatus;
  label: string;
  /** Valeur trouvée sur la page (ex: "75 chars", "absent"), pour aider le user à comprendre. */
  found?: string | null;
  /** Valeur attendue (ex: "30-60 chars", "présent"). */
  expected?: string | null;
}

export interface SubScore {
  category: "seo" | "geo" | "a11y" | "perf";
  score: number; // 0-100
  passed: number;
  total: number;
}

export interface AuditReport {
  url: string;
  finalUrl: string; // après redirects
  fetchedAt: string; // ISO
  /** Score global pondéré 0-100. */
  scoreGlobal: number;
  subScores: SubScore[];
  checks: CheckResult[];
  /** Sample HTML size en KB pour le user. */
  htmlSizeKb: number;
  /** Status HTTP final. */
  httpStatus: number;
  /** Token utilisé pour récupérer le rapport via email gate (UUID). */
  token: string;
  /** True si PSI a échoué ; on le signale dans l'UI. */
  psiUnavailable: boolean;
  /** Warning si la page semble nécessiter JS pour rendre son contenu utile. */
  jsRendered: boolean;
}

export interface AuditError {
  ok: false;
  code:
    | "invalid_url"
    | "fetch_failed"
    | "fetch_timeout"
    | "non_html"
    | "rate_limited"
    | "not_found"
    | "internal";
  message: string;
}

export type AuditResultOk = { ok: true; report: AuditReport };
export type AuditResult = AuditResultOk | AuditError;
