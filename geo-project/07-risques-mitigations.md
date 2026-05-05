# 07 — Risques et mitigations

## Méthode d'évaluation

Chaque risque est noté sur 3 axes :

- **Probabilité** : Faible / Moyenne / Élevée
- **Impact** : Faible / Moyen / Élevé / Critique (= peut tuer le projet)
- **Fenêtre temporelle** : court (0-6 mois) / moyen (6-18 mois) / long (>18 mois)

---

## Matrice synthétique

| #   | Risque                                                             | Probabilité | Impact                   | Fenêtre     |
| --- | ------------------------------------------------------------------ | ----------- | ------------------------ | ----------- |
| R1  | Semrush / Ahrefs lancent un module GEO FR sérieux                  | Moyenne     | Élevé                    | Moyen       |
| R2  | Peec AI localise sérieusement en français                          | Élevée      | Élevé                    | Court-moyen |
| R3  | Coûts LLM augmentent ou volume hors budget                         | Moyenne     | Élevé                    | Continu     |
| R4  | Marché FR plus petit que prévu                                     | Moyenne     | Critique                 | Court       |
| R5  | Burnout / désengagement solo founder                               | Moyenne     | Critique                 | Continu     |
| R6  | LLM majeurs ferment ou changent leur API                           | Faible      | Élevé                    | Continu     |
| R7  | Citation drift trop important rend le tracking fiable              | Moyenne     | Moyen                    | Continu     |
| R8  | Mistral n'investit pas Le Chat à long terme                        | Faible      | Moyen                    | Long        |
| R9  | Bug critique ou perte de données                                   | Faible      | Critique                 | Continu     |
| R10 | Réglementation IA / scrap restrictif                               | Faible      | Élevé                    | Long        |
| R11 | Mamie SEO ne génère pas le trafic attendu                          | Moyenne     | Élevé                    | Court       |
| R12 | Difficulté de closing agences                                      | Moyenne     | Élevé                    | Court-moyen |
| R13 | Concurrent FR sort en parallèle                                    | Faible      | Moyen                    | Court-moyen |
| R14 | Churn > 10% mensuel                                                | Moyenne     | Critique                 | Court       |
| R15 | Procès / problème juridique                                        | Faible      | Élevé                    | Continu     |
| R16 | Dépassement plafond micro-entrepreneur (~77 700 €/an BIC services) | Élevée      | Critique si non anticipé | Court-moyen |

---

## Risques détaillés et mitigations

### R1 — Semrush / Ahrefs lancent un module GEO FR sérieux

**Description** : un acteur SEO global ajoute une fonctionnalité GEO native en français, intégrée à son outil que tous les SEO FR utilisent déjà.

**Pourquoi probable** : Semrush a déjà ~18% du marché GEO services et investit massivement. Ahrefs Brand Radar est en place. Le pivot natural est de lancer un module FR.

**Pourquoi pas catastrophique** :

- Leurs modules GEO restent généralistes, pas FR-natifs
- Pas de focus Le Chat / Mistral
- Surcouche d'un outil qui coûte déjà 500€/mois → trop pour les freelances/PME
- Ils ne feront pas de marque blanche pour agences

**Mitigations**

- Doubler la mise sur **Le Chat** comme différenciateur (Semrush ne le fera pas vite)
- Renforcer le **canal agence en marque blanche** où eux sont mal positionnés
- Garder un **pricing entry agressif** (€49) que Semrush ne peut pas matcher
- Construire **une marque éditoriale forte** (mamie-seo, newsletter, autorité éditoriale FR) qui ne se réplique pas par feature

**Plan B si concrétisation** :

- Pivot sur le segment agence en double-down (offre exclusive, accompagnement plus poussé)
- Acquisition payée par Semrush peu probable mais théoriquement option

---

### R2 — Peec AI localise sérieusement en français

**Description** : Peec AI (Berlin, $29M levés) sort une version 100% française avec UI traduite, tracking Mistral, support FR.

**Pourquoi très probable** :

- Peec a les moyens (cash + équipe)
- Marché FR est leur deuxième marché européen naturel
- Ils ont déjà une UI multilingue partielle
- Horizon réaliste : 6-12 mois

**Pourquoi pas catastrophique non plus** :

- Berlin reste Berlin : support, équipe, mindset US-EU mais pas FR
- Ils ne capturent pas le canal agence FR en marque blanche
- Pricing reste à €89 minimum (vs notre €49)

**Mitigations**

