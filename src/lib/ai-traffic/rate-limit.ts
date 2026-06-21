import { lt, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { aiPixelThrottle } from "@/db/schema";
import type { AiSource } from "./detect";

// Rate-limit / dédup de l'endpoint public d'ingestion, en Postgres (pas
// d'Upstash Redis en V1, cf. doc 09 § 2026-06-15). Garde-fous :
//   1. cap GLOBAL quotidien : borne le coût d'un flood (writes Postgres).
//   2. cap par (IP hashée × source × jour) pour le trafic IA : empêche un
//      visiteur/bot de gonfler le compteur d'une marque (dédup grossier).
//   3. cap par (IP hashée × "all" × jour) pour le trafic TOTAL : plus haut,
//      car un visiteur réel enchaîne beaucoup de pages dans la journée (le cap
//      IA à 30 bloquerait une navigation normale). cf. doc 09 § 2026-06-21.
// La granularité jour suffit : on agrège de toute façon en quotidien.

const GLOBAL_DAILY_CAP = 100_000;
const PER_IP_SOURCE_DAILY_CAP = 30;
const PER_IP_TOTAL_DAILY_CAP = 200;
// Purge opportuniste des fenêtres périmées, déclenchée tous les N hits globaux.
const PURGE_EVERY = 1_000;
const PURGE_OLDER_THAN_DAYS = 2;

/**
 * Incrémente le compteur d'un bucket et retourne le nouveau total. Upsert
 * atomique : `INSERT ... ON CONFLICT DO UPDATE SET count = count + 1`.
 */
async function bump(bucketKey: string): Promise<number> {
  const [row] = await db
    .insert(aiPixelThrottle)
    .values({ bucketKey, count: 1 })
    .onConflictDoUpdate({
      target: aiPixelThrottle.bucketKey,
      set: { count: sql`${aiPixelThrottle.count} + 1` },
    })
    .returning({ count: aiPixelThrottle.count });
  return row?.count ?? 1;
}

/**
 * Trafic TOTAL (chaque pageview). Bump le compteur GLOBAL (anti-flood, une
 * fois par collect) puis le cap par IP/jour plus large. `false` si throttlé.
 * Ne lève jamais (échec base → on laisse passer, endpoint best-effort).
 */
export async function allowSiteHit(ipHash: string, dateIso: string): Promise<boolean> {
  try {
    const globalCount = await bump(`global:${dateIso}`);
    if (globalCount % PURGE_EVERY === 0) {
      // Best-effort, non bloquant pour la réponse.
      void purgeStale();
    }
    if (globalCount > GLOBAL_DAILY_CAP) return false;

    const ipCount = await bump(`ip:${ipHash}:all:${dateIso}`);
    return ipCount <= PER_IP_TOTAL_DAILY_CAP;
  } catch {
    return true;
  }
}

/**
 * Trafic IA (sous-ensemble : pageview d'origine IA détectée). Cap par
 * (IP × source × jour), sans rebump le global (déjà fait par allowSiteHit
 * dans le même collect). `false` si throttlé.
 */
export async function allowAiHit(
  ipHash: string,
  source: AiSource,
  dateIso: string,
): Promise<boolean> {
  try {
    const ipCount = await bump(`ip:${ipHash}:${source}:${dateIso}`);
    return ipCount <= PER_IP_SOURCE_DAILY_CAP;
  } catch {
    return true;
  }
}

/** Supprime les buckets dont la fenêtre a plus de 2 jours. */
export async function purgeStale(): Promise<void> {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - PURGE_OLDER_THAN_DAYS);
  try {
    await db.delete(aiPixelThrottle).where(lt(aiPixelThrottle.windowStart, cutoff));
  } catch {
    // Purge best-effort.
  }
}
