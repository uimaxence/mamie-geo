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
PME marketing, agences SEO/marketing FR.

Pricing public : **Solo 9,99 € / Starter 49 € / Pro 149 €**. Plan Agency
(300 prompts) retiré de la grille publique 2026-05-14, reste sur devis.
Enterprise sur devis. Pas de trial automatique — garantie remboursement
14 jours.

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

## 9. État du projet (snapshot — 2026-06-09)

> Mise à jour 2026-06-10 (fin de journée) — Ranking suite (cf. doc 09) :
> **hint de fiabilité auto-extinguible** sur l'onglet Classement (ligne
> discrète Info tant que `dataDays < RANKING_RELIABLE_AFTER_DAYS` = 14,
> piloté par la donnée, disparaît seul), **étape 3 livrée** (`position`
> par concurrent dans le tool schema scoring, parsing lénient pour les
> anciens payloads — la donnée s'accumule, prééminence branchable plus
> tard), **bouton « Suivre »** sur les marques détectées du classement
> (réutilise la server action `createCompetitor`, event
> `ranking_discovered_tracked`).
>
> Précédente (2026-06-10, suite) — Ranking concurrentiel étapes 1+2
> livrées (cf. doc 09 § 2026-06-10 ranking) : onglet **« Classement »**
> sur `/app/citations` (`?tab=ranking`) — leaderboard 30 j toi +
> concurrents trackés + marques détectées non suivies (cap 5), filtre
> par LLM, delta de rang vs J-7. **Zéro migration** : découverte à
> l'implémentation, `citation_metrics_daily.competitors_data`
> historisait déjà les mentions concurrents par jour × LLM depuis la
> Phase A — le ranking ne fait que lire cette colonne. `computeRanking()`
> pure dans `src/lib/competitors/ranking.ts` (7 tests) +
> `getRankingData()` dans queries.ts. Events `ranking_viewed` /
> `ranking_scope_changed`. Étapes 3 (position par concurrent) et 4
> (scoring systématique, ~$0,003/run skippé) restent à trancher ;
> chart évolution du rang reporté.
>
> Précédente (2026-06-10) — Refonte page Conseils + analyse ranking :
>
> **`/app/conseils` refondu en plan d'action priorisé** (cf. doc 09 §
> 2026-06-10) : la grille 2×2 par axe (colonnes 1/3/5/1 → trous blancs)
> devient 2 sections pleine largeur triées par impact (« Commence ici »
> 6 leviers fort impact / « Ensuite » 4 compléments), numérotées 01-10,
> axe conservé en badge par levier + légende chips dans l'intro. Nouvel
> export `GEO_TIPS_BY_PRIORITY` dans `src/lib/geo-advice.ts`. Doc 10 §
> Layout app amendé : regroupement thématique seulement si les groupes
> sont équilibrés, sinon liste priorisée.
>
> **Analyse feature ranking concurrentiel** ajoutée dans doc 02 §
> « Ranking concurrentiel — analyse de faisabilité » : étapes 1-3
> (leaderboard fenêtre, historisation `competitor_metrics_daily`,
> position par concurrent) à coût LLM ≈ 0 car `parsedBrands.scoring`
> capture déjà les concurrents ; étape 4 (scoring systématique, lever
> le skip regex) à ~$0,003/run skippé, à trancher.
>
> **Diagnostic données concurrents vides** (`/app/citations`) : pas un
> bug — vérifié en DB, 60/61 runs mamie-vege skippés par le
> pre-screening regex (aucune cible trackée mentionnée) et le seul run
> scoré ne cite pas les concurrents trackés. Les « — » = zéro citation
> réelle. UX à améliorer (empty state explicite) + étape 4 du ranking
> adresserait la découverte des marques citées à la place.
>
> Précédente (2026-06-09 soir) — Sweep cohérence UX/UI issu d'un audit
> global du site (cf. doc 09 § 2026-06-09 sweep cohérence + doc 10 §
> Layout app) :
>
> **`<PageContainer>` désormais appliqué à 100 % des pages app** :
> nouvelle largeur `detail` (`max-w-5xl`) pour les pages détail d'entité.
> `dashboard` → `default`, `audits/[id]` / `prompts/[id]` / `runs/[id]`
> → `detail` (fini les paddings hardcodés et les `<main>` imbriqués —
> le layout `(with-nav)` fournit déjà le `<main>`).
>
> **Tables responsive** : `/app/prompts` et la table concurrents de
> `/app/citations` masquent leurs colonnes secondaires sous `md`
> (`hidden md:table-cell`) et n'appliquent leur `min-w` qu'à partir de
> `md` → plus de scroll horizontal forcé en portrait mobile. Convention
> documentée dans doc 10.
>
> **Divers** : nav marketing 100 % FR (« Fonctionnalités » remplace
> « Features » dans header/burger/footer), badge `EntityTypeBadge`
> « Vous » → « Toi » (tutoiement partout), « Enqueue en cours… » →
> « Lancement… », focus rings ajoutés sur les boutons icône du wizard
> onboarding, dialog suppression de compte en liste à puces scannable.
> Écartés après vérification : « contraste gray-400 sur fond noir »
> (faux positif, ~8:1 AAA), confirmation d'export CSV, toasts de
> pagination (over-engineering).
>
> Précédente (2026-06-09) — Refonte UI rapport d'audit + radius global
> resserré (cf. doc 09 § 2026-06-09 refonte UI audit)
>
> **Border-radius global resserré** : tokens `--radius-*` dans
> `globals.css` passent de `6/10/16/20` à `4/6/8/12` (pill inchangé).
> Touche toute l'app (cards xl 20→12, inputs md 10→6, etc.). Boutons
> restent `pill`. Rendu plus net/technique (Linear/Vercel).
>
> **3 primitifs de visualisation de score** dans `src/components/ui/`
> (exportés par l'index, réutilisables dashboard) : `<ScoreRing>`
> (anneau SVG, arc animé 0→valeur au montage, client), `<SegmentBar>`
> (barre proportionnelle segmentée par sévérité, server), `<ScoreBar>`
> (sous-score en barre + pastille colorée, server). Couleur via
> `scoreColor()` centralisé dans `src/lib/audit/score.ts` (≥80 vert /
> ≥60 ambre / <60 rouge), qui remplace 3 copies dupliquées (détail,
> liste, comparaison).
>
> **`/app/audits/[id]`** : header refait — ScoreRing 128px + URL/méta
> + pills d'issues colorées empilées + SegmentBar + 4 ScoreBar (au lieu
> du gros chiffre nu + 4 cards « chiffre nu »). Liste de checks
> (`ChecksBySeverity`) inchangée. **`/app/audits`** liste : chiffre de
> score remplacé par un mini ScoreRing 52px par ligne.
>
> Précédente (2026-06-08 nuit) — Refonte funnel conversion : picker
> post-onboarding + sidebar Subscribe + trial 14j carte requise
>
> **Funnel actif vs banner passif** (cf. doc 09 § 2026-06-08 refonte
> funnel) : le user post-onboarding voit désormais le `<PlanPickerModal>`
> (3 cards Solo/Starter/Pro, toggle Annuel/Mensuel avec annuel
> pré-sélectionné + badge "Save 20 %", CTA "Démarrer mon essai 14
> jours") au lieu de juste un `<UpgradeBanner>` ignorable. 3 variants :
> "default" (post-onboarding ou via sidebar), "urgent" (J-2 avant fin
> de trial, bandeau orange + countdown), "expired" (post-expiration, X
> retiré, lien "plus tard 24h" seul). Dismiss en sessionStorage (1×/
> session) ou localStorage TTL 24h (variant expired).
>
> **Sidebar Subscribe card** : nouvelle card en bas de la sidebar app
> (entre nav et UserMenu), pattern Vercel/Linear/Waalaxy. 4 variants
> selon plan : "default" (trialing sans carte, bleu brand), "trial"
> (trialing avec carte > J+3, sobre), "urgent" (trial ≤ J+3, warning),
> "expired" (error). Clic dispatch un CustomEvent
> `mamie:open-plan-picker` que le trigger écoute. S'efface dès que
> plan ∈ {solo, starter, pro, agency, enterprise}.
>
> **Trial 14j avec carte requise** : lève la condition "quand capital
> disponible" de la décision 2026-05-14 — avec carte requise, pas de
> risque LLM (la carte est posée au checkout, l'user n'est pas facturé
> pendant 14 j, puis Stripe bascule auto en active sauf annulation).
> `openCheckout(plan, cycle, { trial })` ajoute `subscription_data: {
> trial_period_days: 14, trial_settings: { end_behavior: {
> missing_payment_method: "pause" } } }` + `payment_method_collection:
> "always"` pour forcer la collecte de carte. `handleCheckoutCompleted`
> détecte `subscription.status === "trialing"` et garde le workspace
> en plan="trialing" avec `trialEndsAt` rempli (table workspaces
> colonne déjà existante depuis Sprint 0, non utilisée jusqu'ici).
> `handleSubscriptionUpdated` détecte la transition trial → active et
> fire l'event PostHog `trial_converted_paid`. Nouveau handler
> `handleTrialWillEnd` câblé sur `customer.subscription.trial_will_end`
> (Stripe envoie 3 j avant la fin) : capture event PostHog +
> envoi email J-3.
>
> **Stripe Prices annuels** : `priceIdForPlan(plan, cycle)` supporte
> `cycle="annual"` via 3 nouvelles env vars optionnelles
> (`STRIPE_PRICE_SOLO_ANNUAL`, `STRIPE_PRICE_STARTER_ANNUAL`,
> `STRIPE_PRICE_PRO_ANNUAL`). Fallback gracieux sur le mensuel si
> l'annuel manque (avec console.warn). Helper `annualBillingAvailable()`
> renvoie true uniquement si les 3 sont configurés.
> `planFromPriceId(priceId)` renvoie désormais `{ plan, cycle }` au
> lieu de juste `plan` — 3 call sites webhook handlers mis à jour pour
> destructurer `match.plan`. Setup manuel restant : créer les 3 Prices
> dans Stripe Dashboard (calcul : monthlyEur × 12 × 0,8 → 95,90 / 470 /
> 1 430 € HT/an) et ajouter les env vars en prod + local.
>
> **Emails de relance trial** : 2 templates `trial-reminder.ts`
> (variants J-4 = "Plus que 4 jours d'essai" + J-1 = "Demain ton
> abonnement démarre") + 1 template `trial-expired.ts` envoyé
> immédiatement depuis `handleSubscriptionDeleted` quand le trial est
> annulé. Pattern HTML inline + text fallback existant
> ([welcome-paid.ts](src/lib/email/templates/welcome-paid.ts)) à
> recopier. Nouveau cron `/api/cron/trial-emails` (08:00 UTC daily,
> ajouté à vercel.json) scanne les workspaces en trial avec
> `trialEndsAt` proche, calcule daysToEnd, idempotence via events
> kind=`trial_email_sent` payload.template + capture event PostHog
> `trial_email_sent`.
>
> **Nouveaux events PostHog** (au-dessus des ~40 captés au commit
> e85b017) : `plan_picker_opened` (trigger, variant, trial_days_left,
> plan), `plan_picker_skipped` (variant, reason), `plan_picker_billing_
> cycle_toggled` (from, to, variant), `plan_picker_trial_started` (plan,
> billing_cycle, trigger), `sidebar_subscribe_card_clicked` (plan,
> variant), `trial_started` (plan, billing_cycle, trial_ends_at),
> `trial_will_end_3d` (depuis webhook), `trial_converted_paid` (plan,
> billing_cycle, mrr), `trial_canceled` (was_in_trial=true depuis
> webhook), `trial_email_sent` (template, days_to_end).
>
> Précédente (2026-06-08 soir) — Instrumentation PostHog exhaustive
> avant trafic
>
> **Couverture analytics complète** (cf. doc 09 § 2026-06-08
> Instrumentation PostHog) : sur la base du wizard initial (commit
> e66dd07, 15 events business), on a ajouté autocapture + pageviews +
> session replay (masquage PII via `input[type=email|password]` +
> convention `data-private`) + `person_profiles: "always"` pour merger
> l'anonyme marketing au signup. Identify enrichi avec `plan, role,
> workspace_id, brand_count, last_seen_plan` (set) + `signup_at` (setOnce)
> + Groups Analytics workspace (`name, plan, slug, brand_count,
> prompt_count, created_at, mrr`). Helpers serveur (`captureServerEvent`,
> `identifyServerUser`, `groupServer`, `isFeatureEnabled`) standardisent
> les sites de capture via `flush()` au lieu de `shutdown()` (~3× plus
> rapide warm Vercel). ~25 events business ajoutés couvrant marketing
> (pricing CTA, FAQ expand, blog scroll depth/CTA/related), app CRUD
> (prompts/competitors/audits create/update/delete/active_toggled), CSV
> exports, dashboard (viewed, time_range, first_metric_viewed_at
> setOnce), audit detail/compare views, account RGPD (data_exported,
> deletion_requested), monétisation (quota_limit_hit sur tous les
> quotas, upgrade_banner viewed/clicked, billing_portal_opened,
> weekly_recap_email_sent + scaffold webhook Brevo
> `/api/webhooks/brevo` pour weekly_recap_email_clicked).
> Activation milestone `app_first_run_completed` fired idempotent
> dans le worker `execute-prompt` au passage du premier run.success
> par workspace (+ `first_run_at` setOnce sur le owner).
>
> **Bug fix Stripe webhook** : les events `subscription_activated/
> canceled/payment_failed` utilisaient `ws.id` comme `distinctId` →
> empêchait le merge personne PostHog. Corrigé via
> `findWorkspaceOwnerUserId()` (`ws.id` déplacé dans `groups.workspace`).
>
> **Privacy policy mise à jour** : `/legal/privacy/page.mdx` enrichi
> d'une section "Analytics produit" (PostHog EU sous-traitant + masquage
> PII + droit de retrait email). Opt-in implicite défensible
> juridiquement (ePrivacy compliant) sans banner cookie, approche
> Linear/Vercel.
>
> **Convention `data-private`** : appliquer aux éléments qui peuvent
> contenir de la PII non-couverte par les masques inputs par défaut
> (ex: l'input de confirmation `SUPPRIMER` dans la danger zone). Le
> session recording PostHog masque automatiquement (`***`) tout
> élément avec `data-private="true"`.
>
> Précédente (2026-06-08 matin) — 4 features V0+ poussées en un jour : CSV
> export, Pause/Resume, Funnel sources, Comparison pages
>
> **Comparison pages industrialisées** (cf. doc 02 § V0+ + doc 06 §
> Comparison pages) : 3 articles MDX publiés dans `/blog/` plutôt que
> sur le slug `/comparatifs/[slug]` d'origine (réutilisation du
> pipeline blog content-driven existant — FAQPage JSON-LD, related
> articles, sitemap auto). Articles : `mamie-geo-vs-peec-ai.mdx`
> (concurrent direct EU, funnel sources installé), `mamie-geo-vs-otterly
> .mdx` (add-on Semrush vs suite autonome), `mamie-geo-vs-rankscale.mdx`
> (credit-based agence vs flat-prompts PME/freelance). Ton honnête
> "lequel est pertinent pour qui" + disclaimers "selon leur site au
> [date]". Bascule vers route dédiée `/comparatifs/[slug]` reportée
> V1 si traction (cf. doc 06).
>
> **Funnel sources Apparition/Fréquence/Citation** (cf. doc 02 § Glossaire
> + doc 03 § citation_metrics_daily) : 3 colonnes ajoutées
> (`retrieved_count`, `retrievals_total`, `citations_count`, migration
> `0004_salty_molten_man`). Helper `src/lib/citation/source-match.ts`
> matche URLs vs `brand.domain + aliases` (12 tests, support www. +
> sous-domaines + filtrage aliases non-domaines). Worker recompute
> étendu via `aggregateSourcesFunnel` (6 tests). Dashboard : nouvelle
> section dédiée avec 3 cards Stat (Apparition % / Fréquence / Citation
> %) entre "Visibilité par LLM" et "10 derniers batches". CSV export
> `/api/export/metrics.csv` enrichi avec 6 colonnes (3 compteurs +
> 3 ratios dérivés). Pas de backfill rétro — les anciens runs
> restent à 0, les nouveaux alimentent les compteurs au fil de l'eau.
>
> **Pause/Resume projects** (cf. doc 02 § V0+) : nouvelle colonne
> `brands.paused_at TIMESTAMPTZ` + index partiel `idx_brands_active`
> (déjà documenté doc 03 § brands). Le scheduler filtre `isNull(brands.
> pausedAt)` dans les 2 variantes (cron quotidien + post-checkout).
> Server actions `pauseBrand` / `resumeBrand` dans
> `src/lib/brands/actions.ts` (auth + RBAC owner/admin). Toggle UI
> dans `/app/settings` section "Marque trackée" + badge "en pause"
> à côté du nom. Migration `0003_giant_jean_grey`.
>
> **CSV export** (gap V0 listé P0 mais code absent jusqu'ici) : 2
> endpoints `/api/export/runs.csv` (historique runs aplati, 1 ligne =
> 1 prompt × 1 LLM × 1 date avec colonnes scoring) et
> `/api/export/metrics.csv` (`citation_metrics_daily` aplati). Helper
> `src/lib/csv/index.ts` RFC 4180 + BOM UTF-8 pour compat Excel
> direct (5 tests). Auth session Better Auth + scope par membership
> workspace, query params optionnels `?from/to/brandId`, plage 90 j
> par défaut, cap 50 k lignes avec header `X-Export-Truncated`.
> Section "Exports CSV" ajoutée dans `/app/settings`, distincte de la
> danger zone RGPD (qui reste sur le JSON full export article 20).
>
> Précédente (2026-06-05) — Refonte DA carrousels persona « Mamie » + dual-DA acté
>
> **Carrousels LinkedIn DA refondue** : pivot du système Unified-like
> (acté la veille) vers la persona « Mamie » selon nouveau brief
> `geo-project/linkedindesign.md`. Palette chaude (crème `#FBF4E9` +
> sable + encre brune `#2E2620` + **terracotta `#DD6B45` signature**
> + miel `#F3B43F` + sauge + rose). Typo Fraunces (serif Bold/Black) +
> Hanken Grotesk (corps) + Caveat (manuscrit rare) chargées via
> `next/font/google` dans le admin layout UNIQUEMENT. Motif signature
> marguerite 6 pétales + surligneur miel. 5 thèmes de fond combinables
> pour rythmer les carrousels.
>
> **Bleu brand `#329CFF` préservé comme couleur primaire** : présent
> sur logo (sur fonds clairs), 1 accent typo par slide, dots
> pagination. Fil conducteur visuel entre les 2 DA.
>
> **Dual-DA volontaire** : app `(app)/*` + site marketing restent en
> direction Airbnb-like minimaliste (Inter unique, blanc + gris + bleu
> brand accent). **Aucun changement côté app.** Seuls les carrousels
> LinkedIn et visuels marketing externes (OG, blog covers V1+)
> utilisent la persona Mamie chaude. Cf. doc 09 § 2026-06-05.
>
> Précédente (2026-06-04) — Système design carousels LinkedIn « Unified » + crème chaude 3e ton
>
> **Carousels LinkedIn** : système design ancré sur la référence Unified™
> (vagues organiques + big bold typo + paper-note card + brand pill). 3
> nouveaux tokens `--color-cream*` (`#fff4d6` / `#fffbed` / `#fcd34d`)
> réservés aux **visuels externes uniquement** (carousels, OG, blog
> covers). L'app `(app)/*` reste en blanc + gris + bleu brand —
> direction Airbnb-like inchangée. Le `SeoVsGeoVisual` (post LinkedIn
> 2026-06-02) refait dans ce langage : fond crème, vagues bleu pâle,
> brand pill ink, slide number `01 / 01`, headline 88pt, paper-note
> card pour la table. 3 primitives co-localisées (`BrandPill`,
> `SlideNumber`, `WavesDecoration`) prêtes à être splittées dans
> `_primitives/` quand 3+ visuels les partagent. Cf. doc 09 §
> 2026-06-04.
>
> Précédente (2026-06-03) — Pivot brand color terracotta → bleu logo + admin visuels LinkedIn
>
> **Brand color sweep** : `--color-accent` (terracotta `#C5532E`) aliasé sur
> le bleu brand `#329CFF` (couleur du logo). Les classes `card-hover-warm`
> et `gradient-warm-panel` (login) gardent leur nom historique mais leurs
> valeurs basculent en dégradés bleu pâle. Le `--gradient-ai` (boutons
> actions IA) passe de `terracotta → purple → bleu` à `bleu → purple →
> pink`. 4 emails transac mis à jour. Doc 10 + doc 09 + CLAUDE.md alignés.
> Cf. doc 09 § 2026-06-03 pour le contexte complet.
>
> **Admin visuels LinkedIn** : nouvelle route protégée
> `/app/admin/visuals` (guard sur email Max) où sont rendus les visuels
> LinkedIn au format exact (1080×1350 portrait). Bouton "Télécharger
> PNG" via `html-to-image`. Premier visuel : tableau comparatif SEO vs
> GEO 6 lignes pour le post du 2026-06-02 sur l'article geo-vs-seo.
>
> Précédente (2026-05-22) — Phase C livrée + polish UI + pattern retiré
>
> **Phase C livrée** : tous les 5 providers LLM sont en place via la
> séquence PR1-5 multi-LLM. Le tracker peut désormais tourner sur
> Claude Haiku 4.5, Mistral Le Chat (`mistral-large-latest`), OpenAI
> ChatGPT (`gpt-4o-mini` + web_search Responses API), Google Gemini
> (`gemini-2.5-flash` + grounding Search), Perplexity (`sonar`, code
> prêt en attente de la clé). Source de vérité : `getConfiguredLLMs()`
> dans `src/lib/llm/index.ts` qui détecte automatiquement les
> providers configurés (env var présente + IMPLEMENTED_LLMS true). Le
> scheduler `/api/cron/schedule-runs` enqueue uniquement pour ces
> LLMs. Smoke tests live validés sur 4 providers (Mistral ~$0.02,
> OpenAI ~$0.01 avec 16 sources, Gemini ~$0.035 avec 14 sources).
>
> **PR6 KPI dashboard** : retrait du coût USD côté client (donnée
> technique sans valeur métier), agrégat tous-LLMs des 3 stats
> principales (au lieu de Claude only — bug d'héritage Phase A), 4e
> stat = nouveau KPI **Part de voix** (terme glossaire officiel,
> jamais calculé avant). Fonction pure `computePartDeVoix()` dans
> `src/lib/metrics/part-de-voix.ts` (8 tests).
>
> **AppTopBar horizontale (pattern Vercel)** : workspace pill +
> brand switcher + favicon en ligne en haut de l'app, sortis de la
> sidebar verticale qui ne contient plus que logo + nav + user menu.
> Composant `<BrandFavicon>` charge via Google s2 favicons avec
> fallback gracieux (carré ink + initiale).
>
> **Refonte tableau runs en batches dépliables** (PR1 multi-LLM) :
> 1 ligne = 1 batch (prompt × jour) au lieu de 1 ligne = 1 run.
> Évite l'illisibilité 50 lignes avec 5 LLMs. Composant
> `<BatchesTable>` réutilisable (dashboard + prompts/[id]), logique
> de grouping pure dans `src/lib/runs/batches-grouping.ts` (12 tests).
> Dots colorées par LLM dans l'ordre canonique + tooltip + dépliage
> sur mini-table détail par LLM.
>
> **Newsletter blog Brevo** : form d'inscription `<BlogNewsletterForm>`
> sur `/blog` + helpers `subscribeContactToBlogList` / 
> `sendNewArticleNewsletter` dans `src/lib/email.ts` (API Brevo
> /v3/contacts + /v3/emailCampaigns). Endpoint
> `/api/blog/notify-publish` protégé `CRON_SECRET` appelé par le
> launchd publication-mamie-geo.sh après chaque push d'article.
> Nécessite `BREVO_BLOG_LIST_ID` en env (sinon skip gracieux).
>
> **Refonte audit by severity** (2026-05-22) : `/app/audits/[id]`
> groupe désormais les checks par **sévérité** (critical / warning
> / info) au lieu de status (fail / warn / pass). Composant
> `<ChecksBySeverity>` à 3 sections dépliables fusionnées (trigger
> et items dans la MÊME card, pas de cassure visuelle). Critical
> + warning ouverts par défaut, info fermé (focus actionnable).
> Empty state vert « Aucun problème critique 🎉 » si 0 critical.
>
> **Bulle notif sidebar audits** : compteur de checks `critical+fail`
> non résolus sur le dernier audit par URL owned, affiché en
> `<Badge tone="error">` à droite de l'item "Audits techniques" si
> > 0. Calculé inline dans `loadSidebarData()`.
>
> **Background app gris #fafafa** (2026-05-22) : `body` utilise
> `var(--color-surface)` (#fafafa) au lieu de `--color-bg` (#fff).
> Cards / sidebar / topbar / tables restent en `bg-white` → émergent
> visuellement, sensation "premium SaaS" type Linear/Vercel.
>
> **Pattern signature retiré** (2026-05-22) : après 4 itérations
> (login xl primary, gradient bleu, ink coin 8%, primary full 5%),
> validé comme fausse bonne idée. Suppression radicale du composant
> `<PatternBlock>`, classes `bg-pattern*` du globals.css, asset
> `pattern.svg`, 3 usages site (hero, audit-teaser, login) + 2
> usages emails (welcome-paid bande top, weekly-recap pattern-band).
> L'identité visuelle s'appuie sur logo + couleur primary +
> CornerFrame + favicon.
>
> **Brand creation depuis BrandSwitcher** : `+ Ajouter une marque`
> dans la modal dropdown du switcher. Server action `createBrand`
> avec auth + rôle + quota check. Quota `brands` ajouté à
> `quotasFor()` : Solo/Starter 1, Pro 3, Agency 10, Enterprise ∞.
> Dialog UI à 2 modes (form ou CTA upgrade selon quota).
>
> **Em dashes `—` retirés** côté site (~130 fichiers touchés par
> sed `s/ —/,/g`). Placeholders `"—"` (no value) préservés.
>
> Précédente (2026-05-18) : Pattern signature blue ajouté en
> migration progressive du terracotta — **annulé 2026-05-22**, voir
> entrée doc 09 du 2026-05-22.
>
> Précédente : Sprint 6 PR B (2026-05-17) — app /app/audits Premium :
> - PR « charts vivants ». Côté audits : nouvelles tables DB
>   `technical_audits` (historise tous les audits app) et `audit_counters`
>   (compteur mensuel par workspace). Quotas par plan ajoutés :
>   Solo 5/mois (pas de comparaison), Starter 30 + 3 concurrents,
>   Pro 100 + 10, Agency illimité. 4 pages app : `/app/audits` (list groupée
>   par URL + delta), `/app/audits/new` (form pré-rempli sur brand.domain,
>   ~10s synchrone), `/app/audits/[id]` (rapport full avec recos
>   actionnables), `/app/audits/compare` (matrice URL × catégorie pour
>   Starter+). Worker `audit_workspace_url` (queue Postgres) + cron hebdo
>   `/api/cron/schedule-audits` (lundi 5h UTC) + email alerte
>   `audit-score-drop` (delta < -10 pts). Sidebar entry « Audits techniques »
>   (icon Wrench). Côté UX : charts dashboard rendus en permanence avec
>   baseline 0 + overlay « données en cours de collecte » dès J0
>   (TrendSection + BreakdownBars), suppression des EmptyState
>   intempestifs.
>
> Précédentes : Sprint 6 PR A (2026-05-16) — promotion audit technique
> sur la home + variant CTA blog. Sprint 5 premier wow moment
> (2026-05-16) — onboarding skippable + one-shot run + SSE + bannière.
> Sprint 4 hard-cap LLM (2026-05-16) + Sprint 3 audit technique
> (2026-05-16) + Sprint 2 blog content-driven (2026-05-16) + Stripe
> billing (2026-05-14) déjà en prod.
>
> Précédentes : Sprint 4 hard-cap LLM (2026-05-16) + Sprint 3 audit
> technique (2026-05-16) + Sprint 2 blog content-driven (2026-05-16) +
> Stripe billing (2026-05-14) déjà en prod.

### Phase actuelle

**Phases A, B et C livrées. V0+ entamé.**

Phasage acté le 2026-05-07 (cf. `09-decisions-journal.md` § 2026-05-07) :

- **Phase A — Moteur sur Haiku 4.5 cheap** ✅
- **Phase B — Design system + UI complète + marketing + blog SEO + onboarding + pages légales** ✅
- **Phase C — Multi-LLM + Stripe + send_weekly_email** ✅ (livré 2026-05-18)
- **V0+ — Polish UX + items veille concurrence + lancement public** ⏳ (entamé 2026-05-20)

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
- 12 routes app authentifiées : `/login`, `/app/onboarding` (wizard 3 étapes + suggestion IA), `/app/dashboard`, `/app/runs/[id]`, `/app/settings` (édition workspace name + brand aliases), `/app/prompts` (liste + CRUD + suggestion IA), `/app/prompts/[id]` (détail breakdown par LLM), `/app/competitors` (liste + CRUD), `/app/audits` + `/app/audits/new` + `/app/audits/[id]` + `/app/audits/compare` (Sprint 6 PR B 2026-05-17). Quotas enforced par plan (cf. `src/lib/plans/quotas.ts`).
- Design system custom (Tailwind v4 + composants `src/components/ui/`) — direction Airbnb-like minimaliste actée le 2026-05-07, raffinée le 2026-05-11 (refs designme.agency + taap.it). PR 2026-05-12 ajoute 11 primitifs Radix/shadcn (Dialog, DropdownMenu, Tabs, Switch, Tooltip, Sheet, Skeleton, Banner, EmptyState, Pagination, Toaster sonner), 2 wrappers Recharts (LineChart, BarChartHorizontal) et la sidebar app. Polish dashboard 2026-05-12 (refs screens Max) : `Stat` enrichi (icône pastel + delta arrow vs J-7), `SegmentedControl` (time-range picker), `AreaChart` gradient mono-série, `BreakdownBars` (vertical bars + légende + liste valeurs). Cf. doc 10 § « Patterns dashboard ».
- 49 tests unit Vitest verts, 13 tests E2E Playwright sur les flows publics
- Blog MDX **content-driven** (cf. doc 09 § 2026-05-16) : articles dans `src/content/blog/*.mdx` avec frontmatter YAML, scannés par `src/lib/blog/registry.ts`. Plugins remark-gfm + rehype-slug + rehype-autolink-headings. Composant `<BlogFAQ>` qui auto-injecte JSON-LD FAQPage (boost GEO majeur). 3 articles migrés : « Qu'est-ce que le GEO », « Mamie GEO vs Profound », « État visibilité IA France 2026 ». OG image dynamique par article (`next/og`), JSON-LD Article + BreadcrumbList, `<ArticleCTA>` automatique selon `frontmatter.cta`, `<RelatedArticles>` (3 articles liés via catégorie + keywords overlap), `<TOC>` sticky desktop, `<ReadingProgress>` bar. Sitemap.ts + robots.ts auto-générés.
- Lead magnet `/outils/test-visibilite-ia` avec form capture → email Brevo
- Lead magnet `/outils/audit-technique` (cf. doc 09 § 2026-05-16) : 30+ checks SEO + GEO (FAQPage, llms.txt, schema Article, E-E-A-T) + Google PSI + scoring 4 axes (SEO/GEO/A11y/Perf). Pas d'appel LLM → coût marginal 0 €. **Promu en home** via `<AuditTeaser />` (placée après `<TesConcurrentsPasToi />`) + CTA hero variant `ai`. Variant CTA blog `audit-technique` disponible pour les articles « optimisation pour les LLM ».

**Auth + infra** (Phase B finale, Phase C partielle) :

- Better Auth magic-link branché via Brevo (dual backend : **REST API** prioritaire, SMTP fallback) — bascule REST API actée le 2026-05-12 pour bypass IP whitelist Free plan
- DB Neon EU Frankfurt, 18 tables, schéma stable. Migration `0001_thick_husk` 2026-05-14 ajoute `"solo"` à l'enum `workspaces.plan`. Migration `0002_classy_joshua_kane` 2026-05-17 ajoute les tables `technical_audits` (historique app audits) et `audit_counters` (quota mensuel) + queue kind `audit_workspace_url`.
- Vercel preview accessible — login fonctionnel, dashboard accessible
- **Crons Vercel branchés en prod** (PR 2026-05-13) : `/api/cron/dispatch` (\*/5 min), `/api/cron/schedule-runs` (06:00 UTC quotidien), `/api/cron/schedule-weekly-emails` (lundi 09:00 UTC), `/api/cron/expire-past-due` (03:00 UTC quotidien, ajouté 2026-05-14), `/api/cron/schedule-audits` (lundi 05:00 UTC, ajouté 2026-05-17 — Sprint 6 PR B). Endpoints supportent GET et POST avec auth `Bearer CRON_SECRET`. Cause racine du blocker antérieur identifiée : Vercel Cron envoie **GET**, les routes n'exposaient que **POST** (cf. doc 09 § 2026-05-13). Instrumentation JSON via `logCronEvent()` + endpoint debug `GET /api/cron/dispatch?inspect=1` qui dump l'état queue + présence des env vars.
- **Worker `send_weekly_email` actif** : weekly recap envoyé lundi 9h UTC aux workspaces avec ≥ 1 run.success dans les 7 derniers jours. Template HTML inline + text fallback dans `src/lib/email/templates/weekly-recap.ts`. Trial nurture (J+3 / J+10) reporté (mode trial automatique supprimé 2026-05-14 — voir doc 09).

**Stripe billing** (PR 2026-05-14) :

- SDK `stripe@22.x` + 4 routes API : `POST /api/checkout`, `POST /api/portal`, `POST /api/webhooks/stripe` (signature verify + idempotence via `subscription_events.stripeEventId UNIQUE`), `GET/POST /api/cron/expire-past-due` (passe past_due → expired après J+7).
- Webhook handlers idempotents pour `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`. Source de vérité du plan = `subscription.items[0].price.id` mappé via `STRIPE_PRICE_*` env vars.
- UI billing dans `/app/settings` (section dédiée) : plan actuel + prochaine facturation + bouton "Gérer mon abonnement" (portal). Si plan inactif : grille Solo/Starter/Pro avec boutons checkout.
- `<UpgradeBanner>` server component injecté dans `(with-nav)/layout.tsx` — affiche un message contextuel quand plan ∈ trialing/past_due/expired/canceled.
- Plan **Solo 9,99 €** ajouté à `quotasFor()` avec champ `cadence: "daily" | "weekly"`. Le scheduler `/api/cron/schedule-runs` filtre par cadence (weekly = lundi uniquement). Agency reste dans l'enum DB mais retiré de `/pricing` public.
- Templates email transactionnels : `welcome-paid.ts` (post-checkout) + `payment-failed.ts` (post payment_failed). Réutilisent le pattern HTML inline + text fallback de `weekly-recap.ts`.

### Reste à faire

**Court terme — V0+ / pré-lancement** :

1. **Achat crédit Perplexity** ($50 minimum) puis ajout `PERPLEXITY_API_KEY` à Vercel env vars → 5e provider auto-activé via `getConfiguredLLMs()`, pas de redeploy nécessaire.
2. **Setup `BREVO_BLOG_LIST_ID`** : créer la liste "Newsletter blog" dans Brevo dashboard puis copier l'ID dans Vercel env vars → form inscription `/blog` actif + notification auto à chaque article publié.
3. **Hard launch public** : DNS Brevo (DKIM/SPF/DMARC) + Stripe LIVE déjà configurés selon user. Reste communication (LinkedIn, communautés FR).
4. **Drip d'éducation post-signup** (remplace ancien trial nurture J+3/J+10 — plus de trial auto en V0).
5. **Items V0+ veille concurrence** (cf. doc 02 § V0+) : ~~URL drill-down `/app/sources/[id]`~~ ✅ livré 2026-06-08, ~~per-prompt cadence~~ ✅ livré 2026-06-08, ~~sources funnel 3 métriques (Apparition/Fréquence/Citation)~~ ✅ livré 2026-06-08, ~~pause/resume projects~~ ✅ livré 2026-06-08, ~~save-as-PNG charts~~ ✅ livré 2026-06-08, ~~CSV export~~ ✅ livré 2026-06-08, ~~multi-select brand filter~~ ✅ livré 2026-06-08, ~~comparison pages industrialisées~~ ✅ livré 2026-06-08, ~~crawlabilité bots IA dans audit-technique~~ ✅ livré 2026-06-08, ~~régénérer prompts depuis profil~~ ✅ livré 2026-06-08.

**Phase C livrée** (~~barré~~) :

- ~~Providers OpenAI / Mistral / Perplexity / Google~~ — livré 2026-05-18 (PR2-5 multi-LLM)
- ~~Hard-cap enforcement worker~~ — livré 2026-05-16
- ~~Stripe checkout + customer portal + webhook~~ — livré 2026-05-14
- ~~Plan Solo + cadence per-plan + retrait Agency public~~ — livré 2026-05-14
- ~~Charts évolution dashboard~~ — livré 2026-05-12
- ~~Worker `send_weekly_email`~~ — livré 2026-05-13
- ~~Cron prod stuck~~ — résolu 2026-05-13
- ~~Pages CRUD app + Settings édition~~ — livré 2026-05-13

**Polish UX 2026-05-20/22 livré** (~~barré~~) :

- ~~Refonte tableau runs en batches dépliables (PR1)~~ — livré 2026-05-20
- ~~PR6 KPI dashboard agrégat tous-LLMs + Part de voix + retrait coût USD~~ — livré 2026-05-20
- ~~AppTopBar horizontale + favicon brand (pattern Vercel)~~ — livré 2026-05-20
- ~~Newsletter blog Brevo + UX header /blog~~ — livré 2026-05-20
- ~~Brand creation depuis BrandSwitcher + quotas brand~~ — livré 2026-05-20
- ~~Refonte audit `/app/audits/[id]` par sévérité + bulle notif sidebar~~ — livré 2026-05-22
- ~~Background app gris #fafafa~~ — livré 2026-05-22
- ~~Retrait pattern signature blue (faux bonne idée)~~ — livré 2026-05-22
- ~~Em dashes retirés côté site~~ — livré 2026-05-20

### Décisions Sprint 0 verrouillées (rappel)

- Direction artistique : Pivot 2026-05-07 — Airbnb-like minimaliste. Fond blanc / gris `#fafafa` + nuances de gris. Accent **bleu brand `#329CFF`** (pivot 2026-06-03, remplace l'ancien terracotta `#C5532E`) réservé aux badges, liens, highlights data. CTA principal = noir plein. Pas d'italique, une seule police.
- Police unique V0 : **Inter** via `next/font/google`. Geist + Newsreader + Geist Mono retirés.
- Naming + domaine : Mamie GEO sur `mamie-geo.fr`. Redirect 301 défensif `mamie-seo.fr` → `mamie-geo.fr`.
- Magic-link Better Auth : Brevo, **REST API** (acté 2026-05-12 — SMTP était bloqué par IP whitelist Free plan Brevo).
- Le Chat dès Starter : oui sans condition.
- ~~Trial 14j sans carte~~ + Stripe Tax : pivot 2026-05-14 → **pas de trial automatique** + garantie remboursement 14 jours (refund manuel). Stripe Tax conservé.
- Statut juridique : EI continue, bascule SAS/EURL planifiée mois 6-9 (plafond micro ~77 700 €/an).
- Hard-cap LLM : 200 % du quota théorique → block + email + alerte interne.

À mettre à jour à chaque évolution majeure (changement de phase, sprint terminé, gate franchie).
