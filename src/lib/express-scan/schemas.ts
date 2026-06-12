import { z } from "zod";
import { normalizeDomainInput } from "@/lib/utils";

// Schéma du formulaire scan express (/outils/test-visibilite-ia),
// partagé front + back. Même structure que le scan comparateurs.

export const expressScanSchema = z.object({
  email: z.string().email("Email invalide").max(120),
  brandName: z.string().min(2, "Nom de marque requis").max(80),
  sector: z
    .string()
    .min(3, "Décris ton secteur (ex: « agence seo », « plombier », « logiciel de caisse »)")
    .max(80),
  // Ville/zone optionnelle pour les PME locales — localise les questions.
  location: z.string().max(80).optional().or(z.literal("")),
  // Optionnel — sert à pré-remplir la demande d'audit manuel post-scan.
  // Accepte une URL collée telle quelle.
  websiteDomain: z.preprocess(
    (value) => (typeof value === "string" ? normalizeDomainInput(value) : value),
    z
      .string()
      .max(120)
      .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Domaine invalide (ex: monsite.fr)")
      .optional()
      .or(z.literal("")),
  ),
  // Honeypot anti-bot (nom non-sémantique, cf. leçon autofill 2026-06-12).
  hpField: z.string().optional(),
});

export type ExpressScanInput = z.infer<typeof expressScanSchema>;
