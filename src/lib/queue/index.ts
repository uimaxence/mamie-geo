import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { queueJobs } from "@/db/schema";
import { buildIdempotencyKey, type Job } from "./types";

// Postgres-based queue — V0 implémentation minimale.
// cf. geo-project/03-architecture-technique.md § Queue
//
// 4 fonctions seulement : enqueue / claim / complete / fail.
// L'idempotence est garantie par la colonne idempotency_key UNIQUE et
// le ON CONFLICT DO NOTHING. Le claim utilise FOR UPDATE SKIP LOCKED
// pour permettre plusieurs workers en parallèle sans race condition.

export interface EnqueueOptions {
  scheduledAt?: Date;
  maxAttempts?: number;
}

/**
 * Enqueue un job. Retourne `null` si un job avec la même idempotency_key
 * existait déjà en BDD (no-op silencieux).
 */
export async function enqueue(job: Job, options: EnqueueOptions = {}): Promise<string | null> {
  const idempotencyKey = buildIdempotencyKey(job);
  const result = await db
    .insert(queueJobs)
    .values({
      kind: job.kind,
      payload: job.payload,
      idempotencyKey,
      scheduledAt: options.scheduledAt ?? new Date(),
      maxAttempts: options.maxAttempts ?? 3,
    })
    .onConflictDoNothing({ target: queueJobs.idempotencyKey })
    .returning({ id: queueJobs.id });

  return result[0]?.id ?? null;
}

export interface ClaimedJob {
  id: string;
  kind: string;
  payload: unknown;
  attempts: number;
  maxAttempts: number;
}

/**
 * Claim jusqu'à `batchSize` jobs prêts à être exécutés. Atomique via
 * FOR UPDATE SKIP LOCKED — plusieurs workers en parallèle ne se marchent
 * pas dessus.
 */
export async function claim(batchSize: number): Promise<ClaimedJob[]> {
  const rows = await db.execute<{
    id: string;
    kind: string;
    payload: unknown;
    attempts: number;
    max_attempts: number;
  }>(sql`
    UPDATE queue_jobs
    SET status = 'claimed',
        claimed_at = NOW(),
        attempts = attempts + 1
    WHERE id IN (
      SELECT id FROM queue_jobs
      WHERE status = 'pending' AND scheduled_at <= NOW()
      ORDER BY scheduled_at
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, kind, payload, attempts, max_attempts
  `);

  return rows.rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    payload: r.payload,
    attempts: r.attempts,
    maxAttempts: r.max_attempts,
  }));
}

export async function complete(jobId: string): Promise<void> {
  await db.execute(sql`
    UPDATE queue_jobs
    SET status = 'done', finished_at = NOW()
    WHERE id = ${jobId}
  `);
}

/**
 * Marque le job comme `failed` (transient) ou `dead` selon le nombre de
 * tentatives. Retry auto à h+1 sur première échec, h+6 ensuite.
 */
export async function fail(jobId: string, errorMessage: string): Promise<void> {
  await db.execute(sql`
    UPDATE queue_jobs
    SET
      last_error = ${errorMessage},
      status = CASE
        WHEN attempts >= max_attempts THEN 'dead'
        ELSE 'pending'
      END,
      claimed_at = NULL,
      scheduled_at = CASE
        WHEN attempts = 1 THEN NOW() + INTERVAL '1 hour'
        ELSE NOW() + INTERVAL '6 hours'
      END,
      finished_at = CASE
        WHEN attempts >= max_attempts THEN NOW()
        ELSE finished_at
      END
    WHERE id = ${jobId}
  `);
}
