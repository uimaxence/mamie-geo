import { defineConfig } from "drizzle-kit";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Drizzle Kit — migrations versionnées en SQL pur dans src/db/migrations/.
// `db push` interdit en prod (cf. CLAUDE.md § Drizzle / DB).
// On ne passe pas par @/lib/env : drizzle-kit n'a besoin que de DATABASE_URL,
// et le validateur global exige des secrets runtime (Better Auth, Brevo, …)
// qui ne sont pas requis pour générer/appliquer une migration.
// drizzle-kit migrate exécute des transactions multi-statements et utilise
// le driver WebSocket de @neondatabase/serverless. Le WebSocket global natif
// de Node 22 ne suffit pas (drizzle-kit instancie sa propre copie de
// @neondatabase/serverless avec son propre neonConfig hors du cache partagé).
// On fournit donc explicitement le constructeur de `ws` — devDep, jamais en runtime.
neonConfig.webSocketConstructor = ws;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL manquante — vérifier .env.local (chargé via --env-file-if-exists dans le script db:*)",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
