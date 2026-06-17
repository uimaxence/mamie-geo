import { normalizeText } from "@/lib/comparators/sectors";
import type { LocalMapReport } from "./types";

// Rate-limit + cache de la carte locale, même pattern in-memory que le
// scan express. Cap global 50 scans/jour : ~0,002-0,005 €/scan (1 appel
// villes + N questions + 1 extraction), le cap borne surtout l'abus.

const RATE_WINDOW_MS = 60 * 60 * 1000; // 1h
const RATE_LIMIT_PER_IP = 5;
const GLOBAL_DAILY_CAP = 50;
const RESULT_TTL_MS = 24 * 60 * 60 * 1000;

const rateMap = new Map<string, { count: number; resetAt: number }>();
let globalDay = "";
let globalCount = 0;

export function checkLocalMapRateLimit(ip: string): { allowed: boolean } {
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
  report: LocalMapReport;
  expiresAt: number;
}

const resultCache = new Map<string, CacheEntry>();

export function localMapCacheKey(brand: string, sector: string, mainCity: string): string {
  return `${normalizeText(brand)}|${normalizeText(sector)}|${normalizeText(mainCity)}`;
}

export function getCachedLocalMapReport(key: string): LocalMapReport | null {
  const entry = resultCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    resultCache.delete(key);
    return null;
  }
  return entry.report;
}

export function storeLocalMapReport(key: string, report: LocalMapReport): void {
  resultCache.set(key, { report, expiresAt: Date.now() + RESULT_TTL_MS });
  if (resultCache.size % 20 === 0) {
    const now = Date.now();
    for (const [k, entry] of resultCache.entries()) {
      if (entry.expiresAt <= now) resultCache.delete(k);
    }
  }
}
