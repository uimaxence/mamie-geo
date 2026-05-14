// Validation isolée du payload jsonb venant de la queue. Extrait dans
// un fichier sans dépendance DB pour pouvoir être unit-testé sans setup
// d'env complet (cf. pattern execute-prompt-payload.ts).

export interface SendWeeklyEmailPayload {
  workspaceId: string;
  isoWeek: string;
}

// Format ISO 8601 semaine : YYYY-Www (ex: 2026-W19). Régex permissive
// pour ne pas bloquer en cas de format YYYY-Www-N (jour). On garde
// seulement YYYY-Www.
const ISO_WEEK_PATTERN = /^\d{4}-W\d{2}$/;

export function parseSendWeeklyEmailPayload(raw: unknown): SendWeeklyEmailPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("send_weekly_email payload must be an object");
  }
  const r = raw as Record<string, unknown>;
  if (typeof r.workspaceId !== "string" || typeof r.isoWeek !== "string") {
    throw new Error("send_weekly_email payload manque workspaceId/isoWeek string");
  }
  if (!ISO_WEEK_PATTERN.test(r.isoWeek)) {
    throw new Error(
      `send_weekly_email payload isoWeek invalide : ${r.isoWeek} (format YYYY-Www attendu)`,
    );
  }
  return { workspaceId: r.workspaceId, isoWeek: r.isoWeek };
}

/**
 * Calcule la semaine ISO 8601 d'une date donnée. Format `YYYY-Www`
 * (ex: `2026-W19`). Algo standard : semaine du jeudi de la même
 * semaine ISO.
 */
export function isoWeekFromDate(date: Date): string {
  // Copie UTC, on travaille en jeudi de la semaine ISO
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7; // dimanche = 0 → 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // jeudi de la semaine ISO
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}
