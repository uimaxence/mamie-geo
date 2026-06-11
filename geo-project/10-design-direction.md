# 10 — Direction artistique et design

## ⚠️ Direction actée (mise à jour 2026-05-11) — Airbnb-like minimaliste, refs designme.agency + taap.it

> Cette section **supersede** les Directions A/B/C explorées plus bas (archive).
> Pivot global acté le 2026-05-07, raffinement visuel ancré sur designme.agency + taap.it/fr/radar le 2026-05-11.
> Détail dans `09-decisions-journal.md` § 2026-05-07 (pivot UI) + § 2026-05-11 (refs designme/taap).

**Refs visuelles ancrées** : `https://www.designme.agency/` et `https://taap.it/fr/radar`.

**Mood** : airbnb.com, designme.agency, taap.it, sites studio premium minimalistes.

**Règles dures** :

- Fond **gris doux `#fafafa`** sur `body` (2026-05-22, cf. doc 09). Les surfaces qui doivent émerger (cards, sidebar, topbar, tables, items, dialogs) restent en `bg-white` `#FFFFFF`. Jamais d'autre teinte que ce gris/blanc (pas de crème, pas de bleu, pas de gradient pour le fond global).
- Couleurs principales : **nuances de gris uniquement** (gray-50 → gray-950, alignées Tailwind v4).
- **Une seule police** : **Inter** via `next/font/google` (weights 400/500/600/700). Pas de serif, pas de mono, pas de seconde famille. Glyphs alternatifs via `font-feature-settings: "cv11", "ss01", "tnum"`.
- **Pas d'italique** (ni en CSS, ni dans les balises `<em>` qui sont neutralisées en `font-style: normal`).
- **Accent bleu brand `#329CFF`** (couleur du logo, actée 2026-06-03 en remplacement du terracotta `#C5532E`) — liens, badges ponctuels, highlights data dans les charts. Le CTA principal reste **noir plein** (langage designme/taap). Jamais en fond large.

**Hiérarchie typographique** (cf. `src/app/globals.css` classes `.type-*`) : portée par taille + weight + letter-spacing. Display 600 / -0.03em, h1 600 / -0.025em, body 1rem leading 1.55.

**Composants** :

- **Boutons** : tous en **`rounded-pill`**. Variant `primary` (**noir plein**, CTA principal), `secondary` (blanc + bordure gris-300, hover gris-50), `ghost` (transparent, hover gris-100). Variant `accent` (bleu plein) conservé pour cas marginaux décoratifs, jamais CTA principal.
- **Cards** : fond blanc, bordure 1px `gray-200`, **radius `xl` (12px depuis 2026-06-09, était 20px)**, pas d'ombre par défaut. Padding interne généreux (`px-6 py-6`).
- **Sections** : composant `<Section variant="default" | "tinted">` pour alterner fond blanc et fond `gray-50`. Crée le rythme visuel sans cards inutiles.
- **Badges** : fond `gray-100` neutre par défaut. Variants light bg pour status (success/warning/error). Variant `accent` (bleu brand très faible `#eaf4ff`) pour ponctuel (badge plan, badge beta).
- **Inputs** : bordure `gray-300`, focus ring noir sobre, radius `md` (6px depuis 2026-06-09, était 10px).
- **Échelle de border-radius** (resserrée 2026-06-09, cf. doc 09) : `sm 4px · md 6px · lg 8px · xl 12px · pill 9999px`. Tokens `--radius-*` dans `globals.css`. Avant : `6 / 10 / 16 / 20`. Rendu plus net/technique (Linear, Vercel) — l'app paraissait trop « molle ». Boutons restent `pill`.
- **Visualisation de score** (3 primitifs `src/components/ui/`, posés 2026-06-09, réutilisables dashboard) :
  - `<ScoreRing value size strokeWidth suffix />` — anneau SVG, chiffre coloré au centre, arc animé 0→valeur au montage. Couleur via `scoreColor()` (`src/lib/audit/score.ts`, seuils ≥80 vert / ≥60 ambre / <60 rouge).
  - `<SegmentBar segments={[{value, tone, label}]} />` — barre proportionnelle segmentée. Tones `critical | warning | success | neutral`.
  - `<ScoreBar label value hint />` — sous-score : label + chiffre coloré + barre de progression + légende.
