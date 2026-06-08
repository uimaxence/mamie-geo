import { z } from "zod";

// Validation centralisée des variables d'environnement.
//
// Stratégie en 3 modes :
//   - dev / prod runtime  → strict, crash si une var requise manque
//   - tests (NODE_ENV=test) ou CI=true → tolérant, retourne {} pour
//     que les jobs lint/type-check/tests unit n'aient pas besoin de
//     toutes les clés
//   - build Next.js (NEXT_PHASE=phase-production-build) → tolérant
//     avec placeholders. Next.js charge tous les modules pendant
//     "Collecting page data" pour extraire les métadonnées des routes
//     dynamiques ; pas besoin de la vraie DATABASE_URL à ce moment.
//     On fournit donc des valeurs factices qui font passer la build,
//     puis le runtime Vercel re-validera avec les vraies vars
//     d'environnement avant la première exécution d'un handler.

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  DATABASE_URL: z.string().url(),

  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),

  // Brevo : on supporte 2 modes côté code, choisi à runtime selon les
  // vars présentes.
  //   - REST API (recommandé, voir doc 09 § PR 18bis) : utiliser
  //     BREVO_API_KEY + BREVO_FROM_EMAIL. Pas de filtre IP.
  //   - SMTP (legacy) : utiliser BREVO_SMTP_HOST/PORT/USER/PASSWORD/FROM.
  //     Soumis à l'IP whitelist Brevo Free.
  // Si BREVO_API_KEY est défini, on prend la REST API. Sinon fallback SMTP.
  BREVO_API_KEY: z.string().min(1).optional(),
  BREVO_FROM_EMAIL: z.string().email().optional(),
  BREVO_FROM_NAME: z.string().min(1).optional(),
  // ID numérique de la liste Brevo "Newsletter blog" — utilisée pour les
  // inscriptions depuis /blog et les notifications à la publication d'un
  // nouvel article. Optionnelle : si absente, l'inscription échoue
  // gracieusement et la notification est skippée (cf. src/lib/email.ts).
  // À créer dans https://app.brevo.com/contact/list-listing puis copier
  // l'ID dans Vercel env vars.
  BREVO_BLOG_LIST_ID: z.coerce.number().int().positive().optional(),
  BREVO_SMTP_HOST: z.string().min(1).optional(),
  BREVO_SMTP_PORT: z.coerce.number().int().positive().optional(),
  BREVO_SMTP_USER: z.string().min(1).optional(),
  BREVO_SMTP_PASSWORD: z.string().min(1).optional(),
  BREVO_SMTP_FROM: z.string().min(1).optional(),

  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  MISTRAL_API_KEY: z.string().min(1).optional(),
  PERPLEXITY_API_KEY: z.string().min(1).optional(),
  GOOGLE_AI_API_KEY: z.string().min(1).optional(),

  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_PRICE_SOLO: z.string().min(1).optional(),
  STRIPE_PRICE_STARTER: z.string().min(1).optional(),
  STRIPE_PRICE_PRO: z.string().min(1).optional(),
  // Prices annuels (cf. doc 09 § 2026-06-08 réintroduction trial 14j carte
  // requise + facturation annuelle pré-sélectionnée). Optionnels au boot
  // pour ne pas casser preview avant config Stripe Dashboard. Si manquants
  // au runtime, le picker n'expose que le cycle mensuel.
  STRIPE_PRICE_SOLO_ANNUAL: z.string().min(1).optional(),
  STRIPE_PRICE_STARTER_ANNUAL: z.string().min(1).optional(),
  STRIPE_PRICE_PRO_ANNUAL: z.string().min(1).optional(),

  CRON_SECRET: z.string().min(16),
  ADMIN_ALERT_EMAIL: z.string().email(),

  // Google PageSpeed Insights API — clé optionnelle. Sans clé, l'API
  // est limitée à 25K req/jour partagés par IP, ce qui suffit pour V0.
  // Avec clé gratuite, illimité. cf. /outils/audit-technique.
  GOOGLE_PAGESPEED_API_KEY: z.string().min(1).optional(),

  // Google OAuth 2.0 — Sign-in social via Better Auth (cf. doc 09 §
  // 2026-05-26, login via Google). Optionnels : si l'une des deux
  // manque, on skip gracieusement le branchement social provider et
  // seul le magic-link reste actif (cf. src/lib/auth.ts).
  //
  // Setup : Google Cloud Console → APIs & Services → Credentials →
  // OAuth 2.0 Client ID (Web application). Redirect URIs à autoriser :
  //   - https://mamie-geo.fr/api/auth/callback/google
  //   - http://localhost:3000/api/auth/callback/google
  //   - <preview-vercel-url>/api/auth/callback/google (au cas par cas)
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof schema>;

// Traiter les chaînes vides comme undefined — pratique pour les clés
// optionnelles qu'on laisse vides en local.
const cleanedEnv = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => value !== ""),
);

const parsed = schema.safeParse(cleanedEnv);

const isTest = process.env.NODE_ENV === "test";
const isCI = process.env.CI === "true";
// Next.js 13+ pose NEXT_PHASE pendant la build. Cf.
// https://nextjs.org/docs/app/api-reference/next-cli#build
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

if (!parsed.success) {
  if (!isTest && !isCI && !isBuildPhase) {
    console.error("❌ Variables d'environnement invalides :", parsed.error.flatten().fieldErrors);
    throw new Error("Variables d'environnement invalides — voir log ci-dessus");
  }
}

// Placeholders utilisés uniquement pendant la build Next.js : permettent
// au module-load de réussir (neon(URL) accepte n'importe quelle URL
// formée, ne se connecte qu'à la première requête runtime). À l'exécution
// d'un handler en prod, la vraie env est lue par Node depuis Vercel.
const buildPlaceholders: Env = {
  NODE_ENV: "production",
  NEXT_PUBLIC_APP_URL: "https://placeholder.invalid",
  DATABASE_URL: "postgresql://placeholder:placeholder@placeholder.invalid/placeholder",
  BETTER_AUTH_SECRET: "placeholder-build-secret-must-be-thirty-two-chars",
  BETTER_AUTH_URL: "https://placeholder.invalid",
  BREVO_API_KEY: undefined,
  BREVO_FROM_EMAIL: undefined,
  BREVO_FROM_NAME: undefined,
  BREVO_BLOG_LIST_ID: undefined,
  BREVO_SMTP_HOST: undefined,
  BREVO_SMTP_PORT: undefined,
  BREVO_SMTP_USER: undefined,
  BREVO_SMTP_PASSWORD: undefined,
  BREVO_SMTP_FROM: undefined,
  CRON_SECRET: "placeholder-cron-secret-build-only",
  ADMIN_ALERT_EMAIL: "placeholder@placeholder.invalid",
  GOOGLE_CLIENT_ID: undefined,
  GOOGLE_CLIENT_SECRET: undefined,
};

export const env = parsed.success
  ? (parsed.data as Env)
  : isBuildPhase
    ? buildPlaceholders
    : ({} as Env);
