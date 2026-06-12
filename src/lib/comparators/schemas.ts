import { z } from "zod";

// Schéma du formulaire /outils/comparateurs, partagé front + back.

export const comparatorScanSchema = z.object({
  email: z.string().email("Email invalide").max(120),
  brandName: z.string().min(2, "Nom de marque requis").max(80),
  sector: z
    .string()
    .min(3, "Décris ton secteur (ex: « agence seo », « plombier », « logiciel de caisse »)")
    .max(80),
  websiteDomain: z
    .string()
    .max(120)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Domaine invalide (ex: monsite.fr)")
    .optional()
    .or(z.literal("")),
  // Honeypot anti-bot : champ caché qui doit rester vide.
  company: z.string().optional(),
});

export type ComparatorScanInput = z.infer<typeof comparatorScanSchema>;
