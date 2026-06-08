"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { brands, workspaceMembers, workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import { logCronEvent } from "@/lib/cron-logger";
import { getPostHogClient, shutdownPostHog } from "@/lib/posthog-server";
import { quotasFor, type PlanKey } from "@/lib/plans/quotas";

// Server action : crée une nouvelle marque (brand) dans le workspace de
// l'utilisateur authentifié, depuis le BrandSwitcher de la top bar app.
//
// Garde-fous :
//   - auth obligatoire
//   - rôle owner/admin requis (membre simple ne peut pas créer)
//   - quota brands par plan (cf. quotas.ts) : Solo/Starter 1, Pro 3,
//     Agency 10, Enterprise illimité. Si quota atteint → quota_reached.
//   - validation domaine (regex stricte), nom (1-80), aliases (max 10).

const inputSchema = z.object({
  name: z.string().min(1, "Nom de marque requis").max(80),
  domain: z
    .string()
    .min(3, "Domaine requis")
    .max(120)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Format domaine invalide (ex: monsite.fr)"),
  aliases: z.array(z.string().min(1).max(80)).max(10).optional(),
});

export type CreateBrandInput = z.infer<typeof inputSchema>;

export type CreateBrandResult =
  | { ok: true; brandId: string }
  | {
      ok: false;
      error: "quota_reached";
      resource: "brands";
      current: number;
      max: number;
      plan: PlanKey;
    }
  | { ok: false; error: "validation"; message: string }
  | { ok: false; error: "unauthorized" }
  | { ok: false; error: "no_workspace" };

export async function createBrand(input: CreateBrandInput): Promise<CreateBrandResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "unauthorized" };

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "validation",
      message: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }
  const data = parsed.data;

  // Récupère le workspace + rôle. V0 = 1 workspace par user, on prend
  // le plus ancien si plusieurs (V1 pre-empt).
  const membership = await db
    .select({
      workspaceId: workspaceMembers.workspaceId,
      role: workspaceMembers.role,
      plan: workspaces.plan,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, session.user.id))
    .orderBy(workspaceMembers.createdAt)
    .limit(1);

  const ws = membership[0];
  if (!ws) return { ok: false, error: "no_workspace" };

  // Seuls owner et admin peuvent ajouter une brand (pas member/viewer)
  if (ws.role !== "owner" && ws.role !== "admin") {
    return { ok: false, error: "unauthorized" };
  }

  // Quota check : count brands existantes du workspace
  const current = await db.$count(brands, eq(brands.workspaceId, ws.workspaceId));
  const max = quotasFor(ws.plan).brands;

  if (current >= max) {
    return {
      ok: false,
      error: "quota_reached",
      resource: "brands",
      current,
      max,
      plan: ws.plan as PlanKey,
    };
  }

  // Insert
  const brandId = randomUUID();
  await db.insert(brands).values({
    id: brandId,
    workspaceId: ws.workspaceId,
    name: data.name,
    domain: data.domain,
    aliases: data.aliases ?? [],
  });

  logCronEvent({
    event: "brand_created",
    workspaceId: ws.workspaceId,
    userId: session.user.id,
    brandId,
    domain: data.domain,
  });

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: session.user.id,
    event: "brand_created",
    properties: { plan: ws.plan },
  });
  await shutdownPostHog();

  // Invalide tout le segment /app pour que la sidebar et les data
  // dépendantes (loadSidebarData, dashboard, prompts, etc.) rechargent.
  revalidatePath("/app", "layout");

  return { ok: true, brandId };
}

// ──────────────────────────────────────────────────────────────────────
// Pause/Resume — V0+ (cf. doc 02 § V0+). Met à jour brands.pausedAt.
// Une brand en pause est skip dans le scheduler (cf. scheduler/schedule-
// runs.ts). Aucune donnée n'est supprimée, le setup reste intact.
// ──────────────────────────────────────────────────────────────────────

export type PauseBrandResult =
  | { ok: true; pausedAt: Date | null }
  | { ok: false; error: "unauthorized" | "brand_not_found" };

async function assertBrandWritableByUser(
  brandId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: "unauthorized" | "brand_not_found" }> {
  const rows = await db
    .select({
      brandId: brands.id,
      role: workspaceMembers.role,
    })
    .from(brands)
    .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, brands.workspaceId))
    .where(and(eq(brands.id, brandId), eq(workspaceMembers.userId, userId)))
    .limit(1);

  const row = rows[0];
  if (!row) return { ok: false, error: "brand_not_found" };
  if (row.role !== "owner" && row.role !== "admin") {
    return { ok: false, error: "unauthorized" };
  }
  return { ok: true };
}

export async function pauseBrand(brandId: string): Promise<PauseBrandResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "unauthorized" };

  const check = await assertBrandWritableByUser(brandId, session.user.id);
  if (!check.ok) return check;

  const now = new Date();
  await db.update(brands).set({ pausedAt: now }).where(eq(brands.id, brandId));

  logCronEvent({
    event: "brand_paused",
    brandId,
    userId: session.user.id,
  });

  const posthog = getPostHogClient();
  posthog.capture({ distinctId: session.user.id, event: "brand_paused" });
  await shutdownPostHog();

  revalidatePath("/app", "layout");
  return { ok: true, pausedAt: now };
}

export async function resumeBrand(brandId: string): Promise<PauseBrandResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "unauthorized" };

  const check = await assertBrandWritableByUser(brandId, session.user.id);
  if (!check.ok) return check;

  await db.update(brands).set({ pausedAt: null }).where(eq(brands.id, brandId));

  logCronEvent({
    event: "brand_resumed",
    brandId,
    userId: session.user.id,
  });

  const posthog = getPostHogClient();
  posthog.capture({ distinctId: session.user.id, event: "brand_resumed" });
  await shutdownPostHog();

  revalidatePath("/app", "layout");
  return { ok: true, pausedAt: null };
}
