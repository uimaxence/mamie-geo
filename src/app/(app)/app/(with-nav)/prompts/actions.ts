"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { competitors, prompts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import { captureServerEvent } from "@/lib/posthog-server";
import { quotaReached, quotasFor, type PlanKey, type QuotaReachedError } from "@/lib/plans/quotas";
import {
  createPromptSchema,
  updatePromptSchema,
  type CreatePromptInput,
  type UpdatePromptInput,
} from "@/lib/prompts/schemas";

// Server actions /app/prompts, CRUD + toggle + suggestion IA.
// Toutes les actions vérifient l'auth user → workspace → brand pour
// éviter les data leaks. Les actions write `revalidatePath` pour que
// la liste se rafraîchisse sans hard reload.

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

/** Vérifie qu'un prompt appartient bien à la brand de l'utilisateur. */
async function assertPromptOwnership(promptId: string, brandId: string): Promise<boolean> {
  const row = await db
    .select({ id: prompts.id })
    .from(prompts)
    .where(and(eq(prompts.id, promptId), eq(prompts.brandId, brandId)))
    .limit(1);
  return row.length > 0;
}

// ─── CREATE ──────────────────────────────────────────────────────────

export async function createPrompt(raw: CreatePromptInput): Promise<ActionResult> {
  const { ctx, userId } = await getCtxOrThrow();

  const parsed = createPromptSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const quotas = quotasFor(ctx.workspace.plan);

  // Garde-fou anti-abus : un plan en cadence weekly (Solo) ne peut pas
  // override un prompt en daily, sinon il consommerait 7× ses runs
  // facturés. inherit/weekly/monthly restent autorisés.
  if (quotas.cadence === "weekly" && parsed.data.cadence === "daily") {
    return {
      ok: false,
      error:
        "Le plan Solo (cadence hebdomadaire) ne permet pas de cadence prompt quotidienne. Passe en Starter ou choisis hebdo/mensuel.",
    };
  }

  if (quotas.prompts !== Number.POSITIVE_INFINITY) {
    const count = await db.$count(prompts, eq(prompts.brandId, ctx.brand.id));
    if (count >= quotas.prompts) {
      await captureServerEvent({
        event: "quota_limit_hit",
        distinctId: userId,
        ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
        properties: { quota_type: "prompts", current: count, limit: quotas.prompts },
      });
      return quotaReached("prompts", count, quotas.prompts, ctx.workspace.plan as PlanKey);
    }
  }

  const result = await db
    .insert(prompts)
    .values({
      brandId: ctx.brand.id,
      text: parsed.data.text,
      category: parsed.data.category ?? null,
      language: "fr",
      isActive: parsed.data.isActive,
      cadence: parsed.data.cadence,
    })
    .returning({ id: prompts.id });

  const newId = result[0]?.id;
  await captureServerEvent({
    event: "prompt_created",
    distinctId: userId,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
    properties: {
      prompt_id: newId,
      category: parsed.data.category ?? null,
      cadence: parsed.data.cadence,
      is_active: parsed.data.isActive,
    },
  });

  revalidatePath("/app/prompts");
  return { ok: true, id: newId };
}

// ─── UPDATE ──────────────────────────────────────────────────────────

export async function updatePrompt(
  promptId: string,
  raw: UpdatePromptInput,
): Promise<ActionResult> {
  const { ctx, userId } = await getCtxOrThrow();

  if (!(await assertPromptOwnership(promptId, ctx.brand.id))) {
    return { ok: false, error: "Prompt introuvable" };
  }

  const parsed = updatePromptSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  // Même garde-fou que createPrompt : empêche un plan weekly de
  // s'auto-promote vers daily via update.
  if (parsed.data.cadence === "daily") {
    const planCadence = quotasFor(ctx.workspace.plan).cadence;
    if (planCadence === "weekly") {
      return {
        ok: false,
        error:
          "Le plan Solo (cadence hebdomadaire) ne permet pas de cadence prompt quotidienne. Passe en Starter ou choisis hebdo/mensuel.",
      };
    }
  }

  const updates: Partial<typeof prompts.$inferInsert> = {};
  if (parsed.data.text !== undefined) updates.text = parsed.data.text;
  if (parsed.data.category !== undefined) updates.category = parsed.data.category;
  if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;
  if (parsed.data.cadence !== undefined) updates.cadence = parsed.data.cadence;

  if (Object.keys(updates).length === 0) {
    return { ok: true, id: promptId };
  }

  await db.update(prompts).set(updates).where(eq(prompts.id, promptId));

  await captureServerEvent({
    event: "prompt_updated",
    distinctId: userId,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
    properties: { prompt_id: promptId, fields_updated: Object.keys(updates) },
  });

  revalidatePath("/app/prompts");
  revalidatePath(`/app/prompts/${promptId}`);
  return { ok: true, id: promptId };
}

// ─── TOGGLE ACTIVE ───────────────────────────────────────────────────

