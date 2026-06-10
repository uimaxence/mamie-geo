# 10 — Direction artistique et design

## ⚠️ Direction actée (mise à jour 2026-05-11) — Airbnb-like minimaliste, refs designme.agency + taap.it

> Cette section **supersede** les Directions A/B/C explorées plus bas, qui restent en archive.
> Pivot global acté le 2026-05-07, raffinement visuel ancré sur designme.agency + taap.it/fr/radar le 2026-05-11.
> Détail dans `09-decisions-journal.md` § 2026-05-07 (pivot UI) + § 2026-05-11 (refs designme/taap).

**Refs visuelles ancrées** : `https://www.designme.agency/` et `https://taap.it/fr/radar`. Voir les PDFs joints au repo (ou recapturer) avant tout travail design.

**Mood** : airbnb.com, designme.agency, taap.it, sites studio premium minimalistes.

**Règles dures** :

- Fond **gris doux `#fafafa`** sur `body` (mise à jour 2026-05-22, cf. doc 09). Les surfaces qui doivent émerger (cards, sidebar, topbar, tables, items, dialogs) restent en `bg-white` `#FFFFFF`. Jamais d'autre teinte que ce gris/blanc (pas de crème, pas de bleu, pas de gradient pour le fond global).
- Couleurs principales : **nuances de gris uniquement** (gray-50 → gray-950, alignées Tailwind v4).
- **Une seule police** : **Inter** via `next/font/google` (weights 400/500/600/700 chargés). Pas de serif, pas de mono, pas de seconde famille typographique. Inter est le standard de fait des SaaS modernes — neutre, lisible, glyphs alternatifs activés via `font-feature-settings: "cv11", "ss01", "tnum"`.
- **Pas d'italique** (ni en CSS, ni dans les balises `<em>` qui sont neutralisées en `font-style: normal`).
- **Accent bleu brand `#329CFF`** (couleur du logo, actée 2026-06-03 en remplacement du terracotta `#C5532E`) — utilisé pour les liens, les badges ponctuels, les highlights data dans les charts. Le CTA principal reste **noir plein** (langage designme/taap). Jamais en fond large.

**Hiérarchie typographique** (cf. `src/app/globals.css` classes `.type-*`) : portée par taille + weight + letter-spacing, sans recourir à un serif. Display 600 / -0.03em, h1 600 / -0.025em, body 1rem leading 1.55.

**Composants** (raffinement 2026-05-11 sur refs designme/taap) :

