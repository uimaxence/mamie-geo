# 10 — Direction artistique et design

## Pourquoi ce document

L'enjeu : sortir du look "fait par une IA" qui caractérise 80% des SaaS lancés en 2025-2026 (gradient violet/bleu, illustrations 3D Stripe-like, "Trusted by 1000+", composants shadcn par défaut, ton corporate vide). Mamie GEO doit avoir une identité **éditoriale, française, humaine et honnête** — proche de ce que font des projets comme MeetSponsors ou Taap Radar.

Ce doc définit la direction artistique, les patterns obligatoires, les anti-patterns, et donne 3 directions concrètes pour trancher.

---

## Principes anti-IA

Les 8 règles non-négociables pour ne pas avoir l'air "généré".

### 1. Pas de gradient violet/bleu en hero

Le gradient `from-purple-600 to-blue-600` est devenu LE marqueur "AI startup". À bannir. Si gradient, alors couleurs chaudes (terracotta, ocre) ou monochrome subtil.

### 2. Voix personnelle, pas corporate

Pas "Empower your brand with cutting-edge AI visibility solutions". Plutôt "Sache enfin si ChatGPT parle de toi". Tutoiement par défaut. Vocabulaire concret.

### 3. Founder visible

Photo de Max, signature personnelle, histoire "pourquoi j'ai fait ça". Une page À propos qui se lit comme un post LinkedIn long, pas comme une notice d'entreprise. C'est l'arme imparable contre Profound et Peec.

### 4. Captures d'écran réelles, pas illustrations 3D

Le dashboard doit être présent visuellement, avec données réalistes (anonymisées). Zéro illustration 3D abstraite. Si on a besoin de visuel, illustration à la main par un illustrateur (200-500€ pour 5 pièces) ou laisser les UI screenshots porter le récit.

### 5. Typographie avec du caractère

Pas Inter par défaut. Mix serif/sans, ou un sans inhabituel (GT Walsheim, Söhne, Söhne Mono pour les nombres, Tiempos Headline pour les titres, Editorial New, ABC Diatype). C'est ce qui transforme un site "OK" en site "memorable".

### 6. Pattern "Sans nous / Avec nous"

La section deux colonnes (frustrations à gauche, solutions à droite) est obligatoire. Difficile à générer en mode AI slop, hyper convertissante, et ancre le ton honnête.

### 7. Définir activement ce qu'on n'est PAS

"Mamie GEO n'est pas Profound. Mamie GEO n'est pas Semrush." Une section dédiée, courte, claire. C'est exactement l'inverse de l'IA qui ne dit jamais ce qu'elle n'est pas. MeetSponsors le fait bien avec "MeetSponsors n'est pas une marketplace".

### 8. Imperfection volontaire

Une rotation légère sur une carte, un texte manuscrit sur un screenshot, une faute orthographique en italique de second degré. Les détails imparfaits signent l'humain.

---

## Analyse rapide des 2 références

### MeetSponsors

**Ce qu'on garde** :

- Hero avec headline qui surprend ("Tu es éligible pour des sponsors que tu ne connais même pas")
- Sous-titre qui explique la valeur de manière concrète, pas abstraite
- Section "Sans / Avec" puissante (croix rouges vs check verts avec phrases concrètes)
- Mockup UI réaliste avec personnage (Benjamin avec ses 24K abonnés) plutôt qu'illustration générique
- Section "Hey, c'est Benjamin 👋" avec photo + histoire personnelle
- Disclaimer fort : "MeetSponsors n'est pas une marketplace. On ne prend pas de commission."
- Tarification mensuelle/annuelle avec switch et économie -20% affichée
- FAQ extensive et honnête (incluant "Et si je ne suis pas satisfait ?")
- Tutoiement français punchy ("Spoiler : ils viendront pas")

**Ce qu'on n'imite pas** :

- Le côté un peu YouTube/streamer dans le ton (notre cible est plus sérieuse : freelances SEO, CMO PME, agences)
- Les emojis trop fréquents

### Taap Radar

Le site est en JS-rendered, le contenu textuel n'est pas accessible directement. Mais d'expérience générale Taap a une esthétique :

