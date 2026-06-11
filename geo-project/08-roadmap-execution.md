# 08 — Roadmap d'exécution

> État 2026-06-11 : Mois 0-2 (préparation + build V0) **✅ terminés** — Phases A/B/C livrées (A : moteur Haiku ; B : design system + UI + marketing + blog ; C : multi-LLM + Stripe, livrée 2026-05-18). V0+ entamé 2026-05-20. **Prochaine étape : beta/lancement public (Mois 3-4 ci-dessous).** Reste pré-launch : clé Perplexity, `BREVO_BLOG_LIST_ID`, 3 Prices annuels Stripe, comm hard launch, drip post-signup (cf. CLAUDE.md § Reste à faire).

## Phasage Sprint 1 — A → B → C (acté le 2026-05-07)

✅ Les 3 phases sont livrées (détail doc 09 § 2026-05-07) :

| Phase | Contenu                                                                  | Statut          |
| ----- | ------------------------------------------------------------------------ | --------------- |
| **A** | Moteur tracking + scoring + metrics + dashboard + magic-link + onboarding | ✅ livré        |
| **B** | Design tokens + UI complète + home/pricing + blog MDX + outil gratuit     | ✅ livré        |
| **C** | Stripe + hard-cap + 4 providers LLM additionnels                          | ✅ livré 2026-05-18 |

---

## Vue d'ensemble timeline

```
Mois 0    : Validation et préparation (3 semaines)        ✅
Mois 1-2  : Build V0 (8 semaines)                          ✅ (mai 2026)
Mois 3    : Beta privée + feedback                         ⏳ à venir
Mois 4    : Lancement public payant
Mois 5-6  : Croissance + canal agence
   ▲ GATE 1 : décision GO / pivot / stop
Mois 7-8  : V1 (audit AI-readiness)                        (module audit déjà livré en avance, 2026-05-17)
Mois 9-10 : Optimisation tunnel + scale
Mois 11-12: V2 (marque blanche complète)
   ▲ GATE 2 : décision croissance / lever fonds / rester bootstrap
```

---

## Mois 0 (3 semaines avant le premier sprint code)

✅ Terminé : décisions figées (00/01/03/04), naming + domaine, stack figée, comptes API testés, repo + CI, pages légales, doc 09 initialisé. Restes non faits reportés en GTM (listes prospects — cf. doc 05 § Avant J1).

---

## Mois 1 — Sprint 1 (Build V0 — partie 1)

✅ Terminé (mai 2026) : infra Next.js/Drizzle/Neon, Better Auth magic-link, queue Postgres + cron, onboarding wizard, worker execute-prompt, détection citations, premier dashboard.

---

## Mois 2 — Sprint 2 (Build V0 — partie 2)

✅ Terminé (mai 2026) : scoring LLM, score visibilité, dashboard complet + charts, vues prompt/concurrents, CSV export (livré 2026-06-08), email hebdo, quotas + plans Stripe, settings/billing, outil gratuit, tests E2E.

---

## Mois 3 — Beta privée

### Objectifs

- 15-20 beta testeurs actifs
- Itération rapide produit
- Premiers témoignages

### Actions

#### Semaine 9

- [ ] Annonce LinkedIn Max : "Je lance Mamie GEO en beta gratuite"
- [ ] Email aux 100 prospects beta identifiés
- [ ] Post SEO Camp / WebRankInfo / Indie Hackers
- [ ] Onboarding 1:1 (30 min visio) avec chaque beta testeur
- [ ] Setup tableau Notion partagé pour feedback

#### Semaine 10

- [ ] Itération produit basée sur top 3 demandes beta
- [ ] Premier article retex sur le blog
- [ ] Newsletter dédiée beta : "Voilà ce qu'on a appris cette semaine"

#### Semaine 11

- [ ] 2nd round de beta testers (viser 20 total)
- [ ] Premier témoignage / case study écrit
- [ ] Décisions sur dernières features V0 manquantes
- [ ] Préparation packaging lancement

#### Semaine 12

- [ ] Pivot des beta testeurs en clients payants (offre "early bird" : 6 mois Pro à -50%)
- [ ] Post de débrief beta sur LinkedIn (transparence)
- [ ] Lancement officiel programmé pour M4 semaine 1

### Livrables M3

15-20 beta testeurs · 10+ feedbacks documentés · 3-5 témoignages publiables · 1 case study chiffré

