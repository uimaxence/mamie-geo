# CLAUDE.md — Brief opérationnel Mamie GEO

> Source de vérité courte pour Claude Code. À lire en 3 minutes au début
> de chaque session avant de toucher au code. La connaissance détaillée
> vit dans `geo-project/00` à `10`. Ce fichier ne duplique pas, il pointe.

---

## 1. Pitch

Mamie GEO est le **premier SaaS francophone de Generative Engine
Optimization** : il mesure quotidiennement la visibilité d'une marque
dans **ChatGPT, Claude, Perplexity, Gemini et Le Chat (Mistral)**, et
livre des recommandations actionnables. Cible cœur : freelances SEO,
PME marketing, agences SEO/marketing FR. Pricing : **49 / 149 / 399 €**
+ Enterprise sur devis.

Détail : `geo-project/00-vision-strategie.md` et `01-marche-concurrence.md`.

---

## 2. Stack verrouillée (V0)

Décisions actées le 2026-05-05 dans `geo-project/09-decisions-journal.md`.
**Ne pas changer sans nouvelle entrée dans 09 + accord Max.**

| Domaine | Choix | Pourquoi (résumé) |
|---|---|---|
| Framework | **Next.js 15 App Router** | Edge EU, SSR, écosystème |
| Langage | **TypeScript strict** | Pas de `any` non justifié |
| Styling | **Tailwind v4 + shadcn customisé** | Tokens du doc 10 |
| Auth | **Better Auth** | Free, open source, Postgres, magic-link |
| ORM | **Drizzle** | SQL-first, edge-compatible, migrations versionnées |
| DB | **Neon EU Frankfurt** | Free tier + branching pour tests E2E |
| Cache / rate-limit | **Upstash Redis free** | 10K cmd/jour |
| Storage | **Cloudflare R2 free** | 0 frais d'egress |
| Queue V0 | **Postgres-based custom + Vercel Cron** (~150 lignes) | Gratuit, idempotent, testable |
| Queue scale | Inngest (migration > 100K runs/mois) | DX premium quand on peut payer |
| Observabilité | **Sentry free + PostHog Cloud EU free + BetterStack free** | RGPD, tous EU |
| Hébergement | **Vercel Pro $20/mo** (mono-app) | Edge EU, preview deployments |
| Email | **Brevo** (transac + marketing) | Maîtrisé, EU |
| Paiement | **Stripe + Stripe Tax** | TVA UE auto |
| LLMs tracking | **APIs natives** OpenAI / Anthropic / Mistral / Perplexity / Google | Fidélité au browse/search natif (pas OpenRouter) |
| LLM scoring | **Anthropic Claude Haiku 4.5** | JSON mode + cheap |
| Tests | **Vitest** unit/integration + **Playwright** E2E (7 flows) + **MSW** + cassettes | Pas d'appel LLM réel en test |
| CI | **GitHub Actions** | Standard |

Architecture détaillée : `geo-project/03-architecture-technique.md`.

### Anti-décisions (déjà refusées, ne pas re-proposer)

