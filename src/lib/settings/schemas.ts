import { z } from "zod";

// Schémas Zod pour l'édition Settings (workspace + brand aliases).
// Cf. PR App CRUD 2026-05-13.

export const updateWorkspaceNameSchema = z.object({
  name: z
    .string()
    .min(1, "Nom requis")
    .max(80, "Maximum 80 caractères")
    .transform((s) => s.trim()),
});

export type UpdateWorkspaceNameInput = z.infer<typeof updateWorkspaceNameSchema>;

export const updateBrandAliasesSchema = z.object({
  aliases: z
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
    }),
});

export type UpdateBrandAliasesInput = z.infer<typeof updateBrandAliasesSchema>;
