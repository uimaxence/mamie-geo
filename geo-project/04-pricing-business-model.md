# 04 — Pricing et business model

## Philosophie pricing

1. **Pricing transparent et public** — pas de "contact us" sauf Enterprise
2. **Sous Peec AI sur l'entrée de gamme** (€49 vs €89) pour démocratiser et capter freelances
3. **Marque blanche dès le tier Pro** (pas en addon) — différenciateur agence majeur
4. **Annuel à -15-20%** pour favoriser cashflow et réduire churn
5. **Pas de freemium permanent** — trial gratuit 14 jours sans carte requise, puis payant
6. **Pas de remises silencieuses** — annuel, ETI, education clairement affichés
7. **Pricing en EUR** sur le marché FR/EU, USD pour exports si besoin

---

## Stratégie freemium en 3 couches

Le freemium permanent dans le SaaS B2B early-stage est un piège classique : il attire des utilisateurs qui ne paient pas, alourdit le support, et coûte cher en LLM (1,50-5 €/mois par freemium même bridé). Profound, Peec et Goodie n'en proposent pas. Ils proposent des trials.

**Notre approche** : pas de tier gratuit dans l'app, mais un funnel free-to-paid intelligent en 3 couches qui sépare la valeur gratuite (média, lead magnet) de la valeur payante (SaaS récurrent).

### Couche 1 — mamie-geo.fr en média gratuit (blog + ressources)

Le blog (`/blog`), les articles, la newsletter, les guides téléchargeables, les études exclusives. C'est le **freemium éditorial**. Tout reste gratuit, indéfiniment. Cette couche existe pour acquérir l'attention et établir l'autorité, pas pour avoir des utilisateurs gratuits du SaaS.

`mamie-seo.fr` (sans trafic existant) est redirigé en 301 vers `mamie-geo.fr`. Tout le contenu vit sous le domaine principal.

→ Détail dans [06-activation-mamie-seo.md](./06-activation-mamie-seo.md).

### Couche 2 — outil "Test ma visibilité IA" en one-shot gratuit

Sur le site marketing, un outil web public :

- Email requis (pas de compte SaaS complet)
- L'utilisateur entre son domaine + 5 prompts
- L'outil lance 1 LLM (ChatGPT) avec recherche web
- Rapport délivré en 60 secondes : score, position, concurrents cités, sources
- CTA fin : "Voulez-vous le suivi quotidien sur 5 LLMs ? → Essayer Mamie GEO 14 jours"

**Économique** : ~$0.015 par audit. Cap à 100/jour = ~$45/mois maximum.

**Conversion attendue** : 5-10% des audits → trial → 15-25% en payant. Soit ~0,5-2,5% de l'audit gratuit en client final, ce qui est excellent.

C'est le **pont** entre le média gratuit et le SaaS payant. Il fait quasiment tout le travail d'acquisition.

### Couche 3 — trial 14 jours sans carte sur l'app

Le SaaS lui-même :

- 14 jours d'accès complet au plan **Pro** (le tier mid)
- Pas de carte bancaire requise à l'inscription
- Email J+3 et J+10 pour engagement
- Demande de carte au J+14 pour passer en payant
- Si pas de carte : downgrade en compte verrouillé (lecture seule des données collectées) avec relance email pendant 30 jours, puis suppression

**Pourquoi 14 jours et pas 7** : le tracking GEO n'a de valeur que dans la durée (citation drift). 7 jours n'est pas suffisant pour voir une évolution. 14 jours = 2 cycles de tracking quotidiens minimum.

**Pourquoi sans carte** : la friction d'inscription tombe à zéro, le funnel d'acquisition est plus large, et la perte de "trials qui n'ont jamais voulu payer" est compensée par le volume.

### Pas de couche freemium permanente dans le SaaS

Question récurrente : "Pourquoi pas un free tier dans le SaaS, genre 1 marque + 5 prompts + 1 LLM gratuit pour toujours ?"

**Réponses** :

- Coûts LLM réels même bridés : ~50-100 € de coût par 100 freemium = perte sèche
- Les freemium consomment du support comme des payants
- Conversion freemium → payant en B2B SaaS = 1-3% (très faible)
- Le lead magnet "Test ma visibilité IA" donne déjà la même valeur d'amorçage sans le coût récurrent
- Différenciation produit : ne pas dévaluer le payant en proposant trop en gratuit

