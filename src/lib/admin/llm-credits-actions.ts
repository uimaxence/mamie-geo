"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { LLM_VALUES, llmCreditTopups } from "@/db/schema";
import { getAdminSessionEmail } from "@/lib/admin/guard";

// Saisie/suppression manuelle des recharges de crédits LLM (admin only).
// Sert au calcul du solde estimé dans getLlmCreditOverview().

const topupSchema = z.object({
  provider: z.enum(LLM_VALUES),
  amountUsd: z.coerce.number().positive("Montant > 0").max(100000),
  // Date au format YYYY-MM-DD (input date) ; défaut = aujourd'hui côté UI.
  toppedUpAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  note: z.string().max(200).optional(),
});

export type RecordTopupResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" }
  | { ok: false; error: "validation"; message: string };

export async function recordTopup(input: {
  provider: string;
  amountUsd: number;
  toppedUpAt: string;
  note?: string;
}): Promise<RecordTopupResult> {
  const admin = await getAdminSessionEmail();
  if (!admin) return { ok: false, error: "unauthorized" };

  const parsed = topupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "validation",
      message: parsed.error.issues[0]?.message ?? "Invalide",
    };
  }

  await db.insert(llmCreditTopups).values({
    provider: parsed.data.provider,
    amountUsd: parsed.data.amountUsd.toFixed(2),
    // minuit UTC du jour saisi
    toppedUpAt: new Date(`${parsed.data.toppedUpAt}T00:00:00Z`),
    note: parsed.data.note?.trim() || null,
    createdBy: admin,
  });

  revalidatePath("/app/admin/llm-credits");
  return { ok: true };
}

export type DeleteTopupResult = { ok: true } | { ok: false; error: "unauthorized" };

export async function deleteTopup(input: { id: string }): Promise<DeleteTopupResult> {
  const admin = await getAdminSessionEmail();
  if (!admin) return { ok: false, error: "unauthorized" };

  await db.delete(llmCreditTopups).where(eq(llmCreditTopups.id, input.id));
  revalidatePath("/app/admin/llm-credits");
  return { ok: true };
}
