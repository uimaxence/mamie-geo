// Encoding URL ↔ slug pour /app/sources/[id]. Pur, sans DB ; isolé de
// queries.ts pour pouvoir être testé sans charger le module DB (qui
// nécessite DATABASE_URL au import).

/** base64url (RFC 4648) : safe pour URL sans nécessiter d'encodeURIComponent. */
export function encodeSourceSlug(url: string): string {
  return Buffer.from(url, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeSourceSlug(slug: string): string | null {
  try {
    const base64 = slug.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = Buffer.from(padded, "base64").toString("utf-8");
    // Sanity check : doit ressembler à une URL absolue http(s)
    if (!/^https?:\/\//i.test(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
}