### KPI M3

20 beta actifs · NPS > 40 · 5 conversions early-bird payants

---

## Mois 4 — Lancement public

### Objectifs

- 15-25 clients payants
- Activation du tunnel mamie-seo
- Premier momentum média

### Actions

#### Semaine 13

- [ ] Article de lancement officiel sur le blog
- [ ] Annonce LinkedIn personnelle (Max raconte le pourquoi)
- [ ] ProductHunt FR + worldwide
- [ ] Indie Hackers update
- [ ] Email aux 100 prospects + 200 newsletter
- [ ] Webinar grand public ouvert aux inscriptions

#### Semaine 14

- [ ] Premier webinar grand public (200 inscriptions, 80 présents)
- [ ] Pitch presse : BDM, Journal du Net, Frenchweb (3-5 contacts directs)
- [ ] Cadence contenu : 2 articles/semaine, 5 posts LinkedIn

#### Semaine 15

- [ ] Optimisation tunnel : A/B test landing
- [ ] Optimisation onboarding (≤ 4 minutes)
- [ ] Premier article ou interview paru dans BDM ou équivalent

#### Semaine 16

- [ ] Premier programme d'affiliation lancé
- [ ] Bilan M4 : MRR, conversion, sources + ajustements marketing

### Livrables M4

Lancement public effectué · 15-25 clients payants · 1-2 retombées presse/blog

### KPI M4

1500+ visiteurs uniques · 80+ trials · 15-25 payants · MRR 2-4 K€

---

## Mois 5 — Canal agence

### Objectifs

- 3-5 agences signées
- Pipeline B2B agence

### Actions

- [ ] Outreach 50-100 agences SEO FR (LinkedIn + email)
- [ ] Premier webinar agences : 100 inscrits, 40 présents
- [ ] 15-20 demos 1:1 dirigeants agences
- [ ] Closing 3-5 agences (offre founder partner)
- [ ] Maintenir contenu (2/semaine) + LinkedIn + stabilité V0

### Livrables M5

3-5 agences en marque blanche (early access) · pipeline pour 5 agences additionnelles M6

### KPI M5

35 clients payants · 5 agences · MRR 5-7 K€

---

## Mois 6 — GATE 1 — Décision majeure

### Objectifs

Validation PMF · décision GO / pivot / stop · préparation V1.

### Actions

#### Semaine 21

- [ ] Bilan exhaustif : MRR, churn, NPS, NRR, sources
- [ ] Interview qualitative de 10 clients
- [ ] Analyse cohort retention
- [ ] **Audit CA cumulé vs plafond micro-entrepreneur** (~77 700 €/an BIC services) : projection M9-M12, décision bascule SAS/EURL si trajectoire de dépassement (cf. doc 07 R16). Provisionner ~1500-3000 € de frais.

#### Semaine 22

- [ ] Décision GATE 1 (critères ci-dessous)
- [ ] Si GO : début V1 · si pivot : roadmap pivot dans 09 · si stop : plan d'arrêt propre

#### Semaines 23-24

- [ ] Si GO : dev V1 + acquisition continue

### CRITÈRES GATE 1

**GO si TOUS remplis :** MRR ≥ 6 K€ · ≥ 30 clients payants · ≥ 3 agences · churn mensuel ≤ 8% · NPS ≥ 35 · croissance MoM ≥ 25%

**PIVOT si :** 4-5 critères sur 6 remplis → documenter ce qui ne va pas + plan correctif 3 mois

**STOP si :** < 3 critères remplis OU MRR < 3 K€ OU pas de croissance / décroissance

### KPI M6

50+ clients payants (cible idéale) · MRR 7-10 K€ · 5 agences · décision GATE 1 documentée

---

## Mois 7-8 — V1 Build (audit AI-readiness)

> Note 2026-06-11 : le module audit (crawler, checks schema/FAQ/llms.txt, scoring, pages app, recommandations) a été livré **en avance** le 2026-05-17 (Sprint 6 PR B) + lead magnet `/outils/audit-technique`. Ces deux mois se reconvertissent en : marketing du module (annonce, webinar dédié, 10+ articles AI-readiness), recrawl périodique/checklist de suivi si manquants, outreach agences continu, préparation premier client Enterprise.

### Livrables M7-M8

Module audit marketé · 10+ articles éducatifs AI-readiness · 1 client Enterprise en pipeline

### KPI M8

