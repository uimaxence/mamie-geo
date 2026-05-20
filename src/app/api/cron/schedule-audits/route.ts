import { inArray } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db/client";
import { brands, workspaces } from "@/db/schema";
import { incrementAuditCounter } from "@/lib/audits/counters";
import { logCronEvent } from "@/lib/cron-logger";
import { env } from "@/lib/env";
import { ACTIVE_PLANS } from "@/lib/plans/quotas";
import { enqueue } from "@/lib/queue";

// Cron hebdo (lundi 05:00 UTC, cf. vercel.json) : enqueue 1 audit
// `audit_workspace_url` par workspace actif sur le domaine de sa brand.
// notifyOnDrop=true → l'email d'alerte score-drop part automatiquement
// si l'audit révèle une baisse ≥ 10 pts vs la semaine précédente.
//
// Sprint 6 PR B (cf. doc 09 § 2026-05-17).
// Si le quota mensuel d'audits est atteint, on skippe le workspace.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handle(request);
}
export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ ok: true, ts: new Date().toISOString(), mode: "healthcheck" });
  }

  const startedAt = Date.now();
  logCronEvent({ event: "schedule_audits_start", method: request.method });

  // 1. Récupère tous les workspaces actifs + leur brand principale.
  const wsRows = await db
    .select({
      id: workspaces.id,
      plan: workspaces.plan,
      hardCapHitAt: workspaces.hardCapHitAt,
    })
    .from(workspaces)
    .where(inArray(workspaces.plan, ACTIVE_PLANS as readonly string[]));

  // On exclut les hard-capés (l'audit ne consomme pas de LLM mais on
  // applique la même logique de gel pour cohérence, review possible).
  const eligibleWs = wsRows.filter((w) => !w.hardCapHitAt);
  const wsIds = eligibleWs.map((w) => w.id);

  if (wsIds.length === 0) {
    const summary = { workspacesProcessed: 0, enqueued: 0, skipped: 0 };
    logCronEvent({
      event: "schedule_audits_end",
      ...summary,
      totalDurationMs: Date.now() - startedAt,
    });
    return NextResponse.json(summary);
  }

  const brandRows = await db
    .select({
      workspaceId: brands.workspaceId,
      id: brands.id,
      domain: brands.domain,
    })
    .from(brands)
    .where(inArray(brands.workspaceId, wsIds));

  // 1 brand par workspace (V0). On indexe par workspaceId.
  const brandByWs = new Map(brandRows.map((b) => [b.workspaceId, b]));

  let enqueued = 0;
  let skippedQuota = 0;
  let skippedNoBrand = 0;
  for (const ws of eligibleWs) {
    const brand = brandByWs.get(ws.id);
    if (!brand || !brand.domain) {
      skippedNoBrand += 1;
      continue;
    }

    // Vérifie quota avant d'enqueue (idempotence : si l'utilisateur a
    // déjà lancé X audits ce mois, on n'envoie l'hebdo automatique que
    // s'il lui reste du quota).
    const increment = await incrementAuditCounter({
      workspaceId: ws.id,
      plan: ws.plan,
      isCompetitor: false,
    });
    if (!increment.ok) {
      skippedQuota += 1;
      continue;
    }

    const url = brand.domain.startsWith("http") ? brand.domain : `https://${brand.domain}`;
    await enqueue({
      kind: "audit_workspace_url",
      payload: {
        workspaceId: ws.id,
        brandId: brand.id,
        url,
        isCompetitor: false,
        notifyOnDrop: true,
      },
    });
    enqueued += 1;
  }

  const summary = {
    workspacesProcessed: eligibleWs.length,
    enqueued,
    skippedQuota,
    skippedNoBrand,
  };
  logCronEvent({
    event: "schedule_audits_end",
    ...summary,
    totalDurationMs: Date.now() - startedAt,
  });
  return NextResponse.json(summary);
}
