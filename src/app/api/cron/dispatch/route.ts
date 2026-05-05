import { NextResponse, type NextRequest } from "next/server";
import { claim, complete, fail } from "@/lib/queue";
import { env } from "@/lib/env";

// Endpoint déclenché par Vercel Cron toutes les 5 minutes (cf. vercel.json).
// Il pull jusqu'à BATCH_SIZE jobs et les exécute. En Sprint 0 le dispatcher
// est volontairement squelettique : il claim, log, et marque done — les
// vrais workers (execute_prompt etc.) arrivent en Sprint 1.
// cf. geo-project/03-architecture-technique.md § Workers et orchestration

const BATCH_SIZE = 25;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Vercel Cron envoie Authorization: Bearer ${CRON_SECRET}
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const jobs = await claim(BATCH_SIZE);
  let processed = 0;
  const failures: { id: string; error: string }[] = [];

  for (const job of jobs) {
    try {
      // Sprint 0 : pas de worker réel encore. On consomme et on log.
      // Sprint 1 : router selon job.kind vers src/workers/{kind}.ts
      console.info(`[cron] claimed job ${job.id} kind=${job.kind}`);
      await complete(job.id);
      processed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await fail(job.id, message);
      failures.push({ id: job.id, error: message });
    }
  }

  return NextResponse.json({ claimed: jobs.length, processed, failures });
}

export async function GET() {
  // Healthcheck local — pas de secret requis.
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
