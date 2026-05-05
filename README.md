# Mamie GEO

> SaaS francophone de Generative Engine Optimization. Mesure quotidienne de
> la visibilité d'une marque dans ChatGPT, Claude, Perplexity, Gemini et
> Le Chat (Mistral).

## Quickstart

```bash
# Installer pnpm via corepack si besoin
corepack enable

# Installer les deps
pnpm install

# Configurer l'environnement
cp .env.example .env.local
# (remplir DATABASE_URL avec une branche Neon dev-{username}, BETTER_AUTH_SECRET,
#  BREVO_*, CRON_SECRET, etc.)

# Appliquer les migrations
pnpm db:migrate

# Lancer le dev server
pnpm dev
```

## Documentation

Toute la doc projet (vision, marché, produit, archi, pricing, GTM,
risques, roadmap, décisions, design) vit dans [`geo-project/`](./geo-project/README.md).

Pour Claude Code : commencer par [`CLAUDE.md`](./CLAUDE.md). C'est le brief
opérationnel à lire en début de session.

## Stack

Next.js 15 · TypeScript strict · Tailwind v4 · Drizzle · Better Auth ·
Postgres (Neon EU) · Vercel Pro · Brevo (SMTP) · Stripe.

Détail et justifications : [`geo-project/03-architecture-technique.md`](./geo-project/03-architecture-technique.md).

## Scripts

| Commande             | Effet                                         |
| -------------------- | --------------------------------------------- |
| `pnpm dev`           | Dev server Next.js (http://localhost:3000)    |
| `pnpm build`         | Build production                              |
| `pnpm lint`          | ESLint Next                                   |
| `pnpm format`        | Prettier --write                              |
| `pnpm format:check`  | Prettier --check (utilisé en CI)              |
| `pnpm type-check`    | `tsc --noEmit`                                |
| `pnpm test`          | Vitest (unit + integration)                   |
| `pnpm test:e2e`      | Playwright (flows business-critiques)         |
| `pnpm db:generate`   | Génère une migration depuis le schéma Drizzle |
| `pnpm db:migrate`    | Applique les migrations                       |
| `pnpm db:studio`     | Drizzle Studio (UI)                           |
| `pnpm auth:generate` | Régénère les tables Better Auth               |

## Structure

```
mamie-geo/
├── geo-project/      # documentation projet (00 à 10)
├── CLAUDE.md         # brief Claude Code
├── src/
│   ├── app/          # Next.js App Router (route groups marketing|blog|app)
│   ├── lib/          # logique métier (auth, queue, llm, …)
│   ├── db/           # Drizzle (schema + client + migrations)
│   ├── components/   # UI shadcn customisée
│   ├── workers/      # workers de jobs LLM
│   └── content/      # blog MDX
├── tests/e2e/        # Playwright
└── .github/          # CI
```

## Licence

Propriétaire. Tous droits réservés. Code privé.