- ❌ Turborepo / monorepo multi-apps
- ❌ Framer pour le marketing (V0)
- ❌ Subdomain `app.mamie-geo.fr` (V0 = path-based `/app/*`)
- ❌ Prisma (on a tranché Drizzle)
- ❌ Clerk / Supabase Auth (on a tranché Better Auth)
- ❌ Inngest en V0 (Postgres-queue jusqu'à 100K runs/mois)
- ❌ OpenRouter pour le tracking
- ❌ Plan freemium permanent dans le SaaS

---

## 3. Structure du repo

Mono-repo unique. Une seule app Next.js, un seul déploiement, un seul
domaine `mamie-geo.fr`. `mamie-seo.fr` redirige 301 vers `mamie-geo.fr`.

```
mamie-geo/
├── geo-project/                    # docs markdown 00-10 + README
├── CLAUDE.md                       # ce fichier
├── README.md
├── package.json
├── next.config.ts                  # 301 mamie-seo.fr → mamie-geo.fr
├── drizzle.config.ts
├── playwright.config.ts
├── vitest.config.ts
├── .env.example
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (marketing)/            # / /pricing /about /outils/...
│   │   ├── (blog)/                 # /blog /blog/[slug]
│   │   ├── (app)/                  # /app/dashboard /app/prompts ... (auth)
│   │   ├── api/                    # auth, webhooks Stripe, cron dispatch
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   │
│   ├── lib/                        # logique métier
│   │   ├── llm/                    # 1 fichier par provider (openai.ts, anthropic.ts...)
│   │   ├── citation/               # détection regex + scoring LLM
│   │   ├── auth/                   # config Better Auth
│   │   ├── stripe/
│   │   └── queue/                  # Postgres queue helpers
│   │
│   ├── db/
│   │   ├── schema.ts               # Drizzle schema unique
│   │   ├── client.ts
│   │   └── migrations/             # SQL versionné
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn customisé avec design tokens
│   │   ├── marketing/
│   │   ├── blog/
│   │   └── app/
│   │
│   ├── workers/                    # exécution des jobs (1 prompt × 1 LLM = 1 job)
│   │   ├── execute-prompt.ts
│   │   ├── score-response.ts
│   │   └── send-weekly-email.ts
│   │
│   └── content/                    # blog en MDX
│
├── public/
└── tests/
    ├── e2e/                        # Playwright
    └── fixtures/                   # cassettes JSON LLM
```

Source : `geo-project/03-architecture-technique.md` § Structure du repo.

---

## 4. Conventions de code

### Naming

- `camelCase` : variables, fonctions, méthodes, propriétés
- `PascalCase` : composants React, types, classes, enums
- `kebab-case` : noms de fichiers (`my-component.tsx`, `score-response.ts`)
- `SCREAMING_SNAKE_CASE` : constantes globales et env vars
- Routes Next.js : `kebab-case` côté URL (`/outils/test-visibilite-ia`)

### TypeScript

- `strict: true` partout, `noUncheckedIndexedAccess: true`
- **Jamais `any`** sans commentaire `// any: <raison>` à côté
- Erreurs explicites : `throw new Error("contexte précis: valeur=...")` ou Result types pour les flux où l'erreur est attendue
- `zod` schemas réutilisés front + back, exportés depuis `src/lib/<domaine>/schemas.ts`
- Pas de magic numbers : constantes nommées en haut de fichier ou dans `src/lib/constants.ts`

### Drizzle / DB

- **Migrations versionnées** uniquement (`drizzle-kit generate` puis revue manuelle du SQL)
- **Jamais `db push` en prod** — `db push` autorisé uniquement en local sur branche Neon dev
- Toute évolution de schéma → entrée dans `geo-project/03` (table modifiée) **et** dans `geo-project/09` (décision si non triviale)
- Index obligatoire sur tout FK et tout champ utilisé dans `WHERE`/`ORDER BY` côté workers
- `ON DELETE CASCADE` partout où la suppression cascade fait sens métier (workspace → brands → prompts → runs)

### Tests

- **Vitest** : `foo.ts` à côté de `foo.test.ts` (colocation), pas de dossier `__tests__/`
- **Playwright** : seulement sur les **7 flows business-critiques** listés dans `geo-project/03` § Stratégie de test
- **LLMs jamais appelés en test** — règle dure. Trois patterns autorisés :
  1. MSW + cassettes JSON dans `tests/fixtures/llm/{provider}/{prompt-id}.json` (script `pnpm test:record:llm` à créer en Sprint 1)
  2. `FakeLLMClient` injecté via DI (interface `LLMClient` dans `src/lib/llm/types.ts`)
  3. Snapshots de scoring sur réponses fixes
- Tests intégration Drizzle : branche Neon dédiée par PR, rollback transactionnel entre tests
- CI bloquante : pas de merge si rouge

### Dev local

- **Pas de Docker Compose.** Chaque dev pointe sur une branche Neon dédiée `dev-{username}`, gratuite et instantanée.
- `.env.local` contient la `DATABASE_URL` de la branche perso ; jamais commité.
- Migrations appliquées via `pnpm db:migrate` (Drizzle), `db push` interdit en dehors d'un test ponctuel sur sa propre branche.

### Queue Postgres — règle d'idempotence

- Toute insertion dans `queue_jobs` doit fournir une `idempotency_key TEXT UNIQUE NOT NULL`
- Format pour les jobs LLM : `{prompt_id}:{llm}:{scheduled_date_iso}` (ex: `8fa1...:claude:2026-05-06`)
- `INSERT ... ON CONFLICT (idempotency_key) DO NOTHING` côté `enqueue` — un dispatch redémarré ou un cron qui se déclenche deux fois ne crée pas de doublon

### Commits & PR

- **Conventional Commits** : `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`
- **Trunk-based** : pas de feature branches longues, PR < 400 lignes, merge daily
- **Toute modif qui invalide une info dans `geo-project/` met à jour le doc concerné dans le même PR** (cf. § 6 ci-dessous)
- Décisions techniques non triviales → nouvelle entrée dans `geo-project/09-decisions-journal.md`

### Style général

- Pas de commentaire qui paraphrase le code. Commentaires uniquement pour le **pourquoi non-évident** (workaround, invariant, contrainte cachée)
- JSDoc sur les fonctions exportées non-triviales (signature publique d'un module)
- Pas d'over-engineering : 3 lignes répétées valent mieux qu'une abstraction prématurée
- Pas de fallback / validation pour des cas qui ne peuvent pas arriver à l'intérieur du système. Validation aux frontières (input user, webhook, réponse LLM) uniquement

---

## 5. Où chercher quoi dans `geo-project/`

| Question | Doc |
|---|---|
| « Pourquoi on fait ce projet ? Qui est la cible ? » | `00-vision-strategie.md` |
| « Qui sont les concurrents ? Quels gaps ? » | `01-marche-concurrence.md` |
| « Quelle feature pour quel V ? User stories ? » | `02-produit-roadmap.md` |
| « Quelle stack ? Quel schéma BDD ? Quels coûts LLM ? » | `03-architecture-technique.md` ⭐ |
| « Quel pricing ? Quelles marges ? Projections ? » | `04-pricing-business-model.md` |
| « Comment on acquiert ? Quels canaux ? Templates ? » | `05-go-to-market.md` |
| « Quelle stratégie contenu / SEO / lead magnets ? » | `06-activation-mamie-seo.md` |
| « Quels risques ? Quelles conditions d'arrêt ? » | `07-risques-mitigations.md` |
| « Timeline mois par mois ? Sprint 0 checklist ? » | `08-roadmap-execution.md` |
| « Pourquoi on a pris cette décision ? KPI mensuels ? » | `09-decisions-journal.md` ⭐ |
| « Direction artistique ? Patterns obligatoires ? » | `10-design-direction.md` |

---

## 6. Règles de maintenance documentaire (importante)

**La doc précède et survit au code.** Si on change un fait qui apparaît
dans un doc, on met à jour le doc dans le **même PR** que le code, sinon
la doc devient un cimetière.

| Modification | Doc à updater |
|---|---|
| Schéma BDD modifié | `03` (section schéma) + `09` si non trivial |
| Nouvelle décision tech / nouvelle dépendance | `09` (entrée datée + justification) |
| Feature ajoutée / déplacée d'un V à un autre | `02` (roadmap) |
| Coût ou tarif modifié | `04` (et éventuellement `03` § coûts) |
| URL / endpoint / route changé | `03` + `06` si SEO impactée |
| Risque qui se concrétise / s'estompe | `07` |
| Convention de code modifiée | **ce CLAUDE.md** |
| Mise à jour KPI mensuel | `09` (section "Suivi KPI mensuel") |
| Snapshot concurrence | `09` (section "Snapshots veille concurrentielle") |

**Format des entrées de décision** dans `09` (à respecter) :

```
### YYYY-MM-DD — Titre court
**Contexte** :
**Options considérées** : A / B / C
**Choix** :
**Justification** :
**Conséquences attendues** :
**À revisiter** : (date ou condition)
```

---

## 7. Communication avec Max

- Français, ton direct, pas de flagornerie
- Pas yes-man : si une demande paraît bancale, dire pourquoi avant d'implémenter
- Poser une question plutôt qu'assumer si quelque chose est flou
- Signaler explicitement quand une décision est prise faute de mieux (Max peut la rejeter)
- Résumé de fin de session : ce qui est fait / ce qui reste / questions ouvertes

---

## 8. Règles permanentes (rappel)

- Lire le doc concerné AVANT de coder un domaine
- Étendre un fichier existant plutôt que d'en créer un nouveau
- Ne pas ajouter de dépendance npm sans la justifier (entrée dans `09`)
- Pas de mock LLM "pour aller plus vite" sans plan de retour
- Pas de commit géant qui touche 30 fichiers
- Pas d'improvisation sur la stack — toute remise en cause passe par `09`
- Ne pas re-proposer Turborepo, Framer, subdomain `app.`, Prisma, Clerk, Inngest-V0, OpenRouter (cf. § 2 anti-décisions)

---

## 9. État du projet (snapshot)

- **Phase** : Sprint 0 — setup repo
- **Date snapshot** : 2026-05-05
- **Prochaine étape** : Phase 3 du plan session 2 — tâches 1 à 18 du plan Sprint 0
- **Décisions Sprint 0 verrouillées** (session 2) :
  - Direction artistique : A — éditorial chaud
  - Polices V0 : Newsreader (titres) + Geist (corps) + Geist Mono (data)
  - Template marketing : from scratch
  - Naming + domaine : Mamie GEO sur `mamie-geo.fr`
  - Magic-link Better Auth : SMTP Brevo (transport nodemailer)
  - Le Chat dès Starter : oui sans condition
  - Trial 14j sans carte + Stripe Tax : oui aux deux dès J0
  - Statut juridique : EI continue, bascule SAS/EURL planifiée mois 6-9 (plafond micro ~77 700 €/an)
  - Hard-cap LLM : 200% du quota théorique → block + email + alerte interne
  - Redirect mamie-seo.fr : DNS-level Vercel Domains + ligne défensive `next.config.ts`

À mettre à jour à chaque évolution majeure (changement de phase, sprint terminé, gate franchie).
