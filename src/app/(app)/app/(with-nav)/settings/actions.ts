"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { brands, workspaces } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import { captureServerEvent } from "@/lib/posthog-server";
import { generatePixelKey } from "@/lib/ai-traffic/keys";
import { quotasFor } from "@/lib/plans/quotas";
import {
  updateBrandAliasesSchema,
  updateWorkspaceNameSchema,
  type UpdateBrandAliasesInput,
  type UpdateWorkspaceNameInput,
} from "@/lib/settings/schemas";

// Server actions /app/settings, édition workspace.name + brand.aliases.
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
  return { ctx, userId: session.user.id };
}

// ─── UPDATE workspace.name ──────────────────────────────────────────

export async function updateWorkspaceName(raw: UpdateWorkspaceNameInput): Promise<ActionResult> {
  const { ctx, userId } = await getCtxOrThrow();

  const parsed = updateWorkspaceNameSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  await db
    .update(workspaces)
    .set({ name: parsed.data.name })
    .where(eq(workspaces.id, ctx.workspace.id));

  await captureServerEvent({
    event: "workspace_name_updated",
    distinctId: userId,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
  });

  // Le nom du workspace est affiché dans la sidebar (top), dans le
  // dashboard header, et dans Settings → revalider plusieurs paths.
  revalidatePath("/app/settings");
  revalidatePath("/app/dashboard");
  return { ok: true };
}

// ─── UPDATE brand.aliases ────────────────────────────────────────────

export async function updateBrandAliases(raw: UpdateBrandAliasesInput): Promise<ActionResult> {
  const { ctx, userId } = await getCtxOrThrow();

  const parsed = updateBrandAliasesSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const before = ctx.brand.aliases?.length ?? 0;
  await db.update(brands).set({ aliases: parsed.data.aliases }).where(eq(brands.id, ctx.brand.id));

  await captureServerEvent({
    event: "brand_aliases_updated",
    distinctId: userId,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
    properties: {
      aliases_count_before: before,
      aliases_count_after: parsed.data.aliases.length,
    },
  });

  revalidatePath("/app/settings");
  // Les aliases changent la détection citation : revalider le dashboard.
  revalidatePath("/app/dashboard");
  return { ok: true };
}

// ─── ACTIVATE pixel trafic IA ────────────────────────────────────────
// Génère (idempotemment) la clé publique du pixel pour la brand. Réservé
// aux plans avec aiTrafficTracking (dès Solo). cf. doc 09 § 2026-06-15.

export interface ActivatePixelOk {
  ok: true;
  key: string;
}
export type ActivatePixelResult = ActivatePixelOk | ActionError;

export async function activateAiPixel(): Promise<ActivatePixelResult> {
  const { ctx, userId } = await getCtxOrThrow();

  if (!quotasFor(ctx.workspace.plan).aiTrafficTracking) {
    return { ok: false, error: "Le tracking de trafic IA est inclus dès le plan Solo." };
  }

  const [row] = await db
    .select({ aiPixelKey: brands.aiPixelKey })
    .from(brands)
    .where(eq(brands.id, ctx.brand.id))
    .limit(1);

  // Idempotent : si la clé existe déjà, on la renvoie sans en regénérer une
  // (regénérer casserait le snippet déjà installé chez le client).
  if (row?.aiPixelKey) return { ok: true, key: row.aiPixelKey };

  const key = generatePixelKey();
  await db.update(brands).set({ aiPixelKey: key }).where(eq(brands.id, ctx.brand.id));

  await captureServerEvent({
    event: "ai_pixel_activated",
    distinctId: userId,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
  });

  revalidatePath("/app/traffic");
  revalidatePath("/app/dashboard");
  return { ok: true, key };
}

// ─── CHECK installation du pixel ─────────────────────────────────────
// Vérifie que le <script> du pixel est bien présent sur la home de la
// marque, SANS attendre une visite d'origine IA (le pixel ne beacone que
// sur les visites IA). On fetch la home et on cherche le path
// `/api/ai-pixel/{key}`. Best-effort : un site qui injecte le script via
// tag manager (pas dans le HTML servi) ressortira "missing" à tort —
// l'UI le dit. cf. doc 09 § 2026-06-15.

export type CheckPixelResult =
  | { ok: true; status: "installed" | "missing"; url: string }
  | { ok: false; error: string };

export async function checkPixelInstalled(): Promise<CheckPixelResult> {
  const { ctx } = await getCtxOrThrow();

  const [row] = await db
    .select({ aiPixelKey: brands.aiPixelKey, domain: brands.domain })
    .from(brands)
    .where(eq(brands.id, ctx.brand.id))
    .limit(1);

  if (!row?.aiPixelKey) return { ok: false, error: "Pixel non activé." };

  // Domaine nu attendu (cf. site-profile). On neutralise protocole/chemin et
  // on écarte localhost / IP privées (le check fetch un site public).
  const host = row.domain
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .trim()
    .toLowerCase();
  if (!host || !host.includes(".") || /^(localhost|127\.|10\.|192\.168\.|0\.)/.test(host)) {
    return { ok: false, error: "Domaine de la marque invalide pour la vérification." };
  }

  const url = `https://${host}/`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "MamieGEO-PixelCheck/1.0 (+https://mamie-geo.fr)" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    const html = (await res.text()).slice(0, 1_000_000); // cap 1 Mo
    const installed = html.includes(`/api/ai-pixel/${row.aiPixelKey}`);
    return { ok: true, status: installed ? "installed" : "missing", url };
  } catch {
    return { ok: false, error: `Impossible de joindre ${host} pour vérifier.` };
  }
}
