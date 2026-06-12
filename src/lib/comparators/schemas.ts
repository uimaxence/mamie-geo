import { z } from "zod";
import { normalizeDomainInput } from "@/lib/utils";

// Schéma du formulaire /outils/comparateurs, partagé front + back.

export const comparatorScanSchema = z.object({
  email: z.string().email("Email invalide").max(120),
  brandName: z.string().min(2, "Nom de marque requis").max(80),
  sector: z
    .string()
    .min(3, "Décris ton secteur (ex: « agence seo », « plombier », « logiciel de caisse »)")
    .max(80),
  // Ville/zone optionnelle pour les PME locales — localise la découverte
  // (« meilleur plombier tours » fait remonter les annuaires locaux).
  location: z.string().max(80).optional().or(z.literal("")),
  // Accepte une URL collée telle quelle ("https://www.monsite.fr/page"),
  // normalisée en domaine nu avant validation.
  websiteDomain: z.preprocess(
    (value) => (typeof value === "string" ? normalizeDomainInput(value) : value),
    z
      .string()
      .max(120)
      .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Domaine invalide (ex: monsite.fr)")
      .optional()
      .or(z.literal("")),
  ),
  // Honeypot anti-bot : champ caché qui doit rester vide. Nom volontairement
  // non-sémantique : « company » déclenchait l'autofill Chrome (organisation)
  // → faux positifs sur de vrais prospects (constaté 2026-06-12).
  hpField: z.string().optional(),
});

export type ComparatorScanInput = z.infer<typeof comparatorScanSchema>;
