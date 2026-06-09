"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { competitors } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import { captureServerEvent } from "@/lib/posthog-server";
import { quotaReached, quotasFor, type PlanKey } from "@/lib/plans/quotas";
import {
  createCompetitorSchema,
  updateCompetitorSchema,
  type CreateCompetitorInput,
  type UpdateCompetitorInput,
} from "@/lib/competitors/schemas";

// Server actions concurrents (CRUD), portées par la route /app/citations
// depuis 2026-06-08 (cf. doc 09 — fusion Sources + Concurrents en
// 1 entrée sidebar). Toutes les actions vérifient l'auth user → brand.
// Le quota concurrents est enforced par plan (5 Starter / 10 Pro /
// illimité Agency).

export interface ActionOk {
  ok: true;
  id?: string;
}
export interface ActionError {
  ok: false;
  error: string;
  details?: Record<string, unknown>;
}
export type ActionResult = ActionOk | ActionError;

async function getCtxOrThrow() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");
  const ctx = await getUserContext(session.user.id);
  if (!ctx) throw new Error("Aucun workspace");
  return { ctx, userId: session.user.id };
}

async function assertCompetitorOwnership(competitorId: string, brandId: string): Promise<boolean> {
  const row = await db
    .select({ id: competitors.id })
    .from(competitors)
    .where(and(eq(competitors.id, competitorId), eq(competitors.brandId, brandId)))
    .limit(1);
  return row.length > 0;
}

// ─── CREATE ──────────────────────────────────────────────────────────

export async function createCompetitor(raw: CreateCompetitorInput): Promise<ActionResult> {
  const { ctx, userId } = await getCtxOrThrow();

  const parsed = createCompetitorSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  // Quota check
  const quotas = quotasFor(ctx.workspace.plan);
  if (quotas.competitors !== Number.POSITIVE_INFINITY) {
    const count = await db.$count(competitors, eq(competitors.brandId, ctx.brand.id));
    if (count >= quotas.competitors) {
      await captureServerEvent({
        event: "quota_limit_hit",
        distinctId: userId,
        ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
        properties: { quota_type: "competitors", current: count, limit: quotas.competitors },
      });
      return quotaReached("competitors", count, quotas.competitors, ctx.workspace.plan as PlanKey);
    }
  }

  const result = await db
    .insert(competitors)
    .values({
      brandId: ctx.brand.id,
      name: parsed.data.name,
      domain: parsed.data.domain ?? null,
      aliases: parsed.data.aliases,
    })
    .returning({ id: competitors.id });

  const newId = result[0]?.id;
  await captureServerEvent({
    event: "competitor_created",
    distinctId: userId,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
    properties: {
      competitor_id: newId,
      has_domain: Boolean(parsed.data.domain),
      aliases_count: parsed.data.aliases.length,
    },
  });

  revalidatePath("/app/citations");
  return { ok: true, id: newId };
}

// ─── UPDATE ──────────────────────────────────────────────────────────

export async function updateCompetitor(
  competitorId: string,
  raw: UpdateCompetitorInput,
): Promise<ActionResult> {
  const { ctx, userId } = await getCtxOrThrow();

  if (!(await assertCompetitorOwnership(competitorId, ctx.brand.id))) {
    return { ok: false, error: "Concurrent introuvable" };
  }

  const parsed = updateCompetitorSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const updates: Partial<typeof competitors.$inferInsert> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.domain !== undefined) updates.domain = parsed.data.domain ?? null;
  if (parsed.data.aliases !== undefined) updates.aliases = parsed.data.aliases;

  if (Object.keys(updates).length === 0) {
    return { ok: true, id: competitorId };
  }

  await db.update(competitors).set(updates).where(eq(competitors.id, competitorId));

  await captureServerEvent({
    event: "competitor_updated",
    distinctId: userId,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
    properties: { competitor_id: competitorId, fields_updated: Object.keys(updates) },
  });

  revalidatePath("/app/citations");
  return { ok: true, id: competitorId };
}

// ─── DELETE ──────────────────────────────────────────────────────────

export async function deleteCompetitor(competitorId: string): Promise<ActionResult> {
  const { ctx, userId } = await getCtxOrThrow();

  if (!(await assertCompetitorOwnership(competitorId, ctx.brand.id))) {
    return { ok: false, error: "Concurrent introuvable" };
  }

  await db.delete(competitors).where(eq(competitors.id, competitorId));

  await captureServerEvent({
    event: "competitor_deleted",
    distinctId: userId,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
    properties: { competitor_id: competitorId },
  });

  revalidatePath("/app/citations");
  return { ok: true };
}
