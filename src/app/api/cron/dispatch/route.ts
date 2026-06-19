import { sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db/client";
import { queueJobs } from "@/db/schema";
import { logCronEvent } from "@/lib/cron-logger";
import { env } from "@/lib/env";
import { drainQueue } from "@/workers/drain-queue";

// Endpoint déclenché par Vercel Cron (cf. vercel.json). Depuis 2026-06-19
// le cron tourne toutes les heures en FILET DE SÉCURITÉ (retries + jobs
// non drainés) : le chemin chaud est le drain immédiat via `after()` après
// un enqueue (cf. src/workers/drain-queue.ts + doc 09 § 2026-06-19). Motif :
// un cron trop fréquent réveillait Neon en continu (pas de scale-to-zero)
// → compute facturé 24/7.
//
// Le handler draine la queue en boucle (time-budgeted) à chaque tick, pas
// un seul batch, pour vider ce qui s'est accumulé entre deux passages.
//
// IMPORTANT (cf. doc 09 § 2026-05-13) : Vercel Cron envoie des **GET**
// avec `Authorization: Bearer ${CRON_SECRET}`. GET et POST pointent sur le
// même handler.
//
// Modes :
//   - GET/POST authentifié → draine la queue
//   - GET/POST ?inspect=1 authentifié → état de la queue sans rien exécuter
//   - GET sans auth → healthcheck léger (sans body sensible)
//
// cf. geo-project/03-architecture-technique.md § Workers et orchestration

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Laisse au drain le temps de vider la queue accumulée en un seul tick.
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const inspectMode = url.searchParams.get("inspect") === "1";
  const authHeader = request.headers.get("authorization");
  const isAuthed = authHeader === `Bearer ${env.CRON_SECRET}`;

  // Sans auth : healthcheck non sensible (utile pour ping local rapide).
  if (!isAuthed) {
    return NextResponse.json({ ok: true, ts: new Date().toISOString(), mode: "healthcheck" });
  }

  if (inspectMode) {
    const inspect = await collectInspectData();
    logCronEvent({ event: "cron_dispatch_inspect", ...inspect.summary });
    return NextResponse.json(inspect);
  }

  return runDispatch(request);
}

async function runDispatch(request: NextRequest): Promise<NextResponse> {
  logCronEvent({
    event: "cron_dispatch_start",
    method: request.method,
    sourceIp: request.headers.get("x-forwarded-for") ?? null,
    userAgent: request.headers.get("user-agent") ?? null,
  });

  const summary = await drainQueue();
  logCronEvent({ event: "cron_dispatch_end", ...summary });

  return NextResponse.json(summary);
}

// ─────────────────────────────────────────────────────────────────────
// Inspect mode, retourne l'état de la queue sans exécuter de jobs.
// Utile en debug prod : `curl -H "Authorization: Bearer ..."
// "https://.../api/cron/dispatch?inspect=1"`.
// ─────────────────────────────────────────────────────────────────────

async function collectInspectData() {
  const statusRows = await db.execute<{
    status: string;
    n: string | number;
  }>(sql`
    SELECT status, COUNT(*) AS n FROM ${queueJobs} GROUP BY status ORDER BY status
  `);
  const recentRows = await db.execute<{
    id: string;
    kind: string;
    status: string;
    attempts: number;
    scheduled_at: Date;
    last_error: string | null;
  }>(sql`
    SELECT id, kind, status, attempts, scheduled_at, last_error
    FROM ${queueJobs}
    ORDER BY scheduled_at DESC
    LIMIT 10
  `);

  const countsByStatus: Record<string, number> = {};
  for (const row of statusRows.rows) {
    countsByStatus[row.status] = Number(row.n);
  }
  const recentJobs = recentRows.rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    status: r.status,
    attempts: r.attempts,
    scheduledAt:
      r.scheduled_at instanceof Date ? r.scheduled_at.toISOString() : String(r.scheduled_at),
    lastError: r.last_error,
  }));

  // Présence (booléen) des env vars critiques, jamais leur valeur.
  // Vérifie que la prod a bien les vars posées.
  const envPresence = {
    CRON_SECRET: Boolean(env.CRON_SECRET),
    DATABASE_URL: Boolean(env.DATABASE_URL),
    ANTHROPIC_API_KEY: Boolean(env.ANTHROPIC_API_KEY),
    BREVO_API_KEY: Boolean(env.BREVO_API_KEY),
    NEXT_PUBLIC_APP_URL: Boolean(env.NEXT_PUBLIC_APP_URL),
  };

  return {
    summary: {
      pending: countsByStatus.pending ?? 0,
      claimed: countsByStatus.claimed ?? 0,
      done: countsByStatus.done ?? 0,
      failed: countsByStatus.failed ?? 0,
      dead: countsByStatus.dead ?? 0,
    },
    countsByStatus,
    recentJobs,
    envPresence,
    serverTimeUtc: new Date().toISOString(),
  };
}
