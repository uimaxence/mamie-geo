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

#### 2026-06-03 — Pivot brand color terracotta `#C5532E` → bleu logo `#329CFF` + admin visuels LinkedIn

**Contexte** : La couleur du logo Mamie GEO est un bleu cobalt `#329CFF` depuis la décision 2026-05-13. Mais le doc 10 et l'app utilisent encore le terracotta `#C5532E` comme `--color-accent` (badges, liens, hover, CTAs accent, gradient AI, gradient warm panel login, avatars workspace). Le double signal "bleu logo + accent terracotta" crée une dissonance brand : la marque dit "bleu" via son logo, le produit dit "orange" via ses accents.

À l'occasion de la création d'un générateur de visuels LinkedIn (post 2026-06-02 sur l'amplification de l'article geo-vs-seo), Max acte le pivot brand complet vers le bleu logo.

**Options considérées** :
- A) Ne rien changer (le terracotta reste l'accent) — rejeté, dissonance brand persistante.
- B) Visuel LinkedIn uniquement en bleu, code stable terracotta — hybride, risque de figer la dissonance.
- C) **Sweep brand complet** : `--color-accent` aliasé sur le bleu brand, gradients warm refactorés en gradients cool, gradient AI recomposé sans terracotta, emails et docs alignés.

**Choix** : Option C — sweep complet.

**Justification** :
- Cohérence brand univoque (logo + accents + CTAs alignés sur le bleu).
- Les tokens `--color-accent*` sont **conservés comme aliases** (pointent sur le bleu) pour ne pas casser les 22 fichiers qui les référencent — pas de rename invasif des classes Tailwind `text-accent` / `bg-accent-faint` / `tone="accent"`.
- Les classes `card-hover-warm` et `gradient-warm-panel` gardent leur nom historique (refactor lourd inutile) mais leurs valeurs basculent en bleu (le nom devient un héritage interne, pas un engagement visuel).
- Le gradient AI passe de `terracotta → purple → bleu` à `bleu → purple → pink` (signature IA distinctive, cohérente avec les codes ChatGPT/Anthropic, ancrée sur le bleu brand).

**Conséquences attendues** :
- Tous les badges `tone="accent"`, status dots, charts AreaChart de référence, hover liens, etc., basculent en bleu automatiquement via les aliases CSS.
- Les pages marketing avec `card-hover-warm` (tes-outils, how-it-works, pour-qui, sans-avec) voient leur halo de hover passer de pêche à bleu pâle.
- Le panel login (`gradient-warm-panel`) bascule d'un dégradé orange chaud à un dégradé bleu clair.
- 4 templates email mis à jour (audit-score-drop, payment-failed, technical-audit-report).
- Doc 10 (design direction) : ~7 paragraphes mis à jour. La section archivée "Direction A — Éditorial chaud" qui mentionne le terracotta reste intacte (archive historique).
- Doc 09 : cette entrée.
- L'item "anti-pattern gradient violet/bleu en hero" du doc 10 est nuancé : le `--gradient-ai` brand reste autorisé sur boutons d'actions IA (audit, suggérer prompts), mais l'interdit en hero/fond large reste.

**Livré dans le même PR** :
- Page admin protégée `/app/admin/visuals` (guard sur rôle/email Max — réutilisée pour future production de visuels marketing).
- Premier visuel : tableau comparatif SEO vs GEO 1080×1350 portrait pour post LinkedIn du 2026-06-02.
- Bouton "Télécharger PNG" via `html-to-image` (dep ajoutée).

**À revisiter** : si les retours sur le bleu trop saturé reviennent (le `#329CFF` est cobalt vif), envisager `#1d7ee5` (`--color-primary-dim`) comme nouvelle valeur de `--color-accent` pour adoucir.

#### 2026-06-04 — Système design carousels LinkedIn (style « Unified ») + crème chaude 3e ton marketing

**Contexte** : Le visuel SEO vs GEO livré la veille (cf. entrée 2026-06-03) restait fonctionnel mais pas signature. Max envoie une référence Pinterest « Unified™ » (carousels LinkedIn pastel jaune/lavande/blanc, big bold typo, vagues organiques) et demande d'adapter ce langage à Mamie GEO pour cet asset et les futurs carousels LinkedIn.

**Options considérées** :
- A) Copie directe de la palette Unified (jaune saturé + lavande + rose) — rejeté, s'éloigne du brand bleu logo acté la veille.
- B) Bleu brand strict (bleu + ink + blanc + grays) — discipliné mais perd la variation slide-à-slide qui fait le charme « Unified ».
- C) **Bleu brand + ink + crème chaude `#fff4d6`** comme 3e ton marketing — apporte la chaleur Unified sans contredire la décision brand de la veille.

**Choix** : Option C.

**Justification** :
- La crème chaude `#fff4d6` est suffisamment éloignée du jaune saturé Unified pour ne pas être perçue comme « copie » et suffisamment proche d'une teinte beige/butter pour apporter la chaleur recherchée.
- Distinction nette **app vs carousels** : les tokens `--color-cream*` ne sont **PAS** à utiliser dans l'app `(app)/*`. L'app garde sa direction Airbnb-like minimaliste (blanc + gris + bleu brand accent). La crème est réservée aux visuels externes (carousels LinkedIn, OG images, blog covers V1+).
- Système carousel : un visuel = `<BrandPill>` (top-left, ink rond avec logo bleu inset) + `<SlideNumber>` (top-right, `01 / N`) + headline bold massif + paper-note card pour le contenu + `<WavesDecoration>` organique en filigrane bleu pâle aux coins.

**Tokens ajoutés** :
- `--color-cream: #fff4d6` (background principal carousel)
- `--color-cream-soft: #fffbed` (variante très light, pour secondary slides)
- `--color-cream-strong: #fcd34d` (saturé, pour accents/badges sur slides crème)

**Livré dans ce PR** :
- 3 tokens dans `globals.css` (section dédiée « 3e ton marketing »).
- Refonte `SeoVsGeoVisual` en style Unified : fond crème, vagues décoratives bleu pâle (top-right + bottom-left), brand pill ink + cercle bleu logo, slide number `01 / 01`, headline 88pt « SEO vs GEO. », paper-note card blanche contenant les 6 lignes avec rangées alternées (gris pour SEO, bleu soft pour GEO), punchline 80 % en pastille noire ink, footer minimal mamie-geo.fr.
- 3 primitives carousel (`BrandPill`, `SlideNumber`, `WavesDecoration`) co-localisées dans `seo-vs-geo-visual.tsx` — à splitter dans `src/components/admin/visuals/_primitives/` quand 3+ visuels les partagent.

**Conséquences attendues** :
- Le visuel LinkedIn du 2026-06-02 a maintenant une signature distinctive (vagues bleu pâle + brand pill ink + crème chaude) qui le rend reconnaissable même hors-contexte Mamie GEO.
- Les prochains carousels LinkedIn pourront reprendre le même langage : variation slide-à-slide via combinaison des 4 fonds (crème / blanc / bleu brand / ink) avec les primitives partagées.
- L'app reste inchangée — discipline maintenue.

**À revisiter** : si les premiers carousels révèlent que la crème seule manque de pep, envisager d'ajouter `--color-lavender` `#e0e7ff` comme 4e ton marketing (jamais dans l'app).

#### 2026-05-26 — Polish "belle V0" pré-lancement + CTA prix dans le bouton + stats honnêtes

**Contexte** : Avant hard launch public, audit comparatif vs getmint.ai (concurrent FR direct). Trois piliers conversion manquaient à la home : preuve produit visible (que des mockups CSS, zéro screenshot dashboard réel), garanties affichées (la garantie 14j enterrée en FAQ pricing, jamais surfacée hero), différenciation concurrentielle prouvée (aucune page comparative dédiée).

**Décisions actées** :

1. **CTA hero : prix dans le bouton** (pattern Linear/Vercel). Avant : "Voir les plans →". Après : **"Démarrer — 9,99 €/mois"** + microcopy "Garantie remboursement 14 jours · Sans engagement · Hébergé EU". Idem sur le nouveau `<FinalCTA>` avant footer et sur la page `/vs/profound`. Justification : anti-friction maximum, l'utilisateur sait à quoi s'attendre, la garantie 14j fait disparaître le risque psychologique sur 9,99 €/mois.

2. **Pas de testimonials inventés** (rejet du pattern Mint "200+ marques nous font confiance"). À la place : composant `<ProofStrip>` avec 3 stats produit factuelles ("5 IA trackées · 30+ checks gratuits · 10 min pour le 1ᵉʳ rapport"). Justification : intégrité > preuve sociale faible. Bascule en `<Testimonials>` quand 3+ vrais clients pilote acceptent d'apparaître nommément.

3. **TrustStrip placé après PourquoiMaintenant** (et non sous Hero comme initialement prévu). Le `mb-[-200px]` du `<HeroDataShowcase>` desktop fait plonger les 4 cartes tiltées dans la section noire ; mettre TrustStrip (fond tinted gris) entre Hero et PourquoiMaintenant aurait cassé cette coupe signature. Trade-off accepté : trust apparaît juste après le 1ᵉʳ chapitre noir du narratif, toujours haut dans le scroll.

4. **Mobile hero data showcase ajouté** : variante `md:hidden` avec 2 cards simplifiées (Score + Évolution) dans `<HeroDataShowcase>`. Avant : `hidden md:flex` → invisible sur 60%+ du trafic. Pas de tilt ni hover-lift sur mobile.

5. **Page `/vs/profound` créée** : landing comparative single-route recyclant 80% du contenu de l'article blog `mamie-geo-vs-profound.mdx`. Table 3 colonnes (Critère / Profound / Mamie GEO) + cards face-à-face + FAQ + CTA. SEO cible "alternative Profound" en FR (zéro compétition). Mêmes templates `/vs/mint` et `/vs/peec` à venir en P1.

6. **Section product tour préparée mais en attente** : composant `<ProductTour>` créé + script `pnpm seed:demo` (marque fictive "La Maison Verte" + 30j de citation_metrics_daily déterministes). Captures réelles à produire par Max — composant pas inclus dans `page.tsx` tant que les `.webp` n'existent pas dans `public/marketing/dashboard/`.

7. **Footer nettoyé** : retrait du lien mort `/docs`, ajout colonne "Comparatifs" (`/vs/profound`), ajout bloc trust RGPD (icône bouclier + "Hébergement EU · RGPD natif · DPA disponible · 0 tracker publicitaire") au-dessus du copyright.

**Conséquences attendues** : conversion home améliorée par 2-3 leviers cumulatifs (prix transparent, garantie immédiate, démo visuelle bientôt). SEO "alternative Profound FR" capturé. Crédibilité compliance vs concurrents US renforcée.

**Reste à faire pour la "belle V0" complète** : captures dashboard + activation `<ProductTour>` ; décision export CSV (implémenter endpoint `/api/export/runs.csv` ou afficher "Bientôt" dans la future section intégrations P1.3) ; pages comparatives `/vs/mint` et `/vs/peec` (P1) ; section intégrations & exports (P1).

**À revisiter** : sous 3 mois après lancement public, ou dès 3 vrais clients pilote acceptent un testimonial → bascule `<ProofStrip>` en `<Testimonials>` côté hero.

---

#### 2026-05-22 — Phase C livrée + polish UX V0+ + retrait pattern signature (rollback 2026-05-18)

**Contexte** : Période intense du 2026-05-18 au 2026-05-22 — clôture de la Phase C (multi-LLM + Stripe + emails) + démarrage V0+ (polish UX + items veille). Plusieurs décisions structurantes prises rapidement, à formaliser ensemble.

**Décisions actées** :

1. **Multi-LLM livré** (PR1-5 2026-05-18). Tous les 5 providers en place via `getConfiguredLLMs()` :
   - Anthropic Claude Haiku 4.5 (Phase A, déjà en place)
   - Mistral `mistral-large-latest` (PR2, sans web_search natif — à upgrader vers Mistral Agents API plus tard)
   - OpenAI `gpt-4o-mini` + web_search Responses API (PR3)
   - Google `gemini-2.5-flash` + grounding Search (PR4)
   - Perplexity `sonar` (PR5, code prêt, activation à chaud dès `PERPLEXITY_API_KEY` settée — crédit min $50 en attente)
   - Source de vérité : `src/lib/llm/index.ts` `getConfiguredLLMs()` + `IMPLEMENTED_LLMS` flags.
   - Scheduler `/api/cron/schedule-runs` auto-détecte → enqueue runs pour les LLMs configurés uniquement.

