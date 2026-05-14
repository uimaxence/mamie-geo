import { z } from "zod";

// Schémas Zod prompts — partagés front + back (cf. CLAUDE.md § 4
// conventions code). Exportés depuis ce fichier sans dépendance DB
// pour pouvoir être unit-testé.

export const PROMPT_CATEGORIES = ["commercial", "informational", "comparison"] as const;
export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];

/** Schéma pour la création d'un prompt. */
export const createPromptSchema = z.object({
  text: z
    .string()
    .min(5, "Au moins 5 caractères")
    .max(500, "Maximum 500 caractères")
    .transform((s) => s.trim()),
  category: z.enum(PROMPT_CATEGORIES).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CreatePromptInput = z.infer<typeof createPromptSchema>;

/** Schéma pour l'édition d'un prompt (tous champs optionnels sauf id côté action). */
export const updatePromptSchema = z.object({
  text: z
    .string()
    .min(5, "Au moins 5 caractères")
    .max(500, "Maximum 500 caractères")
    .transform((s) => s.trim())
    .optional(),
  category: z.enum(PROMPT_CATEGORIES).optional().nullable(),
  isActive: z.boolean().optional(),
});

export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
