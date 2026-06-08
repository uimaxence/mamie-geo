import posthog from "posthog-js";

// Mamie GEO — PostHog client init.
// defaults: "2026-01-30" enables autocapture, history-change pageviews,
// pageleave, exception capture et session replay (config par défaut).
// On override person_profiles à "always" pour tracker l'anonyme marketing
// + merger sur signup via posthog.alias(). Masquage PII via maskTextSelector
// (cf. /legal/privacy + convention data-private documentée dans CLAUDE.md).

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://eu.posthog.com",
  defaults: "2026-01-30",
  person_profiles: "always",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
  session_recording: {
    maskAllInputs: false,
    maskTextSelector:
      'input[type="email"], input[type="password"], [data-private], [data-private="true"]',
    maskInputOptions: { password: true, email: true },
    collectFonts: false,
  },
});
