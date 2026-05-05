import { defineConfig } from "drizzle-kit";
import { env } from "@/lib/env";

// Drizzle Kit — migrations versionnées en SQL pur dans src/db/migrations/.
// `db push` interdit en prod (cf. CLAUDE.md § Drizzle / DB).
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
