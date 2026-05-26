import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db } from "@/db/client";
import { account, session, user, verification } from "@/db/schema";
import { env } from "@/lib/env";
import { sendMagicLinkEmail } from "@/lib/email";

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

const trustedOrigins = [
  env.NEXT_PUBLIC_APP_URL,
  env.BETTER_AUTH_URL,
  "https://mamie-geo.fr",
  "https://www.mamie-geo.fr",
  "http://localhost:3000",
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
  plugins: [
    magicLink({
      expiresIn: 60 * 10, // 10 minutes
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ to: email, url });
      },
    }),
  ],
});
