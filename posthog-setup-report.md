# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into Mamie GEO. Client-side tracking is initialized via `instrumentation-client.ts` (Next.js 15.3+ pattern) with a reverse proxy through `/ingest` to reduce ad-blocker interference. Server-side tracking uses `posthog-node` via a singleton helper in `src/lib/posthog-server.ts`. Users are identified on every authenticated app session via the `<PostHogUserIdentify>` component injected into the app layout.

| Event | Description | File |
|---|---|---|
| `magic_link_requested` | User submits email for a magic link (login or signup) | `src/app/login/login-content.tsx` |
| `google_signin_clicked` | User clicks "Continuer avec Google" OAuth button | `src/app/login/login-content.tsx` |
| `onboarding_completed` | User finishes the 3-step onboarding wizard | `src/app/(app)/app/onboarding/onboarding-wizard.tsx` |
| `onboarding_skipped` | User skips onboarding with minimal setup (step 1 only) | `src/app/(app)/app/onboarding/onboarding-wizard.tsx` |
| `prompt_ai_suggestions_requested` | User requests AI prompt suggestions (onboarding or prompts page) | `src/app/(app)/app/onboarding/onboarding-wizard.tsx`, `src/app/(app)/app/(with-nav)/prompts/actions.ts` |
| `checkout_initiated` | Stripe checkout session created — user is about to pay | `src/app/(app)/app/(with-nav)/settings/billing-actions.ts` |
| `subscription_activated` | Stripe `checkout.session.completed` — new subscription confirmed | `src/lib/stripe/webhook-handlers.ts` |
| `subscription_canceled` | Stripe `customer.subscription.deleted` — subscription ended | `src/lib/stripe/webhook-handlers.ts` |
| `payment_failed` | Stripe `invoice.payment_failed` — card declined | `src/lib/stripe/webhook-handlers.ts` |
| `brand_created` | User creates a new brand via the BrandSwitcher | `src/lib/brands/actions.ts` |
| `brand_paused` | User pauses tracking for a brand (churn signal) | `src/lib/brands/actions.ts` |
| `brand_resumed` | User resumes a paused brand (re-engagement signal) | `src/lib/brands/actions.ts` |
| `run_triggered_manually` | User manually triggers a GEO tracking run from the dashboard | `src/app/(app)/app/(with-nav)/dashboard/actions.ts` |
| `public_audit_completed` | Free public audit at /outils/audit-technique completes successfully | `src/app/(marketing)/outils/audit-technique/actions.ts` |
| `public_audit_report_email_submitted` | Visitor enters email to receive the full audit report (lead capture) | `src/app/(marketing)/outils/audit-technique/actions.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/196235/dashboard/731887)
- [Signup-to-Subscription Conversion Funnel](https://eu.posthog.com/project/196235/insights/4hO6obfT)
- [New Subscriptions Over Time](https://eu.posthog.com/project/196235/insights/MEqFnWSo)
- [Churn Signals: Cancellations & Payment Failures](https://eu.posthog.com/project/196235/insights/TiLITaSG)
- [Core Product Engagement](https://eu.posthog.com/project/196235/insights/djV6VCk1)
- [Public Audit Lead Capture Funnel](https://eu.posthog.com/project/196235/insights/K2k27wYN)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
