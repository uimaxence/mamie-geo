# 04 — Pricing et business model

## Philosophie pricing

1. **Pricing transparent et public** — pas de "contact us" sauf Enterprise et Agency
2. **Sous Peec AI sur l'entrée de gamme** (Solo 9,99 € + Starter 49 €, vs Peec 89 €) pour capter freelances et PME
3. **Marque blanche réservée Agency sur devis** — retiré de la grille publique 2026-05-14
4. **Annuel à -20 %** pour cashflow et réduction du churn
5. **Trial 14 j AVEC carte requise** (pivot 2026-06-08, cf. doc 09) + **garantie remboursement 14 j** sur toute première souscription. Pas de freemium permanent.
6. **Pas de remises silencieuses** — annuel, ETI, education clairement affichés
7. **Pricing en EUR** sur FR/EU, USD pour exports si besoin

---

## Stratégie freemium en 3 couches

Pas de tier gratuit dans l'app (piège classique : coût LLM 1,50-5 €/mois par freemium, support, conversion 1-3 %. Profound/Peec/Goodie n'en proposent pas). Funnel free-to-paid en 3 couches : valeur gratuite (média + lead magnets) séparée de la valeur payante (SaaS).

### Couche 1 — mamie-geo.fr en média gratuit (blog + ressources)

Blog `/blog`, newsletter, guides, études exclusives = freemium éditorial, gratuit indéfiniment. Rôle : attention + autorité. `mamie-seo.fr` (0 trafic) redirigé 301 vers `mamie-geo.fr`. Détail : doc 06.

### Couche 2 — outil "Test ma visibilité IA" en one-shot gratuit

`/outils/test-visibilite-ia` (refondu 2026-06-12, cf. doc 06 § n°1) :
site + email → scan express live (3 prompts × Le Chat mistral-small,
~0,002 €/scan, cap 50/jour) → verdict immédiat + 4 IA verrouillées →
CTA trial + email de confirmation (essai 14 j / appel découverte).
L'audit manuel 24 h est supprimé (2026-06-12) — pas de promesse de
travail humain gratuit, l'humain est vendu via l'accompagnement
done-for-you.

- Conversion attendue : 5-10 % des scans → trial → 15-25 % en payant.
- C'est le pont média gratuit → SaaS payant (+ filet accompagnement).

Second one-shot gratuit : `/outils/audit-technique` (30+ checks, 0 € LLM, cf. doc 06).

### Couche 3 — pas de trial automatique + garantie remboursement 14 jours

> **Titre conservé pour les références, contenu mis à jour.** Chronologie :
> trial 7 j sans carte acté 2026-05-13 → **supprimé 2026-05-14** (coût LLM :
> ~$3/trial mono-LLM, ~$15 en multi-LLM, soit ~$1 425 / 100 signups à 5 % conv
> — non finançable, cf. doc 09 § 2026-05-14) → **trial 14 j AVEC carte requise
> acté 2026-06-08** (cf. doc 09 § 2026-06-08 refonte funnel).

État courant (2026-06-11) :

- **Trial 14 j avec carte requise** : `subscription_data.trial_period_days: 14` + `payment_method_collection: "always"` au checkout Stripe. Pas de risque LLM (carte posée, bascule auto en active sauf annulation). Conversion attendue 50-70 % (vs 5-15 % sans carte). Plan picker post-onboarding + sidebar Subscribe + emails relance J-4/J-1/expiry.
- **Garantie remboursement 14 j conservée** (coexiste avec le trial) : refund manuel via portal Stripe sur email à `hello@mamie-geo.fr`. Pas de self-service V0.
- **Compte sans subscription** : `plan: "trialing"` sans checkout = `quotasFor() = { prompts: 0, competitors: 0, cadence: "weekly" }` → zéro run, zéro coût infra. UI explorable à vide.
- **Free taster** : `/outils/test-visibilite-ia` (couche 2).
- **Plan `beta` (accès gratuit offert, ajouté 2026-06-15, doc 09)** : pas un tier public, **octroi manuel** par l'admin (`/app/admin/beta`) à des beta-testeurs choisis (programme « 10 accès 3 mois contre feedback »). Quotas volontairement bridés pour le coût LLM : weekly, 15 prompts, tous LLMs → ~10 $/mois/testeur (~100 $ pour 10). Jamais facturé Stripe ; expire seul à `comp_expires_at` (cron `expire-comp` → `expired` + email de conversion essai 14 j). Conversion = checkout Stripe normal (le webhook écrase le plan). Ce n'est **pas** un retour au freemium permanent (anti-décision ci-dessous) : c'est un canal d'acquisition/discovery borné dans le temps.

### Pas de couche freemium permanente dans le SaaS

