import { and, eq, isNull, lt, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db/client";
import { subscriptionEvents, workspaces } from "@/db/schema";
import { logCronEvent } from "@/lib/cron-logger";
import { env } from "@/lib/env";

// Cron quotidien (03:00 UTC) — expiration des accès. Deux cas :
//
// 1. past_due dont la période de facturation est terminée depuis plus de
//    7 jours sans régularisation → `expired`. Stripe retry le paiement
//    automatiquement ; après plusieurs échecs on coupe l'accès après J+7.
//
// 2. Essai gratuit SANS carte (`trialing` + PAS d'abonnement Stripe) dont
//    `trialEndsAt` est dépassé → `expired` (2026-06-16, cf. doc 09 — essai
//    Solo 14 j par défaut). Les essais AVEC carte ont un
//    `stripeSubscriptionId` et sont pilotés par les webhooks Stripe
//    (trial_will_end / subscription.deleted) — on ne les touche PAS ici.
//
// GET et POST exposés (Vercel Cron envoie GET, cf. doc 09 § 2026-05-13).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAST_DUE_GRACE_DAYS = 7;

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

  const cutoff = new Date(Date.now() - PAST_DUE_GRACE_DAYS * 24 * 60 * 60 * 1000);
  const candidates = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.plan, "past_due"), lt(workspaces.currentPeriodEnd, cutoff)));

  logCronEvent({
    event: "expire_past_due_start",
    candidates: candidates.length,
    cutoff: cutoff.toISOString(),
  });

  let expired = 0;
  for (const ws of candidates) {
    await db
      .update(workspaces)
      .set({ plan: "expired", updatedAt: new Date() })
      .where(eq(workspaces.id, ws.id));

    await db.insert(subscriptionEvents).values({
      workspaceId: ws.id,
      eventType: "expired_after_past_due",
      fromPlan: "past_due",
      toPlan: "expired",
      metadata: sql`${JSON.stringify({ gracePeriodDays: PAST_DUE_GRACE_DAYS, cutoff: cutoff.toISOString() })}::jsonb`,
    });
    expired += 1;
  }

  // Cas 2 : essais gratuits sans carte arrivés à terme.
  const now = new Date();
  const trialCandidates = await db
    .select()
    .from(workspaces)
    .where(
      and(
        eq(workspaces.plan, "trialing"),
        isNull(workspaces.stripeSubscriptionId),
        lt(workspaces.trialEndsAt, now),
      ),
    );

  let trialsExpired = 0;
  for (const ws of trialCandidates) {
    await db
      .update(workspaces)
      .set({ plan: "expired", trialEndsAt: null, updatedAt: new Date() })
      .where(eq(workspaces.id, ws.id));

    await db.insert(subscriptionEvents).values({
      workspaceId: ws.id,
      eventType: "free_trial_expired",
      fromPlan: "trialing",
      toPlan: "expired",
      metadata: sql`${JSON.stringify({ trialEndsAt: ws.trialEndsAt?.toISOString() ?? null })}::jsonb`,
    });
    trialsExpired += 1;
  }

  logCronEvent({ event: "expire_past_due_end", expired, trialsExpired });
  return NextResponse.json({
    ok: true,
    expired,
    trialsExpired,
    candidates: candidates.length + trialCandidates.length,
  });
}