75+ clients payants · 10+ K€ MRR · 7-8 agences · 1 Enterprise en pipeline

---

## Mois 9-10 — Scale et optimisation

### Objectifs

Optimisation funnel · premier Enterprise signé · préparation V2 (marque blanche).

### Actions

- [ ] Premier test Google Ads + LinkedIn Ads (budget 1-2 K€)
- [ ] Webinar mensuel maintenu (éventuellement bi-mensuel)
- [ ] Sponsoring SEO Camp si conférence dans la fenêtre
- [ ] Closing premier Enterprise (cycle 3 mois démarré M7)
- [ ] Refacto BDD si nécessaire pour multi-workspaces

### Livrables M9-M10

Premier Enterprise signé · tunnel optimisé · préparation technique V2

### KPI M10

100+ clients payants · 15+ K€ MRR · 10 agences · 1 Enterprise

---

## Mois 11-12 — V2 Build (marque blanche)

### Objectifs

Marque blanche complète · 25 K€ MRR · préparer GATE 2.

### Actions

- [ ] Sprint V2 partie 1 : multi-workspaces, permissions granulaires, branding personnalisable (logo, couleurs), sous-domaines custom (CNAME)
- [ ] Sprint V2 partie 2 : rapports PDF auto mensuels, facturation centralisée, dashboard méta agence, API basique
- [ ] Annonce V2 (LinkedIn, newsletter, webinar agences)
- [ ] Migration des agences early-access vers la marque blanche

### Livrables M11-M12

V2 lancée · marque blanche complète · 12 mois de retex documenté

### KPI M12

130-150 clients payants · 20-25 K€ MRR · 12-15 agences · 1-2 Enterprise

---

## GATE 2 (mois 12)

### Critères

**Bootstrap continue si :** MRR ≥ 20 K€ · croissance MoM ≥ 15% · marges saines (>60% nette après LLM) · énergie founder maintenue

**Lever des fonds (seed 500 K€-1 M€) si :** MRR ≥ 30 K€ · croissance MoM ≥ 20% · plan d'expansion EU clair · besoin de soutien (co-founder / recrutement)

**Pivot ou exit si :** plateau persistant OU concurrent FR sérieux capture le marché plus vite

---

## KPI dashboard mensuel

À tenir à jour le 1er de chaque mois dans 09 :

- **Acquisition** : visiteurs uniques landing · trial signups · conversion landing → trial · CAC blended
- **Revenue** : MRR · ARR · net new MRR · ARPU · total clients payants
- **Rétention** : churn $ et logo · NRR · cohort survival M1/M2/M3/M6
- **Produit** : DAU/MAU · prompts trackés · runs/jour · coûts LLM/jour · NPS (trimestriel)
- **Coûts** : variables/mois · fixes/mois · marge brute/nette

---

## Allocation du temps (solo founder)

- **Mois 1-3 (build + beta)** : 50% dev · 25% contenu/marketing · 15% clients beta · 10% admin/strat
- **Mois 4-6 (lancement + croissance)** : 30% dev · 35% contenu/marketing · 20% sales/agences · 10% support · 5% admin
- **Mois 7-12 (scale + V2)** : 35% dev · 25% contenu/marketing · 25% sales/CS · 10% support · 5% admin

---

## Rituels d'exécution

- **Quotidien** : réponses clients dans la journée · 1-2 posts LinkedIn (Buffer) · check Sentry/uptime · 30 min veille
- **Hebdomadaire** (vendredi) : revue KPI + plan semaine · 1 post LinkedIn long-form récap · newsletter
- **Mensuel** (1er) : update KPI doc 08 + 09 · veille concurrentielle 30 min · bilan financier · revue NPS + top demandes
- **Trimestriel** : revue stratégique 00/01/07 · interviews 10 clients · mise à jour roadmap · 1 semaine de vraie déconnexion
- **Annuel** : audit complet · rapport public "1 an de Mamie GEO" · décision multi-année

---

## Sprint 0 — Checklist critique avant le 1er commit

✅ Terminée (mai 2026) : GO acté, naming/domaine, comptes API testés, stack figée, schéma BDD validé, repo + CI, outil gratuit conceptualisé, légal en place, doc 09 initialisé. Item restant reporté en GTM : listes 100 prospects beta + 100 agences (cf. doc 05).

→ Voir [09-decisions-journal.md](./09-decisions-journal.md) pour tracer toutes les décisions.