- **Touches « fancy »** à envisager pour PR 8+ : frame monitor cross hairs corners pour screenshots dashboard, timecodes décoratifs en footer, speech bubbles dessinées (taap).

### Patterns de personnalité (update 2026-05-11 — refs Mobbin/Dribbble)

Pour éviter le « trop plat », 4 patterns disponibles. À utiliser **sobrement** (pas tous sur la même page) :

1. **Palette pastel pour badges colorés** — 6 tons (`blue`, `green`, `orange`, `purple`, `pink`, `yellow`) avec fond très light + texte saturé. Pour catégoriser (logos LLMs, types de prompt, catégories blog), ponctuer (étapes workflow). Jamais pour CTA.
2. **`<StatusDot tone="..." pulse>`** — cercle 8px coloré avec halo léger (`--glow-*`), optionnellement pulsé. Pour signaler le live : "Beta active", "Run en cours", "Provider en ligne".
3. **`<CornerFrame>`** — wrapper qui pose 4 cross-hairs aux coins. Signature « print éditorial » sur 1-2 éléments par page max (hero, showcase screenshot).
4. **Mix-weight dans les titres** — `<strong>` pour emphase un mot clé du headline (ex : « Sache enfin si **ChatGPT** parle de toi. »).

Icônes : **`lucide-react`** (tree-shake natif, imports nommés).

### ~~Pattern signature damier~~ — RETIRÉ 2026-05-22

> ⚠️ **Abandonné, cf. doc 09 § 2026-05-22.** Pattern damier (acté 2026-05-18) retiré après 4 itérations infructueuses sur `/login`. Supprimés : `<PatternBlock>`/`<PatternBand>`, classes `.bg-pattern*`, assets `pattern.svg`, 3 usages site + 2 emails. Identité visuelle = logo + bleu brand `#329cff` + `<CornerFrame>` + favicon brand top bar. **À ne pas ré-introduire** sans validation explicite.

### Patterns dashboard (update 2026-05-12 — refs screens partagés par Max)

Quatre patterns pour les pages applicatives. Inspiration : Linear / Stripe Sigma / Posthog.

1. **Stat enrichie** (`<Stat icon iconTone delta />`, `src/components/ui/stat.tsx`) : eyebrow label haut gauche · cercle pastel + icône Lucide haut droite · grand chiffre (type-stat 2.25rem weight 600) · ligne delta dessous (flèche `TrendingUp`/`TrendingDown` + % signé coloré vert >0 / rouge <0 / gris =0 + période SMALL CAPS muted « VS J-7 »). `iconTone` : 8 valeurs (`blue`, `green`, `orange`, `purple`, `pink`, `yellow`, `accent`, `neutral`), choix sémantique. Fallback sans delta : `hint` (texte gris).
2. **SegmentedControl** (`<SegmentedControl value onValueChange options size />`, `src/components/ui/segmented-control.tsx`) : pill group horizontal, container `gray-100` border subtile ; actif = fond blanc + shadow-sm, inactifs = transparent texte muted hover ink. Usage : fenêtre temporelle (« 7 j / 30 j / 90 j »), toggle d'agrégation. API contrôlée, génère `aria-pressed`.
3. **AreaChart à gradient** (`<AreaChart data tone referenceValue />`, `src/components/charts/area-chart.tsx`) : Recharts mono-série, fill `linear-gradient` (top stopOpacity 0.25 → bottom 0), axe Y à droite (`orientation="right"`), unité optionnelle, référence dashée optionnelle (accent bleu brand). Pour single-series ; pour multi-LLM, garder `<LineChart>`.
4. **BreakdownBars** (`<BreakdownBars segments mode total />`, `src/components/charts/breakdown-bars.tsx`) : barres verticales colorées, hauteur proportionnelle (mode `absolute`) ou parts du total (mode `share`) ; légende dots + liste « dot + label · valeur tabulée ». Pour répartitions catégorielles 3-7 segments. Couleurs : palette pastel ou `LLM_COLORS` — jamais arbitraire.

