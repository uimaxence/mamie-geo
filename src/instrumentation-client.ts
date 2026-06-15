import posthog from "posthog-js";
import * as Sentry from "@sentry/nextjs";

// Instrumentation client (Next 15) : exécutée une fois côté navigateur avant
// l'hydratation. On y initialise Sentry (erreurs front + replay sur erreur)
// ET PostHog (pageviews, autocapture, session replay). Sans cette init, la
// façade posthog-client.ts restait en no-op (isReady() faux) → zéro event
// navigateur. cf. doc 09 § 2026-06-15.

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 0.1,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
    // Pas de replay de session systématique (coût) ; replay uniquement
    // quand une erreur survient, pour rejouer le contexte du bug.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
if (posthogToken) {
  posthog.init(posthogToken, {
    // Reverse proxy first-party `/ingest` (cf. next.config.ts rewrites) :
    // réduit le blocage par les ad-blockers. UI host reste PostHog EU.
    api_host: "/ingest",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.posthog.com",
    defaults: "2025-05-24",
    // Profils créés uniquement pour les users identifiés (RGPD, cf. privacy
    // policy : opt-in implicite ePrivacy, pas de profil sur visiteur anonyme).
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    // Session replay avec masquage PII (convention `data-private` du code).
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-private]",
    },
  });
}

// Instrumente les transitions de route App Router pour Sentry (tracing nav).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
