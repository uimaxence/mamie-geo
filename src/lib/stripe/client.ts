import Stripe from "stripe";
import { env } from "@/lib/env";

// Wrapper SDK Stripe — lazy init. Crash propre si STRIPE_SECRET_KEY
// manque au runtime (les routes API qui touchent à Stripe doivent
// throw plutôt que silencieusement no-op).
//
// `apiVersion` est pinnée pour éviter qu'une bump du SDK change le
// shape des objets retournés sans qu'on le veuille. Mettre à jour
// explicitement quand on bump le SDK.

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY manquant — checkout/portal/webhook indisponibles. " +
        "Voir .env.example pour le setup.",
    );
  }
  cached = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
    appInfo: { name: "Mamie GEO", version: "0.0.1" },
  });
  return cached;
}