**Règle d'usage** : pas plus de **2 patterns dashboard différents par section visible** (au-dessus du fold). Privilégier `Stat` en haut, **1 graphique principal**, listes/tableaux en dessous.

### Patterns liste & contenu (update 2026-06-09 — issus de /app/conseils)

Quatre patterns réutilisables (introduits sur « Conseils GEO », cf. doc 09 § 2026-06-09) :

1. **Tableau avec ligne d'invitation finale** (réf. `AuditedUrlsSection` dans `conseils-view.tsx`) : dernière `<tr>` du `<tbody>` = `<Link>` plein largeur (`colSpan`) avec pastille `+` (`bg-accent-faint`). **Un seul composant gère le vide ET le peuplé** (« Auditer ta première URL » à 0 ligne, « Auditer une autre URL » sinon) — évite `<EmptyState>` + bouton d'ajout séparés.
2. **Lignes de tableau cliquables via stretched-link** : `<tr className="group relative …">` + dans la cellule principale `<Link className="… after:absolute after:inset-0">` → toute la ligne cliquable sans `<tr>` dans un `<a>` (invalide en HTML). Affordance : `ArrowRight` en dernière cellule, fonce au `group-hover` (`group-hover:text-ink`).
3. **Accordéon éducatif / liste de leviers** (réf. cartes `TipCard`) : carte = `<Collapsible>` autonome (trigger + content fondus par `border-t`, même carte). Trigger **scannable** : ancrage gauche (numéro carré ou icône) + titre + badge de catégorie + **résumé une ligne visible même replié**. Détail au dépli, premier item ouvert par défaut.
4. **Seuils ScoreBadge** : `≥ 80` → tone `success`, `≥ 60` → `warning`, sinon `error`. Identiques partout où un score /100 est affiché (cohérence `ScoreRing` audits).

**Anti-pattern acté** : ne pas empiler un pill/badge « mis en avant » sur **chaque** carte d'une liste — un marqueur d'emphase posé partout ne distingue plus rien. Réserver l'emphase aux éléments réellement différenciants.

### Layout app — conteneur & système de blocs (update 2026-06-09)

**Conteneur unique — `<PageContainer>`** (`src/components/ui/page-container.tsx`) :
- Toute page `(app)/app/(with-nav)/*` a un `<PageContainer>` en racine (jamais un `div mx-auto max-w-… px-… py-…` à la main, jamais un `<main>` local — le layout `(with-nav)` fournit déjà le `<main>`). Centralise largeur + padding (`px-6 py-12 lg:px-10`).
- 4 largeurs (sweep 2026-06-09) : `default` = `max-w-6xl` (dashboard, audits, citations, prompts, conseils, runs) · `detail` = `max-w-5xl` (pages détail : `runs/[id]`, `prompts/[id]`, `audits/[id]`) · `narrow` = `max-w-3xl` (réglages / lecture dense) · `form` = `max-w-2xl` (formulaires).
- `PageHeader` obligatoire en tête de chaque page (plus de `<h1>` brut) — sauf les pages détail dont le hero est déjà une carte riche (ex. `/app/audits/[id]` : la carte ScoreRing fait office de header).

