# 09 — Journal de décisions et suivi

> **Document vivant.** Tenir à jour rigoureusement. Chaque décision majeure, chaque pivot, chaque snapshot de KPI mensuel y est consigné. C'est la mémoire institutionnelle du projet.

---

## Comment utiliser ce document

1. **Décisions** : à chaque arbitrage > 1h de réflexion ou avec impact stratégique, créer une entrée dans la section "Log des décisions" avec date, contexte, options considérées, choix, justification.
2. **KPI mensuels** : remplir le tableau de suivi mensuel le 1er de chaque mois (max 30 min).
3. **Veille concurrentielle** : snapshot mensuel des prix concurrents.
4. **Revue trimestrielle** : ajouter une section synthèse tous les 3 mois.

---

## Décisions Sprint 0 — verrouillées le 2026-05-05

Suite à la discussion stratégique sur les contraintes "moins cher possible + scalable + testable", les décisions suivantes sont actées. Toute remise en question doit être documentée comme une nouvelle entrée dans le log ci-dessous.

### Architecture (cf. doc 03 et 06)

- ✅ **Mono-repo unique** : marketing + blog + app SaaS dans une seule app Next.js
- ✅ **Domaine principal** : `mamie-geo.fr`
- ✅ **mamie-seo.fr** : redirigé en 301 vers mamie-geo.fr dès J1
- ✅ **Pas de subdomain** : app sur `mamie-geo.fr/app/*` (path-based)
- ✅ **Route groups Next.js** : `(marketing)`, `(blog)`, `(app)` pour séparer les layouts
- ❌ **Framer** : refusé en V0, tout en Next.js codé

### Stack technique (cf. doc 03)

- ✅ **Auth** : Better Auth (free, open source, testable, pas de lock-in)
- ✅ **ORM** : Drizzle (léger, edge-compatible, SQL-first)
- ✅ **Job queue V0** : Postgres-based custom queue + Vercel Cron (gratuit, idempotent)
- ✅ **Job queue scale** : migration vers Inngest si > 100K runs/mois
- ✅ **Hébergement (mono-repo)** : Vercel Pro ($20/mo) pour marketing + blog + app dans une seule app
- ❌ **Framer / Astro** : refusés en V0, tout en Next.js
- ✅ **Postgres** : Neon EU Frankfurt free tier (puis Pro à $19 quand >0,5 GB)
- ✅ **Cache/rate limit** : Upstash Redis free tier
- ✅ **Storage** : Cloudflare R2 free tier
- ✅ **Analytics produit** : PostHog Cloud EU free tier
- ✅ **Email transactionnel** : Brevo (continuité)
- ✅ **Errors** : Sentry free
- ✅ **Uptime** : BetterStack free
- ✅ **Paiement** : Stripe + Stripe Tax

### Stratégie LLM (cf. doc 03 et discussion)

- ✅ **Tracking** : APIs natives (OpenAI, Anthropic, Mistral, Perplexity, Google) — pas d'OpenRouter, fidélité aux réponses utilisateur
- ✅ **Scoring/parsing** : Anthropic Claude Haiku 4.5 (cheap + JSON mode)
- ❌ **OpenRouter en V0** : refusé pour le tracking, possible plus tard pour scoring multi-modèles

### Stratégie test (cf. doc 03)

- ✅ Vitest unit + integration
- ✅ Playwright E2E sur 7 flows critiques
- ✅ MSW + cassettes JSON pour mocker les LLMs
- ✅ Drizzle test mode avec branche Neon dédiée par PR
- ✅ CI GitHub Actions, blocking sur tests rouges

### Stratégie freemium (cf. doc 04)

- ✅ **Pas de tier gratuit permanent** dans le SaaS
- ✅ **Couche 1** : mamie-seo/mamie-geo en média gratuit (continuité)
- ✅ **Couche 2** : outil "Test ma visibilité IA" one-shot gratuit (lead magnet)
- ✅ **Couche 3** : trial 14 jours dans le SaaS, sans carte
- ❌ Permanent free tier : refusé pour V0 (réévaluable mois 12 si pression concurrentielle)

### Coût fixe infra cible V0

- ~$50/mois (Vercel Pro $20 + domaine $30, le reste en free tier)
- À l'échelle (~50 clients) : ~$200-300/mois fixe + LLM variables

### Décisions design (cf. doc 10)

