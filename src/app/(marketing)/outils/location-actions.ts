"use server";

import { logCronEvent } from "@/lib/cron-logger";
import { env } from "@/lib/env";
import { detectSiteProfile, type SiteProfile } from "@/lib/site-profile";
import { normalizeDomainInput } from "@/lib/utils";

// Action partagée par les forms des scans (comparateurs + express) :
// le prospect ne saisit que site + email, on déduit marque + secteur +
// zone de chalandise depuis la home (cf. src/lib/site-profile.ts).
// Null → le form bascule en saisie manuelle, rien n'est jamais imposé.

const DOMAIN_REGEX = /^[a-z0-9.-]+\.[a-z]{2,}$/i;

export async function detectSiteProfileAction(rawDomain: string): Promise<SiteProfile | null> {
  const domain = normalizeDomainInput(typeof rawDomain === "string" ? rawDomain : "");
  if (!domain || !DOMAIN_REGEX.test(domain)) return null;
  if (!env.MISTRAL_API_KEY) return null;

  const profile = await detectSiteProfile({ domain, apiKey: env.MISTRAL_API_KEY });
  logCronEvent({
    event: profile ? "tool_profile_detected" : "tool_profile_detection_failed",
    domain,
    ...(profile ? { sector: profile.sector, hasZone: Boolean(profile.zone) } : {}),
  });
  return profile;
}
