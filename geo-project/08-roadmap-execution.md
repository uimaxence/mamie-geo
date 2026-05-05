# 08 — Roadmap d'exécution

## Vue d'ensemble timeline

```
Mois 0    : Validation et préparation (3 semaines)
Mois 1-2  : Build V0 (8 semaines)
Mois 3    : Beta privée + feedback
Mois 4    : Lancement public payant
Mois 5-6  : Croissance + canal agence
   ▲ GATE 1 : décision GO / pivot / stop
Mois 7-8  : V1 (audit AI-readiness)
Mois 9-10 : Optimisation tunnel + scale
Mois 11-12: V2 (marque blanche complète)
   ▲ GATE 2 : décision croissance / lever fonds / rester bootstrap
```

---

## Mois 0 (3 semaines avant le premier sprint code)

### Objectifs
Tout valider et préparer pour pouvoir commencer à coder le 1er jour du sprint 1 sans friction.

### Tâches détaillées

#### Semaine -3
- [ ] Décisions stratégiques figées (00, 01)
- [ ] Naming définitif validé
- [ ] Domaine acheté
- [ ] Logo + identité visuelle (1-2 jours Figma max, anti-bikeshedding)
- [ ] Comptes pro créés (LinkedIn founder, X, GitHub)

#### Semaine -2
- [ ] Stack technique figée (03)
- [ ] Schéma BDD validé
- [ ] Choix outils : Vercel, Neon, Inngest, Clerk, Brevo, Stripe
- [ ] Comptes API créés et premiers tests : OpenAI, Anthropic, Mistral, Perplexity, Google AI
- [ ] Test de coût réel : 100 prompts × 5 LLMs → coût mesuré
- [ ] Setup repo Git, CI/CD basique
- [ ] Pricing public défini (04)

#### Semaine -1
- [ ] CGV / CGU / mentions légales / politique de confidentialité (juriste 1500€)
- [ ] Premiers articles GEO publiés sur mamie-seo (3-5)
- [ ] Newsletter setup + inscription form
- [ ] Outil gratuit "Test ma visibilité IA" en concept (à coder en sprint 1)
- [ ] Liste de 100 prospects beta testeurs identifiée
- [ ] Liste de 100 prospects agences identifiée
- [ ] Calendly setup pour onboarding
- [ ] Doc 09-decisions-journal.md initialisé avec les décisions prises

