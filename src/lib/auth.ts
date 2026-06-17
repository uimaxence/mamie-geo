import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db } from "@/db/client";
import { account, session, user, verification } from "@/db/schema";
import { env } from "@/lib/env";
import { sendMagicLinkEmail } from "@/lib/email";
import { captureServerEvent } from "@/lib/posthog-server";

// Better Auth — config V0 magic-link only.
// cf. geo-project/03-architecture-technique.md § Auth
// cf. geo-project/09-decisions-journal.md (session 2 — magic-link via SMTP Brevo)
//
// trustedOrigins : Better Auth refuse par défaut les requêtes dont
// l'Origin ne matche pas la baseURL. En prod on accède via
// `mamie-geo.fr`, en preview via `*.vercel.app` (URL générée
// dynamiquement), en dev via `localhost:3000` — il faut tous les
// autoriser explicitement sinon le client tombe en "Failed to fetch".
//
// VERCEL_URL est injectée automatiquement par Vercel à chaque deploy
// avec l'URL exacte du déploiement courant (prod ou preview). On
// l'ajoute aux origins de confiance pour que chaque preview marche
// sans config manuelle.
//
// Cf. https://www.better-auth.com/docs/concepts/cors#trusted-origins

// En dev, Next.js bascule sur les ports 3001/3002/3003 si 3000 est
// occupé (un autre `pnpm dev`, un dev server zombie…) — il faut tous
// les autoriser sinon le client tombe en `error: {}` opaque (rejet
// CORS Better Auth, sans message exploitable).
const trustedOrigins = [
  env.NEXT_PUBLIC_APP_URL,
  env.BETTER_AUTH_URL,
  "https://mamie-geo.fr",
  "https://www.mamie-geo.fr",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter((o): o is string => Boolean(o));

// Social providers : actifs uniquement si les deux env vars Google
// sont présentes. Pattern défensif identique aux providers LLM
// (cf. `getConfiguredLLMs()`) : code en place, activation par env.
//
// Quand les vars manquent → seul magic-link reste actif, pas de crash.
// Côté UI, `/login` est un server component qui lit la même condition
// et passe `googleEnabled: boolean` en prop au client `<LoginContent>`
// (cf. src/app/login/page.tsx) — pas d'env var NEXT_PUBLIC_ exposée
// au browser pour rester source-of-truth côté serveur.
const socialProviders =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }
    : undefined;

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: { enabled: false },
  socialProviders,
  // Mesure du funnel : event `user_created` au moment où Better Auth crée
  // un compte (magic-link confirmé ou Google) — sans lui, on ne pouvait pas
  // mesurer le taux de confirmation magic-link (cf. audit 2026-06-17).
  // Best-effort : ne jamais faire échouer le signup si PostHog est down.
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          try {
            await captureServerEvent({
              event: "user_created",
              distinctId: createdUser.id,
              properties: { email: createdUser.email },
            });
          } catch {
            // no-op : la création de compte ne doit pas dépendre de PostHog.
          }
        },
      },
    },
  },
  plugins: [
    magicLink({
      expiresIn: 60 * 10, // 10 minutes
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ to: email, url });
      },
    }),
  ],
});
