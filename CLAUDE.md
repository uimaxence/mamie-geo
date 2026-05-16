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

- Enterprise sur devis.

Détail : `geo-project/00-vision-strategie.md` et `01-marche-concurrence.md`.

---

## 2. Stack verrouillée (V0)

Décisions actées le 2026-05-05 dans `geo-project/09-decisions-journal.md`.
**Ne pas changer sans nouvelle entrée dans 09 + accord Max.**

| Domaine            | Choix                                                                            | Pourquoi (résumé)                                  |
| ------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| Framework          | **Next.js 15 App Router**                                                        | Edge EU, SSR, écosystème                           |
| Langage            | **TypeScript strict**                                                            | Pas de `any` non justifié                          |
| Styling            | **Tailwind v4 + shadcn customisé**                                               | Tokens du doc 10                                   |
| Auth               | **Better Auth**                                                                  | Free, open source, Postgres, magic-link            |
| ORM                | **Drizzle**                                                                      | SQL-first, edge-compatible, migrations versionnées |
| DB                 | **Neon EU Frankfurt**                                                            | Free tier + branching pour tests E2E               |
| Cache / rate-limit | **Upstash Redis free**                                                           | 10K cmd/jour                                       |
| Storage            | **Cloudflare R2 free**                                                           | 0 frais d'egress                                   |
| Queue V0           | **Postgres-based custom + Vercel Cron** (~150 lignes)                            | Gratuit, idempotent, testable                      |
| Queue scale        | Inngest (migration > 100K runs/mois)                                             | DX premium quand on peut payer                     |
| Observabilité      | **Sentry free + PostHog Cloud EU free + BetterStack free**                       | RGPD, tous EU                                      |
| Hébergement        | **Vercel Pro $20/mo** (mono-app)                                                 | Edge EU, preview deployments                       |
| Email              | **Brevo** (transac + marketing)                                                  | Maîtrisé, EU                                       |
| Paiement           | **Stripe + Stripe Tax**                                                          | TVA UE auto                                        |
| LLMs tracking      | **APIs natives** OpenAI / Anthropic / Mistral / Perplexity / Google              | Fidélité au browse/search natif (pas OpenRouter)   |
| Modèle tracking V0 | **Anthropic Claude Haiku 4.5** (`claude-haiku-4-5-20251001`)                     | Phase A — cheap, bascule Sonnet 4.6 en Phase C     |
| LLM scoring        | **Anthropic Claude Haiku 4.5**                                                   | JSON mode + cheap                                  |
| Tests              | **Vitest** unit/integration + **Playwright** E2E (7 flows) + **MSW** + cassettes | Pas d'appel LLM réel en test                       |
| CI                 | **GitHub Actions**                                                               | Standard                                           |

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

| Question                                               | Doc                               |
| ------------------------------------------------------ | --------------------------------- |
| « Pourquoi on fait ce projet ? Qui est la cible ? »    | `00-vision-strategie.md`          |
| « Qui sont les concurrents ? Quels gaps ? »            | `01-marche-concurrence.md`        |
| « Quelle feature pour quel V ? User stories ? »        | `02-produit-roadmap.md`           |
| « Quelle stack ? Quel schéma BDD ? Quels coûts LLM ? » | `03-architecture-technique.md` ⭐ |
| « Quel pricing ? Quelles marges ? Projections ? »      | `04-pricing-business-model.md`    |
| « Comment on acquiert ? Quels canaux ? Templates ? »   | `05-go-to-market.md`              |
| « Quelle stratégie contenu / SEO / lead magnets ? »    | `06-activation-mamie-seo.md`      |
| « Quels risques ? Quelles conditions d'arrêt ? »       | `07-risques-mitigations.md`       |
| « Timeline mois par mois ? Sprint 0 checklist ? »      | `08-roadmap-execution.md`         |
| « Pourquoi on a pris cette décision ? KPI mensuels ? » | `09-decisions-journal.md` ⭐      |
| « Direction artistique ? Patterns obligatoires ? »     | `10-design-direction.md`          |