- **Vitesse** : capturer 100+ clients FR avant qu'ils n'arrivent
- **Lien personnel** : être présent SEO Camp, événements, communautés. Peec ne peut pas y être à notre place
- **Construire un avantage durable** sur le canal agence (relations, customisations, plugins)
- **Audience pré-existante mamie-seo** : eux n'ont pas

**Plan B si concrétisation** :

- Si Peec localise au mois 8-9, on doit avoir **au moins 50 clients fidèles** sinon on est en danger
- Arme nucléaire : baisser Starter à 29 € pour prix-killer
- Renforcer l'angle "made in France, pour les Français"

---

### R3 — Coûts LLM augmentent ou volume hors budget

**Description** : les coûts d'API LLM augmentent (rare), ou les volumes par client explosent et la marge fond.

**Risques précis** :

- Un client utilisant 100 prompts × 5 LLMs × jour, avec longues réponses, peut consommer 100€/mois en LLM seul → marge brute négative possible
- Bug d'un worker qui re-run 1000 fois un prompt = facture explose
- Modèles plus chers obligatoires (ex: GPT-5, Claude Opus 4.7) si la qualité l'exige

**Mitigations**

- **Hard caps par client** : max 200% du quota théorique = block et email
- **Caching agressif** entre clients (cf. doc 03)
- **Modèles low-cost pour le scoring** (Haiku, Mini)
- **Alertes internes** : si un client > 60% de marge consommée → notif Slack
- **Renégociation tarifaire** si nécessaire (les concurrents le feront aussi)
- **Batch API** quand disponible

**Plan B si concrétisation** :

- Reprice en hausse (annoncé 60 jours à l'avance), grandfather les anciens clients
- Limiter Pro à 50 prompts au lieu de 100
- Passer Le Chat à fréquence hebdo par défaut sur Pro (plus cher au token)

---

### R4 — Marché FR plus petit que prévu

**Description** : le marché GEO FR ne décolle pas comme attendu. Les SMB françaises ne paient pas, l'éducation marché traîne, on plafonne à 30-50 clients.

**Pourquoi possible** :

- Adoption IA en France plus lente qu'aux US
- TPE/PME françaises sensibles au prix mais aussi prudentes sur les nouvelles tech
- Cycle marketing FR plus long (B2B SaaS souvent 50-70% des montants US équivalents)

**Signaux d'alerte précoces** :

- Mois 3 : MRR < 1.5 K€ malgré effort marketing
- Mois 6 : moins de 20 clients payants
- NPS < 30
- Faible re-engagement (utilisateurs qui ne reviennent pas après le mois 1)

**Mitigations**

- **Internationalisation EU** dès mois 6 : version anglaise basique pour Allemagne, Pays-Bas, Belgique flamande
- **Étendre la cible** vers consultants marketing globaux et content strategists
- **Pivot product** : ajouter du content optimization (Scalenut-like) pour augmenter la valeur perçue

**Plan B si concrétisation** :

- Pivot vers offre service/consulting si SaaS ne marche pas (mais on a perdu 6-12 mois)
- Acquisition par Peec ou Profound (peu probable)

---

### R5 — Burnout / désengagement solo founder

**Description** : Max sort d'une fatigue freelance, rentre dans un autre tunnel, perd la motivation au mois 4-8.

**Pourquoi probable** :

- Les solo founders solo échouent souvent à cause de l'isolement, pas de la concurrence
- Les SaaS B2B ont un creux de motivation classique mois 3-6 (pas encore PMF clair, charge de travail max)
- Pression cash si freelance abandonné trop tôt

**Mitigations**

- **Garder 30-50% de freelance les 3 premiers mois** pour cashflow + variété
- **Communauté** : rejoindre 1-2 groupes de founders FR (Indie Hackers FR, founders AI Slack, FinTech Mafia France, etc.)
- **Ritual hebdo** : 1 appel par semaine avec un autre founder ou mentor
- **Sport / vie perso non-négociable** : trail running maintenu (atout existant)
- **Compagne au courant et alignée** sur les phases du projet
- **Documentation systématique** : si le moral baisse, le projet ne s'effondre pas en 1 jour
- **Milestone clairs** avec célébrations : 1er client payant, 1ère agence, 10 K€ MRR, etc.

**Plan B si concrétisation** :

- Pause de 2-4 semaines décrétée à l'avance si signaux faibles
- Recruter un cofondateur tech ou commercial dès le mois 6 si le moral chute
- Acceptation lucide d'un éventuel arrêt propre (vendre l'asset à Peec ou autre)

---

### R6 — LLM majeurs ferment ou changent leur API

