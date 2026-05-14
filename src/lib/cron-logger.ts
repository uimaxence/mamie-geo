// Logger JSON structuré pour les endpoints cron. Vercel agrège les
// logs JSON ligne-par-ligne dans son dashboard et les rend filtrables —
// chaque ligne `console.log(JSON.stringify({...}))` devient un event
// queryable sans regex.
//
// Usage côté cron handler :
//   logCronEvent({ event: "cron_dispatch_start", at: ..., source: ... })
//   logCronEvent({ event: "job_succeeded", jobId, kind, durationMs })
//
// Le champ `event` est obligatoire (utilisé comme clé de filtre).
// L'horodatage `at` est ajouté automatiquement en ISO UTC si absent.

export interface CronLogEvent {
  event: string;
  level?: "info" | "warn" | "error";
  at?: string;
  [key: string]: unknown;
}

export function logCronEvent(payload: CronLogEvent): void {
  const enriched = {
    level: payload.level ?? "info",
    at: payload.at ?? new Date().toISOString(),
    ...payload,
  };
  console.log(JSON.stringify(enriched));
}
