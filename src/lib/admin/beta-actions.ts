"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { subscriptionEvents, user, workspaceMembers, workspaces } from "@/db/schema";
import { getAdminSessionEmail } from "@/lib/admin/guard";
import { captureServerEvent } from "@/lib/posthog-server";

// Octroi / révocation manuels de l'accès gratuit "beta" (beta-testeurs).
// Réservé aux admins (guard email). Aucun Stripe impliqué : on écrit
// directement le plan + une date d'expiration. Le cron expire-comp
// repassera le workspace en "expired" passé cette date.

const DEFAULT_BETA_DAYS = 90;
const MAX_BETA_DAYS = 365;

const grantSchema = z.object({
  email: z.string().email("Email invalide"),
  days: z.coerce.number().int().min(1).max(MAX_BETA_DAYS).default(DEFAULT_BETA_DAYS),
});

export type GrantBetaResult =
  | { ok: true; workspaceName: string; expiresAt: string }
  | { ok: false; error: "unauthorized" }
  | { ok: false; error: "validation"; message: string }
  | { ok: false; error: "user_not_found" }
  | { ok: false; error: "no_workspace" };

export async function grantBeta(input: { email: string; days?: number }): Promise<GrantBetaResult> {
  const admin = await getAdminSessionEmail();
  if (!admin) return { ok: false, error: "unauthorized" };

  const parsed = grantSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "validation",
      message: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }
  const email = parsed.data.email.trim().toLowerCase();
  const days = parsed.data.days;

  // Résolution email → user → premier workspace (membership la plus ancienne).
  const rows = await db
    .select({ workspaceId: workspaces.id, workspaceName: workspaces.name, plan: workspaces.plan })
    .from(user)
    .innerJoin(workspaceMembers, eq(workspaceMembers.userId, user.id))
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(sql`lower(${user.email})`, email))
    .orderBy(workspaceMembers.createdAt)
    .limit(1);

  const target = rows[0];
  if (!target) {
    // user inexistant OU sans workspace : on distingue pour le message admin.
    const exists = await db.$count(user, eq(sql`lower(${user.email})`, email));
    return { ok: false, error: exists > 0 ? "no_workspace" : "user_not_found" };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  await db
    .update(workspaces)
    .set({ plan: "beta", compExpiresAt: expiresAt, hardCapHitAt: null, updatedAt: now })
    .where(eq(workspaces.id, target.workspaceId));

  await db.insert(subscriptionEvents).values({
    workspaceId: target.workspaceId,
    eventType: "beta_granted",
    fromPlan: target.plan,
    toPlan: "beta",
    metadata: sql`${JSON.stringify({ email, days, grantedBy: admin, expiresAt: expiresAt.toISOString() })}::jsonb`,
  });

  await captureServerEvent({
    event: "beta_access_granted",
    distinctId: admin,
    properties: { target_email: email, days, expires_at: expiresAt.toISOString() },
    ctx: { workspaceId: target.workspaceId, plan: "beta" },
  });

  revalidatePath("/app/admin/beta");
  return { ok: true, workspaceName: target.workspaceName, expiresAt: expiresAt.toISOString() };
}

export type RevokeBetaResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" }
  | { ok: false; error: "not_beta" };

export async function revokeBeta(input: { workspaceId: string }): Promise<RevokeBetaResult> {
  const admin = await getAdminSessionEmail();
  if (!admin) return { ok: false, error: "unauthorized" };

  const ws = await db.query.workspaces.findFirst({
    where: and(eq(workspaces.id, input.workspaceId), eq(workspaces.plan, "beta")),
  });
  if (!ws) return { ok: false, error: "not_beta" };

  const now = new Date();
  await db
    .update(workspaces)
    .set({ plan: "expired", compExpiresAt: null, updatedAt: now })
    .where(eq(workspaces.id, ws.id));

  await db.insert(subscriptionEvents).values({
    workspaceId: ws.id,
    eventType: "beta_revoked",
    fromPlan: "beta",
    toPlan: "expired",
    metadata: sql`${JSON.stringify({ revokedBy: admin })}::jsonb`,
  });

  await captureServerEvent({
    event: "beta_access_revoked",
    distinctId: admin,
    properties: { reason: "manual" },
    ctx: { workspaceId: ws.id, plan: "expired" },
  });

  revalidatePath("/app/admin/beta");
  return { ok: true };
}
