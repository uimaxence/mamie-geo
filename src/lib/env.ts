import { z } from "zod";

// Validation centralisée des variables d'environnement.
// Toute clé manquante ou mal formée crash au démarrage avec un message
// explicite — préférable à un undefined silencieux en runtime.
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  DATABASE_URL: z.string().url(),

  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),

  BREVO_SMTP_HOST: z.string().min(1),
  BREVO_SMTP_PORT: z.coerce.number().int().positive(),
  BREVO_SMTP_USER: z.string().min(1),
  BREVO_SMTP_PASSWORD: z.string().min(1),
  BREVO_SMTP_FROM: z.string().min(1),

  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  MISTRAL_API_KEY: z.string().min(1).optional(),
  PERPLEXITY_API_KEY: z.string().min(1).optional(),
  GOOGLE_AI_API_KEY: z.string().min(1).optional(),

  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),

  CRON_SECRET: z.string().min(16),
  ADMIN_ALERT_EMAIL: z.string().email(),
});

export type Env = z.infer<typeof schema>;

// Traiter les chaînes vides comme undefined — pratique pour les clés
// optionnelles qu'on laisse vides en local.
const cleanedEnv = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => value !== ""),
);

const parsed = schema.safeParse(cleanedEnv);

if (!parsed.success) {
  // En CI on tolère les valeurs manquantes (les jobs lint/type-check
  // ne nécessitent pas toutes les clés). Crash en dev/prod uniquement.
  if (process.env.NODE_ENV !== "test" && process.env.CI !== "true") {
    console.error("❌ Variables d'environnement invalides :", parsed.error.flatten().fieldErrors);
    throw new Error("Variables d'environnement invalides — voir log ci-dessus");
  }
}

export const env = (parsed.success ? parsed.data : ({} as Env)) as Env;
