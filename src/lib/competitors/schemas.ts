import { z } from "zod";

// Schémas Zod competitors — partagés front + back (cf. CLAUDE.md § 4).
// Exportés sans dépendance DB pour pouvoir être unit-testé.

// Aliases : on accepte strings vides côté Zod et on les filtre dans
// le transform (un input "alias, , alias2" doit garder alias et alias2
// au lieu de rejeter tout le payload).
const aliasArray = z
  .array(z.string().max(80))
  .max(10, "10 aliases maximum")
  .default([])
  .transform((arr) => {
    const seen = new Set<string>();
    const cleaned: string[] = [];
    for (const a of arr) {
      const trimmed = a.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      cleaned.push(trimmed);
    }
    return cleaned;
  });

const domainOptional = z
  .string()
  .max(120)
  .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Format domaine invalide (ex: monsite.fr)")
  .optional()
  .nullable()
  .or(z.literal("").transform(() => null));

/** Schéma pour la création d'un concurrent. */
export const createCompetitorSchema = z.object({
  name: z
    .string()
    .min(1, "Nom requis")
    .max(80, "Maximum 80 caractères")
    .transform((s) => s.trim()),
  domain: domainOptional,
  aliases: aliasArray,
});

export type CreateCompetitorInput = z.infer<typeof createCompetitorSchema>;

/** Schéma pour l'édition d'un concurrent. */
export const updateCompetitorSchema = z.object({
  name: z
    .string()
    .min(1, "Nom requis")
    .max(80)
    .transform((s) => s.trim())
    .optional(),
  domain: domainOptional,
  aliases: aliasArray.optional(),
});

export type UpdateCompetitorInput = z.infer<typeof updateCompetitorSchema>;
