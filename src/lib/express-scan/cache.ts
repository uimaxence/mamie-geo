import { normalizeText } from "@/lib/comparators/sectors";
import type { ExpressScanReport } from "./types";

// Rate-limit + cache du scan express, même pattern in-memory que
// src/lib/comparators/cache.ts. Cap global 50 scans/jour (spec doc 06
// § n°1bis) : ~0,002 €/scan Mistral, le cap borne surtout l'abus.

const RATE_WINDOW_MS = 60 * 60 * 1000; // 1h
const RATE_LIMIT_PER_IP = 5;
const GLOBAL_DAILY_CAP = 50;
const RESULT_TTL_MS = 24 * 60 * 60 * 1000;

const rateMap = new Map<string, { count: number; resetAt: number }>();
let globalDay = "";
let globalCount = 0;

export function checkExpressRateLimit(ip: string): { allowed: boolean } {
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
  report: ExpressScanReport;
  expiresAt: number;
}

const resultCache = new Map<string, CacheEntry>();

export function expressCacheKey(brand: string, sector: string): string {
  return `${normalizeText(brand)}|${normalizeText(sector)}`;
}

export function getCachedExpressReport(key: string): ExpressScanReport | null {
  const entry = resultCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    resultCache.delete(key);
    return null;
  }
  return entry.report;
}

export function storeExpressReport(key: string, report: ExpressScanReport): void {
  resultCache.set(key, { report, expiresAt: Date.now() + RESULT_TTL_MS });
  if (resultCache.size % 20 === 0) {
    const now = Date.now();
    for (const [k, entry] of resultCache.entries()) {
      if (entry.expiresAt <= now) resultCache.delete(k);
    }
  }
}