Refusé (anti-décision) : coût LLM ~50-100 €/100 freemium, support équivalent aux payants, conversion B2B 1-3 %, lead magnets couvrent déjà l'amorçage, ne pas dévaluer le payant. Si un jour nécessaire (ex. Peec passe freemium) : "1 audit one-shot gratuit/mois sur l'outil web", **jamais dans l'app**.

### Note sur mamie-seo.fr

301 vers `mamie-geo.fr` dès J1 (0 trafic, rien à préserver). Pas de multi-domaines en V0.

---

## Grille tarifaire détaillée

Prices annuels -20 % : **Solo 95,90 € / Starter 470 € / Pro 1 430 € HT/an** (≈ 7,99 / 39 / 119 €/mois). Prices Stripe annuels à créer dans le Dashboard + env vars `STRIPE_PRICE_*_ANNUAL` (fallback gracieux mensuel tant qu'absents).

### Plan Solo — 9,99 €/mois (ou 7,99 €/mois en annuel)

**Cible** : freelance qui teste GEO sans engagement. Ajouté 2026-05-14 (cf. doc 09).

- 1 marque, 3 concurrents, 5 prompts, 5 LLMs (Le Chat inclus sans condition)
- Fréquence **hebdomadaire** (run lundi 6h UTC), historique 90 j
- Dashboard + email récap hebdo, 1 utilisateur, support email J+3
- **Pixel d'attribution du trafic IA inclus dès ce plan** (cf. doc 09 § 2026-06-15) : preuve de ROI (coût ≈ nul, réduit le churn du plan d'entrée)

Marge brute LLM ~75 % mono-LLM, ~59 % multi-LLM. Hook : « ton bilan visibilité IA chaque lundi pour le prix d'un café ». Limite voulue : 1 run/semaine → motive l'upgrade Starter.

### Plan Starter — 49 €/mois (ou 39 €/mois en annuel)

**Cible** : freelances, solopreneurs, TPE.

- 1 marque, 5 concurrents, 25 prompts, 5 LLMs
- Fréquence **hebdomadaire**, historique 90 j
- Email hebdo + dashboard, export CSV, 1 utilisateur, support email < 48 h

### Plan Pro — 149 €/mois (ou 119 €/mois en annuel)

**Cible** : PME marketing in-house, freelances multi-clients.

- **3 marques**, 10 concurrents/marque, **100 prompts** (répartissables), 5 LLMs
- Fréquence **quotidienne**, historique 1 an
- Notifications Slack/Discord, alertes drop > 10 %, export CSV + JSON
- 3 utilisateurs, support email + chat < 24 h
- Module AI-readiness audit (V1, mois 4)

### Plan Agence — 399 €/mois (ou 319 €/mois en annuel) — sur devis depuis 2026-05-14

Retiré de `/pricing` (cf. doc 09 § 2026-05-14), remplacé par CTA « Plus de volume ? Contact ». Reste dans l'enum DB pour contrats négociés / grand-fathered. Fiche = référence commerciale interne :

- **10 marques**, 10 concurrents/marque, **300 prompts**, 5 LLMs, quotidien, 1 an
- **Marque blanche complète** (logo, sous-domaine custom, couleurs), multi-workspaces (1/client), permissions granulaires viewers/admins
- Rapports PDF mensuels auto par client, facturation centralisée
- 10 utilisateurs, support email + chat + onboarding 1h offert < 12 h, audit module inclus

### Plan Enterprise — sur devis (à partir de 1 500 €/mois)

**Cible** : ETI / grands comptes / collectivités / banques. Tout Agence plus : marques + prompts illimités, LLMs sur demande, historique illimité, hébergement EU dédié (option), SSO SAML/OIDC, DPA personnalisé (ISO 27001 visée 2027), API illimitée, account manager, SLA 99.5 % avec pénalités, Slack Connect < 4 h ouvrées.

### Offre « Accompagnement done-for-you » — sur devis (ajoutée 2026-06-12, doc 09)

Max prend en main **personnellement** le SEO + GEO d'une marque :
audit complet, inclusion sur les comparateurs/annuaires que les IA
citent, implémentation des correctifs avec le client, suivi Mamie GEO
Pro inclus, point mensuel + rapport d'évolution du rang.

- **Rareté réelle** : 3 créneaux max par trimestre (le temps fondateur
  ne scale pas) — affichée sur `/pricing` (section dédiée sous les
  plans), constantes `DFY_SLOTS_LEFT` / `DFY_SLOTS_PERIOD` centralisées dans
  `src/lib/done-for-you.ts` (affichées sur /pricing, /contact et les
  upsells des 2 scans) à décrémenter à la main à chaque vente.
- **Funnel** : `/pricing` → `/contact` (Cal.com inline, appel
  découverte 30 min gratuit). Event PostHog
  `pricing_done_for_you_cta_clicked`.
