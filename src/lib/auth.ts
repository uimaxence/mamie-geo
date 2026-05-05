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
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: { enabled: false },
  plugins: [
    magicLink({
      expiresIn: 60 * 10, // 10 minutes
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ to: email, url });
      },
    }),
  ],
});
