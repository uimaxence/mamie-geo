"use server";

import { headers } from "next/headers";
import { db } from "@/db/client";
import { comparatorScans } from "@/db/schema";
import { logCronEvent } from "@/lib/cron-logger";
import { sendComparatorLeadEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { createBraveSearch } from "@/lib/comparators/brave";
import { enrichChecks } from "@/lib/comparators/enrich";
import {
  checkScanRateLimit,
  getCachedScanReport,
  scanCacheKey,
  storeScanReport,
} from "@/lib/comparators/cache";
import { runComparatorScan } from "@/lib/comparators/scan";
import { comparatorScanSchema, type ComparatorScanInput } from "@/lib/comparators/schemas";
import { normalizeText } from "@/lib/comparators/sectors";
import type { ComparatorScanResult } from "@/lib/comparators/types";
import { captureServerEvent, identifyServerUser } from "@/lib/posthog-server";

// Server action /outils/comparateurs : email gate → rate limit → cache
// 24h par marque+secteur → scan Brave (~10 requêtes) → notification
// lead interne + events PostHog. Pas de stockage DB pour V0 (même
// approche que /outils/test-visibilite-ia).

async function getIp(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? "unknown";
}

export async function runComparatorScanAction(
  raw: ComparatorScanInput,
): Promise<ComparatorScanResult> {
  const parsed = comparatorScanSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid_input",
      message: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }
  const data = parsed.data;

  // Honeypot rempli = bot. Réponse générique, sans dépenser de requête.
  if (data.company) {
    return { ok: false, code: "invalid_input", message: "Données invalides" };
  }

  if (!env.BRAVE_SEARCH_API_KEY) {
    logCronEvent({ level: "warn", event: "comparator_scan_no_api_key" });
    return {
      ok: false,
      code: "search_unavailable",
      message: "L'outil est temporairement indisponible. Réessaye dans quelques heures.",
    };
  }

  const ip = await getIp();
  if (!checkScanRateLimit(ip).allowed) {
    logCronEvent({ level: "warn", event: "comparator_scan_rate_limited", ip });
    return {
      ok: false,
      code: "rate_limited",
      message: "Trop de scans récemment. Réessaye dans une heure.",
    };
  }

  const email = data.email.trim().toLowerCase();
  const brand = data.brandName.trim();
  const sector = data.sector.trim();
  const websiteDomain = data.websiteDomain?.trim().toLowerCase() || undefined;

  const cacheKey = scanCacheKey(brand, sector);
  const cached = getCachedScanReport(cacheKey);

  const startedAt = Date.now();
  let result: ComparatorScanResult;
  if (cached) {
    result = { ok: true, report: cached };
  } else {
    result = await runComparatorScan({
      brand,
      sector,
      websiteDomain,
      search: createBraveSearch({ apiKey: env.BRAVE_SEARCH_API_KEY }),
    });
    if (result.ok) {
      // Classification + conseils d'inclusion Mistral Small (~0,0001 $/scan),
      // best effort : sans clé ou sur erreur, les checks restent intacts.
      if (env.MISTRAL_API_KEY) {
        result.report.checks = await enrichChecks({
          apiKey: env.MISTRAL_API_KEY,
          sector,
          checks: result.report.checks,
        });
      }
      storeScanReport(cacheKey, result.report);
    }
  }
  const durationMs = Date.now() - startedAt;

  if (!result.ok) {
    logCronEvent({
      level: "warn",
      event: "comparator_scan_failed",
      code: result.code,
      sector,
      durationMs,
    });
    return result;
  }

  logCronEvent({
    event: "comparator_scan_completed",
    brand,
    sector,
    presentCount: result.report.presentCount,
    totalChecked: result.report.totalChecked,
    cacheHit: Boolean(cached),
    durationMs,
  });

  // Persistance : chaque soumission alimente la base niches × sites ×
  // présence (typologie de sources V1, intelligence par secteur) et
  // sert de log de leads. Un échec DB ne bloque pas le résultat.
  try {
    await db.insert(comparatorScans).values({
      email,
      brandName: brand,
      sector,
      sectorNormalized: normalizeText(sector),
      websiteDomain: websiteDomain ?? null,
      presentCount: result.report.presentCount,
      totalChecked: result.report.totalChecked,
      checks: result.report.checks,
    });
  } catch (error) {
    logCronEvent({
      level: "error",
      event: "comparator_scan_persist_failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Lead capturé : notification interne + identification PostHog. Un
  // échec d'email ne doit pas priver le prospect de son résultat.
  try {
    await sendComparatorLeadEmail({
      prospectEmail: email,
      brandName: brand,
      sector,
      presentCount: result.report.presentCount,
      totalChecked: result.report.totalChecked,
    });
  } catch (error) {
    logCronEvent({
      level: "error",
      event: "comparator_lead_email_failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  await identifyServerUser({ distinctId: email, properties: { email } });
  await captureServerEvent({
    event: "public_comparator_scan_completed",
    distinctId: email,
    properties: {
      brand,
      sector,
      present_count: result.report.presentCount,
      total_checked: result.report.totalChecked,
      score_pct: result.report.scorePct,
      cache_hit: Boolean(cached),
      duration_ms: durationMs,
    },
  });

  return result;
}
