import { z } from "zod";
import { LLM_VALUES } from "@/db/schema";

// Validation de frontière de l'endpoint public d'ingestion du pixel. Le
// payload est minimal (clé + source + path) et envoyé via navigator.sendBeacon.

// Clé PUBLIQUE du pixel. Préfixe `mgpx_` (pas `sk_`/`pk_` Stripe) : voir
// `src/lib/ai-traffic/keys.ts` pour le pourquoi (secret scanners + lisibilité).
export const PIXEL_KEY_REGEX = /^mgpx_[a-z0-9]{24}$/;

export const collectPayloadSchema = z.object({
  /** Clé publique du pixel (= brands.ai_pixel_key). */
  k: z.string().regex(PIXEL_KEY_REGEX),
  /** Source IA détectée côté client — revalidée contre LLM_VALUES (jamais de
   *  confiance aveugle au client). */
  s: z.enum(LLM_VALUES),
  /** Pathname de la page visitée (optionnel, non stocké en V1 — réservé pour
   *  une future ventilation par page). Borné pour éviter un payload abusif. */
  p: z.string().max(512).optional(),
});

export type CollectPayload = z.infer<typeof collectPayloadSchema>;
