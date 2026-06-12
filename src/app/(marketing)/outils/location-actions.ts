"use server";

import { logCronEvent } from "@/lib/cron-logger";
import { detectSiteLocation } from "@/lib/location-detect";
import { normalizeDomainInput } from "@/lib/utils";

// Action partagée par les forms des scans (comparateurs + express) :
// quand le prospect renseigne son site, on tente de détecter sa ville
// depuis la home (JSON-LD / footer) pour pré-remplir « Ta ville » —
// toujours modifiable, jamais imposé (cf. src/lib/location-detect.ts).

const DOMAIN_REGEX = /^[a-z0-9.-]+\.[a-z]{2,}$/i;

export async function detectLocationAction(rawDomain: string): Promise<string | null> {
  const domain = normalizeDomainInput(typeof rawDomain === "string" ? rawDomain : "");
  if (!domain || !DOMAIN_REGEX.test(domain)) return null;

  const city = await detectSiteLocation(domain);
  if (city) {
    logCronEvent({ event: "tool_location_detected", domain, city });
  }
  return city;
}