**Tables responsive (convention 2026-06-09)** :
- Une table app reste lisible en portrait mobile **sans scroll horizontal forcé** : colonnes secondaires en `hidden md:table-cell` (`<th>` ET `<td>`), et un éventuel `min-w-[…]` ne s'applique qu'à partir de `md` (`md:min-w-[760px]`).
- On garde en mobile les colonnes qui identifient la ligne et permettent d'agir : `/app/prompts` → Prompt + Actif + Actions ; table concurrents → Marque + Citations + Apparition + Actions.
- `overflow-x-auto` sur le wrapper = filet de sécurité, pas solution principale.

**Microcopy app (rappels, sweep 2026-06-09)** :
- **Tutoiement partout**, y compris les badges (« Toi », pas « Vous »).
- Pas de jargon technique EN dans les libellés : « Lancement… », pas « Enqueue en cours… ». Nav marketing 100 % FR (« Fonctionnalités », pas « Features »).
- Dialogs d'action irréversible : impacts en **liste à puces** scannable, pas en paragraphe.

**Système de blocs (ne pas tout empiler verticalement)** :
- Blocs côte à côte : `grid items-start gap-4 lg:grid-cols-2` (ou `lg:grid-cols-[1.4fr_1fr]` pour un bloc dominant). `items-start` évite qu'une carte courte s'étire.
- Regrouper par **thème** quand les groupes sont équilibrés ; si tailles très inégales (ex. axes Conseils 1/3/5/1), préférer une **liste pleine largeur triée par priorité**, thème en badge par item (cf. doc 09 § 2026-06-10 refonte Conseils).
- **Tables, listes principales et matrices restent pleine largeur** — jamais coincées dans une colonne étroite.
- **Exception largeur étroite** : une page `narrow` (réglages) aux champs denses reste en **une seule colonne**.