2. **PR6 KPI dashboard repensé** (2026-05-20). Le coût USD affiché aux 4 endroits client était de la donnée technique sans valeur métier (l'user paie un abonnement Stripe en €). Retiré partout côté client. Les 3 stats principales (Score, Marque citée, Top concurrent) étaient toujours Claude-only (héritage Phase A) → élargies à l'agrégat tous-LLMs. 4e stat = nouveau KPI **Part de voix** (terme glossaire officiel, jamais calculé jusque-là). Formule `brand / (brand + Σ concurrents) × 100`, fonction pure `computePartDeVoix()` dans `src/lib/metrics/part-de-voix.ts` (8 tests).

3. **AppTopBar horizontale pattern Vercel** (2026-05-20). Sortie du workspace + brand pill de la sidebar verticale vers une top bar sticky horizontale. Composant `<BrandFavicon>` charge l'icône du domaine via Google s2 favicons API avec fallback (carré ink + initiale). Sidebar simplifiée : logo + nav + user menu uniquement.

4. **Pattern signature blue RETIRÉ** (rollback de la décision 2026-05-18). Après 4 itérations sur `/login` (xl primary 100%, gradient bleu radial, ink coin opacity 8%, primary full-width 5%), aucune n'a convaincu sur l'équilibre lisibilité × signature. Conclusion : faux bonne idée. Suppression radicale : composant `<PatternBlock>`, classes CSS `.bg-pattern*`, assets `/public/pattern.svg` + `/src/assets/pattern.svg`, 3 usages site (hero, audit-teaser, login) + 2 usages emails (welcome-paid bande top, weekly-recap pattern-band). L'identité visuelle s'appuie désormais sur logo + couleur primary + CornerFrame + favicon brand dans la top bar. Le terracotta `--color-accent` reste actif sur badges/CTAs comme avant 2026-05-18.

5. **Background app gris `#fafafa`** (2026-05-22). `body` utilise `var(--color-surface)` (#fafafa) au lieu de `--color-bg` (#fff). Cards / sidebar / topbar / tables restent en `bg-white` → émergent visuellement, sensation "premium SaaS" type Linear/Vercel. Aligné avec doc 10 mais corrige la règle « fond toujours blanc » qui devient « cards toujours blanches sur fond gris ».

6. **Refonte audit by severity** (2026-05-22). `/app/audits/[id]` groupe les checks par **sévérité** (critical/warning/info) au lieu de status (fail/warn/pass). Composant `<ChecksBySeverity>` : 3 sections dépliables FUSIONNÉES (le trigger header et les items checks vivent dans la même card, pas de cassure visuelle entre "Critique 3" et les 3 cards critiques). Critical + warning ouverts par défaut, info fermé. Bulle de notification rouge sur l'item sidebar "Audits techniques" si checks `critical+fail` non résolus > 0 (somme sur dernier audit par URL owned).

7. **Brand creation depuis BrandSwitcher** (2026-05-20). Server action `createBrand` dans `src/lib/brands/actions.ts` avec auth + rôle owner/admin + quota check. Nouveau champ `brands` dans `PlanQuotas` : Solo/Starter 1, Pro 3, Agency 10, Enterprise illimité. Dialog UI à 2 modes (form ou CTA upgrade).

8. **Newsletter blog Brevo** (2026-05-20). Form inscription sur `/blog` + helpers `subscribeContactToBlogList` / `sendNewArticleNewsletter` dans `src/lib/email.ts`. Endpoint `/api/blog/notify-publish` (protégé `CRON_SECRET`) appelé par le launchd publication-mamie-geo.sh après chaque push d'article → broadcast Brevo à la liste `BREVO_BLOG_LIST_ID`.

9. **Em dashes `—` retirés côté site** (2026-05-20). Sed `s/ —/,/g` global sur src/app, src/components, src/content, src/lib/email. Placeholders `"—"` (no value) préservés.

**Conséquences** :
- doc 10 § Pattern signature à retirer (devenu obsolète).
- doc 10 règle « fond toujours blanc » à reformuler : « cards toujours blanches sur fond gris #fafafa ».
- doc 03 § Quotas par plan à updater avec le champ `brands`.
- Phase C marquée livrée dans CLAUDE.md § 9, V0+ entamé.

**À revisiter** : si traction user / feedback signale un manque de signature visuelle distinctive après le retrait pattern, ouvrir un nouveau ticket design (mais pas de damier — autre piste type ligne diagonale, gradient subtil, ou pictogramme).

#### 2026-05-18 — Pattern signature blue (damier diagonal) remplace progressivement le terracotta

> ⚠️ **ROLLBACK 2026-05-22** : cette décision a été annulée 4 jours après. Voir entrée 2026-05-22 ci-dessus pour la décision finale (suppression complète du pattern). Conservé en historique.

**Contexte** : Max a livré une banner LinkedIn qui utilise un motif damier diagonal 80×80 en bleu primary sur fond blanc, occupant ~20 % du côté gauche. Le rendu est mémorable et distinctif. Il a déposé le pattern dans `src/assets/pattern.svg` et demande qu'il devienne un élément du design system : remplacer le dégradé orange du login, le poser sur 1-2 sections de la home, l'ajouter aux templates email.

**Tension à résoudre** : doc 10 spécifiait *« fond toujours blanc, jamais teinté »* + *« accent terracotta #C5532E seule signature chaleur »*. Ajouter un second élément signature (bleu géométrique) doit être cadré pour ne pas créer un design system schizophrène.

**Options considérées** :

- A : Pattern = **signature graphique additionnelle**. Terracotta reste l'accent ponctuel (badges, asterisque login). Bleu data viz inchangé. Le pattern s'utilise sur 1-2 placements par page max.
- B : Pattern **remplace progressivement le terracotta**. Le terracotta n'est pas retiré du code en V0 mais ses usages migrent PR par PR vers du pattern bleu ou du neutre. À terme, la marque est portée par le pattern bleu, pas par l'accent orange. ← **retenu**
- C : Pattern décoratif sans statut signature (touche sur 1-2 endroits sans devenir un élément récurrent).

**Choix (livré 2026-05-18)** :

1. **Pattern asset** : `/public/pattern.svg` (servi statiquement Next), fill baké en `#329cff` pour les usages `<img>` et emails. Pour les usages CSS où on veut tinter, classe utilitaire `.bg-pattern` qui projette la couleur via `mask-image` (seul l'alpha du SVG compte).
2. **Composants** : `<PatternBlock corner tone size />` dans `src/components/ui/pattern-block.tsx` pour les blocs carrés qui débordent en signature aux coins ; `<PatternBand position tone height tile />` pour les bandes horizontales (headers email, séparateurs section).
3. **Règles d'usage** (cf. doc 10) : 1-2 placements par page max, toujours coin ou bande délimitée jamais fond plein, tone soft 30 % quand cohabite avec du texte/mockup et tone full en signature isolée, tile 56-104 px côté UI et 24-56 px côté emails.
4. **Migration progressive** : `--color-accent` (`#C5532E`) reste actif dans `globals.css`. Les usages migrés en V0 : panel login (gradient warm → pattern), asterisque login (terracotta → primary), home Hero (ajout pattern soft top-right), home AuditTeaser (blob terracotta → pattern soft bottom-left), email weekly-recap (header pattern band), email welcome-paid (header pattern band). Les autres usages (badges `tone="accent"`, glow ai, terracotta dans dropdowns) restent en place et seront migrés au fil des PR de refonte.
5. **Doc** : `geo-project/10-design-direction.md` enrichi d'une section « Pattern signature » qui codifie les règles. CLAUDE.md snapshot mis à jour.

**Justification** :

- Un logo + un wordmark ne suffisent pas à créer une signature mémorable de marque SaaS. Le damier bleu, vu une fois en grand (login, email), devient associatif et reconnaissable hors contexte — c'est ce que la banner LinkedIn de Max démontre déjà.
- Le terracotta `#C5532E` jouait ce rôle dans doc 10 mais sans forme — il était facile à confondre avec n'importe quel SaaS « accent orange ». Un motif géométrique est intrinsèquement plus distinctif qu'une couleur d'accent.
- Le bleu primary `#329cff` était déjà la couleur du logo et de la data viz. Le pattern le démultiplie en signature graphique cohérente.
- Garder le terracotta en transition évite une refonte big-bang et permet de calibrer le dosage du pattern au fur et à mesure.

**Conséquences attendues** :

- Identité visuelle plus distinctive en post-checkout (premier email reçu = premier contact avec la marque hors site).
- Le login devient un point de signature fort plutôt qu'un panneau marketing tiède (le gradient orange n'apportait pas grand-chose narratif).
- Risque : si on charge le pattern partout au lieu de respecter la règle « 1-2 par page », le motif devient bruit. À surveiller en revue UI.

**À revisiter** : 2026-06-15 — après 2-3 PR de refonte, décider si le terracotta est entièrement retiré du design system (et passer `--color-accent` en alias de neutre) ou si on garde un dual signature pattern bleu + accent terracotta sur les badges marginaux.

#### 2026-05-17 — Sprint 6 PR B — app /app/audits Premium + charts dashboard vivants

**Contexte** : PR A (2026-05-16) a promu l'audit technique en home + blog. PR B livre la version premium dans l'app : audit on-demand depuis `/app/audits/new`, historique en DB, audit hebdo automatique sur la brand, alerte email si chute ≥ 10 pts, et matrice comparative avec les concurrents (différenciateur Pro/Agency). En parallèle, suppression des EmptyState dashboard pour rendre les charts visibles dès J0 (la première impression du dashboard était mortifère pour un nouveau user qui n'avait pas encore de data).

**Options considérées (audit-app)** :

- A : One-shot full premium (table DB + 4 pages + worker + cron + email + comparaison concurrents) en un seul push ← **retenu**
- B : Lean MVP d'abord (juste on-demand + list + detail), puis cron/email/compare dans une PR ultérieure
- C : Audit on-demand côté server action + cron, mais pas d'historique DB (juste cache mémoire éphémère)

**Choix (audit-app, livré 2026-05-17)** :

1. **Table `technical_audits`** (workspaceId, brandId nullable, url, isCompetitor, scoreGlobal, subScores jsonb, checks jsonb, htmlSizeKb, httpStatus, psiUnavailable, fetchedAt, createdAt). Index `(workspaceId, createdAt)` + `(workspaceId, url)`. `brandId` nullable pour les audits concurrents qui ne pointent pas vers `brands.id`.
2. **Table `audit_counters`** (workspaceId, periodStart YYYY-MM-01, auditsCount, competitorAuditsCount) avec PK composite — fenêtre mois calendaire UTC. Compteurs séparés pour ne pas qu'un batch concurrents consomme tout le quota mensuel. Helper `incrementAuditCounter()` UPSERT atomique avec pré-check du quota fini.
3. **Quotas par plan** étendus dans `PlanQuotas` : `audits` (mensuel) + `comparisonCompetitors` (batch max). Solo 5/0, Starter 30/3, Pro 100/10, Agency ∞/∞. Trial/past_due/expired/canceled : 0/0.
4. **Server action `runWorkspaceAudit`** synchrone — quota check + increment AVANT `runAudit()` (5-15s) + insert DB. Tient dans Vercel functions 60s. L'incrément consomme une "tentative" même si l'audit échoue (anti-spam URLs invalides).
5. **Server action `runCompetitorsBatch`** async — enqueue N jobs `audit_workspace_url` (1 par concurrent avec domaine). Limité à `quotas.comparisonCompetitors`. Solo bloqué (0).
6. **Worker `audit_workspace_url`** (nouveau queue kind ajouté à `QUEUE_KIND`). Idempotence `audit_workspace_url:{workspaceId}:{url}:{date}` — lance la même URL le même jour est dédupliqué. Si `notifyOnDrop=true` ET delta ≥ -10 pts vs précédent → envoie l'email score-drop aux membres.
7. **4 pages app** : `/app/audits` (list groupée par URL + delta vs précédent + badge nb d'audits), `/app/audits/new` (form URL pré-rempli sur `brand.domain` + checkbox batch concurrents pour Starter+), `/app/audits/[id]` (détail full avec recos `getRecommendation()`, organisé par failures / warnings / passed), `/app/audits/compare` (matrice URL × catégorie SEO/GEO/A11y/Perf — owned highlighted + concurrents en dessous). Solo voit `/compare` en mode verrouillé (upsell vers Starter).
8. **Cron `/api/cron/schedule-audits`** lundi 05:00 UTC. Pour chaque workspace actif non hard-capé, enqueue 1 audit sur `brand.domain` avec `notifyOnDrop=true`. Quota check inclus (skippe si workspace a déjà épuisé son quota mensuel via on-demand).
9. **Email `audit-score-drop`** : template HTML inline branded, table avec score précédent/actuel + URL, CTA vers `/app/audits`. Reprend le pattern `weekly-recap.ts`. Seulement sur owned, jamais sur concurrents.
10. **Sidebar entry** « Audits techniques » + icon `Wrench` (lucide). Position : après Concurrents, avant Runs.

**Choix (charts vivants, livré 2026-05-17)** :

1. **TrendSection** : suppression de l'EmptyState « pas assez d'historique ». Toujours rendu via `<LineChart>` avec un scaffold de N jours (7/30/90 selon range) où les jours sans data ont `value: 0` pour chaque LLM. Visuellement la ligne « monte du sol » à mesure que les runs arrivent. Overlay flottant central avec backdrop blur quand `fullTrend.length < SPARSE_THRESHOLD (3)` : « Données en cours de collecte — N jours sur 3 requis ». Fallback série `["claude"]` (Phase A) si server renvoie `series=[]`.
2. **BreakdownBars** dashboard : suppression de l'EmptyState « aucun score aujourd'hui ». Les 5 LLMs trackés restent visibles en permanence avec couleur + label + valeur (0 si pas de run). Le composant `<BreakdownBars>` gère déjà gracefully `value === 0` (opacity 0.18 + hauteur min 8 %). Sous-titre change quand tout est à 0 (« Snapshot du jour — en attente du premier run »).
3. **RecentRunsTable** : EmptyState **conservé** (une table de 0 lignes est triste, le texte est plus utile que des cases vides).

**Justifications** :

- **Audits synchrones côté on-demand** : `runAudit()` prend ~10s en moyenne (fetch + parse + PSI parallèle). Vercel functions 60s laisse une marge confortable. Pas d'async pour une expérience instantanée — l'utilisateur clique « Lancer », voit un spinner, et arrive sur le rapport. Le batch concurrents (10 URLs × 10s = 100s) DOIT être async via queue, sinon dépassement Vercel.
- **`brandId` nullable pour les concurrents** : un concurrent n'est pas dans `brands` (table dédiée à la marque trackée). On garde `brandId` pour les audits owned, et `null` pour les concurrents qui ont `competitors.domain` comme source. Avantage : pas besoin d'une table polymorphique ou de discriminator.
- **Quotas séparés owned vs concurrents** : sinon un batch de 10 concurrents consommerait 10/30 du quota mensuel d'un Starter, ne laissant que 20 audits owned pour le mois. Avec compteur séparé, Starter a 30 audits owned + 3 concurrents par batch — quota concurrent moins strict car valeur business plus faible (snapshot ponctuel vs suivi continu).
- **Variant `notifyOnDrop`** : on ne veut PAS d'email d'alerte si l'utilisateur lance lui-même un audit ad hoc et constate une chute (il est déjà sur la page, l'email serait redondant). L'email est réservé aux audits programmés (cron hebdo) où la chute serait passée inaperçue. Implementé via flag dans le payload `audit_workspace_url`.
- **Charts vivants — pas de mock data** : malgré la tentation de pré-remplir avec un dataset « démo » pour l'effet wow, on a refusé. Mensonge → confusion. Baseline 0 + overlay « collecte » est honnête : l'utilisateur sait que ses propres données vont remplir la courbe, et la grille temporelle communique la promesse (tracking continu) sans tromper.
- **RecentRunsTable garde son EmptyState** : à l'inverse des charts, une table avec 0 ligne et juste les en-têtes ne communique rien d'utile — le texte explicatif (« le cron tourne à 06:00 UTC ») est plus actionable.

**Conséquences attendues** :

- L'app gagne un onglet « Audits techniques » qui rend tangible la promesse « plus qu'un tracker LLM » de Mamie GEO — différencie de Profound/Otterly qui ne font que du tracking IA.
- KPI à suivre : ratio `audits / runs` par workspace actif (objectif > 0.5 = chaque workspace audite au moins une fois par mois). Click-through `/app/dashboard` → `/app/audits` (mesure adoption de la nouvelle feature).
- Risque de coût LLM : zéro (audit n'utilise pas de LLM). Risque de coût Google PSI : un appel par audit, gratuit jusqu'à 25K/jour. Risque de coût Vercel functions : un audit ~10s = 10× plus cher qu'un run LLM en compute time, mais on-demand donc rare en pratique.
- Le cron hebdo lundi 5h UTC tournera demain (2026-05-18) sur les workspaces actifs avec brand.domain — premier batch d'audits programmés.

**Hors scope PR B (à revisiter)** :

- ❌ Audit d'URLs internes multiples (page produit, blog post) — V0 audite uniquement la home. Évolution simple : on garde `audit_counters` séparé par URL si on veut tracker tout un site.
- ❌ Diff visuel entre 2 audits (« qu'est-ce qui a changé ? ») — pour l'instant on voit juste le delta de score global ; la liste des checks qui ont changé exigerait un diff structurel des `checks` jsonb, à coder plus tard.
- ❌ Export PDF du rapport — la page `/app/audits/[id]` est déjà print-friendly mais pas d'export bouton.

**À revisiter** : 2026-06-15 — décider si on retire le test visibilité IA humain (`/outils/test-visibilite-ia`) maintenant que l'audit-app Premium tient la promesse principale.

**Fichiers touchés PR B** :

- DB : `src/db/schema.ts` (+ `technicalAudits` + `auditCounters` + queue kind), `src/db/migrations/0002_classy_joshua_kane.sql`
- Lib : `src/lib/plans/quotas.ts` (+ champs `audits` + `comparisonCompetitors`), `src/lib/audits/counters.ts` (NOUVEAU), `src/lib/queue/types.ts` (+ `AuditWorkspaceUrlPayload`), `src/lib/email/templates/audit-score-drop.ts` (NOUVEAU)
- Worker : `src/workers/audit-workspace-url.ts` + `src/workers/audit-workspace-url-payload.ts` (NOUVEAUX), `src/app/api/cron/dispatch/route.ts` (+ case `audit_workspace_url`), `src/app/api/cron/schedule-audits/route.ts` (NOUVEAU)
- Pages : `src/app/(app)/app/(with-nav)/audits/{page,actions}.ts`, `audits/new/{page,new-audit-form}.tsx`, `audits/[id]/page.tsx`, `audits/compare/{page,competitors-batch-button}.tsx` (TOUS NOUVEAUX)
- UI : `src/app/(app)/app-sidebar.tsx` (+ entry « Audits techniques » + icon `Wrench`)
- Cron config : `vercel.json` (+ schedule `0 5 * * 1`)

**Fichiers touchés charts vivants** :

- `src/app/(app)/app/(with-nav)/dashboard/page.tsx` (suppr empty state BreakdownBars)
- `src/app/(app)/app/(with-nav)/dashboard/trend-section.tsx` (scaffold baseline + overlay « collecte »)

---

#### 2026-05-16 — Sprint 6 PR A — promotion audit technique sur la home + blog

**Contexte** : audit ROI marketing fait après Sprint 5. Deux lead magnets en prod : `/outils/test-visibilite-ia` (humain, ~24 h ouvrées, ~$0,20 LLM/audit, capacité limitée par mon temps) et `/outils/audit-technique` (instantané, pas d'appel LLM, coût marginal 0 €, scalable à l'infini). Le second est massivement sous-promu : pas de mention en hero, pas de section home dédiée, listé après le test IA dans le footer. Le test visibilité IA est mis en avant partout alors qu'il scale mal.

**Objectif** : faire de l'audit technique le lead magnet #1 — il est ownable (peu de concurrents font de l'audit GEO-spécifique), gratuit-forever sans contrainte coût, et c'est la première action concrète à recommander à quelqu'un qui découvre le GEO. Le test visibilité IA reste exposé mais en second.

**Options considérées** :

- A : Refonte home large + promo audit + app /app/audits Premium dans un seul gros PR (~2000 lignes, risque merge)
- B : 2 PRs séquentielles — (PR A) promotion audit dans home + blog seule ; (PR B) app /app/audits Premium séparée ← **retenu**
- C : Juste ajouter une mention discrète dans le footer + un bouton ghost en hero (suffisant à court terme mais ne capitalise pas)

**Choix PR A (livrée 2026-05-16)** :

1. **Hero refait** : primary inchangé (« Voir les plans »), secondary remplacé par `<LinkButton variant="ai">` « Audit technique gratuit » → `/outils/audit-technique`. Lien texte discret vers `/outils/test-visibilite-ia` en dessous. Sous-titre mis à jour avec « 30+ checks SEO + GEO en 10 secondes, sans inscription ».
2. **Nouvelle section `<AuditTeaser />`** insérée dans la home **après `<TesConcurrentsPasToi />` et avant `<LLMBadges />`** — logique narrative : (a) « les IA citent les concurrents pas toi » pose le problème, (b) AuditTeaser pose la première solution actionnable et gratuite. Layout 2 colonnes : copy à gauche (eyebrow « Première action concrète » + titre + mini-stats « 30+ checks · 10 sec · 0 € forever · sans inscription » + CTA `variant="ai"`) + mockup à droite (`<MockupAudit />` client component qui simule un rapport : score global 67/100, 4 sub-scores SEO/GEO/A11y/Perf avec progress bars animées au mount, issue critique FAQPage JSON-LD avec recommandation).
3. **Footer outils réordonné** : « Audit technique site » remonte en première position, « Test visibilité IA » en seconde — l'outil le plus scalable doit être premier.
4. **Nouveau variant CTA blog `audit-technique`** ajouté à `BLOG_CTAS` (`src/lib/blog/schemas.ts`) + entry correspondante dans `CTA_CONFIG` (`src/components/blog/article-cta.tsx`). Pas appliqué aux 3 articles existants — sera utilisé sur les **futurs articles** orientés « comment optimiser pour les LLM » (où l'audit technique est la première action recommandée). On garde `audit-gratuit` (humain) pour les articles généralistes GEO ; les deux variants coexistent.

**Hors scope PR A (refusé)** :

- ❌ Refonte hero copy/animations large — reporté, on attend feedback users
- ❌ Réorganisation profonde des sections home (juste 1 ajout après TesConcurrentsPasToi)
- ❌ Refonte du blog au-delà du nouveau variant CTA
- ❌ App version audit (sera PR B)

**Justification** :

- **PR séquentielles plutôt que big bang** : PR A est ~400 lignes, mergeable en 24 h. PR B (app /app/audits Premium, ~1500 lignes estimées) part sur une base déjà déployée et bénéficie du feedback users sur la nouvelle home avant qu'on investisse dans la version premium.
- **Variant `ai` pour les CTAs audit-technique** : cohérent avec le langage déjà posé (le variant `ai` injecte Sparkles + gradient terracotta→purple→blue). Visuellement, le CTA hero a la même signature que le CTA fin d'article + le CTA AuditTeaser → l'utilisateur identifie « outil » sans avoir besoin de lire.
- **Mockup animé plutôt que screenshot statique** : un screenshot vieillit (UI bouge), un mockup en composant React reflète le design system courant. Les progress bars qui s'animent au mount cassent la froideur d'une capture figée et donnent envie de cliquer pour voir « son » rapport.
- **Pas d'A/B test V0** : trafic insuffisant pour conclure. On bascule franchement, on mesure conversion sur 14 jours, on ajuste si besoin.

**Conséquences attendues** :

- Conversion `landing → /outils/audit-technique` montera (estimation : ×3-5 vs niveau actuel quasi nul) car le CTA passe d'un lien footer obscur à un emplacement hero + une section home dédiée.
- Inversement, conversion vers `/outils/test-visibilite-ia` baissera mécaniquement de ~30-50 %. Acceptable : c'était un goulot d'étranglement de toute façon (capacité limitée par mon temps).
- L'audit technique reste sans inscription en V0 (pas de gate email pour l'instant — cf. décision Sprint 3) ; ce sera revu dans la PR B Premium si la conversion organique nous fournit déjà assez de leads.
- KPI à suivre dans `09 § Suivi KPI mensuel` : ratio `/outils/audit-technique` page views ÷ home views, taux click-through CTA hero variant `ai`, taux complétion form audit-technique.

**À revisiter** : 2026-06-15 — décider si on garde les 2 lead magnets ou si on retire le test IA humain (devenu redondant avec l'app version audit Premium PR B).

**Fichiers touchés PR A** :

- `src/app/(marketing)/_sections/hero.tsx` (modif CTA secondaire + sous-titre)
- `src/app/(marketing)/_sections/audit-teaser.tsx` (NOUVEAU — server component)
- `src/app/(marketing)/_sections/mockups/mockup-audit.tsx` (NOUVEAU — client, progress bars animées)
- `src/app/(marketing)/page.tsx` (wire `<AuditTeaser />` après `<TesConcurrentsPasToi />`)
- `src/app/(marketing)/_sections/marketing-footer.tsx` (réordonner outils)
- `src/lib/blog/schemas.ts` (ajouter `"audit-technique"` à `BLOG_CTAS`)
- `src/components/blog/article-cta.tsx` (ajouter entry au `CTA_CONFIG`)
- `CLAUDE.md` § 9 + ce doc

**Plan PR B (résumé — détail à écrire au moment de la PR)** :

- Table `technical_audits` + migration Drizzle
- Pages `/app/audits` (list grouped by URL + sparkline 30j), `/app/audits/new` (form + checkbox concurrent), `/app/audits/[id]` (rapport full réutilisant `<AuditResults>`), `/app/audits/compare` (matrice URL × catégorie)
- Server actions `runWorkspaceAudit` / `runCompetitorsBatch` / `listAudits` / `getAuditDetail` / `deleteAudit` + quota check
- Worker `audit_workspace_url` async + cron `/api/cron/schedule-audits` (lundi 5h UTC)
- Email alerte `audit-score-drop` (delta < -10 pts vs audit précédent)
- Sidebar entry « Audits techniques »
- Quotas : Solo 5/mois, Starter 30, Pro 100, Agency illimité ; comparaison concurrents Starter ✅ 3 / Pro ✅ 10 / Agency ✅ illimité ; Solo ❌

---

#### 2026-05-16 — Sprint 2 blog : pipeline content-driven + SEO/GEO complet

**Contexte** : le blog avait 3 articles MDX bloqués sur une architecture manuelle — registry TS hardcodé dans `src/app/(blog)/blog/articles-registry.ts`, pas de frontmatter YAML, pas d'OG image dynamique, pas de JSON-LD, pas de sitemap. Impossible de "copier-coller un markdown" pour ajouter un article, et les LLM/Google ne pouvaient pas tirer parti des FAQ structured data qui boostent le ranking GEO.

**Objectif** : transformer le blog en machine SEO/GEO autonome — Max colle un fichier `src/content/blog/{slug}.mdx` avec frontmatter YAML, le système fait le reste (meta, OG, JSON-LD, CTA contextuel, articles liés, sitemap).

**Options considérées** :

- A : Garder l'architecture manuelle + ajouter juste sitemap/OG (~400 lignes mais ne scale pas)
- B : Refacto complet content-driven + SEO/GEO complet (~1400 lignes, scale à 100+ articles) ← **retenu**
- C : Migrer vers contentlayer/velite (libraries content-as-data) — overkill V0, nouvelle dépendance externe

**Choix** :

1. **Format MDX + frontmatter YAML** : `src/content/blog/{slug}.mdx` autonomes, frontmatter validé par Zod au scan filesystem (rejette les articles mal formés au build).
2. **Plugins MDX** ajoutés à `next.config.ts` : `remark-frontmatter` (retire YAML du rendu), `remark-gfm` (tables, strikethrough), `rehype-slug` (id auto sur h2/h3), `rehype-autolink-headings` (`behavior: "wrap"` + classe `.heading-anchor` pour styler une icône # au hover).
3. **Registry filesystem** (`src/lib/blog/registry.ts`) : `listArticles()` + `getArticleBySlug()` + `getRelatedArticles()` scannent `src/content/blog/` avec `gray-matter`, mémoïsés via `cache()` per-request.
4. **JSON-LD complet** sur chaque article : `Article` + `BreadcrumbList` + `FAQPage` (auto-injecté par `<BlogFAQ>`). FAQPage est le boost GEO majeur — Google et les LLM citent en priorité ces contenus.
5. **OG image dynamique** via `next/og` ImageResponse, 1200×630, halo gradient catégorie + branding Mamie GEO. Template unique paramétré (cf. `src/app/(blog)/blog/[slug]/opengraph-image.tsx`).
6. **`<ArticleCTA>` auto** : 4 variantes (solo / starter / pro / audit-gratuit) selon `frontmatter.cta`, injectée en fin d'article. `audit-gratuit` utilise le variant `Button ai` (gradient terracotta→purple→blue).
7. **Maillage interne via `<RelatedArticles>`** (3 articles via scoring catégorie + keywords overlap). Pas de rehype plugin auto-liens : complexité disproportionnée pour V0, le maillage interne est suffisamment couvert par les RelatedArticles + liens manuels que l'auteur peut écrire.
8. **`<TOC>` sticky desktop** (articles ≥ 6 min) + `<ReadingProgress>` bar fixed top. Parsé du DOM via les ids posés par rehype-slug.
9. **`sitemap.ts` + `robots.ts`** auto-générés. Mise à jour automatique quand un .mdx est ajouté.
10. **Newsletter** : reportée à une PR future (décision validée 2026-05-16 — on attend que le blog drive du trafic).

**Justification** :

- Le pipeline content-driven résout le bottleneck Max (« copier-coller du markdown »). Plus de double maintenance registry TS + .mdx — un seul fichier = un article complet.
- Les structured data (Article + FAQPage + BreadcrumbList) sont **le levier GEO** : les LLM citent en priorité les contenus structurés. ROI direct sur la mission de Mamie GEO.
- L'architecture est scalable à 100+ articles sans modification (filesystem scan + cache per-request).
- 145 tests verts (+ 15 nouveaux : schemas frontmatter, registry, blog-faq).
- Pas de Lighthouse CI — validation PageSpeed manuelle post-deploy suffit pour V0.

**Conséquences attendues** :

- Workflow Max : 1 fichier .mdx = 1 article complet (meta, OG, JSON-LD, CTA, articles liés auto).
- Tous les articles sont SSG (`generateStaticParams`) — pages HTML pures, TTFB minimal.
- Page `/sitemap.xml` listée dans `robots.txt`, prête pour Google Search Console.
- Score Google PageSpeed cible ≥ 98 (Perf + SEO) sur les articles — à valider manuellement après deploy sur https://pagespeed.web.dev/.

**À revisiter** :

- **Newsletter form + endpoint Brevo addToList** : quand le blog drive du trafic significatif (~500 visiteurs uniques/semaine sur le blog), brancher pour capturer les leads. Brevo liste à créer à ce moment-là.
- **rehype plugin auto-liens internes** : si on dépasse 30+ articles et que le maillage interne devient un facteur SEO critique, ré-évaluer. Pour l'instant `<RelatedArticles>` + liens manuels suffisent.
- **Lighthouse CI dans GitHub Actions** : à ajouter quand on aura > 10 articles pour catch les régressions perf au build.
- **Pages-templates spécialisées** : si on lance des "guides longs" (10k+ mots), créer un template `<LongFormGuide>` avec TOC enrichie + ancres sticky mobile.

---

#### 2026-05-14 — Stripe billing + plan Solo 9,99 € + pivot trial → garantie 14 j refund

**Contexte** : la PR « App CRUD » (2026-05-13) a achevé le self-service. Reste à monétiser. Audit du schéma DB confirme que les colonnes Stripe (`stripeCustomerId`, `stripeSubscriptionId`, `trialEndsAt`, `currentPeriodStart/End`, `hardCapHitAt`) et les tables `subscription_events` (avec `stripeEventId UNIQUE` → idempotence webhook gratuite) + `usage_counters` sont déjà en place — le code Stripe peut être greffé sans refonte schéma.

Trois questions stratégiques se sont posées avant l'implémentation :

1. **Trial automatique 7 jours sans carte (décision 2026-05-05) — encore valide ?** Recalcul coûts unitaires : ~$0,043 / run (Haiku + scoring). Trial 7j × utilisateur moyen (10 prompts × 1 LLM) = ~$3 LLM gaspillés par trial. Sur 100 signups à 5 % conv = $285 de perte sèche. En Phase C complète (5 LLMs), le coût grimpe à ~$15 / trial user → ~$1 425 / 100 signups. **Non viable** en early access.
2. **Tarifs 49/149/399 — trop chers ?** Comparaison marché : Profound $499, Athena ~$300, Otterly €69. Mamie GEO est **déjà 7-10× moins cher que Profound** et aligné avec Otterly. Baisser à 39/119/299 détruirait la marge sans changer la décision d'achat. **Tarifs conservés**.
3. **Plan Agency 399 € — nécessaire en V0 ?** Peu de demande agences early. Risque d'effort marketing dilué. Garder Agency dans l'enum DB mais retirer de l'UI publique. Remplacer par CTA « Plus de volume ? Contact ».

**Options considérées** :

- A : Stripe minimal (checkout + portal + webhook seulement, ~600 lignes, trial conservé, hard-cap PR suivante)
- B : Stripe standard (A + bascule trialing → 0/0/weekly, cadence per-plan, cron expire-past-due, ~750 lignes, hard-cap PR suivante) ← **retenu**
- C : Stripe complet (B + hard-cap enforcement worker, ~1 000 lignes — au-delà du target CLAUDE.md § 4)

**Choix** :

1. **Modèle d'acquisition** : pas de trial automatique + garantie remboursement 14 jours (refund manuel via portal Stripe). Le free taster reste `/outils/test-visibilite-ia` (one-shot, ~$0,20 LLM coût, déjà déployé). Conservation Stripe Tax.
2. **Plan d'entrée Solo 9,99 €/mois** : 5 prompts × 3 concurrents × **1 run par semaine (lundi 6h UTC)** sur les 5 LLMs. Marge brute LLM ~75 % en Phase A, ~59 % en Phase C complète. Hook commercial : « ton bilan visibilité IA chaque lundi pour le prix d'un café ».
3. **Tarifs 49/149/399 conservés**. Agency retiré de `/pricing` public, remplacé par mailto. Reste dans enum DB pour les workspaces existants ou les contrats négociés.
4. **Cadence per-plan** : champ `cadence: "daily" | "weekly"` dans `quotasFor(plan)`. Le scheduler skip les workspaces en cadence weekly hors lundi UTC.
5. **UI billing dans `/app/settings`** (section dédiée) plutôt que page `/app/billing` séparée — cohérent avec le reste settings.
6. **Webhook handlers idempotents** via `subscription_events.stripeEventId UNIQUE` plutôt que table dédiée `stripe_webhooks` brute. 5 events traités : `checkout.session.completed`, `customer.subscription.{updated,deleted}`, `invoice.{paid,payment_failed}`.

**Justification** :

- Trial 7j sans carte n'est pas finançable sans capital. La garantie 14j refund a le même effet rassurant côté commercial mais sans coût LLM upfront (rare en early access que des refunds soient demandés massivement).
- Solo à 9,99 € comble le segment freelance ultra-budget (sub-Otterly) tout en gardant une marge brute saine grâce à la cadence hebdo. C'est aussi la première brique d'acquisition : « tester 1 mois pour 10 € puis upgrade Starter ».
- Le pivot trial est documenté dans CGU et FAQ pricing — pas de friction inattendue côté user.
- La règle d'idempotence via `stripeEventId UNIQUE` réutilise l'infrastructure existante (table `subscription_events` déjà en place), évite une nouvelle migration.

**Conséquences attendues** :

- Migration `0001_thick_husk` ajoute `"solo"` à `workspaces.plan` (constraint check). Aucune autre modif schéma.
- Page `/pricing` refondue : 3 cards Solo (9,99 €) / Starter (49 €) / Pro (149 €) + ligne « Plus de volume ? Contact ».
- Onboarding inchangé (workspace toujours créé en `trialing`, mais `quotasFor("trialing") = 0/0/weekly` → aucun run lancé tant que pas de subscription).
- `<UpgradeBanner>` server component dans `(with-nav)/layout.tsx` : message contextuel quand plan ∈ trialing/past_due/expired/canceled.
- Cron quotidien `/api/cron/expire-past-due` (03:00 UTC) bascule past_due → expired après 7 jours.
- 128 tests verts (+ 23 nouveaux : quotas avec cadence, products mapping, email templates welcome/payment-failed).
- Bouton « Plus de volume ? » dans pricing → leads agences/enterprise dirigés vers `hello@mamie-geo.fr`.
- Coût trial gaspillé : ~$0 (vs ~$3-30 par user trial 7j sans carte) — réinvestissable en acquisition.

**À revisiter** :

- **Trial 7j avec carte requise** (mode `trial_period_days` natif Stripe) à reconsidérer quand capital disponible et conversion rate de la garantie 14j stabilisé. Avec carte requise, conv ~50-70 % vs ~5-15 % sans carte.
- **Hard-cap enforcement worker** : PR suivante (~300 lignes). Sans hard-cap, le risque d'abus reste théorique avec 5 LLMs Phase C — à brancher avant marketing élargi.
- **Pricing Pro 149 €** : à reconsidérer quand bascule Sonnet 4.6 prête en prod. Marge LLM à 18 % aujourd'hui avec Haiku 5 LLMs → recalculer avec Sonnet (plus cher) et ajuster si nécessaire.
- **Lifetime discount early-access** (Stripe coupon code -30 % à vie pour les 50 premiers) : peut être ajouté à tout moment via dashboard Stripe + champ `discounts` dans la session checkout.

---

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

#### 2026-05-07 — Phasage moteur Haiku → design system → multi-LLM, suite mesure coût Sonnet 4.6

**Contexte** : PR 1 du Sprint 1 (LLMClient + provider Anthropic avec
`web_search_20250305`) a permis de mesurer un coût réel par run de
tracking. Cassette enregistrée contre l'API live :

| Métrique         | Mesuré (Sonnet 4.6)           | Estimé doc 03 (initial) |
| ---------------- | ----------------------------- | ----------------------- |
| Input tokens     | 21 925                        | 500-2000                |
| Output tokens    | 2 113 (capé par `max_tokens`) | 500-1500                |
| Web search calls | 1                             | 1-5                     |
| **Coût total**   | **~$0,107 / run**             | $0,005-0,02 / run       |

Cause : le tool serveur `web_search_20250305` injecte les résultats de
recherche (~5 ko / search, parfois plus) comme input tokens du modèle.
Anthropic facture donc l'input gonflé + l'appel search ($0,01) + l'output
final. Le ratio est largement défavorable sur Sonnet 4.6 ($3 / $15 par
Mtok) à un point qui plombe la marge Starter (49 €) si on tracke 5 LLMs
× 30 prompts × 30 jours.

Le doc 03 § 232 mentionne déjà `claude-haiku-4-5` pour le tracking
Anthropic ; c'est la cohérence qu'on doit conserver et respecter dans
le code (PR 1 avait pris Sonnet 4.6 par défaut, à corriger).

**Options considérées** :

- A : Garder Sonnet 4.6 partout, accepter une marge négative en V0
  pour avoir le LLM le plus représentatif de claude.ai
- B : Phaser l'exécution. Phase A développement et tests sur Haiku 4.5
  (cheap), Phase B UI / design system / SEO sur le même backend cheap,
  Phase C bascule vers Sonnet 4.6 et ajout des 4 autres providers
  quand l'expérience produit est figée
- C : Couper le `web_search` en V0 (réponses sans grounding) → coût
  quasi nul, mais "citations" hallucinées par le modèle, donc
  produit non représentatif et invalide pour mesurer ce que voit
  un utilisateur final

**Choix** : B — Phasage A → B → C.

**Justification** :

- **Coût dev divisé par ~5** sur Phase A (Haiku 4.5 = $1 / $5 par Mtok
  vs Sonnet $3 / $15). On va générer beaucoup de runs en debug et
  itération pendant Phase A et B, autant qu'ils coûtent 2-4¢ pièce.
- **L'interface `LLMClient` rend la bascule triviale** : un seul
  fichier `anthropic.ts` à toucher en Phase C pour passer Sonnet 4.6
  (ou feature-flag par plan : Starter sur Haiku, Pro/Agency sur Sonnet).
- **A est tué** par les marges (-300 €/compte Starter dans le pire cas).
- **C est tué** par la fidélité : sans `web_search`, le produit ne
  reflète plus ce que voit un utilisateur de claude.ai, donc invalide
  la promesse de valeur.
- Cohérent avec la séquence "1 LLM cheap pour valider, design avant
  de scaler" demandée par le founder (cf. CLAUDE.md § 9).

**Conséquences appliquées** :

- `src/lib/llm/anthropic.ts` : `DEFAULT_MODEL = "claude-haiku-4-5-20251001"`,
  `DEFAULT_MAX_TOKENS = 4096`, `DEFAULT_MAX_WEB_SEARCHES = 2`. Configurables
  via options du factory si on veut bumper ponctuellement.
- Cassette de test `real-fr-visibility.json` réenregistrée sur Haiku 4.5
  pour rester représentative de l'usage Phase A.
- `geo-project/03-architecture-technique.md` § 656 : note de bas de
  tableau ajoutant la mesure réelle Sonnet 4.6 + le cap pour la
  bascule Phase C.
- `geo-project/08-roadmap-execution.md` : note d'introduction sur le
  phasage A/B/C qui s'intercale dans Sprint 1.x sans changer la
  timeline mensuelle.
- `CLAUDE.md` § 2 + § 9 : modèle tracking V0 = Haiku 4.5 explicité,
  bascule Sonnet 4.6 pointée vers Phase C.

**À revisiter** :

- Fin Phase B (avant les premiers paying users) : refaire un smoke
  test sur 5-10 prompts variés en Haiku 4.5 pour calibrer un coût
  moyen réaliste, puis trancher la grille de bascule Phase C
  (Starter/Pro/Agency par plan, ou par feature flag par workspace).
- Si Anthropic introduit un mode `web_search` qui n'inclut pas tout
  le contenu en input (style "résumé seul"), basculer dessus.
- Si la marge Starter reste trop tendue malgré le bascule par plan,
  considérer le cache cross-clients (`prompt_cache` table déjà prête)
  pour les prompts génériques partagés entre workspaces.

---

#### 2026-05-07 — Pivot UI vers Airbnb-like minimaliste (supersede Direction A doc 10)

**Contexte** : PR 7 (design system éditorial chaud — crème + Newsreader serif + italique) déployée sur Vercel. Retour Max après visite preview : « ça va pas du tout, faut vraiment qu'on revoit le design ». Réorientation explicite vers un look Airbnb (`airbnb.com`) + DesignMe Agency (`https://www.designme.agency/`) avec contraintes :

- pas de fond coloré (donc adieu le crème `#FAF7F2`)
- une seule police, pas plusieurs (donc adieu Newsreader + Geist Mono, on garde Geist Sans seul)
- pas d'italique
- nuances de gris + accent ponctuel pour les CTA

**Options considérées** :

- A : garder Direction A doc 10 et patcher cosmétiquement → ne répond pas à la demande
- B : pivoter en blanc/gris + 1 police, accent terracotta gardé pour cohérence naming (Mamie = chaleur), zéro italique
- C : full noir & blanc, accent neutre → trop austère, perd le fil narratif "Mamie"

**Choix** : B.

**Justification** :

- Direction A "éditorial chaud" donnait un look magazine déjà-vu et chargé, peu adapté à un produit data-driven dont l'écran principal est un dashboard. Le serif Newsreader sur les chiffres impressionne 3 secondes mais alourdit la lecture quotidienne.
- Airbnb-like = standard moderne, lisible, focus sur la donnée. Plus facile à itérer (less is more).
- L'accent terracotta `#C5532E` est conservé pour les CTAs et liens. Ce fil rouge avec le naming "Mamie" reste sans envahir l'interface (jamais en fond, jamais en surface large).
- Geist Sans (déjà installée via le package `geist`) couvre tous les usages : titres en weight 600, body en 400, chiffres tabulaires via `font-variant-numeric: tabular-nums`. Pas besoin d'ajouter une mono.

**Conséquences appliquées** :

- `src/app/globals.css` : reset complet des tokens. Palette `gray-50 → gray-950` alignée Tailwind v4, alias sémantiques `--color-ink`, `--color-muted`, `--color-border`, etc. Suppression des couleurs cream/cream-dim/warm-gray/warm-gray-soft. `em, i, cite, address { font-style: normal }` neutralise les italiques au niveau global. Classes `.type-*` repensées en sans-serif uniquement.
- `src/app/layout.tsx` : retire `next/font/google` Newsreader et `geist/font/mono`. Seul `GeistSans` reste branché.
- `src/components/ui/` : Button gagne un variant `accent` (terracotta plein) en plus de `primary` (ink plein) ; Card en bordure gris-200 / radius `lg` / pas d'ombre ; Stat full sans-serif weight 600 ; Badge en fond `gray-100` neutre + variants light bg pour success/warning/error ; Input en focus ring gris (sobre).
- `src/app/login/page.tsx` : refait en typo unique, CTA `accent`, banners success/error avec fond très light.
- `src/app/(app)/app/dashboard/page.tsx` : header sans serif, stat values en sans-serif épais, tableau avec eyebrow petites caps en thead, hover row gris-50.
- `src/app/(marketing)/page.tsx` : home placeholder sans italique sur "ChatGPT", CTA `accent`.
- `src/app/(app)/layout.tsx` : fond passe de `bg-[color:var(--color-cream)]` à `bg-white`.
- `geo-project/10-design-direction.md` : nouveau § « Direction actée 2026-05-07 » en tête, qui supersede les Directions A/B/C explorées en archive plus bas.
- `CLAUDE.md` § 9 : décision "Direction artistique : A — éditorial chaud" remplacée par pointeur vers cette entrée + précision sur la police unique.

**À revisiter** :

- Avant la livraison Phase B PR 8 (vraie home + pricing) : refaire un retour visuel sur Vercel preview pour valider que le ton Airbnb tient sur des sections marketing plus longues (hero + sans/avec + how-it-works).
- Si on ressent un manque de chaleur dans le dashboard une fois 5 LLMs trackés : envisager un accent moutarde ponctuel sur les badges de meilleurs scores (sans inverser la règle "pas de fond coloré").
- Direction artistique = chose qui vit. Cette entrée n'est pas finale, juste la base pour Phase B. Tout retour user remontant que le rendu final n'est pas Airbnb-like déclenchera une nouvelle entrée 09 sans culpabilité.

---

#### 2026-05-11 — Refs visuelles ancrées sur designme.agency + taap.it (raffinement direction Airbnb-like)

**Contexte** : après le pivot du 2026-05-07 vers une direction Airbnb-like minimaliste, Max apporte deux screenshots PDF de sites qu'il aime visuellement : `https://www.designme.agency/` et `https://taap.it/fr/radar`. Demande : « inspire toi de la charte graphique des deux screens pour l'implementer au projet et mettre à jour les fichiers de charte graphique ».

**Analyse des refs** (extraite des 12 premières pages de chaque PDF) :

DNA commun aux deux sites :

- Fond blanc + sections alternées gris-50 pour rythme visuel (jamais de fond coloré)
- CTA principal = **bouton noir plein arrondi pill (`rounded-full`)** — pas terracotta. CTA secondaire = outline gris (`secondary` chez nous).
- Cards : fond blanc, bordure 1px gris-200, radius généreux (16-20px), pas d'ombre par défaut
- Titres sans-serif épais (weight 600-700), tracking serré (`-0.025em`)
- Body en gris muted (`gray-700`)
- Eyebrows uppercase 12-13px gris (`type-eyebrow`)
- Badges accent ponctuels colorés (vert pastel "Fonctionnalités" sur taap, rose pour les icônes services designme) — mais jamais en bouton CTA
- Touches humanisantes : icônes brand circulaires, illustrations subtiles
- Pas d'italique, une seule police

Différences entre les deux :

- designme.agency intègre des éléments « fancy » : frame monitor avec cross hairs, timecodes, badge vertical "Certified Partner" — accents décoratifs qui donnent du caractère sans bruiter.
- taap.it/fr/radar plus sage, plus produit. Cards features 2 colonnes avec screenshots dedans, speech bubbles dessinées au stylo pour humaniser.

**Décision** : raffiner le design system 2026-05-07 pour matcher ce DNA précis. Le pivot global reste valable (blanc, grays, 1 police, no italique) — c'est juste le styling fin qui s'aligne sur les refs.

**Conséquences appliquées** :

- `src/app/globals.css` : ajout d'un token `--radius-pill: 9999px` pour les boutons en full pill. `--radius-lg` passe à 16px (au lieu de 14px) pour matcher les cards taap.it.
- `src/components/ui/button.tsx` : tous les variants passent en `rounded-[var(--radius-pill)]`. Le variant `primary` (noir plein) devient celui par défaut des CTAs. Le variant `accent` (terracotta) est **conservé mais marqué comme rare** dans le commentaire de tête — gardé pour cas marginaux décoratifs, plus pour CTA principal.
- `src/components/ui/card.tsx` : radius passe de `lg` à `xl` (20px). Padding interne bumpé de `px-5 py-5` à `px-6 py-6`.
- `src/components/ui/section.tsx` (nouveau) : composant `<Section variant="default" | "tinted" pad="md|lg|xl">` qui pose la trame de sections alternées blanc/gris-50 avec padding standard. Évite de réécrire la même classe à chaque page.
- `src/app/login/page.tsx` : CTA `Recevoir le lien` passe de `accent` (terracotta) à `primary` (noir). Banners arrondies en `rounded-[var(--radius-lg)]`.
- `src/app/(app)/app/dashboard/trigger-form.tsx` : bouton "Lancer un run" passe de `accent` à `primary` (noir). Le terracotta reste juste dans le `Badge tone="accent"` du plan trialing — accent ponctuel, comme dans les refs.
- `src/app/(marketing)/page.tsx` : home placeholder enrichi avec un vrai header (logo + nav + 2 CTAs), hero centré avec Badge "Beta · GEO" + display title + 2 CTAs (noir pill + outline pill), première vraie section "Comment ça marche" sur fond gris-50 avec 3 cards eyebrow + h3 + body, footer minimaliste. Préfigure le travail de PR 8 (vraie home).

**À revisiter** :

- PR 8 (vraie home) : compléter avec « Sans Mamie GEO / Avec Mamie GEO », témoignages, founder visible, FAQ. Reproduire le pattern designme.agency : showcase de screenshots dashboard dans des « monitor frames » avec cross hairs en coin.
- Si on veut ajouter un peu plus de personnalité comme designme/taap : envisager des touches décoratives (speech bubbles dessinées sur la home, badge vertical "Certified Partner" → "Bootstrap français"), à valider avec Max avant.

**Update 2026-05-11 (même jour) — fix polices + cascade CSS** :

Retour Max sur le rendu preview après PR 7ter : le titre de la home s'affichait en **serif Times-like** et les CTAs noirs avaient un texte « Se connecter → » en **orange souligné** à l'intérieur. Bugs identifiés :

1. **Bug police** : le package `geist` v1.7 expose la variable CSS `--font-geist-sans`, mais `src/app/globals.css` référençait `var(--font-geist)` (variable inexistante). Résultat : chaîne de fallback `ui-sans-serif, system-ui, ...` qui résolvait en serif par défaut du browser sur Vercel preview.
2. **Bug cascade** : les règles globales `a { color: var(--color-accent); text-decoration: underline }` étaient écrites au top-level du CSS — donc plus prioritaires que les utilities Tailwind `text-white` / `no-underline` appliquées sur les `LinkButton`. Tous les `<a>` héritaient du orange souligné, même à l'intérieur des boutons noirs.

Fixes appliqués :

- **Police** : passage de Geist Sans à **Inter** via `next/font/google` (Max demandait « un Google Font classique sans serif » — Inter est la plus utilisée sur les SaaS modernes). Variable CSS `--font-inter` correctement référencée dans `--font-sans`. Weights 400/500/600/700 chargés. Le package `geist` est retiré des dépendances.
- **Cascade** : toutes les règles globales (`html`, `body`, `em/i/cite`, `h1-h4`, `a`) sont maintenant wrappées dans `@layer base { ... }`. Tailwind v4 cascade priorise les utilities sur la base layer → un `LinkButton` avec `text-white no-underline` gagne contre tout default `<a>` style.
- **Liens** : la règle globale `a { color: accent; underline }` est supprimée. Le default `<a>` est désormais `color: inherit; text-decoration: none`. Pour les liens INLINE dans du corps de texte qu'on veut visibles (ex : « GitHub » en footer), on applique explicitement la classe utilitaire `.link` (souligné gris foncé, hover terracotta) — pas de comportement global qui fuite dans les boutons.

**Conséquences sur la doc 10** : remplacer toute mention de Geist Sans par Inter. Mention "police installée via package `geist`" supprimée — Inter passe par `next/font/google` natif.

**Update 2026-05-11 (3e itération du jour) — enrichissement DA suite à 4 screens Mobbin/Dribbble** :

Max remonte que le rendu actuel est « trop plat » et envoie 4 screens d'inspiration : card Active Node avec status dot glow + cross-hairs marks, gallery de pills colorés pastel avec icônes, cards dashboard avec dataviz, tooltip dark mode. Demande de « décrire précisément et intégrer à la charte pour uniformiser et donner plus de personnalité, toujours clean sans extravagance ».

Lecture des screens :

- **Cross-hairs marks** (+ stylisés en gris ultra-light aux coins) : signature « print éditorial » que designme.agency utilise aussi. Cassent la planéité sans bruiter.
- **Pills colorés pastel** (bleu/orange/vert/violet/rose) avec icône matching à gauche : permettent de catégoriser visuellement (LLMs, types) sans casser le minimalisme blanc.
- **Status dots avec glow doux** : signal "live/offline" qui donne de la profondeur sans ombres lourdes.
- **Mix-weight typo** (Active = 700, Node = 400) : joue la hiérarchie sans changer de couleur.

Ajouts au design system :

- `src/app/globals.css` : 12 tokens couleur pastel (`--color-blue`, `--color-blue-bg`, etc. × 6 teintes). 4 tokens glow (`--glow-red/green/orange/blue`).
- `src/components/ui/badge.tsx` : 6 nouveaux tones (`blue/green/orange/purple/pink/yellow`) avec fond pastel + texte saturé. Prop `icon` slot pour Lucide à gauche du label.
- `src/components/ui/status-dot.tsx` (NOUVEAU) : `<StatusDot tone="success" pulse />` — cercle 8px coloré avec halo léger, optionnellement pulsé.
- `src/components/ui/corner-frame.tsx` (NOUVEAU) : `<CornerFrame>` — wrapper qui pose 4 cross-hairs gris-300 aux coins de son enfant. Signature à utiliser sobrement (1-2 occurrences par page).
- `package.json` : ajout `lucide-react` (icônes sans-serif légères, tree-shake natif).

Application sur la home (placeholder enrichi, pas la vraie home — celle-ci arrive en PR 8) :

- Hero wrappé dans `<CornerFrame>` (signature print subtile)
- Badge "Beta · Generative Engine Optimization" avec `StatusDot tone="accent" pulse` (signal "live")
- Mix-weight sur le headline : « Sache enfin si **ChatGPT** parle de toi. »
- Nouvelle section gris-50 « Les 5 IA qui répondent aux questions de tes futurs clients » avec 5 badges colorés pastel + icônes Lucide (ChatGPT green/MessageCircle, Claude purple/Bot, Perplexity blue/Search, Gemini orange/Sparkles, Le Chat pink/Cat) — c'est le « money shot » qui montre la signature visuelle pastel.
- Section "Comment ça marche" : "Étape 01/02/03" remplacés par 3 Badge colorés (blue/orange/green) — pose la rythmique multi-couleurs sans casser le minimalisme.

Règle de discipline : utiliser ces patterns **sobrement**. Une page peut avoir 1 `CornerFrame`, 1-2 `StatusDot`, et 5-7 badges colorés max. Au-delà = bruit, on retombe dans l'extravagance.

**À revisiter** :

- PR 8 (vraie home) : décliner ces patterns sur les sections « Sans / Avec » (badges status), « Comment ça marche » (steps colorées déjà posées), « Témoignages » (avatars + pills clients), FAQ, footer enrichi.
- PR 9+ (dashboard polish) : appliquer `CornerFrame` sur la card hero du dashboard, `StatusDot` sur les runs en cours, badges colorés sur les LLMs dans la table des runs.

---

#### 2026-05-12 — Bilan Phase A + B livrées + bascule Brevo SMTP → REST API (PR 18bis)

**Contexte** : 8 jours après le démarrage Sprint 1, Max a accès au dashboard en prod sur Vercel après résolution finale du blocage login (magic-link via Brevo). Le pipeline produit (Phase A) et la couche UI (Phase B) sont livrés et fonctionnels. Une seule issue ouverte côté Phase A : les runs restent en `pending` après trigger en prod — probable problème de cron Vercel à investiguer (CRON_SECRET pas posé ? `vercel.json` mal lu ?).

**Bascule Brevo SMTP → REST API** :

L'envoi du magic-link de login a planté pendant 3 sessions de debug consécutives avec une cascade d'erreurs Brevo :

1. `535 5.7.8 Authentication failed` → cause 1 : `BREVO_SMTP_USER` était l'email de compte Brevo (`maxencecailleau.pro@gmail.com`) alors que Brevo attend l'identifiant SMTP généré sous la forme `xxxxxxx@smtp-brevo.com` (visible dans le dashboard Brevo sous le label « Connexion » à côté du serveur SMTP). Doc et `.env.example` mis à jour pour prévenir ce piège.
2. `525 5.7.1 Unauthorized IP address` → cause 2 : le plan Brevo Free impose une IP whitelist SMTP qu'on ne peut pas désactiver. En local on peut whitelister l'IP de la machine, mais Vercel utilise des IPs serverless dynamiques non-whitelistables stablement.

**Décision** : bascule du backend Brevo de SMTP vers **REST API** (`https://api.brevo.com/v3/smtp/email`). L'API REST n'est pas soumise à l'IP whitelist du plan Free — elle s'authentifie via une clé API HTTP `xkeysib-...` (différente de la clé SMTP `xsmtpsib-...`).

Implémentation : `src/lib/email.ts` supporte désormais les **2 backends en parallèle**, sélection automatique via `pickBackend()` :

- Si `BREVO_API_KEY` défini → REST API (prioritaire)
- Sinon → SMTP nodemailer (fallback legacy)

Avantages :

- En prod Vercel : REST API marche sans whitelist IP
- En local : SMTP peut continuer à marcher si l'IP locale est whitelistée (utile pour debug avec `pnpm test:smtp` en mode verbose)
- Compat retro : aucune migration imposée aux dev qui ont déjà leur config SMTP

3 nouvelles vars d'env optionnelles : `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME`. Les anciennes `BREVO_SMTP_*` deviennent optional (fallback). `.env.example` documenté avec les 2 modes.

**Bilan Phase A** : moteur complet sur Haiku 4.5 livré (PR 1 à 5). Le pipeline `schedule-runs → execute_prompt → score_response → recompute_metrics → dashboard` tourne en local et sur Vercel. Coûts mesurés sur seed dev : ~$0,04 par run de tracking + ~$0,003 par scoring Haiku.

**Bilan Phase B** : design system custom (Tailwind v4 + composants ui/), 9 routes publiques + 5 routes app, blog MDX (3 articles), lead magnet capture, onboarding wizard 3 étapes avec suggestion de prompts via Haiku (PR 13), page settings (PR 16), pages légales V0 placeholder (PR 17). Direction artistique Airbnb-like minimaliste actée le 2026-05-07 et raffinée par dégradés warm + bento cards + hover gradients le 2026-05-11.

**À revisiter** :

- Issue connue Phase A : cron en prod ne traite pas les jobs (runs `pending`). À investiguer en priorité — sans cron qui tourne, le bouton « Lancer un run » crée des jobs mais aucun n'est exécuté.
- DNS Brevo : finaliser DKIM/SPF/DMARC sur `mamie-geo.fr` pour avoir un sender `hello@mamie-geo.fr` validé. En attendant, un sender perso validé suffit.
- Pages légales : valider avec juriste avant lancement public payant (1500 € budgété dans doc 08).
- Le `nodemailer` reste dans les deps tant que `pnpm test:smtp` est utile pour debugger SMTP (le script construit son propre transporter local en mode verbose). À retirer quand on aura assez de recul sur la REST API.

---

#### 2026-05-12 — Foundation design post-connexion : sidebar app + 11 primitifs Radix + 2 wrappers Recharts

**Contexte** :

L'app authentifiée n'avait que 2 liens de nav (Dashboard / Réglages) dans un `<AppHeader>` minimaliste — insuffisant pour scale aux 5+ sections nécessaires (Dashboard, Prompts, Concurrents, Runs, Réglages, Billing). Côté primitifs UI, les composants critiques pour les pages CRUD à venir (Prompts, Concurrents, Settings étendu) manquaient : Dialog, DropdownMenu, Tabs, Switch, Tooltip, Toast, Skeleton, Banner, EmptyState, Pagination, Sheet (drawer mobile). Côté charts, l'évolution 30j et le score par LLM mentionnés dans doc 02 n'étaient pas implémentés. Cette PR pose la **foundation** avant les pages CRUD elles-mêmes.

**Options considérées** :

| Sujet             | Option A (retenue)                              | Option B                               | Option C                                   |
| ----------------- | ----------------------------------------------- | -------------------------------------- | ------------------------------------------ |
| Nav app           | Sidebar verticale gauche fixed (w-60)           | Top nav étendu + brand switcher        | Hybride top global + sub-nav contextuel    |
| Charts            | Tremor → bascule Recharts pur                   | Tremor Raw (TW v4 ready)               | Custom SVG + Recharts au besoin            |
| Primitifs UI      | shadcn/ui sur Radix (copy-paste manuel restylé) | Radix nu + wrappers maison             | Custom from-scratch comme `Button`, `Card` |
| Exclusion sidebar | Route group `(with-nav)` Next 15                | `useSelectedLayoutSegment` côté client | Wrapper `<WithSidebar>` opt-in par page    |
| Toasts            | `sonner`                                        | Notistack / custom                     | —                                          |

**Choix** :

1. **Sidebar verticale gauche** (w-60, collapsible mobile via `<Sheet>` drawer). Pattern SaaS data-driven standard, scale propre à 6+ sections.
2. **Recharts pur** (pas Tremor). Tremor v3 est lié à Tailwind v3, et Tremor Raw n'a pas été testé en TW v4 avec nos tokens custom — des wrappers Recharts minces suffisent et donnent un contrôle total.
3. **shadcn/ui sur Radix** : copie manuelle des fichiers (pas de `shadcn init` car notre design system custom existe déjà), restylé avec nos tokens (`--color-ink`, `--radius-xl`, etc.). Accessibilité Radix gratuite (focus trap, ARIA, keyboard nav, ESC, click-outside).
4. **Route group `(with-nav)`** : `/app/dashboard`, `/app/runs/[id]`, `/app/settings` déplacés sous `src/app/(app)/app/(with-nav)/`. `/app/onboarding` reste en dehors → full-screen wizard sans sidebar. Les URLs restent identiques (les groupes `()` n'affectent pas le routing).
5. **sonner** pour les toasts (recommandé shadcn, API simple, déjà customisable via classNames).

**Justification** :

- Sidebar : permet de poser une nav stable avant que les pages CRUD à venir ne forcent une refonte de la nav en plein milieu. Le brand switcher (DropdownMenu) est en place dès maintenant — utile dès que les comptes Pro/Agence ajouteront 3-10 brands.
- Recharts vs Tremor : décision tactique pendant l'exécution. Tremor v3 incompatible TW v4. Tremor Raw nécessitait du copy-paste lourd avec risque d'incompat sur les styles. Recharts est solide, sa surface API petite suffit ici (LineChart + BarChart horizontal), et il est de toute façon une transitive dep de Tremor — autant l'utiliser directement.
- shadcn/Radix vs custom : les primitifs `Dialog`, `DropdownMenu` etc. ont une surface d'a11y non triviale (focus trap, ARIA, keyboard nav). Réécrire ça maison aurait été 2-3× plus de code pour un résultat moins solide. shadcn fournit la base, on customise les classes via nos tokens.
- Route group : pattern Next 15 officiel pour faire varier le layout sans changer les URLs. Plus propre que `useSelectedLayoutSegment` (qui forcerait un client wrapper) ou un wrapper opt-in par page (boilerplate).

**Dépendances ajoutées** :

`@radix-ui/react-dialog ^1.1.15`, `@radix-ui/react-dropdown-menu ^2.1.16`, `@radix-ui/react-tabs ^1.1.13`, `@radix-ui/react-switch ^1.2.6`, `@radix-ui/react-tooltip ^1.2.8`, `@radix-ui/react-slot ^1.2.4`, `sonner ^2.0.7`, `recharts ^3.8.1`, `class-variance-authority ^0.7.1`, `clsx ^2.1.1`, `tailwind-merge ^3.6.0`.

**Conséquences attendues** :

- 11 primitifs UI disponibles dans `@/components/ui` (Dialog, Sheet, DropdownMenu, Tabs, Switch, Tooltip, Skeleton, Banner, EmptyState, Pagination, Toaster). 2 wrappers chart dans `@/components/charts` (LineChart, BarChartHorizontal). 1 helper `cn()` dans `@/lib/utils`.
- 4 pages existantes rafraîchies : dashboard (charts évolution 30j + score par LLM en barres + empty states), onboarding wizard (progress bar 3 segments), run detail (tabs Réponse / Citations / Scoring), settings (sections cards).
- `triggerRunNow` server action côté dashboard : confirmation via `<Dialog>` + feedback via `<toast>` (au lieu d'un texte inline).
- Animations CSS ajoutées à `globals.css` (`@keyframes fade-in`, `fade-out`, `zoom-in`, `zoom-out`, `slide-in-left`, `slide-out-left`, `skeleton-pulse`) + tokens `--animate-*` consommables via classes `animate-fade-in` etc.
- Helper data `loadSidebarData()` mémoïsé via `React.cache()` — pas de duplication query workspace/brands entre layout et page.
- Nouvelle query `getVisibilityTrend(brandId, days=30)` dans `src/lib/dashboard/queries.ts` (agrégation `citation_metrics_daily` pivotée par LLM).

**Périmètre exclu** (PRs suivantes — explicitement pas dans cette PR) :

- `/app/prompts` (liste + CRUD) et `/app/prompts/[id]` (détail breakdown par LLM)
- `/app/competitors` (gestion post-onboarding)
- Settings étendu : sections Équipe (invitations Pro+), Billing (Customer Portal Stripe), Audit logs
- États spéciaux : trial countdown banner, quota warnings 60 %/100 %, hard-cap 200 % block screen
- Page `/app/admin` (MRR, runs/jour, coûts LLM)
- E2E Playwright des 7 flows critiques (s'écriront quand les pages CRUD existent)
- Tests unit React des primitifs Radix-wrappers (nécessiterait `@testing-library/react` + jsdom — coverage déléguée au E2E manuel en attendant)

**À revisiter** :

- Si le scaling de la nav atteint 8+ sections, envisager des "groups" ou une sidebar collapsible en mode rail. Pas avant.
- Si Tailwind v4 ou un futur add-on sort une animation lib first-class, retirer les `@keyframes` custom de `globals.css`.
- BrandSwitcher V0 montre les brands mais ne permet pas encore de switcher la brand active (URL/cookie). À traiter quand le multi-brand est livré (Pro plan).
- Le wrapper `Pagination` est en mode prev/next simple. Si on ajoute > 100 prompts par workspace il faudra des numbers + ellipsis.

---

#### 2026-05-12 — Polish dashboard : Stats enrichies, SegmentedControl, AreaChart à gradient, BreakdownBars

**Contexte** :

Après la PR « foundation design post-connexion » (sidebar + primitifs Radix + charts de base), Max a partagé 3 screens de dashboards SaaS contemporains comme références visuelles pour aller plus loin. Le dashboard Mamie GEO restait fonctionnellement correct mais visuellement basique — il manquait les codes contemporains : delta arrow visible sur chaque stat, time-range picker au-dessus des charts, pattern « breakdown » (bars + légende + liste) pour les répartitions catégorielles, area chart à gradient. En parallèle, Max a relevé une redite : le nom « Mamie GEO » apparaissait deux fois côté sidebar (top desktop + centre du header mobile) alors que l'utilisateur connecté sait déjà où il est.

**Patterns ajoutés** (cf. doc 10 § « Patterns dashboard ») :

1. **`Stat` enrichie** : 8 `iconTone` pastel (blue/green/orange/purple/pink/yellow/accent/neutral), cercle 32 px à droite avec icône Lucide centrée. Prop `delta?: { value, period }` qui affiche `TrendingUp`/`Down` Lucide + pourcentage signé coloré + libellé SMALL CAPS muted.
2. **`SegmentedControl`** : pill group horizontal, container `gray-100` + items radius `pill`, actif = fond blanc + shadow-sm. API contrôlée générique (`value`/`onValueChange`/`options`).
3. **`AreaChart`** : Recharts `AreaChart` mono-série avec `linearGradient` (top 0.25 → bottom 0), axe Y droite, `ReferenceLine` dashée optionnelle (couleur accent terracotta).
4. **`BreakdownBars`** : rangée de bars verticales colorées + légende dots inline + liste « dot + label · valeur tabulée à droite ». Modes `absolute` ou `share`.

**Appliqués sur le dashboard** :

- 4 stats du haut → `iconTone` choisi sémantiquement (Flame orange pour score visibilité, Activity green pour citations, Users purple pour concurrents, DollarSign blue pour coût). Delta `vs J-7` calculé côté serveur via le nouveau helper `computeDelta()` à partir du `getVisibilityTrend(90)`.
- Section « Évolution de visibilité » → nouveau composant client `<TrendSection>` qui wrap le `LineChart` existant avec un `SegmentedControl` (7 j / 30 j / 90 j). Le filtrage range est client-side : on charge 90 jours côté serveur, le composant slice côté client → switch instantané sans re-fetch.
- Section « Score par LLM aujourd'hui » → remplacée par `<BreakdownBars>` avec 5 segments (un par LLM, couleur LLM_COLORS, valeur = visibilityScore du jour, suffix `" / 100"`).
- Section « Top concurrents cités » → retirée du dashboard (info déjà portée par la stat « Top concurrent » du haut). Réduit la verticalité, allège la page.

**Mentions de marque réduites** :

- Sidebar desktop top : le titre n'est plus « Mamie GEO » + workspace name en sous-titre, mais directement **le nom du workspace** comme titre primaire. Le brand switcher juste dessous précise la marque trackée.
- Header mobile : retrait du « Mamie GEO » centré. On garde juste le hamburger à gauche et le nom du workspace à côté.
- Pages marketing/blog/login : aucun changement (utilisateur non identifié, contexte différent).
- Placeholder onboarding `placeholder="Mamie GEO"` dans le formulaire de création de brand : conservé (c'est une démo d'exemple, pas une affirmation de marque).

**Justification** :

- Les screens partagés (Lead Source Breakdown + quad stats avec icons + area chart à gradient) sont des standards SaaS modernes. Les copier exactement aurait été coûteux et hors charte ; les **adapter au design system Airbnb-like** existant (tokens custom, palette pastel déjà en place) est cohérent et rapide.
- Le pattern « breakdown bars + légende + liste » est plus lisible que le `BarChartHorizontal` Recharts initial pour une répartition à 5 segments — il combine visualisation et lecture exacte des valeurs dans le même bloc. Le `BarChartHorizontal` reste exporté pour des cas futurs (>5 segments, comparatif large).
- Réduire les répétitions « Mamie GEO » dans le chrome de l'app est de l'hygiène UX. L'utilisateur connecté est dans le produit — affirmer le nom à chaque écran tient du brand fatigue.

**Conséquences attendues** :

- API `Stat` enrichie est rétro-compatible (`icon`, `iconTone`, `delta` sont tous optionnels — l'appel `<Stat label value />` continue de marcher).
- `computeDelta(current, previous)` exposé depuis `@/lib/dashboard/queries` — utilisable par d'autres pages (`/app/competitors` à venir notamment).
- Nouveau wrapper client `TrendSection` à côté de `page.tsx` — pattern à reproduire pour les autres charts qui auront besoin d'un time-range picker.
- Le dashboard reste pleinement fonctionnel quand l'historique est vide (EmptyState par section, deltas qui retombent sur `hint`).

**Périmètre exclu** (PRs suivantes) :

- Le `BarChartHorizontal` reste dans le repo (utilisable ailleurs) mais n'est plus dans le dashboard.
- Le pattern toolbar « Import/Export + Create New » du screen 1 n'est pas ajouté : pas de feature CRUD encore (Prompts et Competitors arrivent en PR suivante avec leur propre toolbar).
- L'`AreaChart` est livré dans la lib mais n'est pas encore utilisé dans le dashboard — il servira pour les métriques single-series (coût cumulé, volumétrie de runs) en PRs futures.

**À revisiter** :

- Le delta « vs J-7 » est codé en dur. Quand on aura plusieurs périodes pertinentes (J-7, J-30, mois calendaire), le rendre paramétrable via le futur `SegmentedControl` global du dashboard.
- Couleurs LLM dans `BreakdownBars` : aujourd'hui le mapping vient de `LLM_COLORS` côté charts. Quand on aura un Brand multi-LLM, vérifier que l'ordre stable (chatgpt/claude/perplexity/gemini/lechat) est cohérent partout (sidebar, charts, listes, badges).

---

#### 2026-05-13 — Cron prod stuck résolu (cause racine Vercel Cron GET vs POST) + worker `send_weekly_email` (weekly recap)

**Contexte** :

Deux chantiers liés. (1) Les runs restaient en `pending` côté prod alors que tout marchait en local — blocker critique sans lequel rien ne tournait pour la beta. (2) Le worker `send_weekly_email` était un stub qui throwait `not yet implemented (Phase A)` — bloquait la boucle d'engagement utilisateur.

**Cause racine du cron prod stuck** :

À la lecture du code des endpoints `/api/cron/dispatch` et `/api/cron/schedule-runs`, l'erreur saute aux yeux : **les routes n'exposent que `POST`**, mais **Vercel Cron envoie uniquement des `GET`** (avec header `Authorization: Bearer ${CRON_SECRET}` automatiquement injecté). Conséquence : Vercel pingait les endpoints, qui répondaient `{ ok: true }` via le handler `GET` (sans rien exécuter), et le dispatcher ne tournait jamais.

Diagnostic confirmé sans avoir besoin des logs Vercel (la cause est évidente à lecture du code une fois la convention Vercel Cron rappelée).

**Options considérées** :

- **A : Faire pointer GET et POST sur le même handler** (retenue). Simple, rétro-compatible avec les tests manuels `curl -X POST`, et match la convention Vercel.
- B : Refactor pour n'exposer que GET (cassait les tests manuels existants côté `/api/runs/trigger`-style).
- C : Wrapper l'endpoint avec un middleware qui transforme GET → POST. Trop d'abstraction pour un problème de 2 lignes.

**Choix** : option A. `export const GET = handler; export const POST = handler;` (en pratique : `export async function GET(req) { return handle(req); }` + idem POST). Tous les 3 endpoints cron (`dispatch`, `schedule-runs`, `schedule-weekly-emails`) suivent ce pattern.

**Instrumentation ajoutée** :

- Helper `logCronEvent()` dans `src/lib/cron-logger.ts` : émet `console.log(JSON.stringify({...}))` ligne-par-ligne. Vercel parse les JSON logs nativement → events filtrables dans le dashboard sans regex (`event:"job_succeeded"`, etc.).
- Endpoint debug `GET /api/cron/dispatch?inspect=1` (auth requise) : retourne JSON avec `countsByStatus` (pending/claimed/done/failed/dead), 10 derniers jobs, présence (booléen seul, jamais la valeur) des env vars critiques (`CRON_SECRET`, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `BREVO_API_KEY`, `NEXT_PUBLIC_APP_URL`), server time UTC. Permet de diagnostiquer un futur blocker sans déployer du code.

**Worker `send_weekly_email` — scope V0 « weekly recap uniquement »** :

Cf. arbitrage 2026-05-12 (avant la session) : on couvre uniquement le récap hebdo, pas la nurture trial (J+3 / J+10). Justification : la nurture trial nécessite de connaître le state Stripe (`trialEndsAt`, `currentPeriodStart`) qui sera fiabilisé dans la PR « Stripe checkout + webhooks ». Lier les deux maintenant aurait introduit du code à re-aligner.

**Flow du worker** :

1. Charge workspace + brand principale (V0 = 1 brand par workspace).
2. Compte `runs.success` des 7 derniers jours. Si 0 → log `email_skipped_no_data` et return early (pas d'email vide envoyé).
3. Agrège `citation_metrics_daily` sur 7 j (cette semaine) et 7 j antérieurs (semaine précédente) pour calculer les deltas par moyenne.
4. Charge top 3 concurrents cités cette semaine via `competitorsData` JSONB.
5. Charge les membres du workspace (V0 = owner uniquement, prêt pour invitations Pro+).
6. Render le template via `renderWeeklyRecap()` (HTML inline + text fallback).
7. Envoie via `sendWeeklyRecapEmail()` qui passe par le `sendTransactional()` générique (Brevo REST API prioritaire, SMTP fallback).
8. Log `events.kind = "email_sent"` par destinataire avec `messageId`.

**Template** :

Structure HTML inline (table-based pour compat Gmail/Outlook), CSS dans `<style>` + `style="..."` attributes pour les éléments dynamiques. 4 stats en grille 2×2 (label, valeur, delta avec flèche colorée), bloc top 3 concurrents, CTA pill noir « Voir le dashboard complet », footer avec rappel d'inscription + lien vers `/app/settings`. Échappement HTML sur tous les champs dynamiques (test inclus pour XSS sur `workspaceName`).

**Idempotence** :

`idempotency_key = send_weekly_email:{workspaceId}:{isoWeek}` (déjà défini dans `src/lib/queue/types.ts`). Format ISO 8601 semaine `YYYY-Www` via le helper `isoWeekFromDate()` (algo standard jeudi de la semaine ISO). Si le cron `schedule-weekly-emails` est rejoué dans la même semaine ISO → re-enqueue no-op.

**Conséquences attendues** :

- Tous les workers en pending côté prod vont commencer à être traités au prochain tick de cron (toutes les 5 min). Premier email weekly recap envoyé le lundi suivant le merge pour le workspace de test (Max).
- Le pattern logs JSON + endpoint inspect est désormais le standard pour les futurs crons (`schedule-weekly-emails` l'applique d'emblée).
- Nouveau helper `sendTransactional()` dans `src/lib/email.ts` factorise le switch REST/SMTP — utilisé par `sendWeeklyRecapEmail()`, utilisable par les futurs templates (nurture, audit-ready alert, etc.) sans re-dupliquer le boilerplate.
- 19 nouveaux tests unit (10 payload parser + 9 template render) — couvre les briques pures. Les tests d'intégration full DB du worker viendront avec le setup branche-Neon-par-PR mentionné dans CLAUDE.md.

**Fichiers ajoutés** :

- `src/lib/cron-logger.ts`
- `src/lib/email/templates/weekly-recap.ts` (+ `.test.ts`)
- `src/workers/send-weekly-email.ts` + `send-weekly-email-payload.ts` (+ `.test.ts`)
- `src/app/api/cron/schedule-weekly-emails/route.ts`

**Fichiers modifiés** :

- `src/app/api/cron/dispatch/route.ts` (GET handler + JSON logs + inspect mode + case `send_weekly_email`)
- `src/app/api/cron/schedule-runs/route.ts` (GET handler + JSON logs)
- `src/lib/email.ts` (ajout `sendTransactional()` + `sendWeeklyRecapEmail()`)
- `vercel.json` (ajout du cron `0 9 * * 1` pour `schedule-weekly-emails`)

**À revisiter** :

- Si le pattern `events` table de logs (kind `email_sent`, `email_skipped_no_data`, etc.) devient riche, considérer un index supplémentaire sur `(kind, createdAt)` ou une vue matérialisée pour les requêtes BI internes.
- Le worker envoie 1 email par membre du workspace. En V1 multi-membre (Pro = 10 users), considérer un bouton de désinscription par membre (UNSUBSCRIBE_TOKEN) plutôt qu'un opt-out workspace global.
- Aujourd'hui le worker fait 4 queries SQL (workspace, brand, métriques this+last, top concurrents). Si on a beaucoup de workspaces actifs, profiler et envisager un CTE unique.
- Le helper `isoWeekFromDate()` est dupliqué côté worker (peut-être déplaçable dans `src/lib/dates.ts` si on en a besoin ailleurs).

---

#### 2026-05-13 — Refresh home inspiré Semrush AI SEO (data + features nommées + glossaire vocabulaire)

**Contexte** :

Analyse comparative de `https://www.semrush.com/ai-seo/overview/` (référence du marché) vs notre home Mamie GEO. 4 gaps identifiés : (1) aucun chiffre marketing chez nous vs 10+ stats chez Semrush, (2) features non nommées (« tracking » générique) vs 12 produits Semrush distincts, (3) vocabulaire métrique flou vs 3 termes Semrush ownés (« AI Visibility Score », « Share of Voice », « Sentiment »), (4) pas de narrative « why now » vs Semrush qui ouvre sur l'urgence. À l'opposé, on identifie 8 forces à PROTÉGER que Semrush ne peut pas copier : tonalité tu/direct, honnêteté « n'est pas… », Le Chat inclus, EU/RGPD, pricing transparent + trial sans CB, personas humains, lead magnet.

Cette PR refresh la home avec **2 sections nouvelles** (« Pourquoi maintenant ? » avec 4 stats, « Tes outils » avec 5 features nommées) + retouche le hero (chiffre-marteau en ouverture du sous-titre) + cale le vocabulaire métrique dans la doc 02 (glossaire officiel) + snapshot Semrush daté dans la doc 01.

**Options considérées** :

- **A : Refresh ciblé** (retenue). 2 sections nouvelles + hero retouché + glossaire + snapshot. Scope ~415 lignes, faisable en une PR.
- B : Refresh minimal. Juste un chiffre dans le hero + glossaire. ~150 lignes mais ne ferme aucun gap structurel.
- C : Refonte complète. Tout A + page `/comparatif` dédiée + roadmap V1 enrichie (Prompt Research DB, AI-Readiness audit…). ~1200+ lignes, plusieurs PR, sortie de scope « inspiré » → « copié ».

**Choix** : A (refresh ciblé). Justification : pose les fondations (vocabulaire, data, features nommées) sans surcharger le scope. Le reste suit en PRs futures si la traction confirme l'intérêt.

**Sourcing des chiffres** :

Choix : **mix externe + 1 stat FR**. Les 3 stats externes (×6 trafic AI 2025, ×4,4 conversion, 60 % zero-click) viennent de Semrush blog / SparkToro — publics et réutilisables. La 4ᵉ « stat » FR est un fait verifiable (« 5 plateformes IA majeures dont Le Chat de Mistral ») qui sert aussi de pont vers la section LLMBadges qui suit immédiatement.

**Règle de vérité** posée : **aucun chiffre inventé**. Pour chaque stat, la source est cliquable (lien externe ou ancre interne vers `/blog/etat-visibilite-ia-france-2026`). Si une source est retirée du web, on remplace le chiffre, on ne maintient pas un sourcing mort.

**Décisions copy/UX en regard** :

- **Tutoiement tu/te/ta** : strictement conservé dans les nouvelles sections (« Pourquoi tu dois t'y mettre maintenant »). Différenciateur fort vs Semrush impersonnel.
- **5 features, pas 12** : V0 honnête. On ne crée pas de feature fictive. Les 5 sont : Score de visibilité IA / Part de voix / Sentiment / Comparatif concurrents / Rapport hebdo — toutes déjà ou bientôt implémentées (Rapport hebdo livré 2026-05-13).
- **Vocabulaire français** : « Part de voix » au lieu de « Share of Voice ». Sentiment garde son nom (le mot est suffisamment courant en FR). Glossaire officiel dans doc 02 § « Glossaire vocabulaire ».
- **Pas de demo path** : on n'ajoute PAS « Demander une démo » côté CTA. Notre funnel transparent (trial 14j sans CB + pricing public) reste un différenciateur — un demo gate serait régression UX.
- **Pas de social proof artificielle** : on n'invente pas de « Mamie GEO Awards » ou de logos clients pour faire genre. On attend les vrais beta testers signés.

**Conséquences attendues** :

- Crédibilité home augmentée (4 chiffres massue + 5 features nommées vs précédent « tracking » générique).
- Vocabulaire métrique aligné entre produit, marketing et doc commerciale — facilite onboarding nouveaux relecteurs / contractuels.
- Snapshot Semrush daté dans doc 01 → veille structurée, repère pour les prochaines comparaisons.
- Pas d'impact backend / API / DB — purement marketing + doc.

**Hors scope explicite** :

- ❌ Page `/comparatif` dédiée (différée — pourrait être une PR follow-up si la traction le justifie)
- ❌ Live demo path (anti-décision documentée)
- ❌ Implémentation des features Semrush absentes chez nous (Prompt Research DB 261M, AI-Readiness audit, AI traffic dashboard) — restent en V1/V2 dans roadmap doc 02 § V3 et au-delà éventuellement
- ❌ Refactor des sections home existantes (`<SansAvec>`, `<HowItWorks>`, `<PourQui>`, `<NEstPas>`, `<FAQ>`) — elles fonctionnent

**Fichiers ajoutés** :

- `src/app/(marketing)/_sections/pourquoi-maintenant.tsx`
- `src/app/(marketing)/_sections/tes-outils.tsx`

**Fichiers modifiés** :

- `src/app/(marketing)/_sections/hero.tsx` (sous-titre avec chiffre + footnote source)
- `src/app/(marketing)/page.tsx` (montage des 2 nouvelles sections)
- `geo-project/02-produit-roadmap.md` (section « Glossaire vocabulaire » officiel)
- `geo-project/01-marche-concurrence.md` (snapshot Semrush AI SEO Overview daté 2026-05-13)

**À revisiter** :

- Si la traction confirme l'intérêt narrative pour le canal Agence (Aline), envisager une **page `/comparatif`** publique avec tableau Mamie GEO vs Semrush vs Profound vs Peec — utile pour le SEO + closing agence (~1 PR dédiée).
- Le chiffre « 5 plateformes IA » dans la 4ᵉ stat est passable mais un peu light vs les 3 autres bien sourcées. Si on trouve un chiffre Médiamétrie ou Frenchweb sur l'usage IA en France, le remplacer.
- La règle « 5 features nommées » peut évoluer quand on livre vraiment les pages CRUD Prompts / Competitors — à ce moment on pourra peut-être faire passer la liste à 6-7 sans inventer.
- Mesurer l'impact des nouvelles sections sur le funnel (rebond, scroll depth, click-through CTAs) après le merge — décider en M2 si on garde le format ou si on simplifie.

---

#### 2026-05-13 — Polish UX home (hero interactif + scroll-fill dark section + pastilles LLM partagées) + pivot trial 14j → 7j

**Contexte** :

Suite à la PR refresh marketing « inspiré Semrush » (entrée précédente du même jour), Max a poussé une 2ᵉ vague de demandes UX/UI :

1. Hero interactif (le mot en gras dans le headline cycle entre les 5 LLMs trackés)
2. La data « En 2025… » sortie du hero pour devenir une **section dédiée fond sombre avec effet scroll-fill** (texte qui se révèle au scroll, section sticky)
3. Pastilles LLM **harmonisées partout** dans le site (style commun, angles légèrement décalés, gaps resserrés)
4. **Touche subtile de couleur** (gradient ou contraste inversé, pas flashy) pour éviter que le site ne soit trop plat
5. **Passage du trial 14 jours à 7 jours**

Les 4 premières demandes se consolident bien dans la même PR — la section sombre scroll-fill cumule l'inversion contraste (point 4), le narratif data (réutilisé du hero, point 2) et les pastilles LLM inline (point 3). Le hero rotator (point 1) utilise la même map de couleurs LLM que les pastilles → cohérence visuelle systémique.

**Choix techniques** :

| Sujet                   | Choix                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| Hero rotator            | Client component `<HeroLLMRotator>` qui cycle les 5 LLMs toutes les 2,4 s avec leur couleur saturée        |
| Source unique pastilles | Nouveau composant `LLMPill` dans `src/components/marketing/llm-pill.tsx` + map `LLM_KEYS_ORDER`            |
| Rotation pastilles      | Déterministe par LLM (-2°/+3°/-1°/+2°/-3°) — effet « sticker » sans random qui changerait par rendu        |
| Scroll-fill             | CSS pur via `animation-timeline: view()` + `background-clip: text` (Chrome 115+ / Safari 17+) — JS inutile |
| Fallback scroll         | `color: gray-300` en `:not(@supports)` → toujours lisible sans animation                                   |
| Contraste inversé       | Section `<PourquoiMaintenant>` sur fond `--color-ink` + radial warm subtile (rgba terracotta < 0.22)       |
| Trial 14j → 7j          | Override commercial du rationale antérieur (citation drift) — cf. doc 04 § Couche 3                        |

**Pivot trial 14j → 7j — justifications** (cf. doc 04 § « Pivot 2026-05-13 vers 7 jours ») :

- Force la décision payante plus rapidement → réduction du « zombie trial »
- Matche les standards SaaS modernes (Notion, Linear, Vercel Pro) — moins de friction perçue
- La citation drift se voit sur 30+ jours de toute façon ; 7 vs 14 ne change pas la perception initiale
- L'audit gratuit `/outils/test-visibilite-ia` joue déjà le rôle de « démo sans engagement »
- **À revisiter** après 30 jours de feedback prospects : si la conversion trial → payant chute, repasser à 10j ou 14j

**Mentions de marque** : tous les `14 jours` / `14 j` ont été remplacés par `7 jours` / `7 j` dans :

- Hero trust signal, FAQ home, pricing-faq, pricing-data CTAs ×3, pricing page metadata, lead magnet `/outils/test-visibilite-ia`, CGU, blog `mamie-geo-vs-profound`, audit reply email (`src/lib/email.ts`), docs 02/03/04/10, snapshot Semrush doc 01.
- **Exclusion** : `privacy/page.mdx` qui mentionne « Cookies de session Better Auth (durée 14 jours) » — non lié au trial, on garde.
- **Historique doc 09** : les entrées datées du Sprint 0 (lignes 65, 104, 231) qui mentionnent « trial 14j » **restent inchangées** — elles documentent ce qui était décidé à l'époque ; cette nouvelle entrée acte le pivot 2026-05-13.

**Conséquences attendues** :

- Home post-refresh : hero plus light (le paragraphe data est sorti) + section dark percutante au scroll qui sert d'inversion contraste + pastilles LLM cohérentes partout.
- Engagement attendu : la section dark scroll-fill devient un « moment de pause » dans le scroll qui force l'attention.
- Funnel : trial 7j réduit la queue d'utilisateurs hésitants ; à mesurer.

**Fichiers ajoutés** :

- `src/components/marketing/llm-pill.tsx` (composant + LLM_KEYS_ORDER + getLLMConfig)
- `src/app/(marketing)/_sections/hero-llm-rotator.tsx`

**Fichiers modifiés** :

- `src/app/globals.css` (animations `scroll-reveal-text` + `scroll-reveal-skip` + keyframes `scroll-reveal`)
- `src/app/(marketing)/_sections/hero.tsx` (rotator + paragraphe simplifié + 7 jours)
- `src/app/(marketing)/_sections/pourquoi-maintenant.tsx` (réécrit en dark scroll-fill)
- `src/app/(marketing)/_sections/llm-badges.tsx` (utilise `LLMPill` + gap resserré)
- 14 fichiers touchés pour le pivot 14j → 7j (cf. liste ci-dessus)

**À revisiter** :

- Mesurer impact UX (rebond, scroll depth, taux de clic CTA) après le merge — décider en M2 si la section dark reste ou évolue.
- Si le scroll-fill ne fonctionne pas bien sur Safari < 17 (~ 8% du trafic FR estimé), envisager un fallback IntersectionObserver-based.
- Le rotator hero peut être étendu : ajouter un mode « pause au focus clavier » plus visible si retour user.
- La rotation des pastilles (-2°/+3°…) est déterministe par LLM ; si on ajoute Grok ou autre LLM, lui assigner sa rotation dans `LLM_CONFIG`.
- Le pivot trial 7j sera revisité à 30 jours de feedback prospects (cf. doc 04 § Couche 3).

---

#### 2026-05-13 — Pages CRUD app (Prompts + Competitors) + Settings édition + helper `getUserContext`

**Contexte** :

L'application post-login avait une chaîne UX incomplète : un user pouvait créer son workspace, sa brand, ses concurrents et ses 5+ prompts à l'onboarding, mais ne pouvait rien gérer après coup. Pas de page pour ajouter / éditer / supprimer / pauser un prompt. Pas de page pour gérer les concurrents. `/app/settings` était en read-only. Cette PR complète la chaîne « onboarding → tracking → gestion » et permet le **self-service complet** pour les beta-testeurs.

**Choix retenus** :

| Sujet                 | Choix                                                                 |
| --------------------- | --------------------------------------------------------------------- |
| Détail prompt         | Page dédiée `/app/prompts/[id]` (URL partageable + breakdown par LLM) |
| Settings édition      | Inclure (workspace name + brand aliases) — ~200 lignes en plus        |
| Brand switcher action | ❌ Reporté (V0 = 1 brand par workspace)                               |
| Invitations équipe    | ❌ Reporté (Better Auth invitations système séparé)                   |
| Bulk upload CSV       | ❌ Reporté (UX dédié)                                                 |
| Pagination prompts    | Activée (Pro = 100, Agency = 300)                                     |

**Architecture** :

- **Schémas Zod** dans `src/lib/prompts/schemas.ts`, `src/lib/competitors/schemas.ts`, `src/lib/settings/schemas.ts`. Trim + dédoublon case-insensitive sur les aliases (côté server pour éviter dups). Strings vides dans les arrays d'aliases **acceptées côté Zod** et filtrées par le transform — sinon `"alias, , alias2"` rejette tout le payload au lieu de garder `alias` + `alias2`.
- **Quotas par plan** centralisés dans `src/lib/plans/quotas.ts` (single source of truth) : Starter 25 prompts / 5 concurrents, Pro 100 / 10, Agency 300 / illimité. Enforcement côté server actions avant insert. `quota_reached` error structurée renvoyée au client.
- **Helper auth `getUserContext(userId)`** dans `src/lib/auth/user-context.ts` : charge workspace + brand + role en une query. Utilisé par toutes les server actions + queries pour éviter le code dupliqué.
- **Server actions** : `create`, `update`, `delete`, `togglePromptActive` côté prompts ; `create`, `update`, `delete` côté competitors. Toutes avec `revalidatePath` sur les paths concernés.
- **Pages serveur** : `prompts/page.tsx`, `prompts/[id]/page.tsx`, `competitors/page.tsx` chargent les données puis délèguent à un client wrapper pour la partie interactive (filtre, dialogs, toast). Settings page wire les 2 forms d'édition inline.
- **Form Dialogs** : `prompt-form-dialog.tsx` et `competitor-form-dialog.tsx` réutilisent `<Dialog>` Radix. State initial via `useState` (pas `useEffect`) pour respecter le lint React `no-set-state-in-effect`. Parent passe `key={item.id}` pour forcer remount entre éditions.
- **Tag input aliases** : Enter/virgule pour ajouter, Backspace sur input vide pour retirer le dernier, max 10 aliases. Validation server (trim + dedupe case-insensitive).

**Quotas enforced en server actions** :

| Plan         | Prompts  | Concurrents |
| ------------ | -------- | ----------- |
| `trialing`   | 100      | 10          |
| `starter`    | 25       | 5           |
| `pro`        | 100      | 10          |
| `agency`     | 300      | illimité    |
| `enterprise` | illimité | illimité    |

Quand un user trial atteint 100 prompts et tente d'en créer un 101ᵉ, l'action renvoie `{ ok: false, error: "quota_reached", current: 100, max: 100, plan: "trialing" }` et le client affiche une erreur via `toast.error()`.

**Suggestion IA dans `/app/prompts`** :

Réutilise le helper `suggestPrompts()` de `src/app/(app)/app/onboarding/actions.ts` (Haiku 4.5, coût ~$0,003). Le user clique « Suggérer via IA » → 5 prompts apparaissent dans une zone éphémère sous le header → click « Ajouter » pour insérer un par un (avec quota check). Pas d'auto-insert (l'utilisateur valide).

**Conséquences attendues** :

- Tout utilisateur trial peut gérer ses prompts / concurrents / aliases sans email à Max → réduction du support load
- Quotas enforced → les conversions Starter → Pro deviennent visibles (un user qui hit le quota 25 voit un message → upgrade)
- Page détail prompt avec breakdown par LLM = nouvel argument marketing (vue granulaire par prompt, pas dispo chez Profound entry)
- 105 tests Vitest verts (avant : 76). Pas de tests E2E sur ces flows ajoutés (gap identifié pour PR dédiée).

**Fichiers ajoutés** (16) :

- `src/lib/plans/quotas.ts` (source de vérité quotas par plan)
- `src/lib/auth/user-context.ts` (helper auth user → workspace + brand)
- `src/lib/prompts/{schemas,schemas.test,queries}.ts`
- `src/lib/competitors/{schemas,schemas.test,queries}.ts`
- `src/lib/settings/{schemas,schemas.test}.ts`
- `src/app/(app)/app/(with-nav)/prompts/page.tsx` + `actions.ts` + `prompts-list.tsx` + `prompt-form-dialog.tsx`
- `src/app/(app)/app/(with-nav)/prompts/[id]/page.tsx`
- `src/app/(app)/app/(with-nav)/competitors/page.tsx` + `actions.ts` + `competitors-list.tsx` + `competitor-form-dialog.tsx`
- `src/app/(app)/app/(with-nav)/settings/actions.ts` + `workspace-form.tsx` + `brand-aliases-form.tsx`

**Fichiers modifiés** :

- `src/app/(app)/app/(with-nav)/settings/page.tsx` (wire les 2 forms d'édition)
- `CLAUDE.md` (§ 9 — passe de 5 à 8 routes app authentifiées)

**À revisiter** :

- **Bulk upload CSV** de prompts (Pro = 100 prompts, fastidieux à entrer un par un). UX dédié en PR follow-up.
- **Invitations équipe** Pro+ : nécessite système Better Auth invitations. Pas pris dans cette PR.
- **Édition brand.name / brand.domain** : reportée car ces champs changent l'identité tracking (matching détection citation se base dessus). Si on les rend éditables, décider quoi faire des runs historiques.
- **DELETE cascade prompts → runs** : actuellement irréversible. Si plaintes user, envisager un soft-delete (`deletedAt` colonne) + restauration 30j.
- **Tests E2E** auth + app sur ces flows : gap connu CLAUDE.md, à faire en PR dédiée Playwright.

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
