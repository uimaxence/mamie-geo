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

#### 2026-06-12 — Offre accompagnement done-for-you + page /contact + localisation des scans + cohérence DA outils

**Contexte** : Max veut (1) une offre où il booste personnellement le SEO + GEO du client, avec rareté affichée (« 3 créneaux ») et CTA vers son Cal ; (2) que les scans servent les PME locales (« meilleur plombier » ne citera jamais un artisan tourangeau, « meilleur plombier à Tours » si) ; (3) que les outils gratuits réutilisent les composants de l'app (DA cohérente) et que chaque clic prospect soit tracké.

**Livré** :
- **Offre done-for-you** : section dédiée sur `/pricing` (sous les 3 plans, détail pricing doc 04) + page `/contact` avec Cal.com inline. ⚠️ Deux choix faits par Claude faute d'info : (a) le lien Cal pointe sur l'event support existant `mc.maxence/support-mamie-geo` (seul lien connu) — à remplacer dans `cal-contact-embed.tsx` (constante unique) dès que Max crée l'event « appel découverte » ; (b) la rareté affiche **T3 2026** alors que Max a écrit « Q2 2026 » — Q2 se termine le 30 juin, vendre 3 créneaux pour 2 semaines n'avait pas de sens ; constante `SLOTS_PERIOD` à corriger si l'intention était bien Q2.
- **Localisation** : champ « Ta ville (optionnel) » sur les deux scans. Express : les 3 prompts deviennent « … à {ville} » ; comparateurs : découverte « meilleur {secteur} {ville} » (fait remonter les annuaires locaux). Colonne `comparator_scans.location` (migration `0007_calm_nomad`) pour l'agrégation par niche locale. Clés de cache incluent la ville.
- **Cohérence DA + tracking** : les 2 écrans de résultats utilisent `ScoreRing` (le même que le rapport d'audit de l'app) ; lignes des 4 IA verrouillées **cliquables** → `/login?mode=signup&from=scan-express` ; fix CTA accent qui wrappait ; event `tool_cta_clicked` {tool, cta, …} sur chaque CTA (trial, locked_llm, etude) + `from=` dans les URLs signup pour l'attribution.

**À revisiter** : remplacer le lien Cal placeholder ; décrémenter `SLOTS_LEFT` à chaque vente ; cadrer le prix de l'accompagnement après les premiers appels (doc 04).

#### 2026-06-12 — Funnel /outils/test-visibilite-ia refondu : scan express live + 4 IA verrouillées (n°1bis tranché)

**Contexte** : Max veut remplacer le funnel « formulaire → rapport manuel sous 24 h » par une analyse en direct avec une partie masquée pour pousser vers l'app. Le lead magnet n°1bis « Scan express » (doc 06, proposé 2026-06-11) couvrait déjà l'analyse live — restait à trancher, et à décider comment masquer.

**Options considérées** :
- A : flouter de fausses données multi-LLM — rejeté : pour un outil de *mesure*, simuler des données derrière un flou est un risque de crédibilité fatal si découvert.
- B : verrouiller les 4 autres IA (lignes 🔒, pas de données) avec l'argument variance ×8 de l'étude — honnête, même effet de curiosité.
- C : scanner réellement les 5 IA en live — rejeté (déjà acté doc 06 : coût web_search ~0,04 $/run × 4 + latence, et l'écart 1 vs 5 IA EST l'argument de vente).

**Choix** : B. Scan express = 3 prompts templates × Le Chat (`mistral-small-latest`, ~0,002 €/scan) en première intention ; l'audit manuel 24 h devient l'upsell post-scan (1 champ site) — son canal de conversion 10-20 % est conservé, pas remplacé.

**Découverte au premier test réel** : faux négatif sur les variantes de nom — Mistral (sans web search, knowledge figée) cite « Boursorama Banque » alors que le prospect saisit « BoursoBank » → la regex `detectMentions` seule rendait « absent » en contradiction avec la liste des marques affichée. Fix : l'appel d'extraction juge aussi « cible citée y compris sous un autre nom » ; verdict = regex OU jugement LLM, position connue seulement via regex. C'est le même problème que les aliases du SaaS — bon argument produit.

**Conséquences** : moteur `src/lib/express-scan/` (templates/run/extract/cache/schemas, DI testable, 11 tests), anti-abus spec n°1bis (cap 50/j, 5/h/IP, cache 24 h, honeypot non-sémantique), events PostHog dédiés, notification lead interne. `audit-request-form.tsx` supprimé (remplacé par le mini-form upsell).

**À revisiter** : comparer conversion express → trial vs ex-funnel manuel (PostHog, ~4 semaines) ; passer le teaser sur de vraies données multi-LLM quand un 2ᵉ provider cheap sera branchable en public ; surveiller le cap 50 scans/jour si le tool est promu.

#### 2026-06-12 — Scan comparateurs : enrichissement Mistral Small + persistance DB (DeepSeek refusé)

**Contexte** : suite immédiate du lancement du scan comparateurs (entrée ci-dessous). Max propose d'utiliser un LLM « le moins cher » pour le free tool — y compris DeepSeek — et veut que les scans nourrissent notre base de données (niches, meilleurs sites, comment les cibles ressortent) pour améliorer le ranking long terme.

**Options considérées** :
- A : remplacer Brave par un LLM pour la vérification de présence — rejeté (hallucinations sans web search ; avec web search ≈ 0,04 $/req soit 8× Brave).
- B : DeepSeek pour l'enrichissement — rejeté.
- C : Mistral Small (`mistral-small-latest`, clé déjà en prod) pour classifier les sites + générer un conseil d'inclusion par site, et persister chaque scan en DB.

**Choix** : C. **DeepSeek = anti-décision** : plus cher que Mistral Small (~0,27 $/M input vs ~0,10 $), provider supplémentaire à intégrer pour rien, et données de prospects FR sur serveurs chinois = contradiction frontale avec le positionnement « tout EU / RGPD » qui est un argument de vente (docs 00/01). Vaut pour tous les usages, free tools inclus.

**Conséquences** : module `src/lib/comparators/enrich.ts` (JSON mode, ~0,0001 $/scan, best effort : tout échec → checks intacts) ; table `comparator_scans` (migration `0006_slimy_xorn`, doc 03) qui transforme chaque scan en donnée exploitable (agrégation par `sector_normalized` : niches demandées, sites dominants par secteur, taux de présence) — matière première de la typologie de sources (V1, doc 11) ; conseils « site par site » dans l'UI ; copy ajusté (« vérification par vraies recherches web », la vérification reste 0 LLM).

**À revisiter** : exploiter `comparator_scans` (dashboard interne ou export) quand ≥ ~200 scans ; brancher la typologie accumulée dans l'onglet sources du SaaS (V1).

#### 2026-06-12 — Lead magnet « Scan comparateurs » (/outils/comparateurs) + Brave Search API + nav « Outils gratuits »

**Contexte** : priorité acquisition avant hard launch (demande Max : « il faut mettre le paquet sur l'acquisition »). L'enseignement n°1 de l'étude 50 marques (doc 11) — 32 % des sources citées par les IA sont des comparateurs, 1,7 % le site des marques — se prête à un free tool actionnable : « es-tu présent sur les sites que les IA citent ? ». Post LinkedIn de lancement prévu le jour même (article étude + tool). Cible PME/petites agences/freelances → secteur en champ libre, pas de jargon.

**Options considérées** :
- A : vérification de présence par LLM + web search natif (OpenAI/Gemini) — ~0,04 $/scan, non déterministe.
- B : checklist statique sans vérification live — pas de « aha moment », c'est un article déguisé.
- C : API de recherche web classique (Brave Search vs Serper.dev) — découverte des comparateurs via les SERP réelles + check `site:{domaine} "{marque}"` déterministe.

**Choix** : C avec **Brave Search API** (REST pur, zéro dépendance npm, env `BRAVE_SEARCH_API_KEY`). ⚠️ Brave vs Serper tranché par Claude faute de mieux : 5 $ de crédits offerts/mois (≈ 1 000 req ≈ 100 scans gratuits, vérifié sur le pricing officiel 2026-06-12 — l'ancien free tier 2 000 req/mois a été supprimé en février 2026), puis 5 $/1 000 req, carte requise ; vs Serper 50 $ d'entrée. Si la qualité des résultats FR déçoit, le client est derrière une interface `SearchFn` injectable — swap en 1 fichier (`src/lib/comparators/brave.ts`).

**Justification** : 0 LLM (déterministe, montrable « vraies recherches web »), ~10 req/scan ≈ 0,05 $ payant worst case, rate limit 50 req/s → scan parallélisé en ~5-10 s, et la découverte par SERP « meilleur {secteur} » est exactement le proxy des sources que les IA lisent (validé doc 11). Curaté étude (≈13 secteurs) fusionné avec la découverte live pour couvrir la longue traîne PME.

**Conséquences attendues** : 3ᵉ lead magnet livré (cf. doc 06 § n°1ter pour le détail produit), hub `/outils` + onglet nav « Outils gratuits » avec pastille « Nouveau », notification lead interne par scan, events PostHog. Anti-abus : email gate, honeypot, 5 scans/h/IP, cap 150/jour, cache 24 h marque×secteur — caps in-memory (best effort par lambda), le vrai plafond de coût est le plan Brave.

**À revisiter** : retirer la pastille « Nouveau » ~4 semaines après le lancement ; surveiller la conso Brave au-delà des 5 $ de crédits mensuels (≈ 100 scans) ; typologie des sources dans le SaaS (V1, doc 11) pour faire du tool un teaser de la feature payante ; rate-limit Upstash si les caps in-memory se montrent trop poreux.

#### 2026-06-11 — Ranking étape 4 (scoring systématique) + gamification par le rang

**Contexte** : le pre-screening regex skippait le scoring Haiku quand aucune cible trackée n'était détectée (cas mamie-vege : 60/61 runs skippés) → les marques recommandées « à ta place » étaient perdues, exactement le signal que l'étude 50 marques (doc 11) identifie comme n°1 (l'omission, pas le dénigrement). Max a demandé de pousser ranking + comparaison + gamification.

**Options considérées** : A) lever le skip pour tous les plans / B) gate Starter+ / C) échantillonnage 1 j/semaine.

**Choix** : A — scoring systématique pour tous les plans, plus prompt de scoring explicitement élargi à **toutes** les marques citées (trackées ou non). ⚠️ Décision prise par Claude faute d'arbitrage : coût worst case Solo +0,3 $/mois, Starter +7 $, Pro +22 $ — marges OK, et le ranking est le différenciateur produit. Mitigations B/C documentées dans doc 02, à activer si le poste scoring dépasse ~10 % du MRR.

**Aussi livré** : chart « Évolution de ton rang » (`computeRankHistory` + `RankLineChart` axe inversé + export PNG), statut compétitif au-dessus du leaderboard (« n°2 — à 3 citations de X »), cas « jamais citée » rendu explicite. Orientation gamification actée dans doc 02 : le rang est le jeu, ❌ points/streaks/badges décoratifs ; reste à faire : rang dans le weekly email, badges de statut N°1/Top 3, événements de rang.

**À revisiter** : coût scoring dans `usage_counters.llmCostUsd` après 2 semaines de prod ; weekly email rang (prochaine PR).

#### 2026-06-11 — Publication de l'étude « 50 marques × 5 IA » + doc 11

**Contexte** : première étude publique Mamie GEO (50 marques FR, 40 prompts, 5 plateformes, 613 détections, snapshot 2026-06-10). Données et protocole dans `geo-project/` (`resultats.json`, `scoring.csv`, `methodologie.md`, `angles.md`).

**Choix** : publication d'un article interactif sur le blog (`/blog/etude-visibilite-ia-50-marques-francaises`, catégorie Étude) avec des charts **CSS-only** réutilisant le pattern `BreakdownBars` de l'app (pas de recharts côté blog pour préserver PageSpeed ≥ 98). Composants dédiés exposés via `mdx-components.tsx`. Enseignements produit/playbook/marketing consolidés dans `geo-project/11-etude-50-marques.md` (nouveau doc, référencé dans CLAUDE.md § 5).

