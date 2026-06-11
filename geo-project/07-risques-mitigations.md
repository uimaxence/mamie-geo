# 07 — Risques et mitigations

## Méthode d'évaluation

Chaque risque noté sur 3 axes : **Probabilité** (Faible/Moyenne/Élevée), **Impact** (Faible/Moyen/Élevé/Critique = peut tuer le projet), **Fenêtre** (court 0-6 mois / moyen 6-18 / long >18).

---

## Matrice synthétique

| # | Risque | Probabilité | Impact | Fenêtre |
|---|---|---|---|---|
| R1 | Semrush / Ahrefs lancent un module GEO FR sérieux | Moyenne | Élevé | Moyen |
| R2 | Peec AI localise sérieusement en français | Élevée | Élevé | Court-moyen |
| R3 | Coûts LLM augmentent ou volume hors budget | Moyenne | Élevé | Continu |
| R4 | Marché FR plus petit que prévu | Moyenne | Critique | Court |
| R5 | Burnout / désengagement solo founder | Moyenne | Critique | Continu |
| R6 | LLM majeurs ferment ou changent leur API | Faible | Élevé | Continu |
| R7 | Citation drift trop important rend le tracking fiable | Moyenne | Moyen | Continu |
| R8 | Mistral n'investit pas Le Chat à long terme | Faible | Moyen | Long |
| R9 | Bug critique ou perte de données | Faible | Critique | Continu |
| R10 | Réglementation IA / scrap restrictif | Faible | Élevé | Long |
| R11 | Mamie SEO ne génère pas le trafic attendu | Moyenne | Élevé | Court |
| R12 | Difficulté de closing agences | Moyenne | Élevé | Court-moyen |
| R13 | Concurrent FR sort en parallèle | Faible | Moyen | Court-moyen |
| R14 | Churn > 10% mensuel | Moyenne | Critique | Court |
| R15 | Procès / problème juridique | Faible | Élevé | Continu |
| R16 | Dépassement plafond micro-entrepreneur (~77 700 €/an BIC services) | **Imminente (2026-05-16)** | Critique si non anticipé | **Court** — bascule SAS/EURL à anticiper M9-10 si ARR > 50K€ |

---

## Risques détaillés et mitigations

### R1 — Semrush / Ahrefs lancent un module GEO FR sérieux

Un acteur SEO global ajoute du GEO natif en FR dans l'outil que les SEO FR utilisent déjà. Probable : Semrush ~18 % du marché GEO services, Ahrefs Brand Radar en place. Pas catastrophique : modules généralistes non FR-natifs, pas de focus Le Chat, surcouche d'un outil à 500 €/mois (trop cher freelances/PME), pas de marque blanche agences.

**Mitigations** : doubler sur **Le Chat** comme différenciateur ; renforcer le **canal agence marque blanche** ; **pricing entry agressif** (49 €) inmatcheable par Semrush ; **marque éditoriale FR forte** (non réplicable par feature).

**Plan B** : double-down segment agence (offre exclusive, accompagnement) ; acquisition par Semrush théoriquement possible mais peu probable.

---

### R2 — Peec AI localise sérieusement en français

Peec (Berlin, $29M levés) sort une version 100 % FR : UI traduite, tracking Mistral, support FR. Très probable : moyens, marché FR = 2e marché EU naturel, UI multilingue partielle, horizon 6-12 mois. Pas catastrophique : mindset non-FR, pas de canal agence FR marque blanche, pricing ≥ 89 € (vs notre 49 €).

> **Update 2026-06-11** : risque qui se précise — Peec a passé **10 M$ d'ARR** (veille 2026-05/06, cf. doc 09 § 2026-06-08 veille Peec). Probabilité confirmée Élevée.

**Mitigations** : **vitesse** (100+ clients FR avant leur arrivée) ; **lien personnel** (SEO Camp, événements, communautés FR) ; **avantage durable canal agence** (relations, customisations) ; audience éditoriale propre.

**Plan B** : si Peec localise au mois 8-9, il faut ≥ **50 clients fidèles** sinon danger. Arme nucléaire : Starter à 29 € prix-killer. Renforcer « made in France ».

---

### R3 — Coûts LLM augmentent ou volume hors budget

Hausses tarifaires API (rare) ou volumes clients qui explosent la marge. Risques précis : client 100 prompts × 5 LLMs × jour ≈ 100 €/mois de LLM → marge négative possible ; bug worker qui re-run 1000× ; modèles plus chers obligatoires si la qualité l'exige.

> **Update 2026-06-11** : coût mesuré ~$0,043/run confirmé ; **hard-cap 200 % livré 2026-05-16** (block + email + alerte interne) — mitigation principale en place.

**Mitigations** : hard caps par client (200 % quota = block + email) ✅ ; caching agressif entre clients (cf. doc 03) ; modèles low-cost pour le scoring (Haiku) ✅ ; alertes internes si client > 60 % de marge consommée ; renégociation tarifaire ; Batch API quand disponible.

