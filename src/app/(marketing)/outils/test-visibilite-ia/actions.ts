"use server";

import { z } from "zod";
import { sendAuditRequestEmails } from "@/lib/email";
import { normalizeDomainInput } from "@/lib/utils";

// Server action du lead magnet, capture la demande d'audit et envoie
// 2 emails (interne à l'équipe + auto-reply prospect). Pas de stockage
// DB pour V0, quand le volume monte, on ajoutera une table `leads`.
//
// Rate-limit basique : tag par IP via headers in client form (TODO PR
// suivante). Pour V0 on accepte le risque d'abus minimal car volume
// attendu < 50/jour.

const auditRequestSchema = z.object({
  prospectEmail: z.string().email("Email invalide").max(120),
  brandName: z.string().min(1, "Nom de marque requis").max(80),
  domain: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Domaine invalide (ex: monsite.fr)"),
  notes: z.string().max(1000).optional(),
});

export type AuditRequestInput = z.infer<typeof auditRequestSchema>;

export type AuditRequestResult = { ok: true } | { ok: false; error: string };

// Ne jamais `throw` ici : en prod, Next.js masque le message des erreurs
// jetées par une server action derrière un « Server Components render »
// générique — le prospect ne voyait jamais la vraie raison (bug constaté
// 2026-06-12 avec une URL collée dans le champ domaine).
export async function submitAuditRequest(raw: AuditRequestInput): Promise<AuditRequestResult> {
  const parsed = auditRequestSchema.safeParse({
    ...raw,
    domain: normalizeDomainInput(typeof raw.domain === "string" ? raw.domain : ""),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }
  const data = parsed.data;

  try {
    await sendAuditRequestEmails({
      prospectEmail: data.prospectEmail.trim(),
      brandName: data.brandName.trim(),
      domain: data.domain,
      notes: data.notes?.trim() || undefined,
    });
  } catch {
    return { ok: false, error: "Erreur d'envoi, réessaye dans quelques minutes." };
  }

  return { ok: true };
}