- **Pricing** : sur devis, engagement trimestriel. À cadrer après les
  premiers appels (ancrage suggéré : ≥ 1 500-2 500 €/mois vu le coût
  d'opportunité du temps fondateur — l'audit sur mesure one-shot est
  déjà à 990 €).

---

## Add-ons et options

| Option | Prix |
|---|---|
| Marque supplémentaire (Pro) | +29 €/mois |
| Pack 100 prompts supplémentaires | +49 €/mois |
| Tracking d'un LLM custom (ex: DeepSeek, Grok) | +99 €/mois |
| Onboarding accompagné (1h Visio) | 149 € one-shot |
| Audit GEO complet sur mesure | 990 € one-shot |
| Formation équipe (2h Visio) | 590 € |

---

## Réductions

- **Annuel** : -20 %
- **Étudiants / étudiantes** : -50 % sur Starter (avec preuve)
- **OSS / non-profit** : Starter gratuit 12 mois
- **Affiliation agence partenaire** : 20 % commission récurrente sur clients référés (hors plan Agence lui-même)

---

## Unit economics

### Coût d'acquisition (CAC) cible

| Canal | CAC cible | Note |
|---|---|---|
| Organique (mamie-seo + SEO) | 0-50 € | temps de création de contenu réparti |
| LinkedIn outbound | 80-150 € | heures de prospection par signup |
| Webinar / event | 100-200 € | coût d'organisation rapporté |
| Google Ads | 100-300 € | à tester ponctuellement |
| Affiliation | 30-100 € | selon commission |

### LTV cible

Référence plan Pro : churn mensuel cible 5 % (B2B SaaS = 3-7 %) → LTV = 149 / 0,05 = **~2 980 €**.

### Ratio LTV/CAC cible

**> 3** = sain, **5-10** = excellent, < 3 = on creuse.

### Marge brute par plan (après coûts LLM uniquement)

Coût LLM mesuré ~$0,043/run (tracking $0,04 + scoring $0,003, Haiku 4.5). 5 LLMs simultanés ≈ ×5.

| Plan | Prix HT | Cadence | Runs/mois (1 LLM) | Coût LLM/mois | Marge brute |
|---|---|---|---|---|---|
| **Solo** | 9,99 € | weekly | 20 (5×4 sem) | ~$0,86 | **~91 %** |
| **Starter** | 49 € | daily | 750 (25×30) | ~$32 | **~39 %** |
| **Pro** | 149 € | daily | 3000 (100×30) | ~$129 | **~18 %** ⚠️ |
| Agency (sur devis) | 399 € | daily | 9000 | ~$390 | **~3 %** ⚠️ |

> ⚠️ Multi-LLM (livré Phase C) : Pro et Agency basculeront sur Sonnet 4.6 (plus cher, qualité sup.) — marge à recalculer à la bascule. Solo reste sur Haiku.

### Marge brute après tous coûts variables

Avec Stripe (1,5 % + 0,25 €), Brevo, hébergement, cheerio audit :

| Plan | Marge nette ~ (1 LLM) |
|---|---|
| Solo | ~88 % |
| Starter | ~36 % |
| Pro | ~15 % |

**Conclusion** : Solo le plus profitable en relatif, Starter viable, **Pro doit basculer Sonnet 4.6 + tarif à reconsidérer** avant montée en charge multi-LLM.

---

## Projections financières

### Hypothèses de mix client

> Mise à jour 2026-05-16 (ajout Solo) — mix historique 50/35/13/2 obsolète.

Cible mois 12 : **20 % Solo / 45 % Starter / 25 % Pro / 8 % Agency / 2 % Enterprise**. ARPU blended ~110 €/mois (vs ~140 € avant Solo) — baisse compensée par volume signups supérieur ; net positif si conversion Solo → Starter à 12 mois ≥ 25 %.

### Scénario conservateur — mois par mois

| Mois | Starter | Pro | Agence | Ent. | MRR | Coûts var. | Marge contrib. |
|---|---|---|---|---|---|---|---|
| M1 | 5 | 1 | 0 | 0 | 394 € | 50 € | 344 € |
| M2 | 10 | 3 | 0 | 0 | 937 € | 150 € | 787 € |
| M3 | 18 | 6 | 1 | 0 | 2 178 € | 350 € | 1 828 € |
| M4 | 25 | 10 | 2 | 0 | 3 513 € | 600 € | 2 913 € |
| M5 | 35 | 15 | 3 | 0 | 5 167 € | 900 € | 4 267 € |
| M6 | 45 | 20 | 4 | 0 | 6 801 € | 1 250 € | 5 551 € |
| M7 | 55 | 25 | 5 | 0 | 8 415 € | 1 600 € | 6 815 € |
| M8 | 65 | 30 | 6 | 1 | 11 029 € | 2 000 € | 9 029 € |
| M9 | 75 | 35 | 7 | 1 | 12 633 € | 2 350 € | 10 283 € |
| M10 | 85 | 40 | 8 | 1 | 14 237 € | 2 700 € | 11 537 € |
| M11 | 95 | 45 | 9 | 2 | 17 351 € | 3 100 € | 14 251 € |
| M12 | 105 | 50 | 10 | 2 | 18 945 € | 3 450 € | 15 495 € |