---

## 6. Règles de maintenance documentaire (importante)

**La doc précède et survit au code.** Si on change un fait qui apparaît
dans un doc, on met à jour le doc dans le **même PR** que le code, sinon
la doc devient un cimetière.

| Modification                                 | Doc à updater                                     |
| -------------------------------------------- | ------------------------------------------------- |
| Schéma BDD modifié                           | `03` (section schéma) + `09` si non trivial       |
| Nouvelle décision tech / nouvelle dépendance | `09` (entrée datée + justification)               |
| Feature ajoutée / déplacée d'un V à un autre | `02` (roadmap)                                    |
| Coût ou tarif modifié                        | `04` (et éventuellement `03` § coûts)             |
| URL / endpoint / route changé                | `03` + `06` si SEO impactée                       |
| Risque qui se concrétise / s'estompe         | `07`                                              |
| Convention de code modifiée                  | **ce CLAUDE.md**                                  |
| Mise à jour KPI mensuel                      | `09` (section "Suivi KPI mensuel")                |
| Snapshot concurrence                         | `09` (section "Snapshots veille concurrentielle") |

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

## 9. État du projet (snapshot — 2026-05-16)

> Mise à jour 2026-05-16 — PR « Sprint 3 audit technique site sans LLM » :
> nouvel outil `/outils/audit-technique` (lead magnet additionnel).
> Pipeline 30+ checks sans IA — SEO classique (~10) + GEO-specific
> (FAQPage JSON-LD, Article JSON-LD, llms.txt, E-E-A-T) + Open Graph +
> a11y + sécurité + mobile + Core Web Vitals via PageSpeed Insights API.
> Knowledge base recommandations rédigée à la main (~35 entrées, notre
> différenciateur qualitatif). Modèle teaser public + rapport complet
> par email Brevo. 177 tests verts.
>
> Précédentes : Sprint 2 blog content-driven (2026-05-16) + Stripe billing
> (2026-05-14) déjà en prod.

### Phase actuelle

**Phases A et B livrées. Phase C entamée (dual backend Brevo).**

Phasage acté le 2026-05-07 (cf. `09-decisions-journal.md` § 2026-05-07) :

- **Phase A — Moteur sur Haiku 4.5 cheap** ✅
- **Phase B — Design system + UI complète + marketing + blog SEO + onboarding + pages légales** ✅
- **Phase C — Multi-LLM + Stripe + send_weekly_email + bascule Haiku → Sonnet 4.6** ⏳ entamée

### Livré

**Pipeline produit** (Phase A) :

- `LLMClient` interface + provider Anthropic Claude Haiku 4.5 avec `web_search_20250305` tool
- Worker `execute_prompt` (cron quotidien à 06:00 UTC) → run.success en DB
- Détection regex + scoring qualitatif Haiku tool_use (sentiment, position, concurrents)
- Worker `recompute_metrics` inline qui upsert `citation_metrics_daily`
- Score visibilité formule V0 (positionWeight × sentimentWeight, 0-100)
- Idempotence queue Postgres + Vercel Cron (5 min dispatcher + 1×/jour scheduler)
- Coût moyen mesuré : ~$0,04 par run (tracking) + ~$0,003 par scoring (Haiku)

**UI complète** (Phase B) :