**Continuité éducation ↔ outil** : `/app/conseils` (éducation) et `/app/audits` (outil) se renvoient l'un vers l'autre par un bloc cross-link, sans dupliquer la donnée (le tableau d'URLs auditées vit **uniquement** sur `/app/audits`).

**Mentions de marque dans l'app** (update 2026-05-12) :

- Côté pages `(app)/*`, le nom **« Mamie GEO »** n'apparaît **jamais** dans le chrome. Pattern **Vercel** : deux pills empilés, **workspace** au-dessus, **brand/domaine** dessous.
- Côté pages publiques (`(marketing)`, `(blog)`, `/login`), le nom reste affiché normalement.
- Placeholders de formulaires (onboarding) : génériques (`placeholder="Ta marque"` / `"ton-domaine.fr"`).

**Pattern « Workspace + Brand pills »** (pattern Vercel) :

Deux pills empilés en haut de la sidebar, gap 6 px :

1. **Workspace pill** (`<WorkspacePill workspace />`) : avatar 24 px cercle dégradé `from-[--color-accent] to-[--color-accent-dim]` + initiale (weight 600, blanc) · nom du workspace truncate · badge plan à droite (tone `accent` si `trialing`, `neutral` sinon). V0 : pas de chevron (un seul workspace) — greffer un `DropdownMenu` au multi-workspace.
2. **Brand pill** (`<BrandSwitcher brands currentBrandId />`) : avatar 24 px square `radius-sm` `bg-[--color-ink]` + initiale blanche (distinct du cercle workspace) · label = **le domaine** (pas le nom — identifie la marque sans ambiguïté côté GEO ; nom complet dans le dropdown + `title`) · chevron `ChevronsUpDown` — switcher actif dès V0, dropdown avec check sur la brand courante.

**Règle de cohérence** : square noir = identité brand, cercle dégradé = identité workspace. Ne jamais inverser les formes.

**Pourquoi le pivot** : Direction A trop "magazine" pour un produit data-driven — justification complète dans doc 09 § 2026-05-07. **Conservé du brief originel** : anti-patterns "look IA" (§ Principes anti-IA + § Anti-patterns à bannir), voix personnelle / founder visible / captures réelles, pattern "Sans nous / Avec nous".

---

### ~~Système design carousels LinkedIn (acté 2026-06-04)~~ — RÉÉCRIT 2026-06-05

> ⚠️ **Section archivée**. Le système « Unified-like » (crème `#fff4d6` + vagues bleu brand + brand pill ink + Inter 800) acté 2026-06-04 a été **remplacé** le 2026-06-05 par la persona « Mamie » (chaud, manuscrit, marguerite). Cf. doc 09 § 2026-06-05.
>
> **Source de vérité actuelle pour les carrousels et visuels marketing externes** : [`linkedindesign.md`](./linkedindesign.md).
>
> Résumé du système actuel :
> - **Palette chaude Mamie** : Crème `#FBF4E9`, Sable `#F0E3CF`, Encre `#2E2620`, Terracotta `#DD6B45` (signature), Miel `#F3B43F` (surligneur), Sauge `#7FA67C`, Rose `#E59B96`. Le **bleu brand `#329CFF`** reste **couleur primaire** : logo + 1 accent typo par slide + pagination dots (confirmé Max 2026-06-05).
> - **Typographies** : Fraunces (titres serif Bold/Black), Hanken Grotesk (corps), Caveat (manuscrit rare). Chargées via next/font/google **uniquement** dans `src/app/(app)/app/admin/layout.tsx` — app et marketing gardent Inter unique.
> - **Motif-signature** : marguerite 6 pétales (`<Daisy />`), terracotta/miel, tailles grande (déco fond 8-15 % opacité) / moyenne / petite (puce). **Surligneur miel** (`<Highlight />`) sur le mot clé du titre — une seule mise en valeur par slide.
> - **Primitives** : `src/components/admin/visuals/_primitives/` (`tokens.ts`, `daisy.tsx`, `highlight.tsx`, `brand-header.tsx`, `slide-shell.tsx`). **8 gabarits de slides** : Couverture, Définition, Chiffre, Recette/Étapes, Conseil, Citation, Avant/Après, CTA — cf. linkedindesign.md § 6.
>
> **Périmètre strict** : **carousels LinkedIn, OG images V1+, blog covers V1+ uniquement**. **L'app `(app)/*` et le site marketing restent en Airbnb-like minimaliste** (Inter unique + blanc/gris + bleu brand accent). Dual-DA volontaire.

---

## Pourquoi ce document

Sortir du look "fait par une IA" des SaaS 2025-2026. Identité **française, humaine et honnête** — sobre, focus donnée. Ce doc définit la direction, les patterns obligatoires, les anti-patterns, et archive les 3 directions explorées avant le pivot du 2026-05-07.

---

## Principes anti-IA

Les 8 règles non-négociables pour ne pas avoir l'air "généré".

### 1. Pas de gradient violet/bleu en hero

Le gradient `from-purple-600 to-blue-600` plein écran est LE marqueur "AI startup". À bannir **en hero / fond large**. Le `--gradient-ai` brand (bleu → purple → pink) reste autorisé **uniquement sur les boutons d'actions IA** (audit, suggérer prompts, Ask AI).

### 2. Voix personnelle, pas corporate

Pas "Empower your brand with cutting-edge AI visibility solutions". Plutôt "Sache enfin si ChatGPT parle de toi". Tutoiement par défaut. Vocabulaire concret.

### 3. Founder visible

Photo de Max, signature personnelle, histoire "pourquoi j'ai fait ça". Une page À propos qui se lit comme un post LinkedIn long. Arme imparable contre Profound et Peec.

### 4. Captures d'écran réelles, pas illustrations 3D

Dashboard présent visuellement avec données réalistes (anonymisées). Zéro illustration 3D abstraite. Si besoin de visuel : illustration à la main (200-500€ pour 5 pièces) ou UI screenshots.

### 5. Typographie avec du caractère

> Note 2026-05-07 : la lettre de cette règle (« pas Inter par défaut »,
> mix serif/sans) est **supersedée** par la décision Inter unique de la
> direction actée. L'esprit (typo travaillée : weights précis, tracking,
> `font-feature-settings`, hiérarchie nette) reste valable.