### Livrables M0
- Stack technique opérationnelle
- Premier article GEO ranqué (au moins en cours d'indexation)
- Document légal en place
- 100 prospects identifiés et segmentés

### KPI M0
- Aucun KPI commercial. Focus exécution préparation.

---

## Mois 1 — Sprint 1 (Build V0 — partie 1)

### Objectifs
Setup infra + auth + onboarding + premier worker fonctionnel.

### Sprints (1 sprint = 2 semaines)

#### Sprint 1.1 (semaines 1-2)
- [ ] Setup Next.js + Tailwind + shadcn/ui
- [ ] Auth Clerk (signup, login, magic link)
- [ ] Database Postgres + Prisma + premières migrations
- [ ] Stripe intégré (Customer Portal + premiers plans)
- [ ] Page landing publique mamie-geo.fr (5 sections)
- [ ] Page pricing
- [ ] Page login / signup
- [ ] Première brique de workflow Inngest
- [ ] Test API : appel ChatGPT, Claude, Mistral, Perplexity, Gemini avec un prompt simple, vérification des réponses

#### Sprint 1.2 (semaines 3-4)
- [ ] Onboarding wizard (3 étapes)
- [ ] Génération de prompts auto via Claude (donner domaine + description → 10 prompts suggérés)
- [ ] Configuration brand + concurrents
- [ ] Modèle de données runs / citations
- [ ] Premier worker exécution prompt × 5 LLMs (1 prompt à la fois)
- [ ] Stockage réponses brutes
- [ ] Détection regex naïve des marques
- [ ] Premier dashboard très simple (juste : "votre marque a été citée X fois sur Y prompts")

### Livrables M1
- App déployée en staging
- 1 utilisateur peut s'inscrire, configurer une marque, et voir une première donnée
- Coût réel mesuré sur 50 prompts × 5 LLMs

### KPI M1
- Site live ✅
- 5 articles GEO publiés
- 100 abonnés newsletter
- 5 self-tests internes : onboarding fluide, dashboard pertinent

---

## Mois 2 — Sprint 2 (Build V0 — partie 2)

### Sprints

#### Sprint 2.1 (semaines 5-6)
- [ ] Détection citations améliorée (LLM scoring via Claude Haiku)
- [ ] Score de visibilité calculé et persisté
- [ ] Dashboard principal complet (cards, graphes)
- [ ] Vue détaillée par prompt
- [ ] Vue concurrents
- [ ] Évolution temporelle (graph 30 jours)
- [ ] Export CSV
- [ ] Email hebdo automatique

#### Sprint 2.2 (semaines 7-8)
- [ ] Quotas par plan implémentés (Starter / Pro)
- [ ] Plans Stripe configurés
- [ ] Page paramètres (compte, billing, équipe)
- [ ] Page facturation (download factures)
- [ ] Page admin minimale (vue MRR, runs/jour, coûts LLM)
- [ ] Outil gratuit "Test ma visibilité IA" déployé sur mamie-seo
- [ ] Tests E2E sur les flows critiques
- [ ] Préparation lancement beta

### Livrables M2
- V0 fonctionnelle bout-en-bout
- App stable, déployée en production
- Outil gratuit publié, premiers usages testés

### KPI M2
- 10 articles GEO publiés
- 200 abonnés newsletter
- 5 self-tests amis : NPS > 30
- Premier audit gratuit complété en moins de 60 secondes

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
- [ ] Onboarding 1:1 (30 min Visio) avec chaque beta testeur
- [ ] Setup tableau Notion partagé pour feedback

#### Semaine 10
- [ ] Itération produit basée sur top 3 demandes beta
- [ ] Premier article retex sur mamie-seo
- [ ] Newsletter dédiée beta : "Voilà ce qu'on a appris cette semaine"

#### Semaine 11
- [ ] 2nd round de beta testers (visent 20 total)
- [ ] Premier témoignage / case study écrit
- [ ] Décisions sur dernières features V0 manquantes
- [ ] Préparation packaging lancement

#### Semaine 12
- [ ] Pivot des beta testeurs en clients payants (avec offre "early bird" : 6 mois Pro à -50%)
- [ ] Post de débrief beta sur LinkedIn (transparence)
- [ ] Lancement officiel programmé pour M4 semaine 1

### Livrables M3
- 15-20 beta testeurs
- 10+ feedback utilisateurs documentés
- 3-5 témoignages publiables
- 1 case study chiffré

### KPI M3
- 20 beta testeurs actifs
- NPS > 40
- 5 conversions early-bird payants

---

## Mois 4 — Lancement public

### Objectifs
- 15-25 clients payants
- Activation du tunnel mamie-seo
- Premier momentum média

### Actions

#### Semaine 13
- [ ] Article de lancement officiel sur mamie-seo
- [ ] Annonce LinkedIn personnelle (Max raconte le pourquoi)
- [ ] ProductHunt FR + worldwide
- [ ] Indie Hackers update
- [ ] Email aux 100 prospects + 200 newsletter
- [ ] Webinar grand public ouvert aux inscriptions

#### Semaine 14
- [ ] Premier webinar grand public (200 inscriptions, 80 présents)
- [ ] Pitch presse : BDM, Journal du Net, Frenchweb (3-5 contacts directs)
- [ ] Continuer la cadence de contenu : 2 articles/semaine, 5 posts LinkedIn

#### Semaine 15
- [ ] Optimisation tunnel : A/B test landing
- [ ] Optimisation onboarding (réduire à 4 minutes max)
- [ ] Premier article ou interview parue dans BDM ou équivalent

#### Semaine 16
- [ ] Premier programme d'affiliation lancé
- [ ] Bilan M4 : MRR, conversion, sources
- [ ] Décisions ajustement marketing

### Livrables M4
- Lancement public effectué
- 15-25 clients payants
- 1-2 retombées presse / blog

### KPI M4
- 1500+ visiteurs uniques
- 80+ inscriptions trial
- 15-25 clients payants
- MRR 2-4 K€

---

## Mois 5 — Canal agence

### Objectifs
- 3-5 agences signées
- Construire le pipeline B2B agence

### Actions

- [ ] Outreach 50-100 agences SEO FR (LinkedIn + email)
- [ ] Webinar agences (premier) : 100 inscrits, 40 présents
- [ ] 15-20 demos 1:1 avec dirigeants agences
- [ ] Closing 3-5 agences (offre founder partner)
- [ ] Continuer le contenu mamie-seo (cadence 2/semaine)
- [ ] Continuer LinkedIn Max
- [ ] Maintenance produit + bug-fix critiques (V0 doit rester stable)

### Livrables M5
- 3-5 agences en marque blanche (early access)
- Pipeline pour 5 agences additionnelles M6

### KPI M5
- 35 clients payants total
- 5 agences
- MRR 5-7 K€

---

## Mois 6 — GATE 1 — Décision majeure

### Objectifs
- Validation PMF
- Décision GO / pivot / stop
- Préparation V1 (audit module)

### Actions

#### Semaine 21
- [ ] Bilan exhaustif : MRR, churn, NPS, NRR, sources
- [ ] Interview qualitative de 10 clients : NPS détaillé
- [ ] Analyse cohort retention

#### Semaine 22
- [ ] Décision GATE 1 (cf. critères ci-dessous)
- [ ] Si GO : début V1
- [ ] Si pivot : roadmap pivot documentée dans 09
- [ ] Si stop : plan d'arrêt propre

#### Semaines 23-24
- [ ] Si GO : début dev V1 (audit AI-readiness)
- [ ] Continuer acquisition

### CRITÈRES GATE 1

**GO si TOUS ces critères sont remplis :**
- MRR ≥ 6 K€
- ≥ 30 clients payants
- ≥ 3 agences signées
- Churn mensuel ≤ 8%
- NPS ≥ 35
- Croissance MoM ≥ 25%

**PIVOT si :**
- 4-5 critères sur 6 sont remplis
- Documentation ce qui ne va pas et plan correctif sur 3 mois

**STOP si :**
- Moins de 3 critères remplis
- OU MRR < 3 K€
- OU pas de croissance ou décroissance

### KPI M6
- 50+ clients payants (cible idéale)
- MRR 7-10 K€
- 5 agences
- Décision GATE 1 prise et documentée

---

## Mois 7-8 — V1 Build (audit AI-readiness)

### Objectifs
- Lancer le module Audit (différenciateur)
- Maintenir la croissance acquisition
- Optimiser le funnel agences

### Actions M7

- [ ] Sprint dev V1 partie 1 :
  - Crawler léger (Playwright)
  - Parser HTML pour schema, FAQ, llms.txt
  - Score AI-readiness algorithme
  - Page audit dans dashboard
- [ ] Continuer outreach agences
- [ ] Premier client Enterprise touché (préparation)

### Actions M8

- [ ] Sprint V1 partie 2 :
  - Recommandations actionnables
  - Suivi des recommandations (checklist)
  - Recrawl périodique
  - Intégration dashboard
- [ ] Lancement V1 (annonce LinkedIn + newsletter)
- [ ] Webinar dédié au nouveau module

### Livrables M7-M8
- Module Audit opérationnel
- 10+ articles éducatifs sur AI-readiness publiés
- 1 client Enterprise en pipeline

### KPI M8
- 75+ clients payants
- 10+ K€ MRR
- 7-8 agences
- 1 client Enterprise dans le pipeline

---

## Mois 9-10 — Scale et optimisation

### Objectifs
- Optimisation funnel acquisition
- Premier client Enterprise signé
- Préparation V2 (marque blanche complète)

### Actions

- [ ] Premier test Google Ads + LinkedIn Ads (budget 1-2 K€)
- [ ] Webinar mensuel maintenu (peut-être bi-mensuel maintenant)
- [ ] Sponsoring SEO Camp si conférence dans la fenêtre
- [ ] Closing premier client Enterprise (3 mois cycle de vente démarré au M7)
- [ ] Refacto BDD si nécessaire pour préparer multi-workspaces

### Livrables M9-M10
- Premier client Enterprise signé
- Tunnel acquisition optimisé
- Préparation technique V2

### KPI M10
- 100+ clients payants
- 15+ K€ MRR
- 10 agences
- 1 Enterprise

---

## Mois 11-12 — V2 Build (marque blanche)

### Objectifs
- Lancer la marque blanche complète
- Atteindre 25 K€ MRR
- Préparer Gate 2

### Actions

- [ ] Sprint V2 partie 1 :
  - Multi-workspaces architecture
  - Permissions granulaires
  - Branding personnalisable (logo, couleurs)
  - Sous-domaines custom (CNAME setup)

- [ ] Sprint V2 partie 2 :
  - Rapports PDF auto mensuels
  - Facturation centralisée
  - Dashboard méta agence
  - API basique

- [ ] Annonce V2 (LinkedIn, newsletter, webinar agences)
- [ ] Migration des agences early-access vers nouvelle marque blanche

### Livrables M11-M12
- V2 lancée
- Marque blanche complète
- 12 mois de retex documenté

### KPI M12
- 130-150 clients payants
- 20-25 K€ MRR
- 12-15 agences
- 1-2 Enterprise

---

## GATE 2 (mois 12)

### Critères

**Bootstrap continue si :**
- MRR ≥ 20 K€
- Croissance MoM ≥ 15%
- Marges saines (>60% nette après LLM)
- Énergie founder maintenue

**Lever des fonds (seed 500 K€-1 M€) si :**
- MRR ≥ 30 K€
- Croissance MoM ≥ 20%
- Plan d'expansion EU clair
- Soutien externe pour co-founder ou recrutement

**Pivot ou exit si :**
- Plateau persistent
- Concurrent FR sérieux a émergé et capture le marché plus vite

---

## KPI dashboard mensuel

À tenir à jour le 1er de chaque mois dans 09 :

### Acquisition
- Visiteurs uniques landing
- Trial signups
- Conversion landing → trial
- CAC blended

### Revenue
- MRR
- ARR
- Net new MRR (new + expansion - contraction - churn)
- ARPU
- Total customers payants

### Rétention
- Churn $ et logo (mensuel)
- NRR
- Cohort survival M1, M2, M3, M6

### Produit
- DAU / MAU
- Prompts trackés total
- Runs / jour
- Coûts LLM / jour
- NPS (trimestriel)

### Coûts
- Coûts variables / mois
- Coûts fixes / mois
- Marge brute / nette

---

## Allocation du temps (solo founder)

### Mois 1-3 (build + lancement beta)
- 50% dev produit
- 25% contenu / marketing
- 15% interactions clients (beta)
- 10% admin / strat

### Mois 4-6 (lancement + croissance)
- 30% dev produit (V0 → V1)
- 35% contenu / marketing
- 20% sales / agences
- 10% support clients
- 5% admin / strat

### Mois 7-12 (scale + V2)
- 35% dev produit (V1 + V2)
- 25% contenu / marketing
- 25% sales / customer success
- 10% support
- 5% admin / strat

---

## Rituels d'exécution

### Quotidien
- Réponse emails / messages clients dans la journée
- 1-2 posts LinkedIn (autopiloté Buffer si possible)
- Check Sentry / uptime
- 30 min lecture / veille

### Hebdomadaire
- Vendredi : revue KPI semaine + plan semaine suivante
- Vendredi : 1 post LinkedIn long-form de récap
- Newsletter envoyée

### Mensuel
- 1er du mois : update KPI doc 08 + 09 (decisions journal)
- Veille concurrentielle 30 min
- Bilan financier mensuel
- Revue NPS et top demandes feature

### Trimestriel
- Revue stratégique : doc 00, 01, 07
- Interview qualitative 10 clients
- Mise à jour roadmap
- Vacances 1 semaine (vraie déconnect)

### Annuel
- Audit complet
- Rapport public "1 an de Mamie GEO" (transparence + marketing)
- Décision multi-année

---

## Sprint 0 — Checklist critique avant le 1er commit

À faire dans cet ordre, sans en sauter :

1. [ ] Décision finale : GO sur le projet (cf. README et 00)
2. [ ] Cash réserve perso vérifiée (≥ 6 mois)
3. [ ] Discussion compagne et alignement sur la phase
4. [ ] Naming définitif tranché
5. [ ] Domaine acheté
6. [ ] Comptes API testés (chacun fait un appel test)
7. [ ] Stack figée (Vercel, Neon, Inngest, Clerk, Brevo, Stripe, Sentry)
8. [ ] Schéma BDD validé sur papier
9. [ ] Repo créé, CI setup
10. [ ] Premier outil gratuit conceptualisé
11. [ ] Plan de contenu 30 jours rédigé
12. [ ] Liste 100 prospects beta + 100 prospects agences faite
13. [ ] Document légal en cours (juriste contacté)
14. [ ] Doc 09 (decisions-journal.md) initialisé
15. [ ] **GO** : sprint 1 lancé

→ Voir [09-decisions-journal.md](./09-decisions-journal.md) pour tracer toutes les décisions à venir.