- 9 routes publiques statiques : `/`, `/pricing`, `/blog` + 3 articles, `/outils/test-visibilite-ia`, 4 pages `/legal/*`
- 8 routes app authentifiées : `/login`, `/app/onboarding` (wizard 3 étapes + suggestion IA), `/app/dashboard`, `/app/runs/[id]`, `/app/settings` (édition workspace name + brand aliases), `/app/prompts` (liste + CRUD + suggestion IA), `/app/prompts/[id]` (détail breakdown par LLM), `/app/competitors` (liste + CRUD). Quotas enforced par plan (cf. `src/lib/plans/quotas.ts`).
- Design system custom (Tailwind v4 + composants `src/components/ui/`) — direction Airbnb-like minimaliste actée le 2026-05-07, raffinée le 2026-05-11 (refs designme.agency + taap.it). PR 2026-05-12 ajoute 11 primitifs Radix/shadcn (Dialog, DropdownMenu, Tabs, Switch, Tooltip, Sheet, Skeleton, Banner, EmptyState, Pagination, Toaster sonner), 2 wrappers Recharts (LineChart, BarChartHorizontal) et la sidebar app. Polish dashboard 2026-05-12 (refs screens Max) : `Stat` enrichi (icône pastel + delta arrow vs J-7), `SegmentedControl` (time-range picker), `AreaChart` gradient mono-série, `BreakdownBars` (vertical bars + légende + liste valeurs). Cf. doc 10 § « Patterns dashboard ».
- 49 tests unit Vitest verts, 13 tests E2E Playwright sur les flows publics
- Blog MDX **content-driven** (cf. doc 09 § 2026-05-16) : articles dans `src/content/blog/*.mdx` avec frontmatter YAML, scannés par `src/lib/blog/registry.ts`. Plugins remark-gfm + rehype-slug + rehype-autolink-headings. Composant `<BlogFAQ>` qui auto-injecte JSON-LD FAQPage (boost GEO majeur). 3 articles migrés : « Qu'est-ce que le GEO », « Mamie GEO vs Profound », « État visibilité IA France 2026 ». OG image dynamique par article (`next/og`), JSON-LD Article + BreadcrumbList, `<ArticleCTA>` automatique selon `frontmatter.cta`, `<RelatedArticles>` (3 articles liés via catégorie + keywords overlap), `<TOC>` sticky desktop, `<ReadingProgress>` bar. Sitemap.ts + robots.ts auto-générés.
- Lead magnet `/outils/test-visibilite-ia` avec form capture → email Brevo

**Auth + infra** (Phase B finale, Phase C partielle) :

- Better Auth magic-link branché via Brevo (dual backend : **REST API** prioritaire, SMTP fallback) — bascule REST API actée le 2026-05-12 pour bypass IP whitelist Free plan
- DB Neon EU Frankfurt, 16 tables, schéma stable. Migration `0001_thick_husk` 2026-05-14 ajoute `"solo"` à l'enum `workspaces.plan`.
- Vercel preview accessible — login fonctionnel, dashboard accessible
- **Crons Vercel branchés en prod** (PR 2026-05-13) : `/api/cron/dispatch` (\*/5 min), `/api/cron/schedule-runs` (06:00 UTC quotidien), `/api/cron/schedule-weekly-emails` (lundi 09:00 UTC), `/api/cron/expire-past-due` (03:00 UTC quotidien, ajouté 2026-05-14). Endpoints supportent GET et POST avec auth `Bearer CRON_SECRET`. Cause racine du blocker antérieur identifiée : Vercel Cron envoie **GET**, les routes n'exposaient que **POST** (cf. doc 09 § 2026-05-13). Instrumentation JSON via `logCronEvent()` + endpoint debug `GET /api/cron/dispatch?inspect=1` qui dump l'état queue + présence des env vars.
- **Worker `send_weekly_email` actif** : weekly recap envoyé lundi 9h UTC aux workspaces avec ≥ 1 run.success dans les 7 derniers jours. Template HTML inline + text fallback dans `src/lib/email/templates/weekly-recap.ts`. Trial nurture (J+3 / J+10) reporté (mode trial automatique supprimé 2026-05-14 — voir doc 09).

**Stripe billing** (PR 2026-05-14) :

