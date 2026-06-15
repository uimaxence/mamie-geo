import { and, eq, isNotNull, lt, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db/client";
import { subscriptionEvents, user, workspaceMembers, workspaces } from "@/db/schema";
import { logCronEvent } from "@/lib/cron-logger";
import { sendBetaExpiredEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { captureServerEvent } from "@/lib/posthog-server";

// Cron quotidien (04:00 UTC) : trouve les workspaces en accès gratuit
// "beta" dont la date d'expiration (compExpiresAt) est dépassée, les
// repasse en "expired" et envoie un email de conversion (essai 14 j).
//
// L'accès beta est octroyé manuellement par l'admin (/app/admin/beta) avec
// une durée (défaut 90 j). Aucun Stripe : sans ce cron, le workspace
// resterait beta indéfiniment.
//
// GET et POST exposés (Vercel Cron envoie GET, cf. doc 09 § 2026-05-13).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const now = new Date();
  const candidates = await db
    .select({
      workspaceId: workspaces.id,
      workspaceName: workspaces.name,
      email: sql<string | null>`min(${user.email})`,
    })
    .from(workspaces)
    .leftJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
    .leftJoin(user, eq(user.id, workspaceMembers.userId))
    .where(
      and(
        eq(workspaces.plan, "beta"),
        isNotNull(workspaces.compExpiresAt),
        lt(workspaces.compExpiresAt, now),
      ),
    )
    .groupBy(workspaces.id);

  logCronEvent({ event: "expire_comp_start", candidates: candidates.length });

  let expired = 0;
  let emailed = 0;
  for (const ws of candidates) {
    await db
      .update(workspaces)
      .set({ plan: "expired", compExpiresAt: null, updatedAt: now })
      .where(eq(workspaces.id, ws.workspaceId));

    await db.insert(subscriptionEvents).values({
      workspaceId: ws.workspaceId,
      eventType: "beta_expired",
      fromPlan: "beta",
      toPlan: "expired",
      metadata: sql`${JSON.stringify({ at: now.toISOString() })}::jsonb`,
    });

    await captureServerEvent({
      event: "beta_access_expired",
      distinctId: ws.email ?? ws.workspaceId,
      ctx: { workspaceId: ws.workspaceId, plan: "expired" },
    });
    expired += 1;

    if (ws.email) {
      try {
        await sendBetaExpiredEmail({ to: ws.email, workspaceName: ws.workspaceName });
        emailed += 1;
      } catch (error) {
        // Email best-effort : ne pas bloquer l'expiration des autres comptes.
        const message = error instanceof Error ? error.message : String(error);
        logCronEvent({ event: "expire_comp_email_failed", workspaceId: ws.workspaceId, message });
      }
    }
  }

  logCronEvent({ event: "expire_comp_end", expired, emailed });
  return NextResponse.json({ ok: true, expired, emailed, candidates: candidates.length });
}