- ⏳ **Direction artistique** : à trancher entre A (éditorial chaud, recommandée) / B (souverain) / C (studio indie)
- ⏳ **Polices premium ou gratuites** : à trancher
- ⏳ **Template Next.js premium** : à trancher (achat 79-200$ vs from scratch)
- ⏳ **Illustrations** : à trancher (achat 5 pièces vs UI screenshots only)

---

## Décisions tranchées en Sprint 0 (session 2 — 2026-05-05)

Toutes les décisions stack technique, pricing, produit et marque sont
verrouillées ci-dessous. Voir aussi la section "Décisions Sprint 0" plus
haut et l'entrée "2026-05-05 — Réponses aux 10 questions de bootstrap".

### Stack technique (verrouillée)

- ✅ **Auth** : Better Auth (free, Postgres, magic-link via SMTP Brevo)
- ✅ **ORM** : Drizzle (migrations versionnées, jamais `db push` en prod)
- ✅ **Job queue V0** : Postgres-based custom + Vercel Cron
- ✅ **Job queue scale** : migration Inngest > 100K runs/mois
- ✅ **Hébergement app** : Vercel Pro (région `cdg1`)
- ✅ **Postgres** : Neon EU Frankfurt
- ✅ **Storage fichiers** : Cloudflare R2
- ✅ **Analytics** : PostHog Cloud EU
- ✅ **Email transactionnel** : Brevo

### Pricing (verrouillé)

- ✅ **Prix Starter** : 49 €/mois (39 €/mois en annuel)
- ✅ **Discount annuel** : 20%
- ✅ **Trial** : 14 jours
- ✅ **Carte requise au trial** : Non
- ✅ **Plan freemium permanent dans le SaaS** : Non (lead magnet `/outils/test-visibilite-ia` à la place)
- ✅ **Stripe Tax dès J0** : Oui

### Produit (verrouillé)

- ✅ **5 LLMs en V0** : ChatGPT, Claude, Perplexity, Gemini, Le Chat
- ✅ **Fréquence par défaut Starter** : Hebdo
- ✅ **Inclusion Le Chat dès Starter** : Oui (sans condition — différenciateur n°1)
- ✅ **Hard-cap LLM par client** : 200% du quota théorique → block automatique + email + alerte interne

### Marque (verrouillée)

- ✅ **Naming définitif** : Mamie GEO
- ✅ **Domaine principal** : `mamie-geo.fr`
- ✅ **Sous-domaine app** : pas de subdomain — path-based `mamie-geo.fr/app/*`
- ✅ **Redirect mamie-seo.fr** : DNS-level via Vercel Domains + ligne défensive dans `next.config.ts`

### Design (verrouillé)

- ✅ **Direction artistique** : A — éditorial chaud (cf. doc 10)
- ✅ **Polices V0 (gratuites)** : Newsreader (titres) + Geist (corps) + Geist Mono (data/numbers)
- ✅ **Template marketing** : from scratch
- ✅ **Mascotte mamie** : à trancher plus tard (mois 3+) — non bloquant V0

### Légal (à compléter en exécution)

- ✅ **Statut juridique V0** : EI (micro-entreprise BIC services) — bascule SAS/EURL planifiée mois 6-9 avant plafond ~77 700 €/an de CA (cf. doc 07 et 08)
- [ ] **Avocat CGV/CGU** : nom + date contact à renseigner
- [ ] **Cyber-assurance** : à activer mois 6

### Personnel (à compléter au lancement)

- [ ] **% temps freelance maintenu mois 1-3** : \_\_\_ %
- [ ] **Cash réserve perso** vérifiée ≥ 6 mois : ☐ Oui ☐ Non
- [ ] **Vacances trimestrielles** programmées dans le calendrier : ☐ Oui ☐ Non

---

## Log des décisions

### Format type d'entrée

```
### YYYY-MM-DD — Titre de la décision

**Contexte** :
**Options considérées** :
- A : ...
- B : ...
- C : ...
**Choix** :
**Justification** :
**Conséquences attendues** :
**À revisiter** : (date ou condition)
```

### Décisions enregistrées

#### 2026-05-05 — Lancement du projet GEO France

**Contexte** : recherche de SaaS récurrent après fatigue du freelance pur. Analyse du marché GEO, identification du trou francophone.

**Options considérées** :

- A : SaaS audit SEO + UI (en cours, à compléter)
- B : Boîtage tool mapping
- C : SaaS Digital Product Passport SMB
- D : SaaS GEO francophone

