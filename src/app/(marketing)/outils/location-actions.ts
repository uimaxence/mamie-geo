"use server";

import { logCronEvent } from "@/lib/cron-logger";
import { env } from "@/lib/env";
import { detectSiteProfile, type SiteProfile } from "@/lib/site-profile";
import { normalizeDomainInput, pathFromDomainInput } from "@/lib/utils";

// Action partagée par les forms des scans (comparateurs + express) :
// le prospect ne saisit que site + email, on déduit marque + secteur +
// zone de chalandise depuis la home (cf. src/lib/site-profile.ts). Le
// path saisi est respecté ("taap.it/fr" → analyse de /fr, la home FR).
// Null → le form bascule en saisie manuelle, rien n'est jamais imposé.

const DOMAIN_REGEX = /^[a-z0-9.-]+\.[a-z]{2,}$/i;

export async function detectSiteProfileAction(rawDomain: string): Promise<SiteProfile | null> {
  const raw = typeof rawDomain === "string" ? rawDomain : "";
  const domain = normalizeDomainInput(raw);
  if (!domain || !DOMAIN_REGEX.test(domain)) return null;
  if (!env.MISTRAL_API_KEY) return null;

  const pagePath = pathFromDomainInput(raw) || undefined;
  const profile = await detectSiteProfile({ domain, pagePath, apiKey: env.MISTRAL_API_KEY });
  logCronEvent({
    event: profile ? "tool_profile_detected" : "tool_profile_detection_failed",
    domain,
    ...(pagePath ? { pagePath } : {}),
    ...(profile
      ? { sector: profile.sector, hasZone: Boolean(profile.zone), proposition: profile.proposition }
      : {}),
  });
  return profile;
}