### 6. Pattern "Sans nous / Avec nous"

Section deux colonnes (frustrations à gauche, solutions à droite) obligatoire. Difficile à générer en mode AI slop, hyper convertissante, ancre le ton honnête.

### 7. Définir activement ce qu'on n'est PAS

"Mamie GEO n'est pas Profound. Mamie GEO n'est pas Semrush." Section dédiée, courte, claire. MeetSponsors le fait bien avec "MeetSponsors n'est pas une marketplace".

### 8. Imperfection volontaire

Une rotation légère sur une carte, un texte manuscrit sur un screenshot. Les détails imparfaits signent l'humain.

---

## Analyse rapide des 2 références

### MeetSponsors

**Ce qu'on garde** : headline qui surprend, sous-titre concret, section "Sans / Avec" (croix rouges vs checks verts), mockup UI réaliste avec personnage, section founder "Hey, c'est Benjamin 👋", disclaimer fort ("n'est pas une marketplace"), switch mensuel/annuel avec -20%, FAQ extensive et honnête, tutoiement FR punchy.

**Ce qu'on n'imite pas** : le ton YouTube/streamer (notre cible est plus sérieuse), les emojis trop fréquents.

### Taap Radar

Esthétique : très claire, beaucoup de blanc, charts mis en avant, typo sans-serif géométrique distinctive, accent sobre, layout aéré. Ref intégrée dans la direction actée 2026-05-11 (cf. en tête de doc).

---

## 3 directions artistiques au choix

> **Archive.** Exploration pré-pivot, tranchée le 2026-05-07 (cf. doc 09) : aucune retenue — pivot Airbnb-like minimaliste. Palettes conservées pour mémoire.

### Direction A — Éditorial chaud (recommandée)

Abandonnée (cf. doc 09 § 2026-05-07). Mood magazine (NY Mag, Mubi). Palette : crème `#FAF7F2`, noir doux `#1A1A1A`, terracotta `#C5532E`, moutarde `#D4A53A`, gris chaud `#8C8579`. Typo : Tiempos Headline / GT Walsheim / Söhne Mono. Était recommandée pour la cohérence avec le naming « Mamie » — le terracotta a survécu comme accent jusqu'au pivot bleu 2026-06-03, et l'esprit chaud vit désormais dans la persona Mamie des carrousels (cf. linkedindesign.md).

### Direction B — Souverain français

Abandonnée. Mood DSFR / Mistral AI. Palette : blanc cassé `#F8F8F8`, bleu Marianne `#000091`, rouge Marianne `#E1000F`, texte `#161616`, gris `#666666`. Typo : Marianne (gratuite) + JetBrains Mono. Reste l'idée récupérable : badge "Made in France" discret + mention hébergement EU, sans cocorico.

### Direction C — Studio indie chaleureux

Abandonnée. Mood Linear / Cron / Tally / Raycast. Palette : crème `#F5F4EE`, graphite `#222020`, vert sapin `#1B4332`, sable `#D4B996`. Typo : GT America / Söhne / Geist + Geist Mono. Risque identifié : Linear-clone.

---

## Recommandation et choix

> **Obsolète.** La recommandation Direction A (hybridée badge souveraineté de B) n'a pas été suivie : pivot Airbnb-like minimaliste acté 2026-05-07 (doc 09). L'angle souveraineté (hébergement EU, Made in France discret) reste exploité côté copy marketing.

---

## Composants et patterns obligatoires

> Structure de référence pour le site marketing. Les copys ci-dessous sont des gabarits — la prod fait foi (trial 14 j **avec carte** depuis 2026-06-08, grille publique Solo/Starter/Pro depuis 2026-05-14, Agence sur devis).