- SDK `stripe@22.x` + 4 routes API : `POST /api/checkout`, `POST /api/portal`, `POST /api/webhooks/stripe` (signature verify + idempotence via `subscription_events.stripeEventId UNIQUE`), `GET/POST /api/cron/expire-past-due` (passe past_due → expired après J+7).
- Webhook handlers idempotents pour `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`. Source de vérité du plan = `subscription.items[0].price.id` mappé via `STRIPE_PRICE_*` env vars.
- UI billing dans `/app/settings` (section dédiée) : plan actuel + prochaine facturation + bouton "Gérer mon abonnement" (portal). Si plan inactif : grille Solo/Starter/Pro avec boutons checkout.
- `<UpgradeBanner>` server component injecté dans `(with-nav)/layout.tsx` — affiche un message contextuel quand plan ∈ trialing/past_due/expired/canceled.
- Plan **Solo 9,99 €** ajouté à `quotasFor()` avec champ `cadence: "daily" | "weekly"`. Le scheduler `/api/cron/schedule-runs` filtre par cadence (weekly = lundi uniquement). Agency reste dans l'enum DB mais retiré de `/pricing` public.
- Templates email transactionnels : `welcome-paid.ts` (post-checkout) + `payment-failed.ts` (post payment_failed). Réutilisent le pattern HTML inline + text fallback de `weekly-recap.ts`.

### Reste à faire

**Court terme** :

1. **DNS Brevo** finalisé : DKIM/SPF/DMARC sur `mamie-geo.fr` pour pouvoir envoyer depuis `hello@mamie-geo.fr` validé.
2. **Setup Stripe Dashboard prod** : créer products + prices LIVE, configurer webhook URL `https://mamie-geo.fr/api/webhooks/stripe`, activer Stripe Tax, configurer Customer Portal (autoriser switch entre Solo/Starter/Pro + cancellation).

**Phase C** (à entamer) :

3. **Hard-cap enforcement worker** : `checkQuotaOrBlock()` dans `execute-prompt.ts` + email 60/100/200 %. PR dédiée.
4. Providers OpenAI / Mistral / Perplexity / Google (1 PR par provider, slot derrière l'interface `LLMClient` existante)
5. Bascule tracking par plan (Starter reste Haiku, Pro en Sonnet 4.6 quand prêt)
6. **Drip d'éducation post-signup** (remplace ancien trial nurture J+3/J+10 — plus de trial auto en V0)
7. ~~Stripe checkout + customer portal + webhook~~ — livré 2026-05-14 (128 tests verts, idempotence via `subscription_events.stripeEventId UNIQUE`)
8. ~~Plan Solo + cadence per-plan + retrait Agency public~~ — livré 2026-05-14
9. ~~Charts évolution dashboard~~ — livré 2026-05-12
10. ~~Worker `send_weekly_email`~~ — livré 2026-05-13
11. ~~Cron prod stuck~~ — résolu 2026-05-13
12. ~~Pages CRUD app + Settings édition~~ — livré 2026-05-13

### Décisions Sprint 0 verrouillées (rappel)

- Direction artistique : Pivot 2026-05-07 — Airbnb-like minimaliste. Blanc + nuances de gris, accent terracotta `#C5532E` réservé aux CTAs, pas de fond coloré, pas d'italique, une seule police.
- Police unique V0 : **Inter** via `next/font/google`. Geist + Newsreader + Geist Mono retirés.
- Naming + domaine : Mamie GEO sur `mamie-geo.fr`. Redirect 301 défensif `mamie-seo.fr` → `mamie-geo.fr`.
- Magic-link Better Auth : Brevo, **REST API** (acté 2026-05-12 — SMTP était bloqué par IP whitelist Free plan Brevo).
- Le Chat dès Starter : oui sans condition.
- ~~Trial 14j sans carte~~ + Stripe Tax : pivot 2026-05-14 → **pas de trial automatique** + garantie remboursement 14 jours (refund manuel). Stripe Tax conservé.
- Statut juridique : EI continue, bascule SAS/EURL planifiée mois 6-9 (plafond micro ~77 700 €/an).
- Hard-cap LLM : 200 % du quota théorique → block + email + alerte interne.

À mettre à jour à chaque évolution majeure (changement de phase, sprint terminé, gate franchie).
