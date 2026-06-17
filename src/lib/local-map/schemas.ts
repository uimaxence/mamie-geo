import { z } from "zod";
import { normalizeDomainInput } from "@/lib/utils";

// Schéma du formulaire « Carte de visibilité IA locale », partagé front +
// back. Même structure que le scan express, avec une ville principale
// (centre de la carte) en champ pivot.

export const localMapScanSchema = z.object({
  email: z.string().email("Email invalide").max(120),
  brandName: z.string().min(2, "Nom de marque requis").max(80),
  sector: z
    .string()
    .min(3, "Décris ton activité (ex : « plombier », « ostéopathe », « restaurant »)")
    .max(80),
  mainCity: z.string().min(2, "Indique ta ville principale").max(80),
  // Villes autour, optionnelles : si vides, on les déduit automatiquement.
  surroundingCities: z.array(z.string().min(2).max(80)).max(6).default([]),
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

export type LocalMapScanInput = z.infer<typeof localMapScanSchema>;