**Résumé** : MRR fin M12 ~19 K€, ARR ~227 K€, marge contributive ~15,5 K€/mois.

### Scénario base (le plus probable)

Conservateur × 1.3 : MRR M12 ~25 K€, ARR ~300 K€, marge contributive ~20 K€/mois.

### Scénario optimiste

× 2 : MRR M12 ~38 K€, ARR ~456 K€, marge contributive ~30 K€/mois.

---

## Coûts fixes mensuels (estimation solo)

| Poste | Coût mensuel |
|---|---|
| Vercel Pro | $20 |
| Neon Postgres | 0 (free tier V0) puis $19 Pro |
| Queue (Postgres + Vercel Cron) | 0 en V0 ; Inngest $20 quand > 100K runs/mois |
| Sentry | Free → $26 |
| PostHog cloud | Free tier puis $0-50 |
| BetterStack | $10 |
| Brevo | €19-69 selon volume |
| Stripe | 0 (variable seulement) |
| Domaine + Google Workspace | $30 |
| Outils dev (Cursor, GitHub) | $50 |
| Comptable expert (forfait) | €150 |
| Total approximatif | **~€350-600** |

Année 1 en plus : outils marketing (Buffer, Notion, Figma, ConvertKit) ~50 €/mois, budget pub variable, juridique CGV/CGU 800-1 500 € one-shot.

---

## P&L simplifié année 1 (scénario conservateur)

| Poste | Année 1 |
|---|---|
| **Revenus (MRR cumulé annualisé)** | ~ 70 000 € |
| Coûts variables (LLM, Stripe, Brevo) | ~ 14 000 € |
| Coûts fixes (infra, outils, compta) | ~ 6 000 € |
| Coûts setup (juridique, design, naming) | ~ 3 000 € |
| **Marge avant rémunération** | **~ 47 000 €** |
| Rémunération solo (à dégager) | 0-30 000 € (selon montée en charge) |

→ Rémunération 30 K€ → ~17 K€ de réserve réinvestissable. Freelance 30-50 % en parallèle = cash perso sécurisé (60-90 K€ supplémentaires).

---

## Stratégie d'upsell

| Upsell | Trigger | Action | Cible conversion |
|---|---|---|---|
| Starter → Pro | 80 % des prompts atteints / multi-marques | Email auto « passe à Pro : 3 marques + daily » | 15-25 % des Starter en 3 mois |
| Pro → Agence | > 2 marques externes (clients) | Email + appel (marque blanche) | 20 % des Pro multi-marques |
| Agence → Enterprise | 8+ workspaces ou demande SSO / API | Touch commercial direct (Max) | 1-2 conversions/an année 1 |

---

## Analyse de sensibilité

### Si le coût LLM moyen est 2x plus élevé que prévu

| Plan | Coût LLM | Marge nette |
|---|---|---|
| Starter | 3 € | 94% (OK) |
| Pro | 90 € | 40% (limite) |
| Agence | 270 € | 32% (insuffisant) |

→ **Action** : reprice Agence à 599 € ou cap usage à 200 prompts.

### Si le churn est 10% au lieu de 5%

LTV / 2 → LTV/CAC tombe à 1.5 → non viable. → **Action** : prioriser NPS et rétention en V0.

### Si l'acquisition organique mamie-seo ne décolle pas

Plan B : LinkedIn outbound + paid Google Ads (CAC 200-400 €) → marges absorbent, cashflow plus tendu.

---

## Décisions de pricing à figer

Statut 2026-06-11 (historique dans doc 09) :

- [x] Prix Starter : **49 €** (en prod)
- [x] Trial : 7 j acté 2026-05-13 → supprimé 2026-05-14 (garantie 14 j refund) → **trial 14 j AVEC carte requise** acté 2026-06-08. Garantie remboursement 14 j conservée.
- [x] Carte requise au trial : **oui** (2026-06-08)
- [x] Annuel discount : **-20 %** (Prices Stripe annuels à créer dans le Dashboard)
- [x] Plan gratuit permanent : **non** (anti-décision, outils one-shot uniquement)
- [x] Stripe Tax : **oui dès J0** (actif)
- [ ] Pricing page A/B test : pas encore fait (scaffold feature flags PostHog dispo)

→ Voir [05-go-to-market.md](./05-go-to-market.md) pour activer ces tarifs sur le marché.
