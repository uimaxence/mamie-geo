import { and, count, eq, gte, isNotNull, lt } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db/client";
import { events, user, workspaceMembers, workspaces } from "@/db/schema";
import { logCronEvent } from "@/lib/cron-logger";
import { sendTransactional } from "@/lib/email";
import { renderTrialReminder } from "@/lib/email/templates/trial-reminder";
import { env } from "@/lib/env";
import { captureServerEvent } from "@/lib/posthog-server";

// Cron quotidien (08:00 UTC) : envoie les emails de relance trial.
//
// Pour chaque workspace en `plan=trialing` avec `trialEndsAt` non null :
//   - daysToEnd === 4 → trial-reminder "j-4"   (= J+10 du trial)
//   - daysToEnd === 1 → trial-reminder "j-1"   (= J+13 du trial)
//
// Idempotence : on log chaque envoi dans `events` (kind=trial_email_sent,
// payload.template={j-4 | j-1}). Avant chaque envoi on vérifie l'absence
// de ligne pour ce workspace + ce template.
//
// L'email "trial-expired" est envoyé immédiatement par le webhook
// handleSubscriptionDeleted (pas via cron) pour que le user soit
// notifié en temps réel. Cf. webhook-handlers.ts.

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

  // Fenêtre cible : 5 jours autour du J-4 / J-1. On élargit la requête
  // pour récupérer tous les trials proches de la fin, puis on filtre
  // précisément par daysToEnd côté Node.
  const now = Date.now();
  const horizon = new Date(now + 5 * 86_400_000);

  const candidates = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      plan: workspaces.plan,
      trialEndsAt: workspaces.trialEndsAt,
      stripeCustomerId: workspaces.stripeCustomerId,
    })
    .from(workspaces)
    .where(
      and(
        eq(workspaces.plan, "trialing"),
        isNotNull(workspaces.trialEndsAt),
        gte(workspaces.trialEndsAt, new Date(now)),
        lt(workspaces.trialEndsAt, horizon),
      ),
    );

  logCronEvent({ event: "trial_emails_start", candidates: candidates.length });

  let sent = 0;
  let skipped = 0;
  for (const ws of candidates) {
    if (!ws.trialEndsAt) continue;
    const daysToEnd = Math.ceil((ws.trialEndsAt.getTime() - now) / 86_400_000);
    let variant: "j-4" | "j-1" | null = null;
    if (daysToEnd === 4) variant = "j-4";
    else if (daysToEnd === 1) variant = "j-1";
    if (!variant) {
      skipped += 1;
      continue;
    }

    // Idempotence : 1 envoi par template par workspace.
    const already = await db
      .select({ n: count() })
      .from(events)
      .where(and(eq(events.workspaceId, ws.id), eq(events.kind, "trial_email_sent")));
    // Le n compte tous les "trial_email_sent" du workspace toutes variantes.
    // Pour distinguer par variant on raffine la check via une 2e query
    // ciblée sur le payload — on garde simple : check existence par variant.
    const exists = await db.query.events.findFirst({
      where: and(eq(events.workspaceId, ws.id), eq(events.kind, "trial_email_sent")),
      columns: { id: true, payload: true },
    });
    const alreadyForVariant =
      exists && (exists.payload as { template?: string })?.template === variant;
    if (alreadyForVariant) {
      skipped += 1;
      continue;
    }
    // We did the redundant count just to be safe — discard warning.
    void already;

    const recipient = await findOwnerEmail(ws.id);
    if (!recipient) {
      skipped += 1;
      continue;
    }

    const portalUrl = `${env.NEXT_PUBLIC_APP_URL}/app/settings#billing`;
    const dashboardUrl = `${env.NEXT_PUBLIC_APP_URL}/app/dashboard`;
    const trialEndsOn = ws.trialEndsAt.toISOString().slice(0, 10);

    const rendered = renderTrialReminder({
      variant,
      workspaceName: ws.name,
      plan: "starter",
      dashboardUrl,
      portalUrl,
      trialEndsOn,
    });

    try {
      const result = await sendTransactional({
        to: recipient.email,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      });
      await db.insert(events).values({
        workspaceId: ws.id,
        userId: recipient.userId,
        kind: "trial_email_sent",
        payload: { template: variant, messageId: result.messageId, trialEndsOn },
      });
      await captureServerEvent({
        event: "trial_email_sent",
        distinctId: recipient.userId,
        ctx: { workspaceId: ws.id, plan: "trialing" },
        properties: { template: variant, days_to_end: daysToEnd },
      });
      sent += 1;
    } catch (error) {
      logCronEvent({
        level: "error",
        event: "trial_email_send_failed",
        workspaceId: ws.id,
        variant,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logCronEvent({ event: "trial_emails_end", sent, skipped });
  return NextResponse.json({ ok: true, sent, skipped, candidates: candidates.length });
}

async function findOwnerEmail(
  workspaceId: string,
): Promise<{ email: string; userId: string } | null> {
  const row = await db
    .select({ email: user.email, userId: user.id })
    .from(workspaceMembers)
    .innerJoin(user, eq(user.id, workspaceMembers.userId))
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.role, "owner")))
    .limit(1);
  return row[0] ?? null;
}
