"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { logCronEvent } from "@/lib/cron-logger";
import { sendAuditRequestEmails, sendExpressScanLeadEmail } from "@/lib/email";
import { env } from "@/lib/env";
import {
  checkExpressRateLimit,
  expressCacheKey,
  getCachedExpressReport,
  storeExpressReport,
} from "@/lib/express-scan/cache";
import { extractBrandsCited } from "@/lib/express-scan/extract";
import { runExpressScan } from "@/lib/express-scan/run";
import { expressScanSchema, type ExpressScanInput } from "@/lib/express-scan/schemas";
import type { ExpressScanResult } from "@/lib/express-scan/types";
import { createMistralClient } from "@/lib/llm/mistral";
import { captureServerEvent, identifyServerUser } from "@/lib/posthog-server";
import { normalizeDomainInput } from "@/lib/utils";

// Server actions /outils/test-visibilite-ia (funnel refondu 2026-06-12,
// doc 09) :
//   - runExpressScanAction : scan express live — 3 prompts templates ×
//     Le Chat (mistral-small) → verdict immédiat, les 4 autres IA sont
//     verrouillées → CTA trial.
//   - submitAuditRequest : audit manuel 24 h, devenu l'upsell post-scan
//     (analyse humaine complète).

const auditRequestSchema = z.object({
  prospectEmail: z.string().email("Email invalide").max(120),
  brandName: z.string().min(1, "Nom de marque requis").max(80),
  domain: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Domaine invalide (ex: monsite.fr)"),
  notes: z.string().max(1000).optional(),
});

export type AuditRequestInput = z.infer<typeof auditRequestSchema>;

export type AuditRequestResult = { ok: true } | { ok: false; error: string };

// Ne jamais `throw` ici : en prod, Next.js masque le message des erreurs
// jetées par une server action derrière un « Server Components render »
// générique — le prospect ne voyait jamais la vraie raison (bug constaté
// 2026-06-12 avec une URL collée dans le champ domaine).
export async function submitAuditRequest(raw: AuditRequestInput): Promise<AuditRequestResult> {
  const parsed = auditRequestSchema.safeParse({
    ...raw,
    domain: normalizeDomainInput(typeof raw.domain === "string" ? raw.domain : ""),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }
  const data = parsed.data;

  try {
    await sendAuditRequestEmails({
      prospectEmail: data.prospectEmail.trim(),
      brandName: data.brandName.trim(),
      domain: data.domain,
      notes: data.notes?.trim() || undefined,
    });
  } catch {
    return { ok: false, error: "Erreur d'envoi, réessaye dans quelques minutes." };
  }

  return { ok: true };
}

async function getIp(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? "unknown";
}

const EXPRESS_MODEL = "mistral-small-latest";
const EXPRESS_MAX_TOKENS = 1024;

export async function runExpressScanAction(raw: ExpressScanInput): Promise<ExpressScanResult> {
  const parsed = expressScanSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid_input",
      message: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }
  const data = parsed.data;

  if (data.hpField) {
    logCronEvent({ level: "warn", event: "express_scan_honeypot" });
    return {
      ok: false,
      code: "invalid_input",
      message: "Impossible de valider le formulaire. Réessaye, ou écris-nous à hello@mamie-geo.fr.",
    };
  }

  if (!env.MISTRAL_API_KEY) {
    logCronEvent({ level: "warn", event: "express_scan_no_api_key" });
    return {
      ok: false,
      code: "llm_unavailable",
      message: "Le scan est temporairement indisponible. Réessaye dans quelques heures.",
    };
  }

  const ip = await getIp();
  if (!checkExpressRateLimit(ip).allowed) {
    logCronEvent({ level: "warn", event: "express_scan_rate_limited", ip });
    return {
      ok: false,
      code: "rate_limited",
      message: "Trop de scans récemment. Réessaye dans une heure.",
    };
  }

  const email = data.email.trim().toLowerCase();
  const brand = data.brandName.trim();
  const sector = data.sector.trim();
  const location = data.location?.trim() || undefined;
  const websiteDomain = data.websiteDomain || undefined;
  const apiKey = env.MISTRAL_API_KEY;

  const cacheKey = expressCacheKey(brand, sector, location);
  const cached = getCachedExpressReport(cacheKey);

  const startedAt = Date.now();
  let result: ExpressScanResult;
  if (cached) {
    result = { ok: true, report: cached };
  } else {
    const client = createMistralClient({
      apiKey,
      model: EXPRESS_MODEL,
      maxTokens: EXPRESS_MAX_TOKENS,
    });
    result = await runExpressScan({
      brand,
      sector,
      location,
      execute: (prompt) => client.execute({ prompt, language: "fr" }),
      extractBrands: (responseTexts) =>
        extractBrandsCited({ apiKey, targetBrand: brand, responseTexts }),
    });
    if (result.ok) storeExpressReport(cacheKey, result.report);
  }
  const durationMs = Date.now() - startedAt;

  if (!result.ok) {
    logCronEvent({
      level: "warn",
      event: "express_scan_failed",
      code: result.code,
      sector,
      durationMs,
    });
    return result;
  }

  logCronEvent({
    event: "express_scan_completed",
    brand,
    sector,
    citedCount: result.report.citedCount,
    cacheHit: Boolean(cached),
    durationMs,
  });

  try {
    await sendExpressScanLeadEmail({
      prospectEmail: email,
      brandName: brand,
      sector: location ? `${sector} (${location})` : sector,
      citedCount: result.report.citedCount,
      totalPrompts: result.report.totalPrompts,
      websiteDomain,
    });
  } catch (error) {
    logCronEvent({
      level: "error",
      event: "express_scan_lead_email_failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  await identifyServerUser({ distinctId: email, properties: { email } });
  await captureServerEvent({
    event: "public_express_scan_completed",
    distinctId: email,
    properties: {
      brand,
      sector,
      has_location: Boolean(location),
      cited_count: result.report.citedCount,
      total_prompts: result.report.totalPrompts,
      cache_hit: Boolean(cached),
      duration_ms: durationMs,
    },
  });

  return result;
}