**Si vraiment un free tier devient nécessaire** (par exemple pour répondre à une concurrence agressive de Peec qui passerait freemium), on l'ouvrira sous forme de "1 audit one-shot gratuit par mois sur l'outil web", **pas dans l'app**. Les deux espaces restent étanches.

### Note sur mamie-seo.fr

`mamie-seo.fr` n'ayant ni trafic ni autorité SEO valorisable, il est **redirigé en 301 vers `mamie-geo.fr`** dès J1. Tout l'effort de contenu et SEO se concentre sur le domaine unique. Pas de stratégie multi-domaines en V0.

---

## Grille tarifaire détaillée

### Plan Starter — 49 €/mois (ou 39 €/mois en annuel)

**Cible** : freelances, solopreneurs, TPE, premier essai

- 1 marque trackée
- 5 concurrents trackés
- 25 prompts trackés
- 5 LLMs : ChatGPT, Claude, Perplexity, Gemini, Le Chat
- Fréquence **hebdomadaire**
- Historique : **90 jours**
- Email hebdo + dashboard
- Export CSV
- 1 utilisateur
- Support : email, réponse < 48h

### Plan Pro — 149 €/mois (ou 119 €/mois en annuel)

**Cible** : PME avec marketing in-house, freelances avec plusieurs clients

- **3 marques** trackées
- 10 concurrents par marque
- **100 prompts** au total (peut être réparti)
- 5 LLMs (idem)
- Fréquence **quotidienne**
- Historique : **1 an**
- Notifications Slack / Discord
- Alertes automatiques (drop de score > 10%)
- Export CSV + JSON
- 3 utilisateurs
- Support : email + chat, réponse < 24h
- Module **AI-readiness audit** (à partir de V1, mois 4)

### Plan Agence — 399 €/mois (ou 319 €/mois en annuel)

**Cible** : agences SEO/marketing, consultants avec portefeuille clients

- **10 marques** trackées
- 10 concurrents / marque
- **300 prompts** au total
- 5 LLMs
- Fréquence quotidienne
- Historique : 1 an
- **Marque blanche complète** : logo personnalisé, sous-domaine custom (geo.agence-x.fr), couleurs personnalisées
- **Multi-workspaces** : un par client
- **Permissions granulaires** : viewers (clients) vs admins (agence)
- **Rapports PDF mensuels automatiques** envoyés à chaque client
- **Facturation centralisée**
- 10 utilisateurs
- Support : email + chat + onboarding 1h offert, réponse < 12h
- Audit module inclus

### Plan Enterprise — sur devis (à partir de 1 500 €/mois)

**Cible** : ETI / grands comptes / collectivités / banques

- Tout le plan Agence et plus
- Marques illimitées
- Prompts illimités
- LLMs sur demande (incluant tests internes Mistral, modèles spécifiques)
- Historique illimité
- **Hébergement EU dédié** (sur option)
- **SSO SAML / OIDC**
- **DPA personnalisé**, ISO 27001 (à viser pour 2027)
- **API illimitée**
- Account manager dédié
- SLA 99.5% avec pénalités
- Support : Slack Connect, réponse < 4h ouvrées

---

## Add-ons et options

| Option                                                   | Prix           |
| -------------------------------------------------------- | -------------- |
| Marque supplémentaire (Pro)                              | +29 €/mois     |
| Pack 100 prompts supplémentaires                         | +49 €/mois     |
| Tracking d'un LLM spécifique custom (ex: DeepSeek, Grok) | +99 €/mois     |
| Onboarding accompagné (1h Visio)                         | 149 € one-shot |
| Audit GEO complet sur mesure                             | 990 € one-shot |
| Formation équipe (2h Visio)                              | 590 €          |

---

## Réductions