**Plan B** : reprice en hausse (préavis 60 j, grandfather) ; Pro limité à 50 prompts ; Le Chat en hebdo par défaut sur Pro.

---

### R4 — Marché FR plus petit que prévu

Le GEO FR ne décolle pas, SMB ne paient pas, plafond 30-50 clients. Possible : adoption IA FR plus lente, TPE/PME prudentes, B2B SaaS FR souvent 50-70 % des montants US.

**Signaux d'alerte précoces** : M3 MRR < 1,5 K€ malgré effort marketing ; M6 < 20 clients payants ; NPS < 30 ; faible re-engagement après mois 1.

**Mitigations** : internationalisation EU dès M6 (anglais basique : DE, NL, BE) ; étendre la cible (consultants marketing, content strategists) ; pivot product content optimization (Scalenut-like).

**Plan B** : pivot service/consulting (au prix de 6-12 mois perdus) ; acquisition par Peec/Profound (peu probable).

---

### R5 — Burnout / désengagement solo founder

Max sort d'une fatigue freelance, creux de motivation classique M3-6 (pas de PMF clair, charge max), isolement solo founder, pression cash si freelance abandonné trop tôt.

**Mitigations** : garder 30-50 % de freelance les 3 premiers mois (cashflow + variété) ; communauté (1-2 groupes founders FR : Indie Hackers FR, founders AI Slack, FinTech Mafia France…) ; ritual hebdo (1 appel/semaine founder ou mentor) ; sport/vie perso non-négociable (trail) ; compagne alignée sur les phases ; documentation systématique (le projet ne s'effondre pas en 1 jour) ; milestones célébrés (1er client, 1ère agence, 10 K€ MRR).

**Plan B** : pause 2-4 semaines décrétée à l'avance si signaux faibles ; cofondateur tech ou commercial dès M6 si le moral chute ; acceptation lucide d'un arrêt propre (vendre l'asset).

---

### R6 — LLM majeurs ferment ou changent leur API

OpenAI durcit/ferme l'API browse, prix en hausse, Mistral change de stratégie. Peu probable : 5-7 acteurs, aucun intérêt à fermer (revenus), tendance à l'ouverture.

**Mitigations** : multi-LLM par design (1 coupe → 4 tournent) ; architecture découplée (1 module par LLM, remplaçable) ; veille TOS/SDK.

**Plan B** : communication transparente clients (réduction temporaire du score) ; remplacement par modèle équivalent (Llama, Qwen…) ; ne pas vendre « 5 LLMs garantis » au contrat → « les principaux moteurs IA ».

---

### R7 — Citation drift trop important rend le tracking fiable

40-60 % de drift mensuel (chiffre Profound) : scores qui oscillent sans lien avec les actions du client → perte de confiance.

**Mitigations** : lissage sur fenêtre glissante (7-30 j) ; volume de prompts large (80+) pour réduire la variance ; pédagogie volatilité dès l'onboarding ; tendance > snapshot (dashboard focalisé évolution mensuelle) ; comparaison concurrents toujours présente (relativise).

---

### R8 — Mistral n'investit pas Le Chat à long terme

Mistral pivote enterprise pur, Le Chat grand public stagne, notre différenciateur perd de la valeur. (Note 2026-06 : rebranding « Le Chat → Vibe » suivi en veille, cf. article blog 2026-06-05.)

**Mitigations** : Le Chat = nice-to-have, pas le cœur (80 % de la valeur vient des 4 autres LLMs) ; pivot facile (retrait sans changer le produit, pitch « 5 LLMs majeurs ») ; si Mistral monte en B2B, les grands comptes valorisent toujours le tracking.

---

### R9 — Bug critique ou perte de données

Bug qui supprime des données client, crash 24 h, fuite.

**Mitigations** : backup quotidien auto + manuel hebdo (R2) ; disaster recovery testé tous les 2 mois ; tests E2E sur flows critiques avant release ✅ (Playwright en place) ; auto-review cool-down 1 h après commit ; Sentry + uptime alerts ✅ ; cyber-assurance dès M6 (~80-150 €/mois).

---

### R10 — Réglementation IA / scrap restrictif

Loi UE encadrant le prompting de masse, ou TOS LLM bloquant l'usage « monitoring ».

**Mitigations** : conformité TOS de chaque LLM (rate limits, usage policies) ; architecture compatible rate-limiting strict ; data minimization.

---

### R11 — Mamie SEO ne génère pas le trafic attendu

Le contenu GEO ne ranke pas, conversion faible.

> **Update 2026-06-11** : 17 articles publiés, SEO technique en place (canonicals, sitemap, llms.txt) — mais hard launch public pas encore fait, risque toujours ouvert fenêtre courte.

**Mitigations** : plan B paid dès M4 si organique en retard (LinkedIn Ads + Google Ads, CAC plus haut mais maîtrisable) ; outreach manuel intensifié ; co-marketing influenceurs SEO FR.

---

### R12 — Difficulté de closing agences

0-1 agence signée sur 90 jours malgré l'effort. Possible : cycles B2B FR longs (2-3 mois), décideurs prudents, Semrush installé.

**Mitigations** : pivot pricing agence 199 €/mois « introductoire » 6 mois ; webinars agences mensuels (vs trimestriels) ; co-vente avec une agence pilote (déléguer 50 % du closing contre revenus).

---

### R13 — Concurrent FR sort en parallèle

Autre solo founder ou agence FR sur le même créneau.

**Mitigations** : vitesse d'exécution ; audience éditoriale pré-existante ; personal brand Max (LinkedIn, transparence) ; option de s'allier plutôt que se concurrencer.

---

### R14 — Churn > 10% mensuel

LTV chute, modèle non viable. Causes possibles : produit pas sticky (consulté 1×/mois), ROI non démontré, UX confuse, bugs.

**Mitigations** : onboarding suivi (checklist post-signup, série email 7 j) ; quick wins early (score J1, suivi J7) ; customer success proactif (check-in 30/60 j sur Pro et Agence) ; exit survey systématique ; **pause plutôt que cancel** (pause 1-3 mois).

**Plan B** : pivot fonctionnel (alertes, Slack, intégrations) ; rebrand vers « audit one-shot + maintenance » plutôt qu'abonnement pur.

---

### R15 — Procès / problème juridique

Plainte client, attaque marque, plainte RGPD.

**Mitigations** : CGV/CGU par avocat (1 500-2 500 € one-shot) ; limitation de responsabilité dans les CGV ; DPA standard clients pro ; RC pro (~500-800 €/an) ; pas de marketing négatif nommant des marques concurrentes ; privacy by design dès J0.

---

### R16 — Dépassement plafond micro-entrepreneur

Statut EI/micro BIC services : plafond CA **~77 700 €/an** (seuil 2026, à confirmer chaque année). Au-delà : sortie du régime, TVA (rétroactive si non anticipée), réel simplifié.

> **Update 2026-05-16** — réévalué **imminent** : plan Solo 9,99 € multiplie les signups sans baisse proportionnelle du CA (ARPU blended ~110 €), audit-technique = lead magnet scalable → exposition réelle au dépassement **M6-M9**. Trajectoire conservatrice doc 04 (~70 K€ an 1) frôle le plafond ; base ou optimiste = dépassement certain M6-M9.

**Mitigations** : comptable expert dès J0 (~150 €/mois, budgété doc 04) ; suivi CA cumulé mensuel dans les KPI (doc 09) ; **bascule SAS/EURL planifiée M6-M9, en tout état de cause avant le seuil** ; Stripe Tax actif dès J0 (collecte déjà en place, déclaration à activer au passage SAS) ; provision bascule ~1 500-3 000 € (statuts, comptable de transition).

**Plan B** : régularisation TVA rétroactive via comptable + bascule en urgence (2-3 semaines de paperasse) ; communication transparente clients si re-facturation TVA.

---

## Conditions d'arrêt définies à l'avance

Pour éviter le sunk cost, conditions acceptées à l'avance.

À 6 mois, si **deux ou plus** de ces critères sont vrais :

- MRR < 4 K€
- 0 ou 1 agence en marque blanche
- Churn > 12% mensuel
- Burnout caractérisé (incapacité à travailler 2 semaines+)
- Cash réserve perso < 3 mois de coûts de vie

→ **Arrêt propre** avec :

1. Communication transparente aux clients : préavis 60 jours
2. Refund prorata
3. Export des données pour clients (CSV)
4. Vente éventuelle de l'asset domaine + audience à Peec / Profound / autre concurrent
5. Retex publié sur LinkedIn / blog (capital narratif)

À 12 mois, si **un** de ces critères est vrai :

- MRR < 12 K€
- Pas de croissance MoM > 10%

→ **Pivot ou arrêt** : décision documentée dans 09 avec ROI projection sur 6 mois si pivot.

---

## Risques personnels (Max)

### Cash personnel

- Réserve minimale 6 mois de vie courante avant 100 % SaaS
- Si réserve < 3 mois → retour automatique à 50 % freelance même si le MRR décolle
- Compagne salariée = filet partiel, à ne pas surcharger

### Santé mentale

- Trail maintenu 3-4 sessions/semaine ; vacances réelles 2 semaines/trimestre
- Suivi psy si baisse ; pas de travail le week-end sauf urgence

### Vie sociale

- 1-2 communautés de founders ; amitiés non-pro maintenues ; rituel TTRPG conservé

---

## Revue trimestrielle des risques

Tous les 3 mois, 1 h : relire ce document, mettre à jour la matrice probabilité × impact, logger les nouveaux risques dans 09, décider si un plan de contingence se déclenche.

→ Voir [08-roadmap-execution.md](./08-roadmap-execution.md) pour le calendrier des revues.
