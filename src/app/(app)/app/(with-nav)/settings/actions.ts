"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { brands, workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import {
  updateBrandAliasesSchema,
  updateWorkspaceNameSchema,
  type UpdateBrandAliasesInput,
  type UpdateWorkspaceNameInput,
} from "@/lib/settings/schemas";

// Server actions /app/settings — édition workspace.name + brand.aliases.
// V0 : seuls les champs réversibles sont éditables. `brand.name` et
// `brand.domain` changent l'identité tracking → recréer le workspace.

export interface ActionOk {
  ok: true;
}
export interface ActionError {
  ok: false;
  error: string;
}
export type ActionResult = ActionOk | ActionError;

async function getCtxOrThrow() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");
  const ctx = await getUserContext(session.user.id);
  if (!ctx) throw new Error("Aucun workspace");
  return { ctx };
}

// ─── UPDATE workspace.name ──────────────────────────────────────────

export async function updateWorkspaceName(raw: UpdateWorkspaceNameInput): Promise<ActionResult> {
  const { ctx } = await getCtxOrThrow();

  const parsed = updateWorkspaceNameSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  await db
    .update(workspaces)
    .set({ name: parsed.data.name })
    .where(eq(workspaces.id, ctx.workspace.id));

  // Le nom du workspace est affiché dans la sidebar (top), dans le
  // dashboard header, et dans Settings → revalider plusieurs paths.
  revalidatePath("/app/settings");
  revalidatePath("/app/dashboard");
  return { ok: true };
}

// ─── UPDATE brand.aliases ────────────────────────────────────────────

export async function updateBrandAliases(raw: UpdateBrandAliasesInput): Promise<ActionResult> {
  const { ctx } = await getCtxOrThrow();

  const parsed = updateBrandAliasesSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  await db.update(brands).set({ aliases: parsed.data.aliases }).where(eq(brands.id, ctx.brand.id));

  revalidatePath("/app/settings");
  // Les aliases changent la détection citation : revalider le dashboard.
  revalidatePath("/app/dashboard");
  return { ok: true };
}