**Choix** : D — SaaS GEO francophone (Mamie GEO)

**Justification** : marché en hypercroissance (45,5% CAGR), trou français évident, leverage mamie-seo.fr existant, fenêtre 12-18 mois, pas de concurrent direct FR.

**Conséquences attendues** : 6-12 mois de focus, pivot du site mamie-seo, solo founder mode, cash freelance préservé.

**À revisiter** : Gate 1 à 6 mois (juin 2026 → critères dans doc 08).

---

#### 2026-05-05 — Architecture mono-repo Next.js + redirect mamie-seo

**Contexte** : Mamie-seo.fr n'a aucun trafic ni autorité SEO valorisable. La question s'est posée de garder un repo séparé pour le blog ou de tout rassembler.

**Options considérées** :

- A : 3 repos séparés (marketing Framer + app Next.js + blog standalone)
- B : Monorepo Turborepo avec apps/marketing, apps/app, apps/blog
- C : Mono-repo unique : une seule app Next.js qui contient marketing + blog + app SaaS

**Choix** : C — Mono-repo unique Next.js

**Justification** :

- Solo founder, pas d'équipe à coordonner → un seul projet à maintenir
- Aucun SEO existant à préserver sur mamie-seo.fr → pas d'argument pour le conserver
- Cohérence visuelle native (marketing utilise les mêmes composants UI que l'app)
- Déploiement et configuration uniques (un seul Vercel, un seul SSL, un seul cookie)
- Splittable plus tard si besoin (mois 12+ ou si recrutement)

**Conséquences attendues** :

- `mamie-seo.fr` est redirigé en 301 vers `mamie-geo.fr` dès J1
- Pas de subdomain `app.mamie-geo.fr` en V0 — l'app vit sur `mamie-geo.fr/app/*`
- Pas de Framer pour le marketing (pages codées en TSX comme tout le reste)
- Structure `(marketing)`, `(blog)`, `(app)` route groups pour séparer les layouts
- Domaine `mamie-seo.fr` gardé loué 1-2 ans en sécurité, puis abandonné

**À revisiter** : mois 12+ si recrutement ou si besoin de stack séparée pour le marketing.

---

#### 2026-05-05 — Réponses aux 10 questions de bootstrap (session 2)

**Contexte** : fin de session 1, 10 décisions en suspens identifiées (direction
artistique, polices, naming, mécanique trial, magic-link, etc.). Max a tranché
en début de session 2.

**Choix actés** :

1. Direction artistique : A — éditorial chaud
2. Polices : gratuites V0 — Newsreader + Geist + Geist Mono (pas Inter ni Source Serif Pro)
3. Template marketing : from scratch
4. Naming et domaine : Mamie GEO sur `mamie-geo.fr`
5. Magic-link Better Auth : SMTP Brevo (transport nodemailer)
6. Le Chat dès Starter : oui sans condition
7. Trial 14j sans carte + Stripe Tax dès J0 : oui aux deux
8. Statut juridique : EI continue en V0, bascule SAS/EURL mois 6-9 avant plafond ~77 700 €/an BIC services
9. Hard-cap LLM 200% du quota théorique → block + email + alerte interne
10. Redirect `mamie-seo.fr` : DNS-level via Vercel Domains + ligne défensive dans `next.config.ts`

**Conséquences attendues** : déblocage du Sprint 0. Toutes les briques de la
stack peuvent être configurées sans nouvelle question. Les sections "Décisions
Sprint 0 — verrouillées" et "Décisions tranchées en Sprint 0" sont à jour.

**À revisiter** :

- Polices premium quand MRR > 5K€
- Statut juridique au mois 6 (audit CA cumulé vs plafond 77 700 €)
- Mascotte mamie au mois 3+ (non bloquant)

---

#### 2026-05-05 — Cohérences purgées (Phase 1 session 2)

**Contexte** : audit des 12 docs en fin de session 1 a remonté 11 incohérences
entre les décisions actées dans `03`/`09` et le contenu résiduel des autres
docs (Clerk, Prisma, Inngest, subdomain `app.`, etc.).

**Corrections appliquées** :

- `02` § "Fonctionnalités V0" : auth `Clerk ou Supabase Auth` → `Better Auth`
- `02` § "Fonctionnalités V0" : worker `Inngest ou BullMQ` → `Postgres-based queue + Vercel Cron`
- `03` § "APIs ciblées" : `gpt-4o-mini avec browse_with_bing` → `gpt-4o-mini + web_search tool`
- `03` § "Hébergement" : options multiples (Neon ou Supabase, Vercel ou Render, Inngest ou self-hosted) → choix figés
- `03` § "Environnements" : prod sur `app.mamie-geo.fr` → `mamie-geo.fr` (path-based)
- `03` § "Environnements" : dev local Docker Compose → branche Neon `dev-{username}`
- `04` § "Coûts fixes mensuels" : Inngest $20-100 listé en V0 → 0 (Postgres-queue), Inngest planifié à scale
- `04` § "Lead magnet" : `~0,015 €` → `~$0.015` (devise harmonisée)
- `06` § "Lead magnet n°1" : `mamie-seo.fr/test-ia` → `mamie-geo.fr/outils/test-visibilite-ia`
- `08` § "Sprint 1.1" et § "Sprint 0 checklist" : Clerk / Prisma / Inngest → Better Auth / Drizzle / Postgres-queue
- `09` § "Décisions à figer en Sprint 0" : checkboxes obsolètes → décisions verrouillées
- `README.md` : "Projet GEO France" → "Mamie GEO"

**Justification** : éviter qu'un futur lecteur (humain ou Claude) suive une
décision obsolète parce que le doc n'a pas été synchronisé. Règle dorénavant
appliquée : toute modif qui invalide une info dans un doc met à jour le doc
dans le **même PR**.

**Conséquences attendues** : tous les docs cohérents avec `03` et `09`. Sprint 0
peut démarrer sans ambiguïté résiduelle.

**À revisiter** : N/A (tâche de remise à plat ponctuelle).

---

#### 2026-05-05 — Schéma BDD complet (Phase 2 session 2)

**Contexte** : 9 manques techniques avaient été identifiés en session 1 dans
le schéma BDD du doc 03 (Better Auth, queue_jobs, events, états plan,
prompt_cache, usage_counters, hard-cap, idempotence). Le schéma a été
complété avant toute écriture de code.

**Décisions techniques actées** :

- **Better Auth** : tables générées via `npx @better-auth/cli generate`,
  documentées en V0 pour magic-link uniquement (`user`, `session`, `account`,
  `verification`). **Pas de table `users` parallèle** — toutes les FK
  applicatives pointent sur Better Auth `user.id` (TEXT, pas UUID).
- **`workspaces.plan`** : énumération `CHECK` étendue à `trialing`, `starter`,
  `pro`, `agency`, `enterprise`, `past_due`, `expired`, `canceled`. Plus de
  valeur `'free'` (on n'a pas de freemium permanent).
- **`workspaces.current_period_start/end`** : aligné sur le cycle de
  facturation Stripe. Webhook `invoice.created` = reset du `usage_counters`.
- **`workspaces.hard_cap_hit_at`** : timestamp dénormalisé pour fast-path du
  guard quota (évite un join sur `usage_counters` à chaque appel LLM).
- **`queue_jobs.idempotency_key TEXT UNIQUE NOT NULL`** : format imposé par
  `kind` (cf. table dans doc 03). `INSERT ... ON CONFLICT DO NOTHING`.
- **`queue_jobs.status`** : `pending → claimed → done | failed | dead`. Retry
  transient = remise en `pending` avec `scheduled_at += 1h` puis `+ 6h`
  (formalisation de la "fallback strategy" du doc 03).
- **`runs.cache_hit BOOLEAN`** : flag de réutilisation depuis `prompt_cache`
  pour distinguer les runs facturés des runs gratuits.
- **`prompt_cache`** : caching cross-clients sur hash sha256 du texte
  normalisé + `(llm, language)`, fenêtre de fraîcheur 24 h. Gain estimé
  20-40% sur Starter. Documenté V0, à activer dès que mesurable.
- **`events`** : audit log applicatif générique avec `kind` libre + `payload
JSONB`, purge à 90 jours. Centralise les événements forensic (quota
  warnings, plan changes, run completed, etc.).
- **`subscription_events.stripe_event_id UNIQUE`** : idempotence des
  webhooks Stripe (un même `evt_xxx` ne crée qu'une ligne).
- **Algorithme hard-cap LLM** : 60% → alerte interne, 100% → email client,
  200% → block + email + alerte interne, levée manuelle uniquement, reset
  au prochain cycle Stripe.

**Conséquences attendues** : `src/db/schema.ts` peut être écrit sans
ambiguïté, première migration `0001_init.sql` peut être versionnée et
appliquée.

**À revisiter** :

- `prompt_cache` : mesurer le hit-rate réel après 1 mois de prod et décider
  si la fenêtre 24h est la bonne (peut-être 12h pour Pro/Agency, 7j pour
  Starter ?)
- `queue_jobs` : si > 100K runs/mois, migrer vers Inngest (la table reste
  utile en mode "outbox pattern" même avec Inngest)

---

#### 2026-05-06 — Première migration Drizzle appliquée sur Neon EU Frankfurt

**Contexte** : Sprint 0 close, DATABASE_URL Neon en main, étape avant
Sprint 1. Au premier `pnpm db:migrate`, deux blocages successifs :

1. `drizzle-kit` ne charge pas `.env.local` (Next.js le fait, lui non).
2. `drizzle.config.ts` importait `@/lib/env` qui valide tout le contrat
   runtime (Better Auth, Brevo, CRON…) — bloque la migration alors
   qu'aucun de ces secrets n'est nécessaire pour `drizzle-kit`.
3. Drizzle-kit utilise en interne le pool WebSocket `@neondatabase/serverless`
   pour ses transactions multi-statements. Sur le mauvais endpoint Neon
   (URL avec username placeholder `user` au lieu du vrai `*_owner`), ça
   produisait un échec d'auth silencieux avalé par le spinner.

**Options considérées** :

- A : Installer `ws` comme devDep et fournir `neonConfig.webSocketConstructor`
  depuis `drizzle.config.ts` (recommandé par Neon en CLI Node).
- B : Installer `pg` comme devDep et configurer drizzle-kit sur ce driver,
  en gardant `@neondatabase/serverless` au runtime Edge.
- C : Script de migration custom maison qui applique les `.sql` via le
  driver Neon HTTP fetch et tient à jour `__drizzle_migrations`.

**Choix** : A.

**Justification** :

- `ws` est strictement devDep — jamais embarqué dans le bundle runtime
  Edge/Vercel ; pas d'impact sur la cohérence "HTTP fetch en runtime".
- Drizzle-kit bundle en réalité `ws@8.18.2` en interne, donc la dépendance
  publique sert uniquement à fournir `webSocketConstructor` à `neonConfig`
  côté `drizzle.config.ts` (B et C demandent plus de code à maintenir
  pour le même résultat).
- B aurait dupliqué la logique de connexion DB (un client pour CLI, un
  pour runtime) sans bénéfice tant qu'on reste sur Neon.
- C aurait recréé maison ce que drizzle-kit fait correctement, et dérivé
  par rapport au format officiel `drizzle.__drizzle_migrations`.

**Conséquences appliquées** :

- `package.json` : devDep `ws@^8.20.0` + `@types/ws@^8.18.1`.
- `package.json` : scripts `db:generate`, `db:migrate`, `db:studio`
  préfixés par `node --env-file-if-exists=.env.local ./node_modules/drizzle-kit/bin.cjs <cmd>`.
  Charge `.env.local` en local, no-op sur Vercel/CI où les vars sont
  déjà dans `process.env`.
- `drizzle.config.ts` : ne dépend plus de `@/lib/env` (lecture directe
  `process.env.DATABASE_URL` avec check minimal). Le validateur strict
  reste actif au runtime app — drizzle-kit n'est juste plus son client.
- `drizzle.config.ts` : `neonConfig.webSocketConstructor = ws` avant
  l'export du config.
- Migration `0000_many_human_torch.sql` appliquée : 16 tables, 13 FK,
  34 indexes, 98 CHECK constraints, 1 entrée dans `drizzle.__drizzle_migrations`.

**À revisiter** :

- Si on ajoute un autre provider Postgres (improbable V0), réévaluer le
  choix `ws` vs `pg`.
- Quand on industrialise les branches Neon dev par PR (Sprint 1+),
  vérifier que le même flow `pnpm db:migrate` tient avec une `DATABASE_URL`
  pointant sur une branche éphémère.

---

#### YYYY-MM-DD — [titre]

(à compléter)

---

## Suivi KPI mensuel

À remplir le 1er de chaque mois en moins de 30 minutes.

### Template KPI mensuel

```
## Mois : MMMM YYYY

### Acquisition
- Visiteurs uniques mamie-seo :
- Trial signups :
- Conversion landing → trial :
- Sources principales (top 3) :

### Revenue
- MRR :
- ARR :
- Net new MRR :
- ARPU :
- Total clients payants :

### Mix client
- Starter :
- Pro :
- Agence :
- Enterprise :

### Rétention
- Churn $ :
- Churn logo :
- NRR :

### Produit
- DAU / MAU :
- Prompts actifs trackés :
- Runs / jour :
- Coûts LLM / jour :

### Coûts
- Coûts variables totaux :
- Coûts fixes :
- Marge brute % :

### NPS (trimestriel)
- Score :
- Top 3 demandes feature :
- Top 3 raisons de churn :

### Notes du mois
(événements clés, décisions, learnings)
```

### Mois : Mai 2026 (initialisation)

#### Acquisition

- Visiteurs uniques mamie-seo : à mesurer
- Trial signups : 0 (pré-lancement)
- Conversion : N/A
- Sources : N/A

#### Revenue

- MRR : 0
- Total clients payants : 0

#### Notes du mois

- Phase de pré-décision et préparation
- Documentation projet créée
- Choix Sprint 0 en cours

---

### Mois : Juin 2026

(à compléter)

---

### Mois : Juillet 2026

(à compléter)

---

## Snapshots veille concurrentielle (mensuel)

À chaque 1er du mois : 30 min de revue prix + features des concurrents principaux. Note les changements significatifs.

### Template snapshot mensuel

```
## Snapshot YYYY-MM

### Profound (US)
- Prix entrée :
- Prix mid-tier :
- Nouveautés observées :
- Actu / annonces :

### Peec AI (DE)
- Prix entrée :
- Prix mid-tier :
- Nouveautés observées :
- Actu / annonces :

### Goodie AI (US)
- Prix :
- Nouveautés :

### Otterly
- Prix :
- Nouveautés :

### Cairrot
- Prix :
- Nouveautés :

### Semrush AI / Ahrefs Brand Radar
- État du module GEO :
- Évolution depuis dernier snapshot :

### Acteur FR émergent
- Concurrent FR identifié ? : Oui / Non
- Si oui, nom + URL + offre :

### Verdict du mois
- Mouvement significatif sur la concurrence : Oui / Non
- Action à prendre :
```

### Snapshot Mai 2026 (référence initiale)

#### Profound (US)

- Prix entrée : $99 (ChatGPT only) → $399 Growth → $499+ Enterprise
- Nouveautés : GPT-5.2 tracking, Profound Workflows, MCP integration, Personas, HIPAA, Shopping Analysis, 30+ langues, 400M+ Prompt Volumes dataset, Akamai integration, Agency Mode

#### Peec AI (DE)

- Prix entrée : €89 Starter
- Nouveautés : levée Series A $21M nov. 2025 (total $29M), valo > $100M, €650K ARR en 4 mois
- Couverture LLM : ChatGPT, Perplexity, Google AI Overviews, Claude (3-4 selon tier)

#### Goodie AI (US)

- Prix : à partir de $495/mois
- Vision intégrée monitoring + optimization + attribution

#### Otterly

- Prix : $29 Lite, $189 Standard
- Nouveauté : GEO Audit tool

#### Cairrot

- Prix : $99 Pro
- Avantage : 5 LLMs (ChatGPT, Perplexity, Claude, Gemini, DeepSeek), free API

#### Semrush AI / Ahrefs Brand Radar

- État : modules GEO actifs mais surcouches, pas natif
- AI Search Add-on SE Ranking : $71.20/mois en plus

#### Acteur FR émergent

- Aucun identifié en SaaS GEO-first FR à mai 2026 ✅

#### Verdict du mois

- Mouvement significatif : Peec AI continue d'accélérer mais pas encore localisé FR
- Action : aucune urgence, fenêtre temporelle confirmée

---

## Revue trimestrielle

### Format type

```
## Q[1-4] YYYY — Revue trimestrielle

### Bilan vs objectifs
- Objectif MRR : ___ → Réel : ___
- Objectif clients : ___ → Réel : ___
- Objectif autres :

### Ce qui a marché
-
-
-

### Ce qui n'a pas marché
-
-
-

### Ajustements pour Q suivant
-
-
-

### Revue des risques (cf. doc 07)
- Nouveaux risques identifiés :
- Risques aggravés :
- Risques réduits :

### Décision majeure pour Q suivant
-

### Énergie / moral founder
- État :
- Actions wellness :
```

### Q2 2026 (juin) — première revue

(à compléter en juin)

---

## Décisions de pivot ou ajustement (à logger si appliqués)

Si pendant l'année un pivot est décidé (changement de positionnement, de cible, de pricing structurel, etc.), créer une section dédiée avec :

- Contexte du pivot
- Données qui ont déclenché la réflexion
- Hypothèse alternative testée
- Mode de test (A/B, beta, full pivot)
- Critères d'évaluation du pivot
- Date de décision finale (continue, abandonne)

---

## Idées et hypothèses parking

Section pour stocker les idées qui émergent en cours de route mais qu'on ne traite pas tout de suite.

| Date       | Idée                                    | Source                  | Priorité estimée | Status            |
| ---------- | --------------------------------------- | ----------------------- | ---------------- | ----------------- |
| 2026-05-05 | API publique ouverte aux dévs (en V2.5) | Réflexion stratégie     | P2               | Parked            |
| 2026-05-05 | Plugin WordPress de check GEO           | Inspiration ContentMonk | P2               | Parked            |
| 2026-05-05 | Étude annuelle "État du GEO en France"  | Marketing               | P1               | À faire mois 6    |
| 2026-05-05 | Application mobile native               | Réflexion produit       | P3               | Parked long terme |
| 2026-05-05 | Marketplace de prompts par secteur      | Réflexion produit       | P2               | À explorer mois 9 |

---

## Templates emails / messages clé (à réutiliser)

### Template "annonce nouveauté produit"

```
Sujet : Nouvelle feature : [X] est arrivée 🎉

Bonjour [prénom],

Suite à plusieurs retours utilisateurs, on a lancé [feature] ce matin.

Concrètement, vous pouvez maintenant :
- ...
- ...

Comment l'activer : [lien]

Un retour à nous faire ? Répondez simplement à cet email, je lis tout.

Belle journée,
[Max]
```

### Template "sondage NPS trimestriel"

```
Sujet : 30 secondes pour Mamie GEO ?

Bonjour [prénom],

J'ai une seule question : sur une échelle de 0 à 10, recommanderiez-vous
Mamie GEO à un autre freelance / PME / agence ?

[Lien sondage 1 question]

Si vous avez 30 secondes de plus, dites-moi pourquoi vous avez mis cette
note (en répondant à cet email).

Merci,
[Max]
```

### Template "demande de témoignage"

```
Sujet : 5 minutes pour aider Mamie GEO ?

Bonjour [prénom],

J'ai vu que [résultat concret du client]. Bravo !

Est-ce que vous accepteriez de partager une ligne ou deux à ce sujet,
qu'on pourrait utiliser sur notre site avec votre nom et photo ?

Si oui, voici ce qu'on cherche :
- 1-2 phrases sur ce que Mamie GEO vous apporte
- Une métrique chiffrée si possible
- Votre accord pour utiliser votre nom + photo + lien LinkedIn

Merci d'avance,
[Max]
```

---

## Liens utiles internes

- [README](./README.md) — index master
- [00 - Vision](./00-vision-strategie.md) — pour challenger la stratégie
- [01 - Marché](./01-marche-concurrence.md) — données concurrence
- [02 - Produit](./02-produit-roadmap.md) — roadmap features
- [03 - Architecture](./03-architecture-technique.md) — décisions tech
- [04 - Pricing](./04-pricing-business-model.md) — projections
- [05 - GTM](./05-go-to-market.md) — plan acquisition
- [06 - Mamie SEO](./06-activation-mamie-seo.md) — pivot site
- [07 - Risques](./07-risques-mitigations.md) — matrice risques
- [08 - Roadmap](./08-roadmap-execution.md) — timeline mois par mois

---

## Note sur la discipline de tenue de ce document

Ce document est inutile s'il n'est pas tenu rigoureusement. Pour éviter qu'il devienne un cimetière :

1. **Rappel récurrent** : ajouter au calendrier (Google Calendar) un rappel le 1er de chaque mois "Update doc 09" — 30 min bloquées
2. **Décisions importantes** : règle simple — si tu hésites > 1h sur un sujet, écris la décision finale dans ce doc
3. **Honnêteté brute** : si un mois est mauvais, écris-le. C'est ce qui rend le doc précieux dans 12 mois quand tu fais ton bilan annuel
4. **Pas de prose inutile** : bullets, chiffres, brefs commentaires. C'est un journal opérationnel, pas un mémoire
