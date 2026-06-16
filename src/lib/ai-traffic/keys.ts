import { createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

// Génération de la clé publique du pixel + hash d'IP pour le rate-limit.
// Tout est server-only (node:crypto).

const KEY_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789"; // 36 → matche [a-z0-9]
const KEY_LENGTH = 24;
// Préfixe volontairement éloigné de `sk_`/`pk_`/`rk_` (Stripe) et autres
// préfixes de clés secrètes : la clé du pixel est PUBLIQUE (elle vit dans le
// HTML du client). Lui donner un préfixe « secret » déclencherait les secret
// scanners (GitHub push protection, Stripe) et ferait croire à une fuite.
const KEY_PREFIX = "mgpx_"; // Mamie GEO PiXel

/**
 * Génère une clé publique de pixel `mgpx_<24 [a-z0-9]>`. Publique = exposée
 * dans l'URL du snippet et le HTML du client ; elle n'autorise que l'écriture
 * d'agrégats de trafic, aucune lecture.
 */
export function generatePixelKey(): string {
  const bytes = randomBytes(KEY_LENGTH);
  let out = "";
  for (let i = 0; i < KEY_LENGTH; i++) {
    out += KEY_ALPHABET.charAt(bytes[i]! % KEY_ALPHABET.length);
  }
  return `${KEY_PREFIX}${out}`;
}

/**
 * Hash salé et non réversible de l'IP, pour le rate-limit/dédup uniquement.
 * Le sel intègre la date du jour → la même IP donne un hash différent demain
 * (pas de suivi longitudinal possible) et l'IP en clair n'est jamais stockée.
 * Le secret de salage réutilise CRON_SECRET (déjà présent, jamais exposé client).
 */
export function hashIp(ip: string, dateIso: string): string {
  const salt = env.CRON_SECRET ?? "fallback-salt";
  return createHash("sha256").update(`${ip}|${salt}|${dateIso}`).digest("hex").slice(0, 16);
}
