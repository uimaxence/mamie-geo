"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { LLM_VALUES, llmCreditTopups } from "@/db/schema";
import { getAdminSessionEmail } from "@/lib/admin/guard";

// Saisie/suppression manuelle des soldes de crédits LLM (admin only).
// `setBalance` enregistre le solde ACTUEL constaté sur le compte provider
// (à l'instant présent) → getLlmCreditOverview en déduit le solde estimé en
// soustrayant la dépense depuis cette saisie.

const balanceSchema = z.object({
  provider: z.enum(LLM_VALUES),
  // Solde actuel disponible sur le compte (0 autorisé : compte à sec).
  balanceUsd: z.coerce.number().min(0, "Montant ≥ 0").max(100000),
  note: z.string().max(200).optional(),
});

export type SetBalanceResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" }
  | { ok: false; error: "validation"; message: string };

export async function setBalance(input: {
  provider: string;
  balanceUsd: number;
  note?: string;
}): Promise<SetBalanceResult> {
  const admin = await getAdminSessionEmail();
  if (!admin) return { ok: false, error: "unauthorized" };

  const parsed = balanceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "validation",
      message: parsed.error.issues[0]?.message ?? "Invalide",
    };
  }

  await db.insert(llmCreditTopups).values({
    provider: parsed.data.provider,
    amountUsd: parsed.data.balanceUsd.toFixed(2),
    // Solde constaté maintenant : on horodate à l'instant de la saisie.
    toppedUpAt: new Date(),
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