**Conséquences attendues** : asset de lancement LinkedIn + SEO ; pipeline de contenu dérivé (4 posts, 2 articles, 1 carrousel, cf. doc 11 § 3.4) ; étude rejouable trimestriellement pour un format récurrent « évolution ».

**À revisiter** : édition T3 2026 (≥ 3 runs par couple, couverture prompts de toutes les marques, cf. doc 11 § 3.6).

#### 2026-06-11 — Compression documentaire globale (CLAUDE.md + geo-project)

**Contexte** : les 14 fichiers markdown pesaient ~525 KB ; CLAUDE.md (50 KB, chargé à chaque session Claude) empilait ~430 lignes d'historique « Précédente (…) » dupliquant ce journal ; plusieurs docs contredisaient l'état courant (trial, pricing, routes, faux ✅ blog).

**Choix** : passe de compression sur tous les docs (-38 % global, 525 → 327 KB) avec règle dure « zéro perte décisionnelle » : décisions, dates, chiffres, noms de tables/fichiers/env vars, KPI, conditions d'arrêt et titres `##`/`###` conservés. CLAUDE.md § 9 devient un snapshot d'état courant **à remplacer, pas à empiler** (l'historique vit ici). Ce journal : 39 entrées conservées, corps compressés (-50 %). Mises à jour de fond au passage : trial 14 j carte requise propagé partout, routes réelles (`/app/citations`), schéma doc 03 complété (`technical_audits`, `audit_counters`, migrations 0000-0005), quotas alignés sur `quotas.ts`.

**Conséquences attendues** : sessions Claude moins chères et plus rapides à amorcer ; docs à nouveau fiables comme source de vérité.

**À revisiter** : si un détail historique manque, `git log` sur le doc concerné (rien n'est perdu côté git).

#### 2026-06-10 — Audit indexation GSC : host canonique non-www + neutralisation des clones .vercel.app

**Contexte** : pages non indexées en GSC. Cause : Vercel servait `www.mamie-geo.fr` en primaire (redirect apex → www en 307) alors que sitemap, robots `Host`, `metadataBase` et canonicals déclarent le **non-www** → toutes les URLs du sitemap en « Page avec redirection ». En plus : 2 clones `.vercel.app` servis en 200 sans `X-Robots-Tag: noindex` (`mamie-geo.vercel.app` + `mamie-geo-gg22.vercel.app`, 2e projet Vercel branché sur le repo), et 6 pages sans canonical auto-référente.

**Choix** :
- Host canonique = **`mamie-geo.fr` (non-www)**, conforme à CLAUDE.md. Action manuelle Vercel : inverser le primaire (www → apex en 308).
- `next.config.ts` `headers()` : `X-Robots-Tag: noindex, nofollow` sur tout host `(.*\.)?vercel\.app` → neutralise les 2 clones.
- Projet `mamie-geo-gg22` à supprimer / déconnecter du repo (action Max).
- Canonicals auto-référentes ajoutées (home, pricing, 2 outils, blog index, légales via `export const metadata` MDX), résolues via `metadataBase` → consolident vers l'apex quel que soit le host servi.

**Justification** : le fix host primaire débloque réellement l'indexation ; canonicals + noindex = ceinture défensive.

**Conséquences attendues** : après bascule + re-soumission sitemap, résorption « Page avec redirection » / « Page en double » (validation GSC ~2 semaines).

**À revisiter** : vérifier GSC sous ~2 semaines (« Dans l'index »). Si `mamie-geo-gg22` réapparaît, couper le déploiement à la source.

#### 2026-06-10 — Ranking suite : hint de fiabilité auto-extinguible, étape 3 (position concurrents), Suivre depuis le classement

**Contexte** : demande Max — hint discret « les résultats gagnent en pertinence avec le temps », auto-disparaissant, + carte blanche features.

**Choix** :
- **Hint piloté par la donnée** (pas de dismiss manuel ni localStorage) : `getRankingData` renvoie `dataDays` (jours distincts avec ≥ 1 run sur la fenêtre) ; ligne discrète (texte muted + icône Info, volontairement pas un Banner) affichée tant que `dataDays < RANKING_RELIABLE_AFTER_DAYS` (= 14, constante exportée dans `ranking.ts` ; 2 cycles hebdo complets). S'éteint seul, rien à nettoyer.
- **Étape 3 livrée** (cf. doc 02) : champ `position` (`first_paragraph|middle|end`) ajouté aux `competitorsMentioned` du tool schema scoring — requis côté schema, parsing **lénient** côté code (payloads pré-2026-06-10 et omissions du modèle valides). Type `ScoringMentionPosition`. La donnée s'accumule sans coût marginal ; ranking de prééminence branchable plus tard.
- **Bouton pill `+ Suivre`** sur les lignes « détectée » du classement → server action `createCompetitor` existante (quota + RBAC inclus) → toast + refresh. Event PostHog `ranking_discovered_tracked` (name, rank).

**À revisiter** : seuil 14 j à ajuster avec les retours ; étape 4 (scoring systématique) toujours à trancher.

#### 2026-06-10 — Ranking concurrentiel étapes 1+2 : onglet Classement sur /app/citations, zéro migration

**Contexte** : Max valide les étapes 1+2 (cf. doc 02 § Ranking concurrentiel) ; l'analyse prévoyait une table `competitor_metrics_daily`.

**Découverte à l'implémentation** : `citation_metrics_daily.competitors_data` (jsonb) **historisait déjà** les mentions concurrents par jour × LLM (name + citationCount + sentiments) depuis la Phase A (`aggregateVisibility`) — jamais lue côté produit.

**Choix** : zéro nouvelle table ni migration — le ranking lit `competitors_data`. Chart « évolution du rang » reporté ; le delta J-7 couvre le besoin.

**Détail livré** :
- `computeRanking()` pure dans `src/lib/competitors/ranking.ts` (7 tests) : agrège `brandCitedCount` (toi) + `competitors_data` (trackés matchés name+aliases via `normalizeBrandToken` partagé avec metrics.ts, sinon « marques détectées » cap top 5), fenêtre 30 j + rang précédent sur fenêtre décalée J-7 (null sans historique — pas de backfill, même politique que le funnel sources).
- `getRankingData()` dans `src/lib/competitors/queries.ts` : 1 SELECT sur `citation_metrics_daily` (37 jours), classements tous-LLMs + par LLM.
- Onglet « Classement » (3e tab `/app/citations`, deep-linkable `?tab=ranking`, icône Trophy) : SegmentedControl Tous/par LLM, table Rang / Marque (favicon + badge Toi / « détectée, non suivie ») / delta ↑↓ / Citations / Apparition. Ligne « toi » toujours présente même à 0 (« jamais citée sur la fenêtre »). Footer → onglet Concurrents.
- Events PostHog : `ranking_viewed` (window_days, total_runs, entries) + `ranking_scope_changed` (from, to).

**Conséquences** : vue « qui domine » à coût LLM nul ; marques détectées non suivies visibles (cas mamie-vege). Delta J-7 actif dès 7 jours de données.

**À revisiter** : étape 3 (livrée le jour même, cf. entrée précédente) ; étape 4 (scoring systématique, lever le skip regex — décision pricing) ; chart évolution du rang quand l'historique sera dense.

#### 2026-06-10 — Refonte page Conseils : plan d'action priorisé (tri par impact) au lieu de la grille par axe

**Contexte** : retour Max sur `/app/conseils` — la grille 2×2 par axe (colonnes 1/3/5/1, actée la veille) créait des trous blancs massifs et un ordre de lecture ambigu.

**Options considérées** : (a) kanban 4 colonnes / (b) masonry CSS / (c) liste pleine largeur triée par impact.

**Choix** : (c). Le kanban hérite du déséquilibre, le masonry casse l'ordre de lecture. La page devient un **plan d'action ordonné**, pas un sommaire thématique.

**Détail** : 2 sections pleine largeur (« Commence ici — leviers à impact fort » 6 leviers / « Ensuite — pour aller plus loin » 4), numérotation continue 01-10 ; nouvel export `GEO_TIPS_BY_PRIORITY` dans `src/lib/geo-advice.ts` (le champ `impact: "high" | "medium"` existait déjà, inutilisé) ; axe conservé en badge par levier + légende chips (4 × compteur) dans l'intro pleine largeur ; items dépliables, callouts « À retenir », `appHint` inchangés. Doc 10 § Layout app amendé : regroupement thématique seulement si les groupes sont équilibrés, sinon trier par priorité.

**À revisiter** : statut live pass/fail par levier auditable (cf. 2026-06-09) — la liste priorisée s'y prête (checklist).

#### 2026-06-09 — Sweep cohérence UX/UI (audit global) : PageContainer partout, tables responsive, microcopy tutoiement

**Contexte** : audit UX/UI global (marketing + app), chaque finding vérifié manuellement — plusieurs faux positifs écartés (ex. contraste gray-400 de la FinalCTA en réalité ~8:1 AAA, fix délibéré du 2026-05-26 conservé).

**Options considérées** : (a) gros lot (breadcrumbs, lexique loading, confirmation export) / (b) lot resserré sur les incohérences avérées.

**Choix** : (b). Écartés volontairement : confirmation avant export CSV, toasts sur pagination client-side, lexique `LOADING_STATES` centralisé (over-engineering pour 5 libellés).

**Détail livré** :
- Nav marketing francisée : « Features » → « Fonctionnalités » (header desktop, burger mobile, footer).
- `<PageContainer>` appliqué à 100 % des pages app : nouvelle largeur `detail` (`max-w-5xl`) ; `dashboard` (div 6xl hardcodé) → `default` ; `audits/[id]`, `prompts/[id]` (5xl), `runs/[id]` (4xl → 5xl) → `detail`. Bonus : `<main>` imbriqués invalides corrigés (le layout `(with-nav)` fournit déjà le `<main>`).
- Tables responsive (`/app/prompts`, concurrents `/app/citations`) : colonnes secondaires `hidden md:table-cell` (prompts : Catégorie/Cadence/Runs success/Dernier run ; concurrents : Type/Top LLM/Dernière) + `min-w` appliqué dès `md` seulement → plus de scroll horizontal en portrait mobile. Helpers `Th`/`Td` acceptent `className`.
- A11y clavier : focus ring (`focus-visible:ring-2` ink) sur les boutons icône « Retirer » du wizard onboarding.
- Microcopy : `EntityTypeBadge` « Vous » → « Toi » ; « Enqueue en cours… » → « Lancement… ».
- Dialog suppression de compte : paragraphe → liste à puces + ligne remboursement séparée.

**Conséquences** : convention « une page = un PageContainer » vraie à 100 %, app utilisable en portrait mobile, tutoiement cohérent.

**À revisiter** : breadcrumbs pages détail (reporté — « Retour » suffit à 2 niveaux) ; variant card-layout mobile pour les tables si les colonnes masquées manquent (attendre feedback).

#### 2026-06-09 — Harmonisation layout app : `<PageContainer>` + système de blocs multi-colonnes + dé-dup Conseils/Audit

**Contexte** : retour Max (« plusieurs colonnes, pas tout les uns sur les autres »). Audit des layouts `(app)/app/(with-nav)/*` : largeurs incohérentes (`max-w-2xl/3xl/5xl/6xl`), `runs` en `<h1>` brut sans `PageHeader`, doublon tableau d'URLs auditées Conseils ↔ `/app/audits`.

**Options considérées** : merger Conseils dans Audit / séparer + dé-dupliquer ; layout au cas par cas / primitive partagée + convention.

**Choix** (validés Max) : séparer + dé-dupliquer, leviers en 4 blocs par axe, sweep d'harmonisation complet.

**Détail** :
- Primitive `<PageContainer width="default|narrow|form">` (`src/components/ui/page-container.tsx`, exportée par l'index) = `mx-auto px-6 py-12 lg:px-10` + largeur (`6xl/3xl/2xl`). Appliquée à toutes les pages app.
- `PageHeader` partout (`runs` migré). Exception assumée : `audits/[id]` garde sa carte ScoreRing en hero.
- Convention de blocs : `grid items-start gap-4 lg:grid-cols-2` ; tables/listes pleine largeur ; pages `narrow` mono-colonne. Cf. doc 10 § « Layout app ».
- Conseils refondu en 4 cartes d'axe 2×2 (superseded le 2026-06-10, cf. § Refonte page Conseils) ; tableau d'URLs supprimé (vit sur `/app/audits`), page repassée statique, cross-link réciproque Conseils ↔ Audits.

**À revisiter** : 2-col sur tables larges (peu probable) ; statut live pass/fail par levier auditable.

#### 2026-06-09 — Lien « Contacter le support » → réservation Cal.com

**Contexte** : besoin d'un canal de contact direct ; pas de helpdesk en V0.

**Choix** : item « Contacter le support » dans le menu utilisateur sidebar → modal Cal.com (`mc.maxence/support-mamie-geo`, namespace `support-mamie-geo`, brand `#339CFF`).

**Détail** : embed element-click Cal.com (snippet officiel) injecté via `next/script` `afterInteractive` dans `<CalSupportEmbed>`, monté une fois dans le layout `(app)`. Pas de dépendance npm (`@calcom/embed-react` évité). Trigger = `<button data-cal-link data-cal-namespace data-cal-config>` dans le `DropdownMenuItem`. Constantes `CAL_SUPPORT_*` exportées depuis `cal-support-embed.tsx`. Event PostHog `support_cal_opened` (`source: "user_menu"`). Setup : l'event type Cal `support-mamie-geo` doit exister sur le compte `mc.maxence`.

**À revisiter** : si volume support > gérable en 1:1, vrai canal (email dédié / Crisp / helpdesk).

#### 2026-06-09 — Refonte UI rapport d'audit + resserrement du border-radius global

**Contexte** : Max juge `/app/audits/[id]` « plate, pas assez gamifiée » et le radius global trop arrondi (« mou ») ; 7 screens de référence fournis. Conventions tirées : score en anneau circulaire coloré, barre de synthèse segmentée par sévérité, pills d'issues, sous-scores en barres, radius serrés.

**Options considérées** : A refonte cosmétique de la card score / B refonte complète + primitifs réutilisables + radius global.

**Choix** : B (validé Max via picker : radius « serré » + refonte « complète »).

**Détail** :
- Radius global `globals.css` : `sm 6→4 · md 10→6 · lg 16→8 · xl 20→12` (pill inchangé). Touche toute l'app via les tokens `--radius-*`. Boutons restent `pill`.
- 3 primitifs UI dans `src/components/ui/` (exportés par l'index, réutilisables dashboard) : `<ScoreRing>` (anneau SVG, arc animé au montage, client), `<SegmentBar>` (server), `<ScoreBar>` (server).
- `scoreColor()` centralisé dans `src/lib/audit/score.ts` (≥80 vert / ≥60 ambre / <60 rouge) — remplace 3 duplications (détail, liste, comparaison). Le lead magnet marketing garde son scale 75/50.
- `/app/audits/[id]` : header refait (ScoreRing 128px + URL/méta + pills d'issues empilées + SegmentBar + 4 ScoreBar). `ChecksBySeverity` inchangé.
- `/app/audits` liste : chiffre nu → mini ScoreRing 52px par ligne.

**À revisiter** : si le dashboard adopte ScoreRing, vérifier que le scale 80/60 convient aux scores de visibilité (sinon paramétrer les seuils).

#### 2026-06-09 — Page « Conseils GEO » (10 leviers) en route dédiée, pas dans l'audit technique

**Contexte** : carrousel LinkedIn (Amandine Bart, « SEO sans migraine ») — 10 facteurs pour être cité par les IA. Onglet de l'audit ou page à part ?

**Options considérées** : A section/onglet dans `/app/audits/[id]` / B route dédiée `/app/conseils`.

**Choix** : B. L'audit est **automatique et par-URL** ; 8 des 10 leviers sont **off-page et stratégiques** (branding, mentions, YouTube, avis, comparatifs…) non détectables par crawl. Page dédiée = playbook evergreen servant le drip d'éducation post-signup.

**Détail (état final après itérations)** :
- Route `(with-nav)/conseils` : `page.tsx` (server dynamique, `listAudits`) + `conseils-view.tsx`.
- Contenu dans `src/lib/geo-advice.ts` (10 leviers + 4 axes + synthèse + flag `auditable`), réutilisable (newsletter, blog, drip). Chiffres attribués à l'étude Ahrefs, au conditionnel.
- Accordéon `<Collapsible>` par levier (numéro + titre + badge d'axe + résumé ; détail = corps + puces + callout « À retenir » + cross-link `appHint`). Premier levier ouvert par défaut.
- Tableau « Vérifie tes pages » : URLs auditées de la workspace (URL · ScoreBadge /100 · dernier audit), lignes cliquables → `/app/audits/[id]` + ligne `+ Auditer une URL` → `/app/audits/new`.
- Entrée sidebar « Conseils GEO » (icône Lightbulb). Patterns documentés doc 10 § Patterns liste & contenu (2026-06-09).

**Itérations design (mémo)** : badge « Impact » sur chaque carte rejeté (anti-pattern doc 10 : emphase partout = rien ne ressort) ; pill « chiffre clé » inline → bandeau sous carte → remplacé par le tableau d'URLs auditées (plus concret).

**À revisiter** : (a) version publique SEO (`/guides/...`) si traction ; (b) statut live pass/fail par levier une fois le mapping levier→checks posé (flag `auditable` statique aujourd'hui).

#### 2026-06-08 — Veille Peec AI exhaustive (docs.peec.ai) + ajout de 5 features V1 + polish UI app inspiré

**Contexte** : veille Peec précédente du 2026-05-11. Lecture exhaustive de docs.peec.ai (`intro-to-peec-ai`, `/understanding-your-performance`, `/brand-insights`) + reco rapport 2026-05-11 + workduo.ai pricing. Notre `/app/*` est fonctionnellement équivalent mais moins « premium » (densité, hiérarchie typo, badges colorés).

**Findings produit (non couverts V0+)** : 1. Performance Matrix (axe X × Y parmi Topics/Models/Geographies/Competitors × métrique Visibility/Sentiment/Position/SoV) ; 2. Rankings Table avec sélecteur de dimension (By AI Model / topic / tag) ; 3. Domain Types classification (Editorial/Corporate/UGC/Reference/Institutional + ring chart, ~1 LLM call/source mensuel) ; 4. Volume (Beta) — search volume par prompt (DataForSEO probable) ; 5. Query Fanouts (sub-queries du web search ChatGPT) ; 6. Brand Visibility vs Source Visibility (« Spot gaps » — on a la data, pas la viz) ; 7. Strongest/Weakest model par marque ; 8. Recent Chats en double format (cards overview / table page prompt) ; 9. Mode plein écran sur matrices/charts.

**Findings UX/UI** : header inline avec résumé (`Overview · Visibility trending up 5.2%`) ; 3 micro-KPIs deltas en haut-droite ; filtres globaux pills persistants entre pages (gros gap chez nous) ; mini-badges colorés inline `| 86` ; sidebar avec eyebrow « Pages » + item actif `bg-gray-100` ; cards radius ~16px, padding plus aéré.

**Choix** :
- A. Findings consolidés ici + reco V1 enrichies dans doc 02 (Performance Matrix, Domain Types, Volume prompts, Brand vs Source Visibility, Strongest/Weakest model).
- B. Polish UI ciblé sans refonte identitaire : `<PageHeader title summary kpis />` réutilisable (câblé sur `/app/dashboard`), padding `<Card>` p-6, `type-stat` 2.25rem → 2rem, `<MetricBadge tone value />` pattern « | 86 ».

**Hors périmètre** : Performance Matrix, filtres globaux pills, ring chart Domain Types, Volume DataForSEO, Query Fanouts = features V1 (doc 02), pas codées ici.

**À revisiter** : 2026-07-15 — après 4 semaines de prod, mesurer si l'engagement justifie d'étendre `<PageHeader>` aux 8+ pages app restantes.

---

#### 2026-06-08 — Refonte funnel conversion : plan picker post-onboarding + sidebar Subscribe + trial 14j avec carte requise (lève la décision 2026-05-14)

**Contexte** : funnel passif — post-onboarding, `workspace.plan="trialing"` (quotas 0/0) et un seul signal : `<UpgradeBanner>` ignorable ; trialing indéfini possible. Inspiration Waalaxy (modal post-signup + sidebar Subscribe card).

**Options considérées** : A statu quo (conv ~5-15 %) / B trial SANS carte (~$3-15 LLM/user gaspillé — raison du refus 2026-05-14) / C trial AVEC carte requise (conv ~50-70 %, zéro risque LLM) / D picker sans trial.

**Choix** : C — trial 14 j avec carte requise. Levée explicite de la condition « quand capital disponible » du 2026-05-14 : la carte est posée au checkout, l'user n'est pas facturé 14 j, Stripe bascule auto en active sauf annulation → zéro perte sèche LLM, rien à financer. Annuel pré-sélectionné (Save 20 %, `ANNUAL_DISCOUNT_PCT` existant) → ARPU/LTV ↑ dès J0. Picker post-onboarding + sidebar card = moment de décision actif (standard Vercel/Linear/Cal.com/Waalaxy).

**Adaptations vs Waalaxy littéral** : pas de dark pattern loss-aversion (clash brand « Mamie » + la cible SEO FR le repère) ; ton hybride — sobre au signup (X classique, microcopy honnête), pushy en fin de trial (bandeau urgence J-2 + variant « expired » sans X mais lien « plus tard 24h »).

**Conséquences attendues** : conv trial ~50-70 % vs 5-15 % ; funnel mesurable via events PostHog `plan_picker_opened`, `plan_picker_skipped`, `plan_picker_billing_cycle_toggled`, `plan_picker_trial_started`, `sidebar_subscribe_card_clicked`, `trial_started`, `trial_will_end_3d`, `trial_converted_paid`, `trial_canceled`, `trial_email_sent` ; 2 emails de relance (J-4 + J-1) + 1 post-expiry depuis le webhook ; garantie remboursement 14 j conservée post-paiement (à expliciter /pricing FAQ V0+).

**À revisiter** :
- À 20+ checkouts initiés : comparer trial-to-paid avec/sans annuel par défaut ; repasser mensuel si l'annuel ne convertit pas plus.
- Si < 50 % conversion trial→paid : itérer copy picker + emails J-4/J-1 (a/b via `useFeatureFlag` scaffold).
- Setup Stripe restant : créer les 3 Prices annuels (`STRIPE_PRICE_SOLO_ANNUAL` / `STARTER` / `PRO`, monthly × 12 × 0,8). Sans ces env vars, fallback gracieux mensuel (warn).

---

#### 2026-06-08 — Instrumentation PostHog exhaustive (autocapture + session replay + ~40 events custom) avant trafic

**Contexte** : wizard initial (commit `e66dd07`) = 15 events business + reverse-proxy `/ingest` + identify minimal. Manquaient : autocapture, pageviews, session replay, identify enrichi (plan/role/brand_count), Groups Analytics, events CRUD/exports/quotas/banner. Lancement imminent + trafic nul = moment idéal.

**Options considérées** : A MVP analytics (4 events critiques) / B couverture funnels (10 events) / C couverture exhaustive (~40 events + replay + Groups + scaffolding flags).

**Choix** : C. Justification : trafic nul = zéro pollution rétroactive ; coût marginal faible (helpers one-liner) ; replay + `person_profiles: "always"` = funnels reconstructibles rétroactivement ; PostHog EU + proxy first-party + masquage PII (`input[type=email|password]` + convention `[data-private]`) + mention `/legal/privacy` → opt-in implicite défensible sans banner cookie (approche Linear/Vercel, ePrivacy compliant).

**Conséquences** :
- Funnel complet marketing → signup → onboarding → first_run_completed → first_metric_viewed → paid → churn ; Groups Analytics workspace (plan, mrr, brand_count, prompt_count) ; replays pour user research.
- **Bug fix Stripe webhook** : `subscription_activated/canceled/payment_failed` utilisaient `ws.id` comme `distinctId` → merge personne cassé. Corrigé via `findWorkspaceOwnerUserId()`, `ws.id` déplacé dans `groups.workspace`.
- Helpers réutilisables : `TrackedLinkButton`, `PageViewTracker`, `ArticleAnalytics` (scroll depth dédupliqué), `DashboardTracker`, `UpgradeBannerLink`, `useFeatureFlag(key)` client + `isFeatureEnabled()` serveur.
- Webhook Brevo `/api/webhooks/brevo` scaffold (inerte tant que Brevo dashboard pas configuré) → permettra `weekly_recap_email_clicked`.
- Privacy policy enrichie d'une section « Analytics produit » (PostHog sous-traitant EU, masquage PII, droit de retrait email).

**À revisiter** : à 1000 events/jour, vérifier l'exploitabilité des funnels/cohorts ; ajuster la granularité (ajouter ou consolider).

---

#### 2026-06-03 — Pivot brand color terracotta `#C5532E` → bleu logo `#329CFF` + admin visuels LinkedIn

**Contexte** : logo bleu cobalt `#329CFF` (décision 2026-05-13) mais accent app/doc 10 encore terracotta `#C5532E` → dissonance brand (« la marque dit bleu, le produit dit orange »).

**Options considérées** : A statu quo / B bleu sur visuels LinkedIn seulement / C sweep brand complet.

**Choix** : C — sweep complet.
- Tokens `--color-accent*` **conservés comme aliases** pointant sur le bleu (pas de rename des 22 fichiers utilisant `text-accent` / `bg-accent-faint` / `tone="accent"`).
- `card-hover-warm` et `gradient-warm-panel` gardent leur nom historique, valeurs basculées en dégradés bleus (pêche → bleu pâle ; panel login orange → bleu clair).
- `--gradient-ai` : `terracotta → purple → bleu` devient `bleu → purple → pink`. Reste autorisé sur boutons actions IA ; interdit en hero/fond large maintenu (doc 10 nuancé).
- 4 templates email mis à jour (audit-score-drop, payment-failed, technical-audit-report…). Doc 10 ~7 § mis à jour (archive « Direction A — éditorial chaud » intacte).

**Livré dans le même PR** : page admin protégée `/app/admin/visuals` (guard email Max) + premier visuel tableau comparatif SEO vs GEO 1080×1350 portrait (post LinkedIn 2026-06-02) + bouton « Télécharger PNG » via `html-to-image` (dep ajoutée).

**À revisiter** : si retours « bleu trop saturé », envisager `#1d7ee5` (`--color-primary-dim`) comme valeur d'accent.

#### 2026-06-05 (soir) — Raffinement DA carrousels v2 : fond blanc + bleu brand primaire, marguerite retirée

**Contexte** : carrousel SEO vs GEO v1 (commit `c3b92e3`, persona Mamie) validé sur le principe, mais 5 retours Max pour les **prochains** carrousels : (1) corps trop petits en vignette feed mobile, (2) contrastes insuffisants, (3) préférer fond blanc classique, (4) bleu brand `#329CFF` en couleur principale, (5) pas de fleur (marguerite kitsch). Synthèse : « simplifier et rendre ça plus pro ».

**Décision** : ne pas refaire le carrousel v1 (gardé en historique) ; raffiner `linkedindesign.md` en **v2** pour tous les prochains visuels :
- § 2 Palette : blanc `#FFFFFF` fond par défaut (~80 % des slides), crème/sable occasionnels (1-2 slides max), **bleu brand promu primaire visible sur chaque slide** (logo + 1 accent typo + CTA + dots), terracotta/miel/sauge/rose en accents secondaires jamais en fond plein (sauf 1 slide CTA exceptionnelle). Contraste AAA visé, AA minimum strict, blanc sur bleu brand uniquement en titres ≥ 24 px bold.
- § 3 Typo : minima relevés (corps ≥ 32 px, corps large 40-48, label 24-28, hook 120-150) + test vignette ~135×168 px obligatoire avant publication.
- § 4 Formes : **marguerite-signature retirée**, plus de festons/stickers (washi-tape, tampon, fleurs vintage). Identité = logo bleu + palette restreinte + Fraunces. Accents autorisés : flèches `→`, coches `✓✗` en pills, pastilles rondes/icônes Lucide.
- § 8 : 4 techniques (surligneur miel, mot en bleu, italique Fraunces, pill-étiquette) ; souligné manuscrit retiré, Caveat en usage rare.
- § 11/12 : anti-patterns ajoutés (marguerite/stickers, Caveat déco, corps < 32 px, blanc sur miel/sauge) + prompt réutilisable refondu.

**Code conservé** : carrousel v1 en l'état ; primitives `<Daisy>` / `<Highlight>` / `<BrandHeader>` / `<SlideShell>` restent dans `_primitives/` — `<Daisy>` à ne plus instancier (supprimer quand le carrousel v1 sera refait/archivé) ; thème `white` manquant à ajouter dans `tokens.ts` au prochain carrousel.

**Risque** : se rapprocher trop de la DA app (blanc + bleu + Inter) — Fraunces + accents chauds ponctuels doivent rester perceptibles pour ne pas dissoudre le dual-DA.

**À revisiter** : lisibilité vignette du premier carrousel v2 ; si après 3-4 carrousels la frontière app/marketing devient floue, ré-évaluer (renforcer un accent propre ou assumer la fusion).

#### 2026-06-05 — Refonte DA carrousels LinkedIn → persona « Mamie » (chaude, marguerite, Fraunces) — dual-DA acté

**Contexte** : Max rédige `geo-project/linkedindesign.md` (persona « Mamie » : chaud, manuscrit, marguerite, serif) et demande la refonte complète des visuels. Tension apparente avec le pivot bleu 2026-06-03 et doc 10 (Inter unique, pas d'italique).

**Options considérées** : A étendre la persona Mamie à tout le site/app (rejeté, casse la cohérence SaaS) / B ignorer le brief (rejeté) / C dual-DA.

**Choix** : C — **dual-DA assumé** :
- App `(app)/*` + site marketing : Airbnb-like minimaliste inchangé (Inter, blanc + gris, bleu `#329CFF` accent ponctuel). **Aucun changement.**
- Carrousels LinkedIn + visuels marketing externes (OG V1+, blog covers V1+) : persona Mamie selon `linkedindesign.md` — palette chaude (crème/sable/encre/terracotta/miel/sauge/rose), typo Fraunces + Hanken + Caveat, marguerite, surligneur miel.
- **Bleu brand `#329CFF` reste primaire dans les carrousels** (confirmé Max) : logo sur fonds clairs, 1 accent typo par slide, dots pagination. Remplace le « bleu pervenche `#A9C0D6` » du brief original.

**Justification** : carrousels = canal d'acquisition LinkedIn (chaleur différenciante vs Profound/Peec/Mint) ; app = outil de mesure (sobriété, crédibilité technique) ; le bleu commun fait le fil conducteur.

**Livré** : `linkedindesign.md` annoté (scope carrousels-only) ; Fraunces (600/700/900) + Hanken Grotesk (400/500/700) + Caveat (400/700) via `next/font/google` dans `src/app/(app)/app/admin/layout.tsx` uniquement ; refonte `src/components/admin/visuals/_primitives/` : `tokens.ts` (palette Mamie 8 couleurs + brandBlue + 5 thèmes cream/sand/terracotta/honey/sage), `daisy.tsx`, `highlight.tsx`, `brand-header.tsx`, `slide-shell.tsx` (1080×1350, marges 80px, header/footer auto) ; suppression `brand-pill.tsx`, `slide-number.tsx`, `waves-decoration.tsx` ; refonte des 3 slides SEO vs GEO (cover terracotta + hook Fraunces 118pt, comparaison crème 2 colonnes, CTA crème + Caveat).

**Conséquences** : tokens `--color-cream*` du 2026-06-04 inutiles côté carrousels — restent dans globals.css, à nettoyer si toujours unused dans 1 mois. `linkedindesign.md` = source de vérité des futurs carrousels.

**À revisiter** : aligner toute génération auto sur linkedindesign.md ; module marketing externe (OG, covers) si la persona tire les conversions (pas avant 30 j de data) ; pont visuel si confusion carrousel chaud → site froid.

#### 2026-06-04 — Système design carousels LinkedIn (style « Unified ») + crème chaude 3e ton marketing

> Superseded dès le 2026-06-05 par la persona « Mamie » (cf. entrées ci-dessus). Conservé en historique.

**Contexte** : référence Pinterest « Unified™ » (pastel jaune/lavande, big bold typo, vagues organiques) à adapter à Mamie GEO.

**Options** : A copie palette Unified / B bleu brand strict / C bleu + ink + crème chaude `#fff4d6` (retenu).

**Choix** : C. Tokens ajoutés à `globals.css` (réservés visuels externes, jamais dans l'app) : `--color-cream: #fff4d6`, `--color-cream-soft: #fffbed`, `--color-cream-strong: #fcd34d`. Refonte `SeoVsGeoVisual` style Unified (fond crème, vagues bleu pâle, brand pill ink, slide number `01 / 01`, headline 88pt, paper-note card, pastille ink 80 %). 3 primitives co-localisées (`BrandPill`, `SlideNumber`, `WavesDecoration`) — supprimées le 2026-06-05.

**À revisiter** : obsolète (système remplacé le 2026-06-05).

#### 2026-05-26 — Polish "belle V0" pré-lancement + CTA prix dans le bouton + stats honnêtes

**Contexte** : audit comparatif vs getmint.ai (concurrent FR direct) avant hard launch. 3 piliers conversion manquants : preuve produit visible (zéro screenshot réel), garanties surfacées (garantie 14j enterrée en FAQ), différenciation concurrentielle prouvée (pas de page comparative).

**Décisions actées** :
1. **CTA hero avec prix** (pattern Linear/Vercel) : « Démarrer — 9,99 €/mois » + microcopy « Garantie remboursement 14 jours · Sans engagement · Hébergé EU ». Idem `<FinalCTA>` et `/vs/profound`.
2. **Pas de testimonials inventés** (rejet pattern Mint « 200+ marques ») : `<ProofStrip>` avec 3 stats factuelles (« 5 IA trackées · 30+ checks gratuits · 10 min pour le 1ᵉʳ rapport »). Bascule `<Testimonials>` à 3+ vrais clients nommés.
3. **TrustStrip après PourquoiMaintenant** (le `mb-[-200px]` du `<HeroDataShowcase>` interdit la place sous le hero — coupe signature préservée).
4. **Mobile hero data showcase** : variante `md:hidden` 2 cards (Score + Évolution) — avant : invisible sur 60 %+ du trafic.
5. **Page `/vs/profound`** : landing comparative recyclant 80 % de l'article blog. SEO « alternative Profound » FR (zéro compétition). `/vs/mint` et `/vs/peec` en P1.
6. **`<ProductTour>` préparé en attente** + script `pnpm seed:demo` (marque fictive « La Maison Verte », 30 j de `citation_metrics_daily` déterministes). Non monté tant que les `.webp` n'existent pas dans `public/marketing/dashboard/`.
7. **Footer nettoyé** : retrait lien mort `/docs`, colonne « Comparatifs », bloc trust RGPD (« Hébergement EU · RGPD natif · DPA disponible · 0 tracker publicitaire »).

**Reste à faire « belle V0 »** : captures dashboard + activation ProductTour ; décision export CSV (livré 2026-06-08) ; `/vs/mint` `/vs/peec` ; section intégrations & exports (P1).

**À revisiter** : sous 3 mois post-lancement, ou dès 3 vrais clients pilote → bascule `<ProofStrip>` en `<Testimonials>`.

---

#### 2026-05-22 — Phase C livrée + polish UX V0+ + retrait pattern signature (rollback 2026-05-18)

**Contexte** : clôture Phase C (2026-05-18 → 22, multi-LLM + Stripe + emails) + démarrage V0+. Décisions groupées :

1. **Multi-LLM livré** (PR1-5, 2026-05-18) : Anthropic Claude Haiku 4.5 ; Mistral `mistral-large-latest` (PR2, sans web_search natif — Mistral Agents API plus tard) ; OpenAI `gpt-4o-mini` + web_search Responses API (PR3) ; Google `gemini-2.5-flash` + grounding Search (PR4) ; Perplexity `sonar` (PR5, code prêt, activation dès `PERPLEXITY_API_KEY` — crédit min $50). Source de vérité : `getConfiguredLLMs()` + flags `IMPLEMENTED_LLMS` dans `src/lib/llm/index.ts` ; le scheduler auto-détecte.
2. **PR6 KPI dashboard** (2026-05-20) : coût USD retiré côté client (donnée technique sans valeur métier) ; 3 stats élargies Claude-only → agrégat tous-LLMs (bug d'héritage Phase A) ; 4e stat **Part de voix** = `brand / (brand + Σ concurrents) × 100`, fonction pure `computePartDeVoix()` dans `src/lib/metrics/part-de-voix.ts` (8 tests).
3. **AppTopBar horizontale pattern Vercel** (2026-05-20) : workspace + brand pill en top bar sticky ; `<BrandFavicon>` via Google s2 favicons + fallback (carré ink + initiale) ; sidebar = logo + nav + user menu.
4. **Pattern signature blue RETIRÉ** (rollback de la décision 2026-05-18) : 4 itérations login non concluantes → fausse bonne idée. Suppression radicale : `<PatternBlock>`, classes `.bg-pattern*`, assets `pattern.svg` (×2), 3 usages site (hero, audit-teaser, login) + 2 usages emails. Identité = logo + primary + CornerFrame + favicon top bar. Le terracotta `--color-accent` reste actif comme avant 2026-05-18.
5. **Background app gris `#fafafa`** : `body` = `var(--color-surface)` ; cards/sidebar/topbar/tables restent `bg-white` → émergent, effet « premium SaaS » Linear/Vercel. Règle doc 10 reformulée : « cards toujours blanches sur fond gris ».
6. **Refonte audit by severity** : `/app/audits/[id]` groupé critical/warning/info (au lieu de fail/warn/pass) via `<ChecksBySeverity>` — 3 sections dépliables fusionnées (trigger + items dans la même card), critical+warning ouverts, info fermé. Bulle notif rouge sidebar « Audits techniques » si checks `critical+fail` non résolus > 0 (dernier audit par URL owned).
7. **Brand creation depuis BrandSwitcher** (2026-05-20) : server action `createBrand` dans `src/lib/brands/actions.ts` (auth + rôle owner/admin + quota). Champ `brands` dans `PlanQuotas` : Solo/Starter 1, Pro 3, Agency 10, Enterprise ∞. Dialog 2 modes (form ou CTA upgrade).
8. **Newsletter blog Brevo** (2026-05-20) : form `/blog` + helpers `subscribeContactToBlogList` / `sendNewArticleNewsletter` dans `src/lib/email.ts` ; endpoint `/api/blog/notify-publish` (protégé `CRON_SECRET`) appelé par le launchd publication-mamie-geo.sh → broadcast à la liste `BREVO_BLOG_LIST_ID`.
9. **Em dashes `—` retirés côté site** (2026-05-20) : sed `s/ —/,/g` sur src/app, src/components, src/content, src/lib/email. Placeholders `"—"` (no value) préservés.

**Conséquences** : doc 10 (§ pattern + règle fond) et doc 03 (quotas `brands`) mis à jour ; Phase C marquée livrée dans CLAUDE.md § 9.

**À revisiter** : si manque de signature visuelle remonté après le retrait pattern, nouveau ticket design (pas de damier — ligne diagonale, gradient subtil, ou pictogramme).

#### 2026-05-18 — Pattern signature blue (damier diagonal) remplace progressivement le terracotta

> ⚠️ **ROLLBACK 2026-05-22** : décision annulée 4 jours après — voir § 2026-05-22 (suppression complète du pattern). Conservé en historique.

**Résumé** : banner LinkedIn de Max avec damier diagonal 80×80 bleu primary → promu signature graphique destinée à remplacer progressivement le terracotta (option B retenue parmi : A signature additionnelle / B remplacement progressif / C décoratif sans statut). Livré : `/public/pattern.svg` (fill `#329cff`), classe `.bg-pattern` (tint via `mask-image`), composants `<PatternBlock corner tone size />` + `<PatternBand>`, règles d'usage doc 10 (1-2 placements/page max, jamais fond plein), migration login + hero + audit-teaser + 2 emails. Justification d'époque : un motif géométrique est plus distinctif qu'une couleur d'accent. Tout supprimé le 2026-05-22.

#### 2026-05-17 — Sprint 6 PR B — app /app/audits Premium + charts dashboard vivants

**Contexte** : suite PR A — version premium de l'audit dans l'app (on-demand, historique DB, cron hebdo, alerte email, matrice concurrents) + suppression des EmptyState dashboard (première impression mortifère à J0).

**Options (audit-app)** : A one-shot full premium (retenu) / B lean MVP puis itérations / C on-demand sans historique DB.

**Choix (audit-app, livré)** :
1. Table `technical_audits` (workspaceId, brandId nullable, url, isCompetitor, scoreGlobal, subScores jsonb, checks jsonb, htmlSizeKb, httpStatus, psiUnavailable, fetchedAt, createdAt) ; index `(workspaceId, createdAt)` + `(workspaceId, url)`.
2. Table `audit_counters` (workspaceId, periodStart YYYY-MM-01, auditsCount, competitorAuditsCount), PK composite, mois calendaire UTC ; compteurs séparés owned/concurrents ; `incrementAuditCounter()` UPSERT atomique avec pré-check quota.
3. Quotas `PlanQuotas` étendus : `audits`/mois + `comparisonCompetitors` (batch max) : Solo 5/0, Starter 30/3, Pro 100/10, Agency ∞/∞ ; trialing/past_due/expired/canceled 0/0.
4. Server action `runWorkspaceAudit` synchrone (~10 s, marge Vercel 60 s) — quota incrémenté AVANT `runAudit()` (anti-spam URLs invalides).
5. `runCompetitorsBatch` async → enqueue N jobs `audit_workspace_url` (10 × 10 s dépasserait Vercel). Solo bloqué (0).
6. Worker `audit_workspace_url` (nouveau `QUEUE_KIND`), idempotence `audit_workspace_url:{workspaceId}:{url}:{date}` ; email score-drop seulement si `notifyOnDrop=true` ET delta ≥ -10 pts (réservé au cron — un audit ad hoc n'envoie pas d'email redondant).
7. 4 pages : `/app/audits` (list groupée par URL + delta), `/app/audits/new` (pré-rempli `brand.domain` + checkbox batch Starter+), `/app/audits/[id]` (recos `getRecommendation()`), `/app/audits/compare` (matrice URL × catégorie SEO/GEO/A11y/Perf ; Solo verrouillé → upsell).
8. Cron `/api/cron/schedule-audits` lundi 05:00 UTC : 1 audit `brand.domain` par workspace actif non hard-capé, `notifyOnDrop=true`, quota check.
9. Email `audit-score-drop` (pattern weekly-recap, owned only).
10. Sidebar « Audits techniques » (icône `Wrench`), entre Concurrents et Runs.

**Choix (charts vivants)** : TrendSection toujours rendu avec scaffold N jours à `value: 0` + overlay backdrop blur si `fullTrend.length < SPARSE_THRESHOLD (3)` (« Données en cours de collecte ») ; BreakdownBars : 5 LLMs visibles en permanence (0 = opacity 0.18) ; RecentRunsTable **garde** son EmptyState (une table vide ne communique rien). **Pas de mock data démo** : honnêteté > effet wow.

**Justifications clés** : `brandId` nullable évite une table polymorphique pour les audits concurrents ; quotas séparés pour qu'un batch concurrents ne cannibalise pas le mensuel owned ; coût LLM nul (l'audit n'utilise pas de LLM), PSI gratuit < 25K/jour.

**Conséquences** : différenciation vs Profound/Otterly (plus qu'un tracker LLM). KPI à suivre : ratio audits/runs par workspace (objectif > 0.5), click-through dashboard → audits.

**Hors scope (à revisiter)** : audit d'URLs internes multiples ; diff structurel entre 2 audits (`checks` jsonb) ; export PDF.

**À revisiter** : 2026-06-15 — retirer ou non le test visibilité IA humain (`/outils/test-visibilite-ia`).

**Fichiers** : `src/db/schema.ts` (+`technicalAudits` +`auditCounters` + queue kind) + migration `0002_classy_joshua_kane.sql` ; `src/lib/plans/quotas.ts`, `src/lib/audits/counters.ts` (NOUVEAU), `src/lib/queue/types.ts` (+`AuditWorkspaceUrlPayload`), `src/lib/email/templates/audit-score-drop.ts` (NOUVEAU) ; `src/workers/audit-workspace-url{,-payload}.ts` (NOUVEAUX), `/api/cron/dispatch` (+case), `/api/cron/schedule-audits` (NOUVEAU) ; pages `audits/{page,actions}`, `audits/new/`, `audits/[id]/`, `audits/compare/` ; `app-sidebar.tsx` ; `vercel.json` (`0 5 * * 1`) ; dashboard `page.tsx` + `trend-section.tsx`.

---

#### 2026-05-16 — Sprint 6 PR A — promotion audit technique sur la home + blog

**Contexte** : 2 lead magnets en prod — `/outils/test-visibilite-ia` (humain, ~24 h ouvrées, ~$0,20 LLM/audit, capacité limitée) vs `/outils/audit-technique` (instantané, 0 € LLM, scalable à l'infini) massivement sous-promu. Objectif : audit technique = lead magnet #1, test IA exposé en second.

**Options** : A gros PR home + app audits (~2000 lignes) / B 2 PRs séquentielles (retenu — PR A ~400 lignes, PR B sur base déployée) / C mention discrète footer.

**Choix PR A (livrée)** :
1. Hero : secondary → `<LinkButton variant="ai">` « Audit technique gratuit », lien texte discret vers le test IA dessous, sous-titre « 30+ checks SEO + GEO en 10 secondes, sans inscription ».
2. Section `<AuditTeaser />` après `<TesConcurrentsPasToi />` (le problème → la première solution actionnable) : copy + `<MockupAudit />` client animé (un mockup React reflète le design system courant, un screenshot vieillit).
3. Footer outils réordonné (audit technique premier).
4. Variant CTA blog `audit-technique` ajouté à `BLOG_CTAS` (`src/lib/blog/schemas.ts`) + `CTA_CONFIG` (`article-cta.tsx`) — pour futurs articles « optimiser pour les LLM » ; `audit-gratuit` (humain) reste pour les généralistes, les deux coexistent.

**Hors scope** : refonte hero large, réorganisation home profonde, refonte blog, app audits (PR B, cf. § 2026-05-17). Pas d'A/B test V0 (trafic insuffisant — bascule franche + mesure 14 j).

**Conséquences attendues** : conversion vers audit-technique ×3-5 ; baisse mécanique ~30-50 % vers test-visibilite-ia (acceptable, goulot). KPI : page views audit-technique ÷ home, CTR CTA hero `ai`, complétion form.

**À revisiter** : 2026-06-15 — garder les 2 lead magnets ou retirer le test IA humain.

**Fichiers** : `_sections/hero.tsx`, `_sections/audit-teaser.tsx` (NOUVEAU), `_sections/mockups/mockup-audit.tsx` (NOUVEAU), `(marketing)/page.tsx`, `marketing-footer.tsx`, `src/lib/blog/schemas.ts`, `src/components/blog/article-cta.tsx`.

---

#### 2026-05-16 — Sprint 2 blog : pipeline content-driven + SEO/GEO complet

**Contexte** : blog sur registry TS hardcodé (`articles-registry.ts`), pas de frontmatter/OG/JSON-LD/sitemap. Objectif : Max colle un `.mdx`, le système fait le reste.

**Options** : A garder manuel + sitemap/OG (~400 lignes, ne scale pas) / B refacto content-driven complet (~1400 lignes, retenu) / C contentlayer/velite (overkill V0).

**Choix** :
1. `src/content/blog/{slug}.mdx` + frontmatter YAML validé Zod au scan filesystem (build fail si mal formé).
2. Plugins `next.config.ts` : `remark-frontmatter`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings` (`behavior: "wrap"`, classe `.heading-anchor`).
3. Registry filesystem `src/lib/blog/registry.ts` (`listArticles` / `getArticleBySlug` / `getRelatedArticles`, `gray-matter`, mémoïsé `cache()` per-request).
4. JSON-LD complet : `Article` + `BreadcrumbList` + `FAQPage` auto via `<BlogFAQ>` — **le boost GEO majeur** (les LLM citent en priorité les contenus structurés).
5. OG image dynamique `next/og` 1200×630 (`opengraph-image.tsx`, template paramétré).
6. `<ArticleCTA>` auto, 4 variantes (solo/starter/pro/audit-gratuit) selon `frontmatter.cta`.
7. `<RelatedArticles>` (3 articles, scoring catégorie + keywords overlap) — pas de rehype auto-liens (complexité disproportionnée V0).
8. `<TOC>` sticky desktop (articles ≥ 6 min) + `<ReadingProgress>` bar.
9. `sitemap.ts` + `robots.ts` auto-générés.
10. Newsletter reportée (attendre du trafic).

**Conséquences** : 1 fichier .mdx = 1 article complet ; tous SSG (`generateStaticParams`) ; 145 tests verts (+15) ; PageSpeed cible ≥ 98 (validation manuelle, pas de Lighthouse CI V0).

**À revisiter** : newsletter Brevo à ~500 visiteurs uniques/semaine blog (livrée 2026-05-20) ; rehype auto-liens si 30+ articles ; Lighthouse CI à > 10 articles ; template `<LongFormGuide>` si guides 10k+ mots.

---

#### 2026-05-14 — Stripe billing + plan Solo 9,99 € + pivot trial → garantie 14 j refund

**Contexte** : self-service achevé (PR CRUD 2026-05-13), reste à monétiser. Colonnes Stripe (`stripeCustomerId`, `stripeSubscriptionId`, `trialEndsAt`, `currentPeriodStart/End`, `hardCapHitAt`) + tables `subscription_events` (`stripeEventId UNIQUE` = idempotence gratuite) et `usage_counters` déjà en place. 3 questions tranchées :
1. **Trial 7 j sans carte encore valide ?** ~$0,043/run → ~$3 LLM gaspillés/trial (1 LLM), ~$285/100 signups à 5 % conv ; ~$15/trial en Phase C 5 LLMs → ~$1 425/100 signups. **Non viable en early access.**
2. **Tarifs 49/149/399 trop chers ?** Profound $499, Athena ~$300, Otterly €69 → déjà 7-10× moins cher que Profound. **Conservés** (baisser détruirait la marge sans changer la décision d'achat).
3. **Agency 399 € en V0 ?** Peu de demande → retiré de l'UI publique (reste dans l'enum DB), remplacé par CTA « Plus de volume ? Contact ».

**Options** : A Stripe minimal (~600 lignes) / B Stripe standard (+ trialing 0/0/weekly, cadence per-plan, cron expire-past-due, ~750 lignes — retenu) / C complet avec hard-cap worker (~1000 lignes).

**Choix** :
1. **Pas de trial automatique + garantie remboursement 14 j** (refund manuel via portal Stripe). Free taster = `/outils/test-visibilite-ia`. Stripe Tax conservé. Documenté CGU + FAQ pricing.
2. **Plan Solo 9,99 €/mois** : 5 prompts × 3 concurrents × 1 run/semaine (lundi 6h UTC) sur 5 LLMs. Marge brute LLM ~75 % Phase A, ~59 % Phase C. Hook : « ton bilan visibilité IA chaque lundi pour le prix d'un café ».
3. Tarifs 49/149/399 conservés ; Agency → mailto.
4. Cadence per-plan : champ `cadence: "daily" | "weekly"` dans `quotasFor(plan)` ; le scheduler skip les weekly hors lundi UTC.
5. Billing dans `/app/settings` (section dédiée, pas de page `/app/billing`).
6. Webhooks idempotents via `subscription_events.stripeEventId UNIQUE` ; 5 events : `checkout.session.completed`, `customer.subscription.{updated,deleted}`, `invoice.{paid,payment_failed}`.

**Conséquences** : migration `0001_thick_husk` (ajout `"solo"` à `workspaces.plan`) ; `/pricing` refondue 3 cards + ligne contact ; onboarding inchangé (`trialing` = quotas 0/0/weekly → aucun run sans subscription) ; `<UpgradeBanner>` dans `(with-nav)/layout.tsx` ; cron `/api/cron/expire-past-due` 03:00 UTC (past_due → expired après 7 j) ; 128 tests verts (+23) ; coût trial gaspillé ~$0, réinvestissable en acquisition.

**À revisiter** : trial avec carte requise (`trial_period_days` natif, conv ~50-70 % vs ~5-15 %) quand capital dispo + conv garantie stabilisée — **levé le 2026-06-08, cf. §** ; hard-cap worker PR suivante (**livré 2026-05-16**) ; pricing Pro 149 € à recalculer à la bascule Sonnet 4.6 (marge LLM 18 % avec Haiku 5 LLMs) ; lifetime discount early-access (-30 % à vie, 50 premiers) activable via Stripe dashboard + `discounts` checkout.

---

#### 2026-05-05 — Lancement du projet GEO France

**Contexte** : recherche de SaaS récurrent après fatigue du freelance pur ; analyse marché GEO, trou francophone identifié.

**Options** : A SaaS audit SEO + UI / B boîtage tool mapping / C SaaS Digital Product Passport SMB / D SaaS GEO francophone.

**Choix** : D — Mamie GEO. Marché en hypercroissance (45,5 % CAGR), trou FR évident, leverage mamie-seo.fr existant, fenêtre 12-18 mois, pas de concurrent direct FR.

**Conséquences** : 6-12 mois de focus, pivot du site mamie-seo, solo founder, cash freelance préservé.

**À revisiter** : Gate 1 à 6 mois (juin 2026 — critères dans doc 08).

---

#### 2026-05-05 — Architecture mono-repo Next.js + redirect mamie-seo

**Contexte** : mamie-seo.fr n'a aucun trafic ni autorité SEO valorisable.

**Options** : A 3 repos séparés (Framer + app + blog) / B monorepo Turborepo / C mono-repo unique Next.js.

**Choix** : C. Solo founder (un seul projet), aucun SEO à préserver, cohérence visuelle native, déploiement/SSL/cookie uniques, splittable plus tard.

**Conséquences** : 301 mamie-seo.fr → mamie-geo.fr dès J1 ; pas de subdomain `app.` (path-based `/app/*`) ; pas de Framer ; route groups `(marketing)` / `(blog)` / `(app)` ; mamie-seo.fr loué 1-2 ans en sécurité puis abandonné.

**À revisiter** : mois 12+ si recrutement ou besoin de stack marketing séparée.

---

#### 2026-05-05 — Réponses aux 10 questions de bootstrap (session 2)

**Choix actés** (déblocage Sprint 0) :
1. Direction artistique : A — éditorial chaud (superseded 2026-05-07)
2. Polices gratuites V0 : Newsreader + Geist + Geist Mono (superseded 2026-05-07/11 → Inter)
3. Template marketing : from scratch
4. Naming/domaine : Mamie GEO sur `mamie-geo.fr`
5. Magic-link Better Auth : SMTP Brevo (superseded 2026-05-12 → REST API)
6. Le Chat dès Starter : oui sans condition
7. Trial 14 j sans carte + Stripe Tax dès J0 (trial superseded 2026-05-13 puis 2026-05-14)
8. Statut juridique : EI en V0, bascule SAS/EURL mois 6-9 avant plafond ~77 700 €/an BIC services
9. Hard-cap LLM 200 % du quota → block + email + alerte interne
10. Redirect mamie-seo.fr : DNS-level Vercel Domains + ligne défensive `next.config.ts`

**À revisiter** : polices premium à MRR > 5K€ ; statut juridique au mois 6 (audit CA vs plafond) ; mascotte mamie mois 3+ (non bloquant).

---

#### 2026-05-05 — Cohérences purgées (Phase 1 session 2)

11 incohérences corrigées entre les décisions `03`/`09` et le contenu résiduel des autres docs : Clerk/Supabase Auth → Better Auth (02) ; Inngest/BullMQ → Postgres-queue + Vercel Cron (02, 04, 08) ; `browse_with_bing` → `web_search` tool (03) ; hébergements multiples → choix figés (03) ; `app.mamie-geo.fr` → path-based (03) ; Docker Compose → branche Neon `dev-{username}` (03) ; devise harmonisée `~$0.015` (04) ; lead magnet → `mamie-geo.fr/outils/test-visibilite-ia` (06) ; Clerk/Prisma/Inngest → Better Auth/Drizzle/Postgres-queue (08) ; checkboxes 09 verrouillées ; README renommé « Mamie GEO ».

**Règle actée** : toute modif qui invalide une info dans un doc met à jour le doc dans le **même PR**.

---

#### 2026-05-05 — Schéma BDD complet (Phase 2 session 2)

9 manques techniques de session 1 comblés avant tout code :

- **Better Auth** : tables générées via `npx @better-auth/cli generate` (`user`, `session`, `account`, `verification`). **Pas de table `users` parallèle** — FK applicatives sur Better Auth `user.id` (TEXT, pas UUID).
- **`workspaces.plan`** : CHECK étendu à `trialing/starter/pro/agency/enterprise/past_due/expired/canceled`. Pas de valeur `'free'`.
- **`workspaces.current_period_start/end`** : aligné cycle Stripe ; webhook `invoice.created` = reset `usage_counters`.
- **`workspaces.hard_cap_hit_at`** : timestamp dénormalisé (fast-path du guard quota, évite un join à chaque appel LLM).
- **`queue_jobs.idempotency_key TEXT UNIQUE NOT NULL`** : format imposé par `kind` (cf. doc 03) ; `INSERT ... ON CONFLICT DO NOTHING`.
- **`queue_jobs.status`** : `pending → claimed → done | failed | dead` ; retry transient = `scheduled_at += 1h` puis `+ 6h`.
- **`runs.cache_hit BOOLEAN`** : distingue runs facturés / réutilisés depuis `prompt_cache`.
- **`prompt_cache`** : cache cross-clients sha256 texte normalisé + `(llm, language)`, fraîcheur 24 h, gain estimé 20-40 % Starter. Documenté V0, à activer dès que mesurable.
- **`events`** : audit log applicatif générique `kind` libre + `payload JSONB`, purge 90 jours.
- **`subscription_events.stripe_event_id UNIQUE`** : idempotence webhooks Stripe.
- **Hard-cap LLM** : 60 % alerte interne, 100 % email client, 200 % block + email + alerte interne, levée manuelle uniquement, reset au cycle Stripe.

**À revisiter** : hit-rate `prompt_cache` après 1 mois (fenêtre 24 h vs 12 h Pro / 7 j Starter ?) ; migration Inngest si > 100K runs/mois (la table reste en outbox pattern).

---

#### 2026-05-06 — Première migration Drizzle appliquée sur Neon EU Frankfurt

**Contexte** : 3 blocages au premier `pnpm db:migrate` : drizzle-kit ne charge pas `.env.local` ; `drizzle.config.ts` importait `@/lib/env` (validation runtime complète, bloquante) ; le pool WebSocket `@neondatabase/serverless` échouait silencieusement sur mauvais endpoint Neon (username placeholder au lieu de `*_owner`).

**Options** : A `ws` devDep + `neonConfig.webSocketConstructor` (recommandé Neon, retenu) / B `pg` devDep pour drizzle-kit / C script de migration maison.

**Choix** : A. `ws` strictement devDep, jamais dans le bundle runtime Edge ; B dupliquerait la logique de connexion ; C dériverait du format officiel `drizzle.__drizzle_migrations`.

**Conséquences** : devDeps `ws@^8.20.0` + `@types/ws@^8.18.1` ; scripts `db:generate`, `db:migrate`, `db:studio` préfixés `node --env-file-if-exists=.env.local ./node_modules/drizzle-kit/bin.cjs <cmd>` (charge `.env.local` en local, no-op CI/Vercel) ; `drizzle.config.ts` lit `process.env.DATABASE_URL` directement (check minimal, plus de dépendance `@/lib/env`) + `neonConfig.webSocketConstructor = ws`. Migration `0000_many_human_torch.sql` appliquée : 16 tables, 13 FK, 34 indexes, 98 CHECK constraints.

**À revisiter** : `ws` vs `pg` si autre provider Postgres ; vérifier le flow sur branches Neon éphémères par PR (Sprint 1+).

---

#### 2026-05-07 — Phasage moteur Haiku → design system → multi-LLM, suite mesure coût Sonnet 4.6

**Contexte** : mesure réelle du coût par run (cassette live, PR 1, Sonnet 4.6) :

| Métrique         | Mesuré (Sonnet 4.6)           | Estimé doc 03 (initial) |
| ---------------- | ----------------------------- | ----------------------- |
| Input tokens     | 21 925                        | 500-2000                |
| Output tokens    | 2 113 (capé par `max_tokens`) | 500-1500                |
| Web search calls | 1                             | 1-5                     |
| **Coût total**   | **~$0,107 / run**             | $0,005-0,02 / run       |

Cause : `web_search_20250305` injecte les résultats (~5 ko/search) en input tokens → input gonflé + $0,01/search + output. Plombe la marge Starter (49 €) sur Sonnet 4.6 ($3/$15 par Mtok) à 5 LLMs × 30 prompts × 30 jours.

**Options** : A Sonnet partout (marge négative, jusqu'à -300 €/compte Starter — tué) / B phasage A Haiku cheap → B UI → C Sonnet + 4 providers (retenu) / C couper `web_search` (citations hallucinées, produit non représentatif — tué).

**Choix** : B. Coût dev ÷ ~5 (Haiku $1/$5 par Mtok) ; bascule triviale via interface `LLMClient` (un seul fichier `anthropic.ts` en Phase C, ou feature-flag par plan).

**Conséquences** : `src/lib/llm/anthropic.ts` : `DEFAULT_MODEL = "claude-haiku-4-5-20251001"`, `DEFAULT_MAX_TOKENS = 4096`, `DEFAULT_MAX_WEB_SEARCHES = 2` (configurables via factory) ; cassette `real-fr-visibility.json` réenregistrée sur Haiku ; docs 03 § 656 / 08 / CLAUDE.md § 2+9 alignés.

**À revisiter** : fin Phase B, smoke test 5-10 prompts Haiku pour calibrer le coût moyen puis trancher la grille de bascule Phase C (par plan ou par workspace) ; basculer si Anthropic sort un mode web_search « résumé seul » ; activer `prompt_cache` cross-clients si marge Starter trop tendue.

---

#### 2026-05-07 — Pivot UI vers Airbnb-like minimaliste (supersede Direction A doc 10)

**Contexte** : retour Max sur la PR 7 (éditorial chaud : crème + Newsreader serif + italique) : « ça va pas du tout ». Réorientation vers airbnb.com + designme.agency : pas de fond coloré, une seule police, pas d'italique, nuances de gris + accent ponctuel CTA.

**Options** : A patcher Direction A / B blanc-gris + 1 police + accent terracotta conservé (retenu) / C full noir & blanc (trop austère, perd le fil « Mamie »).

**Choix** : B. Le look magazine alourdit un produit dont l'écran principal est un dashboard ; Airbnb-like = lisible, focus data ; terracotta `#C5532E` conservé en accent ponctuel (jamais en fond ni surface large).

**Conséquences** : reset complet des tokens `globals.css` (palette gray-50→950, alias `--color-ink` / `--color-muted` / `--color-border`, suppression cream/warm-gray, `em, i, cite, address { font-style: normal }`, classes `.type-*` sans-serif) ; Newsreader + Geist Mono retirés du layout ; composants ui restylés (Button variant `accent`, Card bordure gray-200 sans ombre, Badge fond gray-100, Input focus ring gris) ; login / dashboard / home / layout app alignés ; doc 10 nouveau § « Direction actée 2026-05-07 » supersede A/B/C ; CLAUDE.md § 9 mis à jour.

**À revisiter** : valider le ton sur les vraies sections marketing (PR 8) ; accent chaleureux ponctuel si dashboard trop froid. La DA vit — tout retour déclenche une nouvelle entrée 09 sans culpabilité.

---

#### 2026-05-11 — Refs visuelles ancrées sur designme.agency + taap.it (raffinement direction Airbnb-like)

**Contexte** : 2 refs visuelles fournies par Max (designme.agency + taap.it/fr/radar). DNA commun : fond blanc + sections gris-50 alternées, **CTA = bouton noir plein pill** (pas terracotta), cards bordure 1px gray-200 radius 16-20px sans ombre, titres weight 600-700 tracking `-0.025em`, body gray-700, eyebrows uppercase 12-13px, badges pastel ponctuels (jamais en CTA), touches humanisantes, 1 police, pas d'italique.

**Décision** : raffiner le design system 2026-05-07 sur ce DNA (le pivot global reste valable).

**Appliqué** : token `--radius-pill: 9999px`, `--radius-lg` → 16px ; tous les boutons en pill, `primary` (noir) = CTA par défaut, `accent` (terracotta) marqué rare ; Card radius `xl` (20px), padding `px-6 py-6` ; nouveau `<Section variant="default|tinted" pad="md|lg|xl">` (trame sections alternées) ; login + dashboard CTAs passés en `primary` ; home placeholder enrichie (header, hero, section gris-50, footer).

**Update même jour — fix polices + cascade CSS** : (1) bug police — `globals.css` référençait `var(--font-geist)` inexistante (le package expose `--font-geist-sans`) → titres rendus en serif fallback ; (2) bug cascade — règles globales `a { color: accent; underline }` au top-level écrasaient les utilities dans les boutons. Fixes : passage à **Inter** via `next/font/google` (weights 400/500/600/700, variable `--font-inter`, package `geist` retiré) ; règles globales wrappées dans `@layer base` ; default `<a>` = `color: inherit; text-decoration: none`, liens inline visibles via classe `.link`. Doc 10 : Geist → Inter.

**Update 3e itération — enrichissement DA (4 screens Mobbin/Dribbble, « trop plat »)** : ajout 12 tokens pastel (`--color-blue`, `--color-blue-bg`, … × 6 teintes) + 4 tokens glow ; `Badge` 6 nouveaux tones (blue/green/orange/purple/pink/yellow) + prop `icon` Lucide ; `<StatusDot tone pulse />` (NOUVEAU — cercle 8px + halo) ; `<CornerFrame>` (NOUVEAU — cross-hairs gris aux coins, signature print) ; dep `lucide-react`. Appliqué : hero en CornerFrame, badge Beta avec StatusDot pulse, mix-weight headline, section 5 badges LLM pastel, steps colorées. **Règle de discipline : 1 CornerFrame, 1-2 StatusDot, 5-7 badges colorés max par page** — au-delà = bruit.

**À revisiter** : décliner sur PR 8 (vraie home) et le dashboard (CornerFrame hero card, StatusDot runs, badges LLM) ; touches décoratives (speech bubbles, badge vertical) à valider avec Max avant.

---

#### 2026-05-12 — Bilan Phase A + B livrées + bascule Brevo SMTP → REST API (PR 18bis)

**Contexte** : J+8 du Sprint 1, dashboard accessible en prod. Issue ouverte : runs `pending` en prod (cron Vercel — résolu 2026-05-13).

**Bascule Brevo SMTP → REST** : 2 causes d'échec magic-link sur 3 sessions de debug : (1) `535 Authentication failed` — `BREVO_SMTP_USER` doit être l'identifiant SMTP `xxxxxxx@smtp-brevo.com`, pas l'email de compte (doc + `.env.example` mis à jour) ; (2) `525 Unauthorized IP address` — le plan Brevo Free impose une IP whitelist SMTP, incompatible avec les IPs serverless dynamiques Vercel.

**Décision** : backend **REST API** (`https://api.brevo.com/v3/smtp/email`, clé `xkeysib-...`) non soumis à la whitelist. `src/lib/email.ts` supporte les 2 backends via `pickBackend()` : `BREVO_API_KEY` défini → REST (prioritaire), sinon SMTP nodemailer (fallback legacy, utile en local + `pnpm test:smtp`). 3 env vars : `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME` ; les `BREVO_SMTP_*` deviennent optionnelles.

**Bilan Phase A** : pipeline complet `schedule-runs → execute_prompt → score_response → recompute_metrics → dashboard` ; coûts mesurés ~$0,04/run tracking + ~$0,003/scoring Haiku.
**Bilan Phase B** : design system custom, 9 routes publiques + 5 routes app, blog MDX 3 articles, lead magnet, onboarding wizard 3 étapes (suggestion Haiku, PR 13), settings (PR 16), légales placeholder (PR 17).

**À revisiter** : cron prod (résolu 2026-05-13) ; DNS Brevo DKIM/SPF/DMARC pour `hello@mamie-geo.fr` ; pages légales à valider juriste avant lancement payant (1 500 € budgété doc 08) ; retirer `nodemailer` quand recul suffisant sur la REST API.

---

#### 2026-05-12 — Foundation design post-connexion : sidebar app + 11 primitifs Radix + 2 wrappers Recharts

**Contexte** : nav app limitée à 2 liens ; primitifs CRUD manquants ; pas de charts. Foundation posée avant les pages CRUD.

**Choix** :
1. **Sidebar verticale gauche w-60** (drawer `<Sheet>` mobile) — vs top nav étendu ou hybride. Scale propre à 6+ sections, brand switcher en place.
2. **Recharts pur** (pas Tremor) : Tremor v3 lié à TW v3, Tremor Raw non testé TW v4 ; wrappers minces suffisent, Recharts est de toute façon une transitive dep de Tremor.
3. **shadcn/ui sur Radix** copié-collé manuellement (pas de `shadcn init`, design system custom existant), restylé avec nos tokens — a11y Radix gratuite (focus trap, ARIA, keyboard).
4. **Route group `(with-nav)`** : dashboard/runs/settings dessous, onboarding dehors (full-screen) ; URLs inchangées.
5. **sonner** pour les toasts.

**Deps ajoutées** : `@radix-ui/react-dialog ^1.1.15`, `react-dropdown-menu ^2.1.16`, `react-tabs ^1.1.13`, `react-switch ^1.2.6`, `react-tooltip ^1.2.8`, `react-slot ^1.2.4`, `sonner ^2.0.7`, `recharts ^3.8.1`, `class-variance-authority ^0.7.1`, `clsx ^2.1.1`, `tailwind-merge ^3.6.0`.

**Conséquences** : 11 primitifs dans `@/components/ui` (Dialog, Sheet, DropdownMenu, Tabs, Switch, Tooltip, Skeleton, Banner, EmptyState, Pagination, Toaster) + 2 wrappers `@/components/charts` (LineChart, BarChartHorizontal) + helper `cn()` ; 4 pages rafraîchies (dashboard charts 30j, onboarding progress, run detail tabs, settings cards) ; `triggerRunNow` avec Dialog + toast ; animations CSS `--animate-*` dans globals ; `loadSidebarData()` mémoïsé `React.cache()` ; `getVisibilityTrend(brandId, days=30)` dans `src/lib/dashboard/queries.ts`.

**Exclu (PRs suivantes)** : pages CRUD prompts/competitors ; settings étendu (équipe, billing, audit logs) ; états trial/quota/hard-cap ; `/app/admin` ; E2E des 7 flows ; tests unit React des wrappers (déléguée au E2E manuel).

**À revisiter** : sidebar rail si 8+ sections ; BrandSwitcher sans switch actif (à traiter au multi-brand Pro) ; Pagination numbers + ellipsis si > 100 prompts.

---

#### 2026-05-12 — Polish dashboard : Stats enrichies, SegmentedControl, AreaChart à gradient, BreakdownBars

**Contexte** : 3 screens de référence SaaS fournis par Max ; dashboard fonctionnel mais visuellement basique ; redite « Mamie GEO » ×2 dans le chrome.

**Patterns ajoutés** (cf. doc 10 § « Patterns dashboard ») :
1. **`Stat` enrichie** : 8 `iconTone` pastel, cercle 32 px icône Lucide, prop `delta?: { value, period }` (TrendingUp/Down + % signé coloré + libellé small caps). Rétro-compatible (props optionnelles).
2. **`SegmentedControl`** : pill group, container gray-100, actif fond blanc + shadow-sm, API contrôlée générique.
3. **`AreaChart`** : mono-série `linearGradient` (0.25 → 0), axe Y droite, `ReferenceLine` optionnelle — livré dans la lib, pas encore utilisé (futur : coût cumulé, volumétrie).
4. **`BreakdownBars`** : bars verticales colorées + légende dots + liste valeurs tabulées, modes `absolute`/`share` — plus lisible que `BarChartHorizontal` pour 5 segments (qui reste exporté).

**Appliqué** : 4 stats avec iconTone sémantique + delta vs J-7 via `computeDelta()` (exposé depuis `@/lib/dashboard/queries`, réutilisable) ; `<TrendSection>` client avec SegmentedControl 7/30/90 j (90 j chargés serveur, slice client → switch instantané) ; « Score par LLM » → BreakdownBars 5 segments `LLM_COLORS` ; section « Top concurrents cités » retirée (info portée par la stat du haut). Mentions de marque réduites : titre sidebar = nom du workspace, header mobile sans « Mamie GEO » centré (brand fatigue).

**À revisiter** : delta « vs J-7 » paramétrable quand plusieurs périodes pertinentes ; cohérence de l'ordre LLM (chatgpt/claude/perplexity/gemini/lechat) partout.

---

#### 2026-05-13 — Cron prod stuck résolu (cause racine Vercel Cron GET vs POST) + worker `send_weekly_email` (weekly recap)

**Cause racine cron stuck** : les routes cron n'exposaient que `POST`, or **Vercel Cron envoie uniquement des `GET`** (avec `Authorization: Bearer ${CRON_SECRET}` auto-injecté) → le handler GET répondait `{ ok: true }` sans rien exécuter, le dispatcher ne tournait jamais.

**Options** : A GET et POST sur le même handler (retenu — rétro-compatible avec les tests `curl -X POST`) / B GET only / C middleware GET→POST (sur-abstraction). Appliqué aux 3 endpoints (`dispatch`, `schedule-runs`, `schedule-weekly-emails`).

**Instrumentation** : `logCronEvent()` dans `src/lib/cron-logger.ts` (JSON logs ligne-par-ligne, parsés nativement par Vercel) ; endpoint debug `GET /api/cron/dispatch?inspect=1` (auth requise) : countsByStatus, 10 derniers jobs, présence **booléenne** des env vars critiques (`CRON_SECRET`, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `BREVO_API_KEY`, `NEXT_PUBLIC_APP_URL`), server time UTC. Pattern standard pour les futurs crons.

**Worker `send_weekly_email`** — scope V0 weekly recap uniquement (nurture trial J+3/J+10 reportée : dépend du state Stripe fiabilisé en PR Stripe). Flow : workspace + brand → skip si 0 run.success sur 7 j (log `email_skipped_no_data`) → agrégats `citation_metrics_daily` 7 j vs 7 j précédents → top 3 concurrents (`competitorsData` JSONB) → membres → `renderWeeklyRecap()` (HTML inline table-based + text fallback, échappement XSS testé) → `sendWeeklyRecapEmail()` via nouveau `sendTransactional()` générique (REST prioritaire, SMTP fallback) → log `events.kind = "email_sent"` par destinataire. Idempotence : `send_weekly_email:{workspaceId}:{isoWeek}` (helper `isoWeekFromDate()`, format `YYYY-Www`).

**Fichiers ajoutés** : `src/lib/cron-logger.ts`, `src/lib/email/templates/weekly-recap.ts` (+test), `src/workers/send-weekly-email{,-payload}.ts` (+tests), `/api/cron/schedule-weekly-emails/route.ts`. Modifiés : routes `dispatch` + `schedule-runs` (GET handler + logs + inspect), `src/lib/email.ts` (+`sendTransactional` +`sendWeeklyRecapEmail`), `vercel.json` (`0 9 * * 1`). 19 nouveaux tests unit.

**À revisiter** : index `(kind, createdAt)` sur `events` si la table grossit ; unsubscribe par membre (UNSUBSCRIBE_TOKEN) en V1 multi-membre ; CTE unique si beaucoup de workspaces actifs ; déplacer `isoWeekFromDate()` dans `src/lib/dates.ts` si réutilisé.

---

#### 2026-05-13 — Refresh home inspiré Semrush AI SEO (data + features nommées + glossaire vocabulaire)

**Contexte** : comparatif vs semrush.com/ai-seo/overview. 4 gaps : zéro chiffre marketing, features non nommées, vocabulaire métrique flou, pas de narrative « why now ». 8 forces à protéger (que Semrush ne peut pas copier) : tu/direct, honnêteté « n'est pas… », Le Chat inclus, EU/RGPD, pricing transparent, personas humains, lead magnet.

**Options** : A refresh ciblé ~415 lignes (retenu) / B minimal ~150 (ne ferme aucun gap) / C refonte complète ~1200+ (« copié » plus qu'« inspiré »).

**Choix** : 2 sections nouvelles (« Pourquoi maintenant ? » 4 stats + « Tes outils » 5 features nommées) + hero retouché (chiffre-marteau) + glossaire officiel doc 02 + snapshot Semrush daté doc 01.
- Stats sourcées : ×6 trafic AI 2025, ×4,4 conversion, 60 % zero-click (Semrush blog / SparkToro) + « 5 plateformes IA majeures dont Le Chat ». **Règle de vérité : aucun chiffre inventé, source cliquable, chiffre remplacé si la source meurt.**
- 5 features nommées (pas 12 — V0 honnête) : Score de visibilité IA / Part de voix / Sentiment / Comparatif concurrents / Rapport hebdo.
- Vocabulaire FR : « Part de voix » (pas « Share of Voice »), Sentiment conservé. Glossaire dans doc 02.
- **Pas de demo path** (le funnel transparent est un différenciateur) ; **pas de social proof artificielle** (on attend les vrais beta testers).

**Fichiers** : + `_sections/pourquoi-maintenant.tsx`, `_sections/tes-outils.tsx` ; modifiés : `hero.tsx`, `(marketing)/page.tsx`, docs 01/02. Pas d'impact backend/DB.

**À revisiter** : page `/comparatif` publique (Mamie GEO vs Semrush vs Profound vs Peec) si traction agence ; remplacer la 4ᵉ stat par un chiffre FR sourcé (Médiamétrie/Frenchweb) si trouvé ; mesurer l'impact funnel en M2 ; étendre la liste features quand les CRUD seront livrées.

---

#### 2026-05-13 — Polish UX home (hero interactif + scroll-fill dark section + pastilles LLM partagées) + pivot trial 14j → 7j

**Contexte** : 2ᵉ vague de demandes Max : hero interactif, data « En 2025… » en section sombre scroll-fill, pastilles LLM harmonisées, touche subtile de couleur, trial 14 j → 7 j.

**Choix techniques** : `<HeroLLMRotator>` client (cycle 5 LLMs / 2,4 s, couleur saturée) ; composant unique `LLMPill` (`src/components/marketing/llm-pill.tsx` + map `LLM_KEYS_ORDER` + `getLLMConfig`), rotation déterministe par LLM (-2°/+3°/-1°/+2°/-3°, effet sticker sans random) ; scroll-fill CSS pur (`animation-timeline: view()` + `background-clip: text`, Chrome 115+/Safari 17+, fallback `gray-300` lisible) ; section `<PourquoiMaintenant>` sur fond `--color-ink` + radial warm subtil (rgba terracotta < 0.22).

**Pivot trial 14 j → 7 j** (cf. doc 04 § Couche 3) : force la décision payante (anti « zombie trial »), standards SaaS modernes, la citation drift se voit sur 30+ j de toute façon, l'audit gratuit joue déjà la démo. Remplacement global dans 14 fichiers (hero, FAQ, pricing ×3, metadata, lead magnet, CGU, blog vs-profound, email audit, docs 01-04/10). Exclusions : cookie Better Auth 14 jours (privacy, non lié) ; entrées historiques doc 09 inchangées. **Note : superseded par le pivot 2026-05-14 (plus de trial auto) puis le trial 14 j carte requise du 2026-06-08.**

**Fichiers** : + `llm-pill.tsx`, `hero-llm-rotator.tsx` ; modifiés : `globals.css` (keyframes `scroll-reveal*`), `hero.tsx`, `pourquoi-maintenant.tsx`, `llm-badges.tsx`, 14 fichiers du pivot.

**À revisiter** : impact UX en M2 (rebond, scroll depth, CTR) ; fallback IntersectionObserver si Safari < 17 (~8 % trafic FR) problématique ; assigner une rotation dans `LLM_CONFIG` à tout nouveau LLM.

---

#### 2026-05-13 — Pages CRUD app (Prompts + Competitors) + Settings édition + helper `getUserContext`

**Contexte** : rien n'était gérable après l'onboarding (pas de CRUD prompts/concurrents, settings read-only). Cette PR complète « onboarding → tracking → gestion » : self-service complet pour les beta-testeurs.

**Choix** : page dédiée `/app/prompts/[id]` (URL partageable + breakdown par LLM) ; settings édition (workspace name + brand aliases, ~200 lignes) ; pagination prompts activée ; reportés : brand switcher actif, invitations équipe (système Better Auth séparé), bulk upload CSV.

**Architecture** :
- Schémas Zod dans `src/lib/{prompts,competitors,settings}/schemas.ts` — trim + dedupe case-insensitive des aliases côté server ; strings vides acceptées côté Zod et filtrées par le transform (sinon `"alias, , alias2"` rejetterait tout).
- Quotas centralisés `src/lib/plans/quotas.ts` (single source of truth) : trialing 100/10, starter 25/5, pro 100/10, agency 300/illimité, enterprise illimité (prompts/concurrents). Enforcement en server actions ; erreur structurée `{ ok: false, error: "quota_reached", current, max, plan }` → `toast.error()`.
- Helper `getUserContext(userId)` (`src/lib/auth/user-context.ts`) : workspace + brand + role en 1 query, utilisé partout.
- Server actions CRUD + `togglePromptActive`, `revalidatePath` ; pages server + client wrappers ; form dialogs Radix (state initial via `useState`, remount via `key={item.id}`) ; tag input aliases (Enter/virgule, Backspace, max 10).
- Suggestion IA dans `/app/prompts` : réutilise `suggestPrompts()` de l'onboarding (Haiku, ~$0,003), validation manuelle avant insert (pas d'auto-insert).

**Conséquences** : self-service complet (réduction support) ; conversions visibles au hit de quota ; breakdown par prompt = argument marketing (pas dispo chez Profound entry) ; 105 tests verts (avant 76).

**Fichiers (16 ajoutés)** : `src/lib/plans/quotas.ts`, `src/lib/auth/user-context.ts`, `src/lib/{prompts,competitors,settings}/{schemas,schemas.test,queries}.ts`, pages `prompts/{page,actions,prompts-list,prompt-form-dialog}`, `prompts/[id]/page.tsx`, `competitors/{page,actions,competitors-list,competitor-form-dialog}`, `settings/{actions,workspace-form,brand-aliases-form}`. Modifiés : `settings/page.tsx`, CLAUDE.md § 9.

**À revisiter** : bulk CSV prompts (Pro = 100, fastidieux) ; invitations Better Auth Pro+ ; édition brand.name/domain (impacte le matching détection — décider du sort des runs historiques) ; soft-delete prompts (`deletedAt` + restauration 30 j) si plaintes ; E2E Playwright sur ces flows.

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