- Très claire, beaucoup de blanc
- Charts et graphes mis en avant (pertinent pour analytics)
- Typo distinctive (sans-serif géométrique custom)
- Couleurs sobres avec un accent bleu marine ou pétrole
- Layout aéré, moderne, pas surchargé

→ À aller voir en navigateur pour mood board réel avant le brief design.

---

## 3 directions artistiques au choix

### Direction A — Éditorial chaud (recommandée)

**Mood**: New York Magazine, The Browser, Are.na, Mubi. Esprit "magazine intelligent" qui parle à un lecteur adulte.

**Palette**:

- Fond crème : `#FAF7F2` (pas blanc froid)
- Texte principal : `#1A1A1A` (noir doux, pas pur)
- Accent terracotta : `#C5532E` (boutons, liens, hover)
- Accent jaune moutarde : `#D4A53A` (badges, surlignage)
- Gris chaud secondaire : `#8C8579`

**Typographie**:

- Titres : **Tiempos Headline** (serif éditorial) — payant ~250$, ou alternative gratuite : **Source Serif Pro** ou **Newsreader**
- Corps : **GT Walsheim** ou **Söhne** (payant) — alternative gratuite : **Inter** mais avec tracking serré et weights précis (300, 500, 700)
- Numbers / data : **Söhne Mono** ou **JetBrains Mono**

**Personnalité**:

- Chaud, humain, rétro-moderne
- Mamie GEO → mamie qui s'y connaît, pas mamie ringarde
- Honneur la tradition éditoriale française (Libération, Le 1, Society)

**Pourquoi recommandé** :

- Cohérent avec naming Mamie GEO (chaleur, France, tradition)
- Très différenciant : aucun concurrent SaaS GEO ne va dans cette direction
- Évoque le sérieux éditorial qui rend crédible les chiffres et études qu'on publiera

### Direction B — Souverain français

**Mood** : DSFR (système de design État français), refonte récente Mistral AI, journal Le Monde digital. Esprit "fierté discrète française".

**Palette**:

- Fond blanc cassé : `#F8F8F8`
- Bleu Marianne : `#000091`
- Rouge Marianne (ponctuel) : `#E1000F`
- Texte : `#161616`
- Gris : `#666666`

**Typographie**:

