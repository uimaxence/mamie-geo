import { normalizeText } from "./sectors";
import type { ComparatorScanReport } from "./types";

// Rate-limit + cache résultats du scan comparateurs. In-memory comme
// src/lib/audit/cache.ts : se vide à chaque cold start Vercel,
// acceptable V0 (le cap dur côté coût est le plan Brave lui-même).

const RATE_WINDOW_MS = 60 * 60 * 1000; // 1h
const RATE_LIMIT_PER_IP = 5;
const GLOBAL_DAILY_CAP = 150; // ~10 requêtes Brave/scan → borne le coût/jour
const RESULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h — un scan/marque/jour suffit

const rateMap = new Map<string, { count: number; resetAt: number }>();
let globalDay = "";
let globalCount = 0;

export function checkScanRateLimit(ip: string): { allowed: boolean } {
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  if (globalDay !== today) {
    globalDay = today;
    globalCount = 0;
  }
  if (globalCount >= GLOBAL_DAILY_CAP) return { allowed: false };

  const entry = rateMap.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    globalCount += 1;
    return { allowed: true };
  }
  if (entry.count >= RATE_LIMIT_PER_IP) return { allowed: false };
  entry.count += 1;
  globalCount += 1;
  return { allowed: true };
}

interface CacheEntry {
  report: ComparatorScanReport;
  expiresAt: number;
}

const resultCache = new Map<string, CacheEntry>();

export function scanCacheKey(brand: string, sector: string): string {
  return `${normalizeText(brand)}|${normalizeText(sector)}`;
}

export function getCachedScanReport(key: string): ComparatorScanReport | null {
  const entry = resultCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    resultCache.delete(key);
    return null;
  }
  return entry.report;
}

export function storeScanReport(key: string, report: ComparatorScanReport): void {
  resultCache.set(key, { report, expiresAt: Date.now() + RESULT_TTL_MS });
  if (resultCache.size % 20 === 0) {
    const now = Date.now();
    for (const [k, entry] of resultCache.entries()) {
      if (entry.expiresAt <= now) resultCache.delete(k);
    }
  }
}