### Hero (page d'accueil)

Structure :

```
[Headline punchy 6-10 mots]
"Sache enfin si ChatGPT parle de toi (et tes concurrents)"

[Sous-titre concret]
"Mamie GEO mesure quotidiennement la visibilité de ta marque dans
ChatGPT, Claude, Perplexity, Gemini et Le Chat de Mistral.
Le tout en français, hébergé en France, à partir de 9,99€/mois."

[CTA principal] + [sous-CTA conditions d'essai]

[Visuel : screenshot du dashboard avec données réalistes]
```

### Section "Sans Mamie GEO / Avec Mamie GEO"

Layout 2 colonnes. Croix rouges à gauche, check verts à droite.

**Sans Mamie GEO** :

- ❌ Tu écris du contenu sans savoir si l'IA le voit
- ❌ Tes clients te demandent "et pour ChatGPT ?" et tu hausses les épaules
- ❌ Tu paies Profound 500$/mois pour un outil 100% anglais qui ne tracke pas Le Chat
- ❌ Tu fais des audits manuels prompt par prompt qui te prennent 4h
- ❌ Tu découvres qu'un concurrent a percé dans les IA quand il est trop tard
- ❌ Tu n'as aucun rapport pro à montrer à ton client ou ton boss

**Avec Mamie GEO** :

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

Cards avec les 3 personas principaux : freelance SEO (Sophie), équipe marketing PME (Thomas), agence en marque blanche (Aline). Chaque card : photo persona + 1 phrase bénéfice + lien cas d'usage.

### Section "Mamie GEO n'est pas..."

> **Mamie GEO n'est pas un outil SEO classique.**
> Pas de recherche de mots-clés Google ni d'analyse de backlinks. Pour ça, Semrush et Ahrefs sont meilleurs et installés.
>
> **Mamie GEO n'est pas un générateur de contenu.**
> On ne va pas écrire ton article à ta place. On te dit ce qui manque pour être cité, pas comment l'écrire.
>
> **Mamie GEO n'est pas Profound.**
> Si tu as 500$/mois et que tu veux du Fortune 1000 grade avec 8 LLMs et SOC 2 Type II, va chez eux. Nous on cible les freelances et PME francophones avec un rapport qualité/prix imbattable.

### Section "Hey, c'est Max 👋"

