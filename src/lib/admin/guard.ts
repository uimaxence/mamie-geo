import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Allowlist admin partagée entre le layout /app/admin/* et les server
// actions admin. Founder toujours admin ; emails supplémentaires (dev
// local, autres admins) via env `ADMIN_EMAILS` (séparés par virgules).
//
// V0 : pas de champ `role` en base — l'email signé dans la session Better
// Auth fait foi. Centralisé ici pour éviter la divergence entre le guard
// d'affichage (layout) et le guard d'écriture (actions).
export const ADMIN_EMAILS = new Set(
  [
    "maxencecailleau.pro@gmail.com",
    "maxence.cailleau1@gmail.com",
    ...(process.env.ADMIN_EMAILS?.split(",") ?? []),
  ]
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export function isAdminEmail(email: string | null | undefined): boolean {
  return ADMIN_EMAILS.has((email ?? "").toLowerCase());
}

/**
 * Vérifie que la session courante est un admin. Retourne l'email admin si
 * OK, sinon `null` — l'appelant décide (redirect côté page, erreur typée
 * côté server action).
 */
export async function getAdminSessionEmail(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user.email ?? null;
  return isAdminEmail(email) ? email!.toLowerCase() : null;
}
