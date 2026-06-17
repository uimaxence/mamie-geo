"use server";

import { headers } from "next/headers";
import { logCronEvent } from "@/lib/cron-logger";
import { createBraveSearch } from "@/lib/comparators/brave";
import { sendLocalMapLeadEmail, sendScanConfirmationEmail } from "@/lib/email";
import { env } from "@/lib/env";
import {
  checkLocalMapRateLimit,
  getCachedLocalMapReport,
  localMapCacheKey,
  storeLocalMapReport,
} from "@/lib/local-map/cache";
import { buildCityCluster } from "@/lib/local-map/cities";
import { extractLocalBusinesses } from "@/lib/local-map/grounding";
import { runGroundedLocalScan } from "@/lib/local-map/scan";
import { localMapScanSchema, type LocalMapScanInput } from "@/lib/local-map/schemas";
import type { LocalMapResult } from "@/lib/local-map/types";
import { captureServerEvent, identifyServerUser } from "@/lib/posthog-server";

// Server action /outils/visibilite-locale — « Carte de visibilité IA
// locale » (concept GEO local, doc 09 § 2026-06-17). GROUNDED : pour chaque
// ville, une vraie recherche web (Brave) « meilleur {métier} à {ville} »,
// puis Mistral extrait les entreprises locales réellement nommées (vs
// l'invention « from knowledge »). Géocodage exact via adresse.data.gouv.
// Garde-fous identiques au scan express (honeypot, rate-limit, cache 24 h).

async function getIp(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? "unknown";
}

export async function runLocalMapScanAction(raw: LocalMapScanInput): Promise<LocalMapResult> {
  const parsed = localMapScanSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid_input",
      message: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }
  const data = parsed.data;

  if (data.hpField) {
    logCronEvent({ level: "warn", event: "local_map_honeypot" });
    return {
      ok: false,
      code: "invalid_input",
      message: "Impossible de valider le formulaire. Réessaye, ou écris-nous à hello@mamie-geo.fr.",
    };
  }

  // Le grounding réaliste nécessite Mistral (extraction) ET Brave (recherche web).
  if (!env.MISTRAL_API_KEY || !env.BRAVE_SEARCH_API_KEY) {
    logCronEvent({ level: "warn", event: "local_map_no_api_key" });
    return {
      ok: false,
      code: "llm_unavailable",
      message: "Le scan est temporairement indisponible. Réessaye dans quelques heures.",
    };
  }

  const ip = await getIp();
  if (!checkLocalMapRateLimit(ip).allowed) {
    logCronEvent({ level: "warn", event: "local_map_rate_limited", ip });
    return {
      ok: false,
      code: "rate_limited",
      message: "Trop de scans récemment. Réessaye dans une heure.",
    };
  }

  const email = data.email.trim().toLowerCase();
  const brand = data.brandName.trim();
  const sector = data.sector.trim();
  const mainCity = data.mainCity.trim();
  const websiteDomain = data.websiteDomain || undefined;
  const apiKey = env.MISTRAL_API_KEY;

  const cacheKey = localMapCacheKey(brand, sector, mainCity);
  const cached = getCachedLocalMapReport(cacheKey);

  const startedAt = Date.now();
  let result: LocalMapResult;
  if (cached) {
    result = { ok: true, report: cached };
  } else {
    // Cluster géocodé (ville + ~6 communes proches) via adresse.data.gouv.
    const cluster = await buildCityCluster({ apiKey, city: mainCity, sector, count: 6 });
    if (cluster.length === 0) {
      logCronEvent({ level: "warn", event: "local_map_geocode_failed", mainCity });
      return {
        ok: false,
        code: "no_location",
        message: `On n'a pas trouvé « ${mainCity} » comme commune française. Vérifie l'orthographe de ta ville.`,
      };
    }

    const search = createBraveSearch({ apiKey: env.BRAVE_SEARCH_API_KEY });
    result = await runGroundedLocalScan({
      brand,
      brandDomain: websiteDomain,
      sector,
      cities: cluster,
      search,
      ground: (perCity) =>
        extractLocalBusinesses({ apiKey, brand, brandDomain: websiteDomain, sector, perCity }),
      llmLabel: "résultats web · Le Chat + Brave",
    });
    if (result.ok) storeLocalMapReport(cacheKey, result.report);
  }
  const durationMs = Date.now() - startedAt;

  if (!result.ok) {
    logCronEvent({
      level: "warn",
      event: "local_map_failed",
      code: result.code,
      sector,
      durationMs,
    });
    return result;
  }

  const report = result.report;
  logCronEvent({
    event: "local_map_completed",
    brand,
    sector,
    mainCity,
    recommendedCount: report.recommendedCount,
    totalCities: report.totalCities,
    cacheHit: Boolean(cached),
    durationMs,
  });

  try {
    await sendLocalMapLeadEmail({
      prospectEmail: email,
      brandName: brand,
      sector,
      mainCity,
      recommendedCount: report.recommendedCount,
      totalCities: report.totalCities,
      cities: report.cities.map((c) => ({
        name: c.name,
        recommended: c.recommended,
        topRival: c.topRival,
      })),
      websiteDomain,
    });
  } catch (error) {
    logCronEvent({
      level: "error",
      event: "local_map_lead_email_failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    await sendScanConfirmationEmail({
      prospectEmail: email,
      brandName: brand,
      resultSummary: `recommandé par l'IA dans ${report.recommendedCount} ville${report.recommendedCount > 1 ? "s" : ""} sur ${report.totalCities} autour de ${mainCity}`,
      toolLabel: "carte de visibilité IA locale",
    });
  } catch (error) {
    logCronEvent({
      level: "error",
      event: "local_map_confirmation_email_failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  await identifyServerUser({ distinctId: email, properties: { email } });
  await captureServerEvent({
    event: "public_local_map_scan_completed",
    distinctId: email,
    properties: {
      brand,
      sector,
      main_city: mainCity,
      recommended_count: report.recommendedCount,
      total_cities: report.totalCities,
      cache_hit: Boolean(cached),
      duration_ms: durationMs,
    },
  });

  return result;
}