Page À propos : photo réelle de Max, histoire personnelle (freelance qui en a marre, pourquoi le GEO, pourquoi en français), liens LinkedIn/X/blog, liste des "engagements" (pas d'ads en V0, pas de levée avant validation, hébergement EU, pricing transparent).

### Pricing page

- Switch mensuel/annuel avec affichage économie -20%
- 3 plans en cards : **Solo / Starter / Pro** (Agency retiré de la grille publique 2026-05-14, sur devis)
- Badge "Le plus populaire" sur Pro
- Tableau comparatif détaillé en bas (toggle "Voir tous les détails")
- FAQ pricing en bas (8-10 questions)
- CTA Enterprise discret en fin de page

### FAQ

Au moins 12 questions, dont : LLMs trackés ? Le Chat dans tous les plans ? AI Overviews Google ? Comparaison outils US (Profound) ? Données stockées où ? RGPD ? Annulation ? Marque blanche ? Satisfaction/remboursement ? Essais gratuits ? Compliqué à utiliser ? Pour qui ?

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
- ❌ Logos "Trusted by" en V0 (pas encore de logos crédibles)
- ❌ Photo équipe sourire forcé
- ❌ Mockup laptop générique flottant dans l'espace
- ❌ Cards avec ombre douce identiques alignées en grille de 6

### Copy

- ❌ "Empower your brand" / "Cutting-edge AI" / "Seamless integration" / "Leverage the power of" / "Unlock your potential" / "Best-in-class" / "Game-changing" / "Revolutionary" / "Boost your X with AI"

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

Site marketing, blog et app SaaS **dans la même app Next.js**, route groups (`(marketing)`, `(blog)`, `(app)`). Pas de Framer en V0 (solo founder, cohérence design system, coût 0 — cf. anti-décisions CLAUDE.md). Éviter le look "fait par un dev" : DA forte, composants customisés en profondeur, design tokens (variables CSS, utilities), animations fines Framer Motion (lib npm) si besoin. Migration marketing seule vers Framer/Astro envisageable mois 12+, pas avant.

---

## Mood board textuel et références

### Sites à étudier en profondeur

MeetSponsors.com (voix FR punchy, "Sans/Avec", founder visible) · Linear.app (typo + animation) · Tally.so (indie pas corporate) · Cron.com avant Notion (éditorial dans un produit tech) · Are.na (chaleur anti-tech) · Frenchies.io (tone FR SaaS) · Hey.com ("Sans/Avec" tranché).

### Marques à observer

The Browser Company/Arc (typo + voix) · Pitch.com (layout magazine, sans 3D) · Vercel (cleanness) · Claude/Anthropic (serif headline + terracotta) · Mistral AI (souveraineté FR moderne). Éditorial papier : Society, Le 1, The Gentlewoman, Smith Journal.

---

## Plan d'exécution design

> ✅ **Réalisé** (Phase B livrée, cf. doc 09) : direction tranchée
> (pivot 2026-05-07), Inter unique, design system + tokens dans
> `globals.css`, composants UI custom, home + pricing + onboarding +
> dashboard + détail prompt + settings designés, page À propos, FAQ,
> comparison pages (vs Profound/Peec/Otterly/Rankscale, 2026-06-08).
> Reste du plan d'origine non réalisé : pages cas d'usage par persona
> (3 pages) — V1.

---

## Budget design

| Poste | Coût |
|---|---|
| Polices premium (Tiempos + GT Walsheim) | 0-500€ — **non dépensé** (Inter gratuite actée) |
| Template marketing Next.js premium (optionnel) | 79-200$ one-shot — non acheté (from scratch) |
| Illustrations à la main (5 pièces) | 200-500€ one-shot |
| Photo Max pro (séance studio) | 150-300€ |
| **Total an 1** | **~500-1500€** |

---

## Pièges à éviter dans l'exécution

1. **Bikeshedding design**. Trancher en 2-3 jours max, itérer avec data utilisateur.
2. **Recopier servilement MeetSponsors**. Inspiration ≠ clone.
3. **Surcharger la home**. Pas plus de 8 sections : Hero, Sans/Avec, Comment ça marche, Pour qui, Démo/Visu, Pricing teaser, Founder, FAQ, Footer.
4. **Dark mode** : prévu "dès V0" à l'origine — **non livré à date (2026-06)**, de facto reporté post-lancement.
5. **Faire faire le design par une IA**. Génératif pour itérer ok, rendu final entre mains humaines.

---

## Décisions design à acter

> ✅ Toutes actées (cf. doc 09) :
>
> - **Direction artistique** : aucune des 3 — pivot **Airbnb-like minimaliste** (2026-05-07), raffiné refs designme/taap (2026-05-11). Persona « Mamie » chaude réservée aux carrousels LinkedIn (2026-06-05, dual-DA).
> - **Polices** : gratuites — **Inter unique** via next/font/google (app + marketing). Fraunces/Hanken Grotesk/Caveat admin visuels uniquement.
> - **Template Next.js premium** : non — from scratch.
> - **Illustrations** : non — UI screenshots only.
> - **Mascotte mamie** : pas dans l'app ; motif marguerite + persona Mamie sur les visuels externes uniquement (linkedindesign.md).

→ Voir [03-architecture-technique.md](./03-architecture-technique.md) pour les décisions techniques verrouillées.
→ Voir [09-decisions-journal.md](./09-decisions-journal.md) pour le suivi des choix.
