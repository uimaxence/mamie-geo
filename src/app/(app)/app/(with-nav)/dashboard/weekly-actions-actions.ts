"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { weeklyActionStates } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/auth/user-context";
import { captureServerEvent } from "@/lib/posthog-server";
import { WEEKLY_ACTIONS } from "@/lib/weekly-actions/catalog";
import { isoWeekFromDate } from "@/workers/send-weekly-email-payload";

// Server Action des boutons « Fait / Reporter / Ignorer » de la card Actions
// de la semaine. Persiste la décision utilisateur (et seulement elle) pour la
// marque + semaine ISO courante. Upsert idempotent : recliquer met à jour.

const SNOOZE_DAYS = 7;

export type WeeklyActionStatusInput = "done" | "dismissed" | "snoozed";

export interface SetWeeklyActionResult {
  ok: true;
}

export async function setWeeklyActionStatus(input: {
  slug: string;
  status: WeeklyActionStatusInput;
}): Promise<SetWeeklyActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");

  // Validation de frontière : slug du catalogue + statut connu.
  const def = WEEKLY_ACTIONS.find((a) => a.slug === input.slug);
  if (!def) throw new Error(`Action inconnue: slug=${input.slug}`);
  if (!["done", "dismissed", "snoozed"].includes(input.status)) {
    throw new Error(`Statut invalide: status=${input.status}`);
  }

  const ctx = await getUserContext(session.user.id);
  if (!ctx) throw new Error("Aucun workspace pour cet utilisateur");

  const now = new Date();
  const isoWeek = isoWeekFromDate(now);
  const snoozeUntil =
    input.status === "snoozed"
      ? new Date(now.getTime() + SNOOZE_DAYS * 24 * 60 * 60 * 1000)
      : null;
  // Un geste one-shot marqué « fait » disparaît pour toujours (scope permanent).
  const scope = def.permanentOnDone && input.status === "done" ? "permanent" : "week";

  await db
    .insert(weeklyActionStates)
    .values({
      brandId: ctx.brand.id,
      actionSlug: input.slug,
      isoWeek,
      status: input.status,
      snoozeUntil,
      scope,
    })
    .onConflictDoUpdate({
      target: [
        weeklyActionStates.brandId,
        weeklyActionStates.actionSlug,
        weeklyActionStates.isoWeek,
      ],
      set: { status: input.status, snoozeUntil, scope, updatedAt: now },
    });

  await captureServerEvent({
    event: "weekly_action_status_set",
    distinctId: session.user.id,
    ctx: { workspaceId: ctx.workspace.id, plan: ctx.workspace.plan, role: ctx.role },
    properties: { slug: input.slug, status: input.status, iso_week: isoWeek },
  });

  revalidatePath("/app/dashboard");
  return { ok: true };
}
