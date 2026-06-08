"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { competitors, prompts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import { getPostHogClient, shutdownPostHog } from "@/lib/posthog-server";
import { quotaReached, quotasFor, type PlanKey } from "@/lib/plans/quotas";
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
  const { ctx } = await getCtxOrThrow();

  const parsed = createPromptSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  // Quota check
  const quotas = quotasFor(ctx.workspace.plan);
  if (quotas.prompts !== Number.POSITIVE_INFINITY) {
    const count = await db.$count(prompts, eq(prompts.brandId, ctx.brand.id));
    if (count >= quotas.prompts) {
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
    })
    .returning({ id: prompts.id });

  revalidatePath("/app/prompts");
  return { ok: true, id: result[0]?.id };
}

// ─── UPDATE ──────────────────────────────────────────────────────────

export async function updatePrompt(
  promptId: string,
  raw: UpdatePromptInput,
): Promise<ActionResult> {
  const { ctx } = await getCtxOrThrow();

  if (!(await assertPromptOwnership(promptId, ctx.brand.id))) {
    return { ok: false, error: "Prompt introuvable" };
  }

  const parsed = updatePromptSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const updates: Partial<typeof prompts.$inferInsert> = {};
  if (parsed.data.text !== undefined) updates.text = parsed.data.text;
  if (parsed.data.category !== undefined) updates.category = parsed.data.category;
  if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;

  if (Object.keys(updates).length === 0) {
    return { ok: true, id: promptId };
  }

  await db.update(prompts).set(updates).where(eq(prompts.id, promptId));

  revalidatePath("/app/prompts");
  revalidatePath(`/app/prompts/${promptId}`);
  return { ok: true, id: promptId };
}

// ─── TOGGLE ACTIVE ───────────────────────────────────────────────────

export async function togglePromptActive(promptId: string): Promise<ActionResult> {
  const { ctx } = await getCtxOrThrow();

  if (!(await assertPromptOwnership(promptId, ctx.brand.id))) {
    return { ok: false, error: "Prompt introuvable" };
  }

  const row = await db
    .select({ isActive: prompts.isActive })
    .from(prompts)
    .where(eq(prompts.id, promptId))
    .limit(1);
  if (!row[0]) return { ok: false, error: "Prompt introuvable" };

  await db.update(prompts).set({ isActive: !row[0].isActive }).where(eq(prompts.id, promptId));

  revalidatePath("/app/prompts");
  revalidatePath(`/app/prompts/${promptId}`);
  return { ok: true, id: promptId };
}

// ─── DELETE ──────────────────────────────────────────────────────────

export async function deletePrompt(promptId: string): Promise<ActionResult> {
  const { ctx } = await getCtxOrThrow();

  if (!(await assertPromptOwnership(promptId, ctx.brand.id))) {
    return { ok: false, error: "Prompt introuvable" };
  }

  // ON DELETE CASCADE supprime aussi les runs liés (cf. schema runs FK)
  await db.delete(prompts).where(eq(prompts.id, promptId));

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
 * Wrapper sur `suggestPrompts()` de l'onboarding : charge le contexte
 * workspace/brand de l'user et passe à l'helper Haiku. Les prompts
 * suggérés ne sont PAS insérés en BDD, l'UI doit afficher les
 * suggestions et l'user valide avant insertion (via createPrompt).
 */
export async function suggestMorePrompts(): Promise<SuggestResult | ActionError> {
  const { ctx, userId } = await getCtxOrThrow();

  // Charge les concurrents pour informer la suggestion LLM
  const competitorsRows = await db
    .select({ name: competitors.name })
    .from(competitors)
    .where(eq(competitors.brandId, ctx.brand.id));
  const competitorNames = competitorsRows.map((c) => c.name);

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "prompt_ai_suggestions_requested",
    properties: { source: "prompts_page" },
  });
  await shutdownPostHog();

  try {
    const result = await suggestFromOnboarding({
      brandName: ctx.brand.name,
      domain: ctx.brand.domain,
      competitors: competitorNames,
    });
    return { ok: true, prompts: result.prompts, costUsd: result.costUsd };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Suggestion indisponible";
    return { ok: false, error: message };
  }
}