- **Boutons** : tous en **`rounded-pill`** (full radius). Variant `primary` (**noir plein**, CTA principal — c'est ça le langage designme/taap, pas le bleu), `secondary` (blanc + bordure gris-300, hover gris-50), `ghost` (transparent, hover gris-100). Le variant `accent` (bleu plein) est conservé pour des **cas marginaux décoratifs** mais ne doit jamais être le CTA principal.
- **Cards** : fond blanc, bordure 1px `gray-200`, **radius `xl` (12px depuis 2026-06-09, était 20px)**, pas d'ombre par défaut. Padding interne généreux (`px-6 py-6`).
- **Sections** : composant `<Section variant="default" | "tinted">` pour alterner fond blanc et fond `gray-50`. Pattern central des deux refs — crée le rythme visuel sans cards inutiles.
- **Badges** : fond `gray-100` neutre par défaut. Variants light bg pour status (success/warning/error). Variant `accent` (bleu brand très faible `#eaf4ff`) gardé pour ponctuel (badge plan, badge beta) — comme le badge vert pastel "Fonctionnalités" de taap.
- **Inputs** : bordure `gray-300`, focus ring noir sobre, radius `md` (6px depuis 2026-06-09, était 10px).
- **Échelle de border-radius** (resserrée 2026-06-09, cf. doc 09) : `sm 4px · md 6px · lg 8px · xl 12px · pill 9999px`. Tokens `--radius-*` dans `globals.css`. Avant : `6 / 10 / 16 / 20`. Resserrement global pour un rendu plus net/technique (Linear, Vercel, dashboards SEO des refs), l'app paraissait trop « molle ». Les boutons restent `pill`.
- **Visualisation de score** (3 primitifs `src/components/ui/`, posés 2026-06-09 pour la refonte audit, réutilisables dashboard) :
  - `<ScoreRing value size strokeWidth suffix />` — anneau SVG, chiffre coloré au centre, arc animé 0→valeur au montage. Couleur via `scoreColor()` (`src/lib/audit/score.ts`, seuils ≥80 vert / ≥60 ambre / <60 rouge).
  - `<SegmentBar segments={[{value, tone, label}]} />` — barre proportionnelle segmentée (répartition critiques/avertissements/bons points). Tones `critical | warning | success | neutral`.
  - `<ScoreBar label value hint />` — sous-score : label + chiffre coloré + barre de progression + légende.
- **Touches « fancy »** observées chez designme à envisager pour PR 8+ : frame monitor avec cross hairs corners pour les screenshots dashboard, timecodes décoratifs en footer, speech bubbles dessinées au stylo pour humaniser (taap).

### Patterns de personnalité (update 2026-05-11 — refs Mobbin/Dribbble)

Pour éviter le « trop plat » remonté par Max, 4 patterns disponibles dans le design system. À utiliser **sobrement** (pas tous sur la même page) :

1. **Palette pastel pour badges colorés** — 6 tons (`blue`, `green`, `orange`, `purple`, `pink`, `yellow`) avec fond très light + texte saturé. Utilisation : catégoriser (logos LLMs, types de prompt, catégories blog), ponctuer (étapes d'un workflow). Jamais pour CTA.
2. **`<StatusDot tone="..." pulse>`** — cercle 8px coloré avec halo léger (`--glow-*`), optionnellement pulsé. Pour signaler le live : "Beta active", "Run en cours", "Provider en ligne".
3. **`<CornerFrame>`** — wrapper qui pose 4 cross-hairs aux coins. Signature « print éditorial » à appliquer sur 1-2 éléments par page max (hero, showcase screenshot). Casse la planéité sans bruiter.
4. **Mix-weight dans les titres** — `<strong>` pour emphase un mot clé du headline (ex : « Sache enfin si **ChatGPT** parle de toi. »). Joue sur la hiérarchie typo sans ajouter de couleur.

Inspirations directes : screen 1 du brief (status dot avec glow + cross-hairs Active Node), screen 2 (badges colorés pastel avec icônes Lucide), screen 3 (cards stats premium pour PR 8+ dashboard polish).

Icônes : **`lucide-react`** ajouté en dépendance (set d'icônes sans-serif léger, tree-shake natif). Imports nommés pour ne pas alourdir le bundle.

### ~~Pattern signature damier~~ — RETIRÉ 2026-05-22

> ⚠️ **Section archivée**. Le pattern damier signature actée le 2026-05-18 a été **complètement retiré** le 2026-05-22 après 4 itérations infructueuses sur `/login` (xl primary, gradient bleu, ink coin 8%, primary full 5%). Aucune n'a convaincu sur l'équilibre lisibilité × signature visuelle. Cf. doc 09 § 2026-05-22 (rollback).
>
> Conséquences :
> - Composant `<PatternBlock>` + `<PatternBand>` supprimés.
> - Classes CSS `.bg-pattern*` retirées de `globals.css`.
> - Assets `/public/pattern.svg` + `src/assets/pattern.svg` supprimés.
> - 3 usages site retirés (hero, audit-teaser, login) + 2 usages emails (welcome-paid, weekly-recap).
>
> L'identité visuelle s'appuie désormais sur : logo + couleur brand bleu `#329cff` (CTAs accent, badges, highlights, charts) + `<CornerFrame>` (signature print subtile autour du hero) + favicon brand dans la top bar app. Le token `--color-accent` est aligné sur le bleu brand depuis le 2026-06-03 (auparavant terracotta).
>
> **À ne pas ré-introduire** sans validation explicite + démonstration que le problème de lisibilité × signature trouvé pendant les 4 itérations 2026-05-18→22 est résolu.

### Patterns dashboard (update 2026-05-12 — refs screens partagés par Max)

Quatre patterns visuels supplémentaires entrés dans le design system pour les pages applicatives (post-connexion). Sources d'inspiration : dashboards SaaS contemporains type Linear / Stripe Sigma / Posthog.

1. **Stat enrichie** (`<Stat icon iconTone delta />` dans `src/components/ui/stat.tsx`) :
   - Layout : eyebrow label en haut gauche · cercle pastel coloré avec icône Lucide en haut droite · grand chiffre (type-stat 2.25rem weight 600) · ligne delta sous le chiffre.
   - Delta : flèche `TrendingUp`/`TrendingDown` Lucide + pourcentage signé coloré (vert >0, rouge <0, gris =0) + libellé de période en SMALL CAPS muted (« VS J-7 »).
   - `iconTone` : 8 valeurs alignées sur la palette pastel (`blue`, `green`, `orange`, `purple`, `pink`, `yellow`, `accent`, `neutral`). Choix sémantique par stat — pas de couleur arbitraire.
   - Fallback : si pas de delta calculable, retombe sur `hint` (texte gris simple).
2. **SegmentedControl** (`<SegmentedControl value onValueChange options size />` dans `src/components/ui/segmented-control.tsx`) :
   - Pill group horizontal : container `gray-100` border subtile + items radius `pill` ; actif = fond blanc + shadow-sm, inactifs = transparent + texte muted hover ink.
   - Usage typique : fenêtre temporelle (« 7 j / 30 j / 90 j ») au-dessus d'un chart, ou toggle d'agrégation (« Day / Week / Month »).
   - API contrôlée — l'appelant gère le state. Génère `aria-pressed` sur chaque bouton.
3. **AreaChart à gradient** (`<AreaChart data tone referenceValue />` dans `src/components/charts/area-chart.tsx`) :
   - Recharts `AreaChart` mono-série, fill `linear-gradient` (top stopOpacity 0.25 → bottom 0) sur la couleur de tonalité choisie.
   - Axe Y aligné à droite (`orientation="right"`), unité optionnelle (« % », « $ »).
   - Référence dashée optionnelle (couleur accent bleu brand) avec label aligné droite — pour afficher une moyenne ou un seuil.
   - À utiliser pour les métriques single-series (cumul, volumétrie). Pour multi-LLM, garder `<LineChart>`.
4. **BreakdownBars** (`<BreakdownBars segments mode total />` dans `src/components/charts/breakdown-bars.tsx`) :
   - Rangée de barres verticales colorées (une par segment), hauteur proportionnelle à la valeur (mode `absolute`) ou parts du total (mode `share`).
   - Sous le chart : légende dots horizontaux puis liste « dot + label · valeur tabulée à droite » avec séparateurs subtils.
   - Idéal pour les répartitions catégorielles à 3-7 segments (visibilité par LLM, sources d'acquisition, types de prompt).
   - Couleurs reprises de la palette pastel ou de `LLM_COLORS` selon le contexte — pas de couleur arbitraire.

**Règle d'usage** : pas plus de **2 patterns dashboard différents par section visible** (au-dessus du fold). Un dashboard surchargé en visualisations devient illisible. Privilégier `Stat` en haut, **1 graphique principal** (Line / Area / Bar), et listes/tableaux en dessous.

### Patterns liste & contenu (update 2026-06-09 — issus de /app/conseils)

Quatre patterns réutilisables ailleurs dans l'app (introduits sur la page « Conseils GEO », cf. doc 09 § 2026-06-09) :

1. **Tableau avec ligne d'invitation finale** (réf. `AuditedUrlsSection` dans `conseils-view.tsx`, calqué sur la table concurrents `citations/`) :
   - Dernière `<tr>` du `<tbody>` = un `<Link>` plein largeur (`colSpan`) avec pastille `+` (`bg-accent-faint`) et libellé d'ajout.
   - **Un seul composant gère le vide ET le peuplé** : libellé « Auditer ta première URL » quand 0 ligne, « Auditer une autre URL » sinon. Évite de maintenir un `<EmptyState>` séparé + un bouton d'ajout séparé.
2. **Lignes de tableau cliquables via stretched-link** :
   - `<tr className="group relative …">` + dans la cellule principale `<Link className="… after:absolute after:inset-0">` → **toute la ligne** devient cliquable sans envelopper `<tr>` dans un `<a>` (invalide en HTML).
   - Affordance : `ArrowRight` en dernière cellule qui fonce au `group-hover` (`group-hover:text-ink`).
3. **Accordéon éducatif / liste de leviers** (réf. cartes `TipCard`) :
   - Carte = `<Collapsible>` autonome (trigger + content fondus par un `border-t` à l'ouverture, même carte — pas de cassure visuelle).
   - Trigger **scannable** : ancrage gauche (numéro carré ou icône) + titre + badge de catégorie + **résumé une ligne visible même replié** (la « réponse immédiate »). Détail (corps, puces, callout « À retenir ») au dépli. Premier item ouvert par défaut pour amorcer la lecture.
4. **Seuils ScoreBadge** : `≥ 80` → tone `success`, `≥ 60` → `warning`, sinon `error`. À garder identiques partout où un score /100 est affiché (cohérence avec le `ScoreRing` des audits).

**Anti-pattern acté ici** : ne pas empiler un `pill`/badge « mis en avant » sur **chaque** carte d'une liste — un marqueur d'emphase posé partout ne distingue plus rien. Réserver l'emphase (badge plein, bandeau, couleur saturée) aux éléments qui portent réellement une info différenciante.

### Layout app — conteneur & système de blocs (update 2026-06-09)

Avant ce passage, seul le dashboard exploitait une grille multi-colonnes ; toutes les autres pages app étaient en **pile verticale** et les largeurs de conteneur divergeaient (`max-w-2xl/3xl/5xl/6xl` au hasard). Harmonisation actée :

**Conteneur unique — `<PageContainer>`** (`src/components/ui/page-container.tsx`) :
- Toute page `(app)/app/(with-nav)/*` a un `<PageContainer>` en racine (jamais un `div mx-auto max-w-… px-… py-…` à la main, jamais un `<main>` local — le layout `(with-nav)` fournit déjà le `<main>`). Centralise largeur + padding (`px-6 py-12 lg:px-10`).
- 4 largeurs (sweep 2026-06-09 : `detail` ajoutée, dernières pages hardcodées migrées) : `default` = `max-w-6xl` (vues principales : dashboard, audits, citations, prompts, conseils, runs) · `detail` = `max-w-5xl` (pages détail d'une entité : `runs/[id]`, `prompts/[id]`, `audits/[id]`) · `narrow` = `max-w-3xl` (réglages / lecture dense) · `form` = `max-w-2xl` (formulaires).
- `PageHeader` obligatoire en tête de chaque page (plus de `<h1>` brut ni de `<header>` maison) — sauf les pages « détail/show » dont le hero est déjà une carte riche (ex. `/app/audits/[id]` : la carte ScoreRing fait office de header, pas de PageHeader redondant par-dessus).

**Tables responsive (convention 2026-06-09)** :
- Une table app doit rester lisible en portrait mobile **sans scroll horizontal forcé** : les colonnes secondaires passent en `hidden md:table-cell` (header `<th>` ET cellules `<td>`), et un éventuel `min-w-[…]` de table ne s'applique qu'à partir de `md` (`md:min-w-[760px]`).
- On garde en mobile les colonnes qui permettent d'identifier la ligne et d'agir : ex. `/app/prompts` → Prompt + Actif + Actions ; table concurrents → Marque + Citations + Apparition + Actions.
- `overflow-x-auto` sur le wrapper reste en filet de sécurité, pas comme solution principale.

**Microcopy app (rappels, sweep 2026-06-09)** :
- **Tutoiement partout**, y compris les badges (« Toi », pas « Vous ») — l'app dit déjà « vs toi », « ta marque ».
- Pas de jargon technique EN dans les libellés visibles : « Lancement… », pas « Enqueue en cours… ». Côté marketing, la nav est 100 % FR (« Fonctionnalités », pas « Features »).
- Dialogs d'action irréversible : impacts en **liste à puces** scannable, pas en paragraphe.

**Système de blocs (ne pas tout empiler verticalement)** :
- Blocs côte à côte : `grid items-start gap-4 lg:grid-cols-2` (ou `lg:grid-cols-[1.4fr_1fr]` pour un bloc dominant). `items-start` évite qu'une carte courte s'étire à la hauteur de sa voisine.
- Regrouper par **thème** quand les groupes sont équilibrés ; si les groupes ont des tailles très inégales (ex. axes Conseils à 1/3/5/1 leviers), une grille par groupe crée des trous — préférer alors une **liste pleine largeur triée par priorité**, le thème restant visible en badge par item (cf. doc 09 § 2026-06-10 refonte Conseils).
- **Tables, listes principales et matrices restent pleine largeur** — jamais coincées dans une colonne étroite.
- **Exception largeur étroite** : une page `narrow` (réglages) aux champs denses reste en **une seule colonne** — y forcer du 2-col cramerait les grilles de champs. Le multi-colonnes est pour les pages larges.

**Continuité éducation ↔ outil** : `/app/conseils` (éducation) et `/app/audits` (outil) se renvoient l'un vers l'autre par un bloc cross-link, plutôt que de dupliquer la donnée (le tableau d'URLs auditées vit **uniquement** sur `/app/audits`).

**Mentions de marque dans l'app** (update 2026-05-12) :

- Côté pages applicatives `(app)/*`, le nom **« Mamie GEO »** n'apparaît **jamais** dans le chrome. Le top de sidebar suit le pattern **Vercel** (cf. screen Max 2026-05-12) : deux pills empilés, **workspace** au-dessus (avatar dégradé bleu brand + nom + plan badge) et **brand/domaine** dessous (square noir avec initiale + domaine + chevron switcher). L'utilisateur sait où il est — répéter le nom produit est du bruit.
- Côté pages publiques (`(marketing)`, `(blog)`, `/login`), le nom reste affiché normalement (utilisateur non identifié, contexte ≠).
- Côté placeholders de formulaires (onboarding), **rester générique** : `placeholder="Ta marque"` / `placeholder="ton-domaine.fr"` plutôt que des exemples nommés de la marque elle-même.

**Pattern « Workspace + Brand pills »** (pattern Vercel) :

Deux pills empilés en haut de la sidebar, séparés par 6 px de gap :

1. **Workspace pill** (`<WorkspacePill workspace />`) :
   - Avatar 24 px : cercle avec dégradé `from-[--color-accent] to-[--color-accent-dim]` + initiale du workspace (1 lettre, weight 600, blanc).
   - Label : nom du workspace, weight medium, truncate.
   - Badge plan à droite (tone `accent` si `trialing`, `neutral` sinon).
   - V0 : pas de chevron (un seul workspace par user). Greffer un `DropdownMenu` quand le multi-workspace arrivera.
2. **Brand pill** (`<BrandSwitcher brands currentBrandId />`) :
   - Avatar 24 px : square `radius-sm` `bg-[--color-ink]` + initiale en blanc — codifie la marque visuellement, distinct du cercle workspace.
   - Label : **le domaine** (pas le nom), c'est ce qui identifie une marque de façon non ambigüe côté GEO. Le nom complet apparaît dans le dropdown et dans le `title` attribute.
   - Chevron `ChevronsUpDown` à droite — c'est un switcher actif dès V0.
   - Dropdown : liste des brands du workspace, chacune avec son square + nom + domaine ; check sur la courante.

**Règle de cohérence** : le square noir = identité brand, le cercle dégradé = identité workspace. Cette distinction visuelle se retrouve partout (dropdown items, headers d'écran si besoin) — ne jamais inverser les formes.

**Pourquoi le pivot** :

- La Direction A "éditorial chaud" donnait un look déjà-vu et chargé (crème + serif + italique = magazine), pas adapté à un produit data-driven.
- Airbnb-like = standard moderne lisible, focus sur la donnée affichée (dashboard et tables sont l'essentiel produit), facile à itérer.
- Le bleu brand `#329cff` (logo) sert d'accent ponctuel — distinctif sans envahir l'interface (jamais en fond large).

**Conservé du brief originel** :

- Anti-patterns "look IA" toujours valables (cf. § Principes anti-IA + § Anti-patterns à bannir plus bas).
- Voix personnelle / founder visible / captures réelles plutôt qu'illustrations 3D : inchangé.
- Pattern "Sans nous / Avec nous" : inchangé pour la home (cf. § Composants et patterns obligatoires).

---

### ~~Système design carousels LinkedIn (acté 2026-06-04)~~ — RÉÉCRIT 2026-06-05

> ⚠️ **Section archivée**. Le système « Unified-like » (crème `#fff4d6` + vagues bleu brand + brand pill ink + Inter 800) acté 2026-06-04 a été **remplacé** le 2026-06-05 par un système plus distinctif inspiré de la persona « Mamie » (chaud, manuscrit, marguerite). Cf. doc 09 § 2026-06-05.
>
> **Source de vérité actuelle pour les carrousels et visuels marketing externes** : [`linkedindesign.md`](./linkedindesign.md).
>
> Résumé du nouveau système (détails dans linkedindesign.md) :
> - **Palette chaude Mamie** : Crème `#FBF4E9`, Sable `#F0E3CF`, Encre `#2E2620`, Terracotta `#DD6B45` (signature), Miel `#F3B43F` (surligneur), Sauge `#7FA67C`, Rose `#E59B96`. Le **bleu brand `#329CFF`** reste **couleur primaire** présente sur logo + accent typo signature par slide (1 mot clé bleu), pagination dots (confirmé Max 2026-06-05).
> - **Typographies** : Fraunces (titres serif Bold/Black), Hanken Grotesk (corps sans rond), Caveat (note manuscrite rare). Chargées via next/font/google **uniquement** dans `src/app/(app)/app/admin/layout.tsx` — l'app et le site marketing gardent Inter unique.
> - **Motif-signature** : marguerite 6 pétales (`<Daisy />`), terracotta/miel par défaut. Tailles grande (déco fond 8-15 % opacité) / moyenne (accent) / petite (puce).
> - **Surligneur miel** (`<Highlight />`) sur le mot clé du titre — une seule technique de mise en valeur par slide.
> - **Primitives** dans `src/components/admin/visuals/_primitives/` : `tokens.ts`, `daisy.tsx`, `highlight.tsx`, `brand-header.tsx`, `slide-shell.tsx`.
> - **8 gabarits de slides** (Lego) : Couverture, Définition, Chiffre, Recette/Étapes, Conseil, Citation, Avant/Après, CTA — détails et exemples dans linkedindesign.md § 6.
>
> **Périmètre strict (inchangé)** : **carousels LinkedIn, OG images V1+, blog covers V1+ uniquement**. **L'app `(app)/*` et le site marketing restent en direction Airbnb-like minimaliste** (Inter unique + blanc + nuances de gris + bleu brand `#329CFF` accent ponctuel). Dual-DA volontaire — le SaaS est froid data-driven, les carrousels portent la persona Mamie chaleureuse.

---

## Pourquoi ce document

L'enjeu : sortir du look "fait par une IA" qui caractérise 80% des SaaS lancés en 2025-2026 (gradient violet/bleu, illustrations 3D Stripe-like, "Trusted by 1000+", composants shadcn par défaut, ton corporate vide). Mamie GEO doit avoir une identité **française, humaine et honnête** — sobre, focus sur la donnée.

Ce doc définit la direction artistique, les patterns obligatoires, les anti-patterns, et conserve en archive les 3 directions concrètes initialement explorées (A éditorial chaud, B souverain, C studio indie) avant le pivot du 2026-05-07.

---

## Principes anti-IA

Les 8 règles non-négociables pour ne pas avoir l'air "généré".

### 1. Pas de gradient violet/bleu en hero

Le gradient `from-purple-600 to-blue-600` plein écran est devenu LE marqueur "AI startup". À bannir **en hero / fond large**. Le `--gradient-ai` brand (bleu → purple → pink) reste autorisé **uniquement sur les boutons d'actions IA** (audit, suggérer prompts, Ask AI) où il signale explicitement une opération IA.

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
"Sans carte bancaire · 7 jours d'essai · 5 minutes pour s'inscrire"

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