**Description** : OpenAI durcit ses conditions, ferme l'API browse, augmente les prix, ou Mistral change de stratégie.

**Pourquoi peu probable** :

- Marché ouvert avec 5-7 acteurs majeurs
- Aucun n'a intérêt à fermer son API (revenus)
- Tendance globale : ouverture vs fermeture

**Mitigations**

- **Multi-LLM par design** : si 1 LLM coupe, les 4 autres tournent
- **Architecture découplée** : chaque LLM est un module remplaçable
- **Veille active** : monitorer changements TOS et SDK

**Plan B si concrétisation** :

- Communication transparente aux clients (réduction temporaire du score)
- Remplacer par modèle équivalent (Llama, Qwen, etc.)
- Ne pas vendre 5 LLMs en garanti dans le contrat → vendre "les principaux moteurs IA"

---

### R7 — Citation drift trop important rend le tracking fiable

**Description** : 40-60% de drift mensuel (chiffre Profound) signifie que les LLM sont volatiles. Un client peut voir son score osciller sans que ce soit dû à ses actions, et perdre confiance dans l'outil.

**Mitigations**

- **Lissage des scores sur fenêtre glissante** (7-30 jours) plutôt qu'instantané
- **Volume de prompts assez large** pour réduire la variance (80+ prompts)
- **Communication pédagogique** : expliquer la volatilité dès l'onboarding
- **Tendance > snapshot** : focus dashboard sur évolution mensuelle, pas absolu
- **Comparaison toujours présente** vs concurrents → relativise

---

### R8 — Mistral n'investit pas Le Chat à long terme

**Description** : Mistral pivot sur l'enterprise SaaS pur (à la OpenAI Enterprise), Le Chat grand public stagne, notre différenciateur "tracking Le Chat" perd de sa valeur.

**Mitigations**

- **Le Chat reste un nice-to-have, pas le cœur** : 80% de la valeur produit vient des 4 autres LLMs (ChatGPT, Claude, Perplexity, Gemini)
- **Pivot facile** : si Le Chat décline, on peut le retirer et insister sur "5 LLMs majeurs" sans changer le produit
- **Communiqué officiel à fournir** si Mistral monte en puissance B2B (les grands comptes peuvent toujours valoriser le tracking)

---

### R9 — Bug critique ou perte de données

**Description** : un bug supprime des données client, un crash dure 24h, fuite de données.

**Mitigations**

- Backup quotidien automatique + manual hebdo (R2)
- Disaster recovery testé tous les 2 mois
- Tests E2E sur les flows critiques avant chaque release
- Code review systématique (même solo : auto-review cool-down 1h après commit)
- Sentry + uptime alerts pour réaction rapide
- Cyber-assurance souscrite à partir du mois 6 (~80-150€/mois)

---

### R10 — Réglementation IA / scrap restrictif

**Description** : nouvelle loi UE encadre les usages de scraping LLM, on ne peut plus envoyer 100 prompts par jour sans accord explicite ; ou un LLM bloque les usages "monitoring" via leur TOS.

**Mitigations**

- **TOS conformité** : lire et respecter les TOS de chaque LLM (rate limits, usage policies)
- **Architecture compatible** avec rate-limiting strict
- **Data minimization** : ne stocker que ce qui est nécessaire, pas plus

---

### R11 — Mamie SEO ne génère pas le trafic attendu

**Description** : le pivot ne décolle pas, le contenu GEO ne ranque pas, conversion vers Mamie GEO faible.

**Mitigations**

- **Plan B paid** dès le mois 4 si organique en retard : LinkedIn Ads + Google Ads (CAC plus haut mais maîtrisable)
- **Outreach manuel** intensifié si funnel fail
- **Co-marketing** avec influenceurs SEO FR

---

### R12 — Difficulté de closing agences

**Description** : on signe 0 ou 1 agence sur 90 jours malgré l'effort. Le canal accélérateur ne s'active pas.

**Pourquoi possible** :

- Cycles de vente B2B FR longs (2-3 mois)
- Décideur agence prudent
- Concurrence Semrush déjà installée

**Mitigations**

- **Pivot pricing** : passer agence à 199€/mois "introductoire" pendant 6 mois
- **Webinar agences plus fréquents** : un par mois au lieu de trimestriel
- **Co-vente avec une agence pilote** : devenir partenaire d'une agence d'envergure pour leur déléguer 50% du closing en échange de revenus

---

### R13 — Concurrent FR sort en parallèle

**Description** : un autre solo founder ou une agence française sort un produit similaire sur le même créneau.

