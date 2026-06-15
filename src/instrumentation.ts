import * as Sentry from "@sentry/nextjs";

// Instrumentation serveur/edge (Next 15). `register()` est appelé une fois
// au démarrage de chaque runtime. Sentry n'est activé que si SENTRY_DSN est
// présent (no-op en local/test sans DSN). cf. doc 09 § 2026-06-15 (Sentry).
export async function register() {
  if (!process.env.SENTRY_DSN) return;
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      // Échantillonnage tracing bas : on veut les erreurs, pas le coût d'un
      // tracing 100 % sur le free tier. À monter si besoin de perf APM.
      tracesSampleRate: 0.1,
      environment: process.env.VERCEL_ENV ?? "development",
    });
  }
}

// Capture les erreurs des Server Components / route handlers / actions.
export const onRequestError = Sentry.captureRequestError;
