import { and, eq, gte } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db/client";
import { brands, prompts, runs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";

// GET /api/runs/events, Server-Sent Events stream pour le dashboard.
// Push en temps réel les transitions de runs (pending → running →
// success/failed) pour afficher bannière "premier run en cours" +
// toasts à chaque finish.
//
// Limite Vercel functions = 60s (Pro). On ferme la connexion à 28s
// avec un event `close` ; le client `EventSource` se reconnecte
// automatiquement.
//
// Polling DB côté serveur toutes les 2s pour détecter les changements.
// V0 : suffit pour 5-30s par run. V1 pourrait utiliser PostgreSQL
// LISTEN/NOTIFY si Neon le supporte côté Edge.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Window pour considérer un run "récent" (24h). Au-delà on ignore.
const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;
const POLL_INTERVAL_MS = 2_000;
const CONNECTION_TIMEOUT_MS = 28_000;

interface RunSnapshot {
  id: string;
  status: string;
  llm: string;
  promptText: string;
  scheduledAt: string;
  executedAt: string | null;
}

async function fetchWorkspaceRuns(workspaceId: string): Promise<RunSnapshot[]> {
  const cutoff = new Date(Date.now() - RECENT_WINDOW_MS);
  const rows = await db
    .select({
      id: runs.id,
      status: runs.status,
      llm: runs.llm,
      promptText: prompts.text,
      scheduledAt: runs.scheduledAt,
      executedAt: runs.executedAt,
    })
    .from(runs)
    .innerJoin(prompts, eq(prompts.id, runs.promptId))
    .innerJoin(brands, eq(brands.id, prompts.brandId))
    .where(and(eq(brands.workspaceId, workspaceId), gte(runs.scheduledAt, cutoff)))
    .orderBy(runs.scheduledAt)
    .limit(50);

  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    llm: r.llm,
    promptText: r.promptText,
    scheduledAt: r.scheduledAt.toISOString(),
    executedAt: r.executedAt ? r.executedAt.toISOString() : null,
  }));
}

function diff(prev: RunSnapshot[], next: RunSnapshot[]): RunSnapshot[] {
  const prevMap = new Map(prev.map((r) => [r.id, r]));
  const changed: RunSnapshot[] = [];
  for (const r of next) {
    const before = prevMap.get(r.id);
    if (!before || before.status !== r.status) {
      changed.push(r);
    }
  }
  return changed;
}

export async function GET(_request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const ctx = await getUserContext(session.user.id);
  if (!ctx) {
    return NextResponse.json({ error: "Aucun workspace" }, { status: 404 });
  }
  const workspaceId = ctx.workspace.id;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Stream closed côté client, on ignore.
        }
      };

      // Snapshot initial.
      let last: RunSnapshot[] = [];
      try {
        last = await fetchWorkspaceRuns(workspaceId);
        send("snapshot", { runs: last });
      } catch (err) {
        send("error", { message: err instanceof Error ? err.message : "fetch_failed" });
      }

      let closed = false;

      const poll = async () => {
        if (closed) return;
        try {
          const current = await fetchWorkspaceRuns(workspaceId);
          const changes = diff(last, current);
          if (changes.length > 0) {
            send("update", { runs: changes });
            last = current;
          }
        } catch {
          // ignore poll error, on retry au prochain tick
        }
      };

      const interval = setInterval(poll, POLL_INTERVAL_MS);

      // Keep-alive comment pour éviter timeout proxy intermédiaire.
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keep-alive\n\n`));
        } catch {
          /* ignore */
        }
      }, 10_000);

      const timeout = setTimeout(() => {
        closed = true;
        clearInterval(interval);
        clearInterval(keepAlive);
        send("close", { reason: "timeout" });
        try {
          controller.close();
        } catch {
          /* ignore */
        }
      }, CONNECTION_TIMEOUT_MS);

      // Le client peut fermer prématurément.
      return () => {
        closed = true;
        clearInterval(interval);
        clearInterval(keepAlive);
        clearTimeout(timeout);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