**Mitigations**

- Vitesse d'exécution
- Avantage mamie-seo (audience pré-existante)
- Personal brand Max (LinkedIn, transparence)
- Réflexion : peut-être qu'on se met ensemble plutôt que de se concurrencer

---

### R14 — Churn > 10% mensuel

**Description** : les clients partent rapidement, LTV chute, modèle non viable.

**Causes possibles** :

- Produit pas assez sticky (utilisateur consulte une fois par mois max)
- ROI pas démontré
- UX confusing
- Bugs

**Mitigations**

- **Onboarding suivi** : checklist post-signup, email serie de 7 jours
- **Quick wins early** : montrer un score le jour 1, suivi le jour 7
- **Customer success proactive** : check-in à 30 et 60 jours sur Pro et Agence
- **Exit survey** systématique : comprendre pourquoi
- **Pause plutôt que cancel** : option de "pause 1-3 mois" pour réduire les annulations définitives

**Plan B si concrétisation** :

- Pivot fonctionnel : ajouter ce qui manque (alertes, Slack, intégrations)
- Rebrand offre vers "audit one-shot" + "maintenance" plutôt que abonnement pur

---

### R15 — Procès / problème juridique

**Description** : un client porte plainte, un concurrent attaque pour usage de marque, plainte RGPD, etc.

**Mitigations**

- **CGV / CGU rédigés par avocat** (1500-2500€ one-shot)
- **Limitation de responsabilité** dans les CGV
- **DPA** standard pour les clients pro
- **Assurance responsabilité civile pro** (~500-800€/an)
- **Ne pas utiliser de noms de marques concurrentes en marketing négatif**
- **Privacy by design** dès J0

---

### R16 — Dépassement plafond micro-entrepreneur

**Description** : le statut EI / micro-entrepreneur en BIC services (catégorie
applicable au SaaS) a un plafond de chiffre d'affaires annuel de
**~77 700 €** (seuil 2026, à confirmer chaque année). Au-delà, sortie automatique
du régime, application de la TVA (même rétroactive si pas anticipée), et
fiscalité réelle simplifiée.

**Pourquoi probable** : trajectoire conservateur du doc 04 prévoit ~70 K€ de
revenus cumulés sur l'année 1, ce qui frôle le plafond. Trajectoire base ou
optimiste = dépassement certain entre M6 et M9.

**Mitigations**

- **Comptable expert dès J0** (forfait ~150 €/mois, déjà budgété doc 04)
- **Suivi CA cumulé mensuel** dans les KPI (doc 09 — ajouter ligne dédiée)
- **Bascule SAS/EURL planifiée** entre M6 et M9, en tout état de cause **avant**
  d'atteindre le seuil
- **Anticipation TVA** : Stripe Tax actif dès J0 → la collecte est déjà en place
  côté client, reste à activer la déclaration côté entreprise au passage SAS
- **Provisionner le coût de bascule** : ~1500-3000 € de frais (notaire, statuts,
  comptable de transition)

**Plan B si concrétisation imprévue** :

- Si on dépasse le plafond avant d'avoir basculé : régularisation TVA rétroactive
  via comptable, bascule en urgence (2-3 semaines de paperasse)
- Communication transparente clients si nécessité de re-facturer TVA

---

## Conditions d'arrêt définies à l'avance

Pour éviter le piège du sunk cost, voici les **conditions d'arrêt** acceptées à l'avance :

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

- Réserve minimale 6 mois de vie courante avant d'aller à 100% sur le SaaS
- Si réserve < 3 mois, retour automatique à 50% freelance même si MRR décolle
- Compagne salariée = filet de sécurité partiel mais à respecter (ne pas dépendre)

### Santé mentale

- Routine sport (trail) maintenue : 3-4 sessions/semaine
- Vacances réelles : 2 semaines par trimestre (vrai déconnect)
- Suivi possible en cas de baisse (psy si nécessaire)
- Limite week-ends : pas de travail samedi-dimanche sauf urgence

### Vie sociale

- Communauté de founders : entrer dans 1-2 groupes
- Maintien des amitiés non-pro
- TTRPG (intérêt existant) : maintenir le rituel

---

## Revue trimestrielle des risques

Tous les 3 mois, prendre 1h pour :

1. Relire ce document
2. Mettre à jour la matrice probabilité × impact
3. Logger les nouveaux risques émergents dans 09
4. Décider si un plan de contingence doit être déclenché

→ Voir [08-roadmap-execution.md](./08-roadmap-execution.md) pour le calendrier des revues.