- Titres et corps : **Marianne** (libre, créée pour l'État FR) — gratuite
- Mono : **JetBrains Mono**

**Personnalité** :

- Institutionnel mais frais
- "Made in France" assumé sans cocorico
- Crédibilité immédiate pour cibles publiques, banques, secteur souveraineté

**Pourquoi en option B**:

- Très bon pour cible Enterprise/souveraineté (Marc, persona 4)
- Légèrement risqué : peut paraître froid pour cible freelance/PME
- Économique (police gratuite officielle)

### Direction C — Studio indie chaleureux

**Mood** : Linear, Cron, Tally, Rauno's site, Raycast. Esprit "indie SaaS qui maîtrise son art".

**Palette**:

- Fond crème : `#F5F4EE`
- Graphite : `#222020`
- Vert sapin : `#1B4332`
- Accent sable : `#D4B996`

**Typographie**:

- Titres : **GT America** ou **Söhne**
- Corps : idem ou **Geist**
- Mono : **Geist Mono**

**Personnalité**:

- Minimal mais tiède, pas glacial
- Soigné, "petit studio qui pense à tout"

**Risque** : devient un Linear-clone si pas exécuté finement. Plus dur à différencier.

---

## Recommandation et choix

**Direction A — Éditorial chaud** est la meilleure option pour :

- Le naming "Mamie GEO" qui évoque la chaleur/transmission
- Le différentiateur fort vs concurrents tech-froids US
- L'angle éditorial qui sera porté par le blog mamie-seo et les études publiées
- Le persona Sophie/Aline qui apprécie la personnalité

**Hybridation possible** : prendre la base Direction A et garder un angle B ponctuel (badge "Made in France" discret, mention hébergement EU avec petit drapeau) pour récupérer l'angle souveraineté sans tomber dans le cocorico.

→ **Décision à acter dans 09-decisions-journal.md**.

---

## Composants et patterns obligatoires

### Hero (page d'accueil)

Structure :

```
[Headline punchy 6-10 mots]
"Sache enfin si ChatGPT parle de toi (et tes concurrents)"

[Sous-titre concret]
"Mamie GEO mesure quotidiennement la visibilité de ta marque dans
ChatGPT, Claude, Perplexity, Gemini et Le Chat de Mistral.
Le tout en français, hébergé en France, à partir de 49€/mois."

[CTA principal]
"Tester gratuitement →"

[Sous-CTA]
"Sans carte bancaire · 14 jours d'essai · 5 minutes pour s'inscrire"

[Visuel : screenshot du dashboard avec données réalistes]
```

### Section "Sans Mamie GEO / Avec Mamie GEO"

Layout 2 colonnes. Croix rouges à gauche, check verts à droite.

**Sans Mamie GEO**:

- ❌ Tu écris du contenu sans savoir si l'IA le voit
- ❌ Tes clients te demandent "et pour ChatGPT ?" et tu hausses les épaules
- ❌ Tu paies Profound 500$/mois pour un outil 100% anglais qui ne tracke pas Le Chat
- ❌ Tu fais des audits manuels prompt par prompt qui te prennent 4h
- ❌ Tu découvres qu'un concurrent a percé dans les IA quand il est trop tard
- ❌ Tu n'as aucun rapport pro à montrer à ton client ou ton boss

**Avec Mamie GEO**:

- ✅ Score de visibilité IA quotidien sur 5 moteurs dont Le Chat
- ✅ Comparaison directe avec tes 5 concurrents principaux
- ✅ Rapports automatiques en marque blanche pour tes clients (plan Agence)
- ✅ Recommandations actionnables : voilà ce qui manque pour être cité
- ✅ Alertes quand ton score chute ou qu'un concurrent te dépasse
- ✅ Le tout en français, hébergé en France, à 49€/mois

### Section "Comment ça marche" en 3 étapes

Avec mockups réalistes ou screenshots :

1. **Ajoute ta marque et tes concurrents** (30 secondes)
2. **Mamie GEO génère 25 prompts pertinents** (auto, IA)
3. **Reçois ton premier rapport en 10 minutes** (et ensuite chaque jour)

### Section "Pour qui c'est"

Cards avec les 3 personas principaux :

- Le freelance SEO (Sophie)
- L'équipe marketing PME (Thomas)
- L'agence en marque blanche (Aline)

Chaque card : photo persona + 1 phrase bénéfice + lien vers cas d'usage.

### Section "Mamie GEO n'est pas..."

Important pour éviter la confusion concurrentielle :

> **Mamie GEO n'est pas un outil SEO classique.**
> On ne fait pas de recherche de mots-clés Google, ni d'analyse de backlinks. Pour ça, Semrush et Ahrefs sont meilleurs et installés.
>
> **Mamie GEO n'est pas un générateur de contenu.**
> On ne va pas écrire ton article à ta place. On te dit ce qui manque pour être cité, pas comment l'écrire.
>
> **Mamie GEO n'est pas Profound.**
> Si tu as 500$/mois et que tu veux du Fortune 1000 grade avec 8 LLMs et SOC 2 Type II, va chez eux. Nous on cible les freelances et PME francophones avec un rapport qualité/prix imbattable.

### Section "Hey, c'est Max 👋"

Page À propos qui doit être :

- Photo réelle de Max
- Histoire personnelle (freelance qui en a marre, pourquoi le GEO, pourquoi en français)
- Liens : LinkedIn, X, blog mamie-seo
- Liste des "engagements" : pas d'ads en V0, pas de levée de fonds avant validation, hébergement EU, pricing transparent

### Pricing page

- Switch mensuel/annuel avec affichage économie -20%
- 3 plans en cards : Starter / Pro / Agence
- Badge "Le plus populaire" sur Pro
- Tableau comparatif détaillé en bas (toggle "Voir tous les détails")
- FAQ pricing en bas (8-10 questions)
- CTA Enterprise discret en fin de page

### FAQ

Au moins 12 questions, dont :

- "Quels LLMs sont trackés ?"
- "Le Chat de Mistral est inclus dans tous les plans ?"
- "Vous trackez les AI Overviews de Google ?"
- "Comment vous comparez aux outils américains comme Profound ?"
- "Mes données sont stockées où ?"
- "RGPD et conformité ?"
- "Je peux annuler à tout moment ?"
- "Vous proposez de la marque blanche ?"
- "Et si je ne suis pas satisfait ?"
- "Vous proposez des essais gratuits ?"
- "C'est compliqué à utiliser ?"
- "Pour qui c'est fait ?"

### Footer

- Logo + tagline courte
- 3 colonnes : Produit / Ressources / Légal
- Newsletter Mamie GEO inscription
- Liens réseaux sociaux (LinkedIn Max, X, blog)
- Mention discrète "Fait avec ❤️ en Maine-et-Loire" ou équivalent

---

## Anti-patterns à bannir

### Visuels

- ❌ Hero gradient violet/bleu
- ❌ Illustrations 3D abstraites (style Stripe / Pitch.com)
- ❌ Images stock business
- ❌ Logos "Trusted by" en V0 (on n'a pas encore les logos crédibles)
- ❌ Photo equipo sourire forcé
- ❌ Mockup laptop générique flottant dans l'espace
- ❌ Cards avec ombre douce identiques alignées en grille de 6

### Copy

- ❌ "Empower your brand"
- ❌ "Cutting-edge AI"
- ❌ "Seamless integration"
- ❌ "Leverage the power of"
- ❌ "Unlock your potential"
- ❌ "Best-in-class"
- ❌ "Game-changing"
- ❌ "Revolutionary"
- ❌ "Boost your X with AI"

### Structure

- ❌ Hero avec 3 colonnes "Fast / Reliable / Easy"
- ❌ Section avec 4 icônes Lucide identiques
- ❌ Trust banner "Comme vu dans" sans réelles mentions
- ❌ Témoignages génériques type "Game-changer for our team!"
- ❌ Pricing avec une seule CTA "Get started" sur les 3 plans
- ❌ Footer chargé avec 50 liens

---

## Stack technique du marketing site

### Décision : tout en mono-repo Next.js (cf. doc 03)

Le site marketing, le blog et l'app SaaS sont **dans la même app Next.js**, séparés par des route groups (`(marketing)`, `(blog)`, `(app)`).

**Pourquoi pas Framer en V0** :

- Solo founder = un seul projet à maintenir
- Cohérence visuelle native entre marketing et app (mêmes composants UI)
- Pas de double gestion de design system
- Coût : 0 supplémentaire (Vercel Pro $20/mo pour tout)

**Comment éviter le look "fait par un dev" malgré tout** :

- Direction artistique forte (cf. plus haut, direction A recommandée)
- Composants UI customisés en profondeur (pas shadcn par défaut)
- Typographie premium ou choix non-évident
- Typographie + couleurs + espacement définis comme **design tokens** dans Tailwind config (variables CSS, utilities personnalisées)
- Templates marketing premium achetés en option pour démarrage rapide (ex: Cosmos, Onceui — 79-200$ one-shot)
- Animations fines via Framer Motion (lib npm, pas l'outil) ou Motion One

**Si plus tard refonte marketing nécessaire** : possibilité de migrer le marketing seul vers Framer ou Astro, mais c'est un problème de mois 12+, pas de V0.

---

## Mood board textuel et références

### Sites à étudier en profondeur

| Site                                      | Pourquoi                                                      |
| ----------------------------------------- | ------------------------------------------------------------- |
| MeetSponsors.com                          | Voix française punchy, structure "Sans/Avec", founder visible |
| Linear.app                                | Typographie + animation détails                               |
| Tally.so                                  | Indie indie qui se voit, pas corporate                        |
| Cron.com (avant Notion)                   | Editorial dans un produit tech                                |
| Are.na                                    | Pour la chaleur visuelle anti-tech                            |
| Newsletter Stack (newsletter de Substack) | Editorial typo                                                |
| Frenchies.io                              | Tone français pour SaaS                                       |
| Lemonade insurance                        | Pour le ton humain en assurance (sortir de la grise)          |
| Hey.com                                   | Pour les sections "Sans/Avec" très tranchées                  |

### Marques à observer

| Marque                     | Élément à voler                           |
| -------------------------- | ----------------------------------------- |
| The Browser Company (Arc)  | Typographie soignée + voix                |
| Pitch.com                  | Layout magazine, mais sans tomber dans 3D |
| Vercel (avant tout récent) | Cleanness mais on en sort                 |
| Claude (Anthropic)         | Le serif headline + l'orange terracotta   |
| Mistral AI                 | Souveraineté française moderne            |

### Magazines / éditorial papier

- Society
- Le 1
- The Gentlewoman
- Smith Journal

---

## Plan d'exécution design

### Avant le code (2-3 jours)

- [ ] Trancher la direction A/B/C
- [ ] Acheter ou choisir polices définitives
- [ ] Wireframes Figma des 5 pages clés (home, pricing, à propos, blog, dashboard)
- [ ] Design system minimal : couleurs, typo, espacement, shadow, border-radius
- [ ] 5 composants UI : button, input, card, badge, table

### Sprint 1 (semaines 1-2)

- [ ] Site marketing en Framer ou template Next.js : home + pricing
- [ ] Design système dans le SaaS (shadcn customisé avec nos tokens)
- [ ] Onboarding wizard designé

### Sprint 2 (semaines 3-4)

- [ ] Dashboard principal designé
- [ ] Vue détaillée prompt
- [ ] Page paramètres / facturation

### Avant lancement public (mois 4)

- [ ] Refacto visuel basé sur retours beta
- [ ] Page À propos avec photo + histoire
- [ ] FAQ complète
- [ ] Page comparatifs vs concurrents (Profound, Peec)
- [ ] Page cas d'usage par persona (3 pages)

---

## Budget design

| Poste                                          | Coût                                   |
| ---------------------------------------------- | -------------------------------------- |
| Polices premium (Tiempos + GT Walsheim)        | 0-500€ (selon choix gratuit ou payant) |
| Template marketing Next.js premium (optionnel) | 79-200$ one-shot                       |
| Illustrations à la main (5 pièces)             | 200-500€ one-shot                      |
| Photo Max pro (séance studio)                  | 150-300€                               |
| **Total an 1**                                 | **~500-1500€**                         |

C'est un budget raisonnable qui change radicalement la perception du produit.

---

## Pièges à éviter dans l'exécution

1. **Bikeshedding sur le design pendant 2 semaines**. Trancher en 2-3 jours max, itérer ensuite avec data utilisateur.
2. **Recopier servilement MeetSponsors**. Inspiration ≠ clone. Garder ses propres patterns identitaires.
3. **Surcharger la page d'accueil**. Pas plus de 8 sections : Hero, Sans/Avec, Comment ça marche, Pour qui, Démo/Visu, Pricing teaser, Founder, FAQ, Footer.
4. **Oublier le dark mode**. À implémenter dès V0 sur le SaaS, optionnel sur marketing. C'est attendu en 2026.
5. **Faire faire le design par une IA**. Génératif type v0 ou bolt en V0 pour itérer ok, mais le rendu final doit passer entre des mains humaines. C'est précisément ce qu'on veut éviter.

---

## Décisions design à acter

À mettre dans 09-decisions-journal.md :

- [ ] **Direction artistique** : ☐ A (éditorial chaud) ☐ B (souverain) ☐ C (studio indie) → choix : \_\_\_
- [ ] **Polices premium ou gratuites** : ☐ Premium (~500€) ☐ Gratuites (Source Serif + Inter) → choix : \_\_\_
- [ ] **Template Next.js premium** : ☐ Achat (79-200$) ☐ From scratch → choix : \_\_\_
- [ ] **Illustrations** : ☐ Achat 5 pièces illustrateur ☐ Pas d'illustrations (UI screenshots only) → choix : \_\_\_
- [ ] **Mascotte mamie** : ☐ Oui (visuelle) ☐ Non (juste le nom) → choix : \_\_\_

→ Voir [03-architecture-technique.md](./03-architecture-technique.md) pour les décisions techniques verrouillées.
→ Voir [09-decisions-journal.md](./09-decisions-journal.md) pour le suivi des choix.
