import { lt, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { aiPixelThrottle } from "@/db/schema";
import type { AiSource } from "./detect";

// Rate-limit / dédup de l'endpoint public d'ingestion, en Postgres (pas
// d'Upstash Redis en V1 — cf. doc 09 § 2026-06-15). Deux garde-fous :
//   1. cap GLOBAL quotidien : borne le coût d'un flood (writes Postgres).
//   2. cap par (IP hashée × source × jour) : empêche un visiteur/bot de
//      gonfler le compteur d'une marque (sert aussi de dédup grossier — un
//      rafraîchissement en boucle ne compte pas indéfiniment).
// La granularité jour suffit : on agrège de toute façon en quotidien.

const GLOBAL_DAILY_CAP = 100_000;
const PER_IP_SOURCE_DAILY_CAP = 30;
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
 * Retourne `true` si le hit doit être compté, `false` s'il est throttlé. Ne
 * lève jamais (un échec base → on laisse passer, l'endpoint reste best-effort).
 */
export async function allowHit(
  ipHash: string,
  source: AiSource,
  dateIso: string,
): Promise<boolean> {
  try {
    const globalCount = await bump(`global:${dateIso}`);
    if (globalCount % PURGE_EVERY === 0) {
      // Best-effort, non bloquant pour la réponse.
      void purgeStale();
    }
    if (globalCount > GLOBAL_DAILY_CAP) return false;

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