- **Annuel** : -20% (cf. tableau)
- **Étudiants / étudiantes** : -50% sur Starter (avec preuve)
- **OSS / non-profit** : Starter gratuit pendant 12 mois
- **Affiliation agence partenaire** : 20% commission récurrente sur les clients référés (ne s'applique pas au plan Agence elle-même)

---

## Unit economics

### Coût d'acquisition (CAC) cible

| Canal                       | CAC cible | Note                                         |
| --------------------------- | --------- | -------------------------------------------- |
| Organique (mamie-seo + SEO) | 0-50 €    | Coût du temps de création de contenu réparti |
| LinkedIn outbound           | 80-150 €  | Quelques heures de prospection par signup    |
| Webinar / event             | 100-200 € | Coût d'organisation rapporté                 |
| Google Ads                  | 100-300 € | À tester ponctuellement                      |
| Affiliation                 | 30-100 €  | Selon commission                             |

### LTV cible

Calcul de référence pour le plan Pro (149 €/mois) :

- Churn mensuel cible : 5% (industrie SaaS B2B = 3-7%)
- LTV = ARPU / churn = 149 / 0.05 = **~2 980 €**

### Ratio LTV/CAC cible

- **> 3** = sain
- **5-10** = excellent
- < 3 = on creuse

### Marge brute par plan (après coûts LLM uniquement)

| Plan    | Prix  | Coût LLM/mois | Marge brute | %       |
| ------- | ----- | ------------- | ----------- | ------- |
| Starter | 49 €  | ~1.50 €       | 47.50 €     | **97%** |
| Pro     | 149 € | ~45 €         | 104 €       | **70%** |
| Agence  | 399 € | ~135 €        | 264 €       | **66%** |

### Marge brute après tous coûts variables

Ajout : Stripe (1.5% + 0.25€), Brevo (forfait absorbé), hébergement (réparti) :

| Plan    | Marge nette ~ |
| ------- | ------------- |
| Starter | ~93%          |
| Pro     | ~65%          |
| Agence  | ~62%          |

**Conclusion** : pricing tient si les hypothèses LLM sont vérifiées. Le Pro est le tier le plus risqué — à monitorer mensuellement.

---

## Projections financières

### Hypothèses de mix client

À l'équilibre (mois 12), répartition cible :

- 50% Starter
- 35% Pro
- 13% Agence
- 2% Enterprise

ARPU blended cible : ~140 €/mois

### Scénario conservateur — mois par mois

| Mois | Starter | Pro | Agence | Ent. | MRR      | Coûts variables | Marge contrib. |
| ---- | ------- | --- | ------ | ---- | -------- | --------------- | -------------- |
| M1   | 5       | 1   | 0      | 0    | 394 €    | 50 €            | 344 €          |
| M2   | 10      | 3   | 0      | 0    | 937 €    | 150 €           | 787 €          |
| M3   | 18      | 6   | 1      | 0    | 2 178 €  | 350 €           | 1 828 €        |
| M4   | 25      | 10  | 2      | 0    | 3 513 €  | 600 €           | 2 913 €        |
| M5   | 35      | 15  | 3      | 0    | 5 167 €  | 900 €           | 4 267 €        |
| M6   | 45      | 20  | 4      | 0    | 6 801 €  | 1 250 €         | 5 551 €        |
| M7   | 55      | 25  | 5      | 0    | 8 415 €  | 1 600 €         | 6 815 €        |
| M8   | 65      | 30  | 6      | 1    | 11 029 € | 2 000 €         | 9 029 €        |
| M9   | 75      | 35  | 7      | 1    | 12 633 € | 2 350 €         | 10 283 €       |
| M10  | 85      | 40  | 8      | 1    | 14 237 € | 2 700 €         | 11 537 €       |
| M11  | 95      | 45  | 9      | 2    | 17 351 € | 3 100 €         | 14 251 €       |
| M12  | 105     | 50  | 10     | 2    | 18 945 € | 3 450 €         | 15 495 €       |

**Résumé scénario conservateur** :

- MRR fin M12 : ~19 K€
- ARR fin M12 : ~227 K€
- Marge contributive M12 : ~15.5 K€/mois

### Scénario base (le plus probable)

Multiplier le scénario conservateur par 1.3 :

- MRR fin M12 : ~25 K€
- ARR fin M12 : ~300 K€
- Marge contributive M12 : ~20 K€/mois

### Scénario optimiste

Multiplier par 2 :

- MRR fin M12 : ~38 K€
- ARR fin M12 : ~456 K€
- Marge contributive M12 : ~30 K€/mois

---

## Coûts fixes mensuels (estimation solo)

| Poste                                | Coût mensuel                                           |
| ------------------------------------ | ------------------------------------------------------ |
| Vercel Pro                           | $20                                                    |
| Neon Postgres                        | 0 (free tier V0) puis $19 Pro                          |
| Queue (Postgres-based + Vercel Cron) | 0 en V0 ; migration Inngest $20 quand > 100K runs/mois |
| Sentry                               | Free → $26                                             |
| PostHog cloud                        | Free tier puis $0-50                                   |
| BetterStack                          | $10                                                    |
| Brevo                                | €19-69 selon volume                                    |
| Stripe                               | 0 (variable seulement)                                 |
| Domaine + emails Google Workspace    | $30                                                    |
| Outils dev (Cursor, GitHub)          | $50                                                    |
| Comptable expert (mensuel forfait)   | €150                                                   |
| Total approximatif                   | **~€350-600**                                          |

À ajouter pour année 1 :

- Outils marketing (Buffer, Notion, Figma, ConvertKit) : ~50€/mois
- Eventuellement budget pub : variable
- Frais juridiques setup CGV/CGU : 800-1500€ one-shot

---

## P&L simplifié année 1 (scénario conservateur)

| Poste                                   | Année 1                             |
| --------------------------------------- | ----------------------------------- |
| **Revenus (MRR cumulé annualisé)**      | ~ 70 000 €                          |
| Coûts variables (LLM, Stripe, Brevo)    | ~ 14 000 €                          |
| Coûts fixes (infra, outils, compta)     | ~ 6 000 €                           |
| Coûts setup (juridique, design, naming) | ~ 3 000 €                           |
| **Marge avant rémunération**            | **~ 47 000 €**                      |
| Rémunération solo (à dégager)           | 0-30 000 € (selon montée en charge) |

→ Si Max s'octroie 30 K€ de rémunération sur l'année 1, il reste ~17 K€ de réserve pour réinvestir.
→ Si en parallèle il garde 30-50% de freelance, le cash personnel est sécurisé (60-90 K€ supplémentaires).

---

## Stratégie d'upsell

### Du Starter vers Pro

- Trigger : utilisateur atteint 80% de ses prompts ou consulte plusieurs marques
- Email automatique : "Votre tracking semble décollé, passez à Pro pour 3 marques + tracking quotidien"
- Conversion cible : 15-25% des Starter en 3 mois

### Du Pro vers Agence

- Trigger : utilisateur ajoute plus de 2 marques externes (ses clients)
- Email + appel : "Vous gérez plusieurs marques, le plan Agence vous donne accès à la marque blanche"
- Conversion cible : 20% des Pro multi-marques

### Du Agence vers Enterprise

- Trigger : agence atteint 8+ workspaces ou demande SSO / API
- Touch commercial direct (Max au téléphone)
- Cible : 1-2 conversions / an en année 1, croissant

---

## Analyse de sensibilité

### Si le coût LLM moyen est 2x plus élevé que prévu

| Plan    | Coût LLM | Marge nette       |
| ------- | -------- | ----------------- |
| Starter | 3 €      | 94% (OK)          |
| Pro     | 90 €     | 40% (limite)      |
| Agence  | 270 €    | 32% (insuffisant) |

→ **Action** : reprice Agence à 599€ ou cap usage à 200 prompts.

### Si le churn est 10% au lieu de 5%

LTV / 2 → ratio LTV/CAC tombe à 1.5 → modèle non viable.
→ **Action** : prioriser absolument le NPS et la rétention en V0.

### Si l'acquisition organique mamie-seo ne décolle pas

Plan B : LinkedIn outbound + paid Google Ads (CAC 200-400€)
→ marges suffisantes pour absorber, mais cashflow plus tendu

---

## Décisions de pricing à figer

À trancher avant ouverture des inscriptions, à logger dans 09 :

- [ ] Prix exact entrée Starter (49€ vs 39€ vs 59€)
- [ ] Trial gratuit : 7 ou 14 jours
- [ ] Carte requise au trial : oui ou non
- [ ] Annuel discount : 15%, 20% ou 25%
- [ ] Plan gratuit permanent : oui (rapport one-shot par mois) ou non
- [ ] Stripe Tax oui/non dès J0
- [ ] Pricing page A/B test : tester 2 versions différentes en sprint 1

→ Voir [05-go-to-market.md](./05-go-to-market.md) pour activer ces tarifs sur le marché.