export async function togglePromptActive(promptId: string): Promise<ActionResult> {
  const { ctx, userId } = await getCtxOrThrow();

  if (!(await assertPromptOwnership(promptId, ctx.brand.id))) {
    return { ok: false, error: "Prompt introuvable" };
  }

  const row = await db
    .select({ isActive: prompts.isActive })
    .from(prompts)
    .where(eq(prompts.id, promptId))
    .limit(1);
  if (!row[0]) return { ok: false, error: "Prompt introuvable" };

  const newState = !row[0].isActive;
  await db.update(prompts).set({ isActive: newState }).where(eq(prompts.id, promptId));

  await captureServerEvent({
    event: "prompt_active_toggled",
    distinctId: userId,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
    properties: { prompt_id: promptId, new_state: newState },
  });

  revalidatePath("/app/prompts");
  revalidatePath(`/app/prompts/${promptId}`);
  return { ok: true, id: promptId };
}

// ─── DELETE ──────────────────────────────────────────────────────────

export async function deletePrompt(promptId: string): Promise<ActionResult> {
  const { ctx, userId } = await getCtxOrThrow();

  if (!(await assertPromptOwnership(promptId, ctx.brand.id))) {
    return { ok: false, error: "Prompt introuvable" };
  }

  // ON DELETE CASCADE supprime aussi les runs liés (cf. schema runs FK)
  await db.delete(prompts).where(eq(prompts.id, promptId));

  await captureServerEvent({
    event: "prompt_deleted",
    distinctId: userId,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
    properties: { prompt_id: promptId },
  });

  revalidatePath("/app/prompts");
  return { ok: true };
}

// ─── SUGGEST (réutilise helper Haiku 4.5) ────────────────────────────

import { suggestPrompts as suggestFromOnboarding } from "@/app/(app)/app/onboarding/actions";

export interface SuggestResult {
  ok: true;
  prompts: string[];
  costUsd: number;
}

/**
 * Wrapper sur `suggestPrompts()` de l'onboarding : régénère des prompts
 * depuis le profil complet (brand + aliases + concurrents + prompts
 * existants). Haiku reçoit la liste des prompts déjà trackés et est
 * instruit de proposer des questions COMPLÉMENTAIRES (pas de doublons,
 * pas de paraphrases). Les suggestions ne sont PAS insérées en BDD,
 * l'UI affiche et l'user valide via createPrompt / bulkAddPrompts.
 */
export async function suggestMorePrompts(): Promise<SuggestResult | ActionError> {
  const { ctx, userId } = await getCtxOrThrow();

  const competitorsRows = await db
    .select({ name: competitors.name })
    .from(competitors)
    .where(eq(competitors.brandId, ctx.brand.id));
  const competitorNames = competitorsRows.map((c) => c.name);

  const existingRows = await db
    .select({ text: prompts.text })
    .from(prompts)
    .where(eq(prompts.brandId, ctx.brand.id));
  const existingTexts = existingRows.map((r) => r.text);

  await captureServerEvent({
    event: "prompt_ai_suggestions_requested",
    distinctId: userId,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
    properties: {
      source: "prompts_page",
      existing_count: existingTexts.length,
      competitors_count: competitorNames.length,
    },
  });

  try {
    const result = await suggestFromOnboarding({
      brandName: ctx.brand.name,
      domain: ctx.brand.domain,
      competitors: competitorNames,
      aliases: ctx.brand.aliases,
      existingPrompts: existingTexts,
    });
    return { ok: true, prompts: result.prompts, costUsd: result.costUsd };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Suggestion indisponible";
    return { ok: false, error: message };
  }
}

// ─── BULK ADD ────────────────────────────────────────────────────────

export interface BulkAddResult {
  ok: true;
  added: number;
  skipped: number;
  /** Si quota atteint en cours de boucle, on stoppe et on remonte le détail. */
  quotaReached?: QuotaReachedError;
}

/**
 * Insère plusieurs prompts d'un coup. Utilisé par le bouton « Tout ajouter »
 * après une suggestion IA. Respecte le quota du plan : s'arrête dès qu'il
 * est atteint et renvoie le compteur (added + skipped). Pas de transaction
 * — chaque INSERT est isolé pour qu'une violation de constraint n'annule
 * pas les précédentes.
 */
export async function bulkAddPrompts(texts: string[]): Promise<BulkAddResult | ActionError> {
  const { ctx } = await getCtxOrThrow();

  const cleaned = Array.from(
    new Set(texts.map((t) => t.trim()).filter((t) => t.length >= 5 && t.length <= 500)),
  );
  if (cleaned.length === 0) {
    return { ok: false, error: "Aucun prompt valide à ajouter" };
  }

  const quotas = quotasFor(ctx.workspace.plan);
  const current = await db.$count(prompts, eq(prompts.brandId, ctx.brand.id));
  const remaining =
    quotas.prompts === Number.POSITIVE_INFINITY
      ? Number.POSITIVE_INFINITY
      : Math.max(0, quotas.prompts - current);

  let added = 0;
  let skipped = 0;
  let quotaError: QuotaReachedError | undefined;

  for (const text of cleaned) {
    if (added >= remaining) {
      quotaError = quotaReached(
        "prompts",
        current + added,
        quotas.prompts,
        ctx.workspace.plan as PlanKey,
      );
      skipped = cleaned.length - added;
      break;
    }
    await db.insert(prompts).values({
      brandId: ctx.brand.id,
      text,
      language: "fr",
      isActive: true,
    });
    added += 1;
  }

  revalidatePath("/app/prompts");
  return { ok: true, added, skipped, quotaReached: quotaError };
}
