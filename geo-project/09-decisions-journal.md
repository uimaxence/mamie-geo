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

## Décisions à figer en Sprint 0

À trancher avant le 1er commit, à compléter ci-dessous puis verrouiller :

### Stack technique
- [ ] **Auth** : ☐ Clerk ☐ Supabase Auth ☐ Better Auth → choix : ___
- [ ] **ORM** : ☐ Prisma ☐ Drizzle → choix : ___
- [ ] **Job queue** : ☐ Inngest ☐ BullMQ self-hosted → choix : ___
- [ ] **Hébergement app** : ☐ Vercel ☐ Render → choix : ___
- [ ] **Postgres** : ☐ Neon EU ☐ Supabase EU → choix : ___
- [ ] **Storage fichiers** : ☐ Cloudflare R2 ☐ Supabase Storage → choix : ___
- [ ] **Analytics** : ☐ PostHog cloud ☐ PostHog self-host ☐ autre : ___
- [ ] **Email transactionnel** : Brevo (par défaut) — confirmer ✅/❌

### Pricing
- [ ] **Prix Starter** : ☐ 39€ ☐ 49€ ☐ 59€ → choix : ___
- [ ] **Discount annuel** : ☐ 15% ☐ 20% ☐ 25% → choix : ___
- [ ] **Trial** : ☐ 7 jours ☐ 14 jours → choix : ___
- [ ] **Carte requise au trial** : ☐ Oui ☐ Non → choix : ___
- [ ] **Plan freemium permanent** : ☐ Oui (1 audit/mois) ☐ Non → choix : ___

### Produit
- [ ] **5 LLMs en V0** : confirmer ChatGPT, Claude, Perplexity, Gemini, Le Chat ✅/❌
- [ ] **Fréquence par défaut Starter** : ☐ Hebdo ☐ Bi-mensuel → choix : ___
- [ ] **Inclusion Le Chat dès Starter** : ☐ Oui ☐ Non (premium uniquement) → choix : ___

### Marque
- [ ] **Naming définitif** : ☐ Mamie GEO ☐ autre : ___
- [ ] **Domaine principal** : ☐ mamie-geo.fr ☐ autre : ___
- [ ] **Sous-domaine app** : ☐ app.mamie-geo.fr ☐ autre : ___

### Légal
- [ ] **Statut juridique projet** : ☐ Reste en EI (continuité actuelle) ☐ SAS → choix : ___
- [ ] **Avocat CGV/CGU** : nom + date contact : ___
- [ ] **Cyber-assurance** : à activer mois ___

### Personnel
- [ ] **% temps freelance maintenu mois 1-3** : ___ %
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

| Date | Idée | Source | Priorité estimée | Status |
|---|---|---|---|---|
| 2026-05-05 | API publique ouverte aux dévs (en V2.5) | Réflexion stratégie | P2 | Parked |
| 2026-05-05 | Plugin WordPress de check GEO | Inspiration ContentMonk | P2 | Parked |
| 2026-05-05 | Étude annuelle "État du GEO en France" | Marketing | P1 | À faire mois 6 |
| 2026-05-05 | Application mobile native | Réflexion produit | P3 | Parked long terme |
| 2026-05-05 | Marketplace de prompts par secteur | Réflexion produit | P2 | À explorer mois 9 |

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
