import type { AuditReport } from "./types";

// Cache mémoire token → report avec TTL 1h. Sert à conserver le
// rapport entre `runAudit()` (qui retourne le rapport teaser + token)
// et `sendFullReportEmail()` (qui re-fetche par token pour générer
// l'email complet). Stateless en V0 — pas de Redis/DB.
//
// Limite naturelle : un déploiement Vercel = process froid, donc le
// cache se vide à chaque cold start. Acceptable car l'email est
// typiquement envoyé dans la même minute que l'audit.

const TTL_MS = 60 * 60 * 1000; // 1h

interface CacheEntry {
  report: AuditReport;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function gc() {
  const now = Date.now();
  for (const [token, entry] of cache.entries()) {
    if (entry.expiresAt <= now) cache.delete(token);
  }
}

export function storeReport(token: string, report: AuditReport): void {
  cache.set(token, { report, expiresAt: Date.now() + TTL_MS });
  // GC opportuniste — un appel sur N pour ne pas ralentir le hot path.
  if (cache.size % 20 === 0) gc();
}

export function getReport(token: string): AuditReport | null {
  const entry = cache.get(token);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(token);
    return null;
  }
  return entry.report;
}

/** Rate limit basique IP → audits/h. In-memory, suffit V0. */
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1h
const RATE_LIMIT = 50;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}
