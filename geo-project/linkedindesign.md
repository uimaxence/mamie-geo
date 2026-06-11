# linkedindesign.md — Système de design des carrousels LinkedIn de mamie-geo

> Brief de génération visuelle pour les carrousels LinkedIn de **mamie-geo**. Pensé pour être **réutilisé tel quel comme consigne** (à Claude, à un designer, ou à un outil de génération).

> ⚠️ **Périmètre** (cadré 2026-06-05) : s'applique **uniquement aux carrousels LinkedIn et visuels marketing externes** (OG images V1+, blog covers V1+). Ne s'applique PAS à l'app `(app)/*` ni au site marketing, qui restent en direction Airbnb-like minimaliste (blanc + gris + bleu brand `#329CFF` + Inter). Dual-DA volontaire — cf. doc 09 § 2026-06-05.

> 🔁 **Version courante : v2 (2026-06-05 soir)**, après premier rendu du carrousel SEO vs GEO. Pivot sobriété pro : fond blanc par défaut, bleu brand primaire sur chaque slide, accents chauds rétrogradés, motifs décoratifs v1 archivés (marguerite, feston, washi-tape, stickers), corps ≥ 32 px, contraste AAA visé. Les règles v2 sont intégrées dans le corps du doc ci-dessous. Le carrousel SEO vs GEO (commit `c3b92e3`) a été construit selon la v1 et est conservé tel quel — toutes les **nouvelles slides** suivent la v2.

---

## 0. Ce qu'on a appris des références (et ce qu'on en garde)

Six DA de réseaux sociaux analysées (Unified, Settle, Marketing.Co, lovebug.media, B Academy…). Recettes retenues :

- **Le titre EST le design** : message énorme, peu d'éléments → titre qui mange 50-70 % de la slide
- **Palette resserrée** (1 dominante + 1-2 accents + neutre) → reconnaissable en feed
- **Tout arrondi** (cartes, pills) → doux, non-corporate
- **Types de cartes réutilisables** (hook, définition, chiffre, liste, citation, CTA) → 8 gabarits § 6
- **Surlignage du mot-clé** → surligneur miel
- **Flèche → / « swipe »** → conservée, version arrondie

Ce qu'on **n'imite pas** : fonds bleus saturés froids (Marketing.Co), fond noir (lovebug). Et depuis la v2, les stickers/textures « fait-main » des références sont également écartés (trop kitsch pour le positionnement pro).

---

## 1. Principes directeurs (la philosophie mamie)

1. **Zéro jargon visible.** Tout terme GEO vient avec sa « définition de mamie » sur la slide.
2. **On tient la main.** Chaque carrousel se termine par *quoi faire ensuite*.
3. **Chaleur > performance brute.** On rassure avant d'impressionner.
4. **Une idée par slide.** Deux idées → deux slides.
5. **Lisible au pouce.** Titre illisible en vignette = trop petit.
6. **Cohérence > variété.** Mêmes couleurs, même typo, même grille sur tout le carrousel.
7. **Le sourire est permis.** Un clin d'œil, un mot manuscrit — mais un seul par slide.

---

## 2. Palette de couleurs (v2 — 2026-06-05 soir)

Dominante pro : **blanc + bleu brand** comme socle, palette chaude en accents secondaires.

### Neutres (fonds & texte)
- `Blanc` **#FFFFFF** — **fond par défaut**, ~80 % des slides (v2)
- `Crème` **#FBF4E9** — fond alternatif occasionnel, max 1-2 slides par carrousel
- `Sable` **#F0E3CF** — fond cartes secondaires, rare
- `Encre` **#2E2620** — texte principal (brun très foncé, jamais noir pur)
- `Encre douce` **#5A4A3C** — texte secondaire
- `Gris` **#F5F0E8** — séparateurs/bordures discrets

### Couleur primaire brand (présente sur chaque slide)
- `Bleu brand` **#329CFF** — **couleur principale** : logo, accents typo (1 mot clé par slide), CTAs, traits décoratifs, dots de pagination active. Confirmation Max 2026-06-05.
- `Bleu brand dim` **#1D7EE5** — hover/pressed, contrastes durs sur fond clair
- `Bleu brand soft` **#EAF4FF** — fond de pill/badge bleu, cartes accent

### Couleurs d'accent chaud (jamais en fond plein de slide en v2)
- `Terracotta` **#DD6B45** — accent chaleur ponctuel (puce, soulignage, pill CTA). **Exception** : 1 slide CTA finale peut être full-bleed terracotta — pas plus
- `Miel` **#F3B43F** — surligneur sur mot clé (technique principale), pill « ASTUCE »
- `Sauge` **#7FA67C** — accent secondaire « tout va bien » (rare)
- `Rose ancien` **#E59B96** — touches déco rares

### Règles d'usage v2
- Blanc en fond par défaut ; crème/sable occasionnels (1-2 max par carrousel)
- Bleu brand visible sur chaque slide (minimum : logo + 1 accent typo)
- Pas de fond terracotta plein hors slide CTA finale exceptionnelle
- Max 2 couleurs d'accent par slide (hors blanc + encre + bleu brand, qui sont la base)
- **Contraste AAA visé**, AA minimum strict :
  - Texte sur Blanc/Crème/Sable → `Encre #2E2620` (≥ 13:1 ✓ AAA)
  - Texte sur Bleu brand → `Blanc` uniquement en titres ≥ 24 px bold (4.8:1 = AA Large only)
  - Texte sur Terracotta → `Crème` (5.2:1 ✓ AA)
  - Texte sur Miel ou Sauge → `Encre` (jamais blanc — ratio insuffisant)
- Rose et sauge jamais en fond de slide entier — accents/déco uniquement

---

## 3. Typographie

Combo « mamie moderne », polices **gratuites (Google Fonts)** :

| Rôle | Police | Style |
|---|---|---|
| **Titres / hooks** | `Fraunces` | Bold / Black, optical "soft" |
| **Sous-titres** | `Fraunces` | Semibold (ou italique pour l'emphase) |
| **Corps / labels** | `Hanken Grotesk` | Regular / Medium / Bold |
| **Note de mamie** (rare) | `Caveat` | manuscrit, accents seulement |

Alternatives : *Recoleta* (≈ Fraunces), *General Sans* / *Inter* (≈ Hanken).

### Échelle typographique v2 (base 1080 × 1350)
- **Hook / display** : 120-150 px · Fraunces Black · interligne 0,95
- **Titre de slide (H1)** : 84-100 px · Fraunces Bold · interligne 1,0
- **H2** : 56-66 px · Fraunces Semibold
- **Corps large** : 40-48 px · Hanken Medium · interligne 1,35
- **Corps** : 32-36 px · Hanken Regular
- **Label / pill** : 24-28 px · Hanken Bold · MAJUSCULES · interlettrage +4 %
- **Note manuscrite Caveat** : 50-60 px — usage rare, max 1 par carrousel et seulement si elle apporte du sens

### Règle de lisibilité durcie (v2)
Tout texte hors footer/mention légale **≥ 32 px**. **Test obligatoire** : afficher la slide en vignette ~135 × 168 px (1/8 natif) — si le contenu ne se distingue plus, c'est trop petit (LinkedIn affiche d'abord en vignette feed).

### Règles générales
- Max **2 niveaux de hiérarchie** par slide
- Titres **alignés à gauche** par défaut (centré seulement pour cartes « définition » et « citation »)
- Jamais plus de ~7 mots dans un hook
- Emphase : **surligneur miel** > *italique Fraunces* > **mot en bleu brand**. Une seule technique par slide. (Souligné manuscrit retiré en v2.)

---

## 4. Système de formes (v2 — 2026-06-05 soir)

> 🔁 **Motif-signature retiré (v2)** : la marguerite v1 abandonnée après le premier rendu (trop kitsch). Idem washi-tape, tampon « FAIT MAISON », fleurs vintage.
>
> **L'identité visuelle passe par 3 éléments** :
> 1. Le **logo Mamie GEO** en bleu brand `#329CFF` (top-left chaque slide)
> 2. La **palette restreinte** (blanc dominant + bleu brand + 1-2 accents chauds occasionnels)
> 3. La **typographie Fraunces** (serif chaud, signature en soi)

### Formes-conteneurs autorisées
- **Coins arrondis généreux** : rayon 24-32 px sur les cartes, pill (9999 px) sur boutons/labels/badges
- **Cartes blanches sur fond crème** (ou inverse) avec border 1 px `#F0E3CF` + box-shadow subtile
- **Traits de séparation** discrets (1 px `#F5F0E8`)
- Pas de bord festonné/napperon en v2

### Accents géométriques minimalistes (à doser)
- **Flèche `→`** dans une pill bleu brand ou cream — CTA et « swipe »
- **Coche `✓`** / croix `✗` dans une pill — listes oui/non, Avant/Après
- **Pastille ronde** colorée (bleu brand, miel, encre) contenant chiffre ou icône Lucide simple

### v1 archivé (à ne PAS utiliser)
❌ Marguerite 🌼 · bord festonné/napperon · cœurs, étoiles 4 branches, pois vichy · fleurs vintage, washi-tape, tampon « FAIT MAISON », point de couture · stickers décoratifs en général

---

## 5. Grille & specs techniques

### Format
- Carrousel LinkedIn = post document exporté en **PDF**
- **1080 × 1350 px (4:5 portrait)** recommandé ; alternative 1080 × 1080. **Ne jamais mélanger** les ratios dans un carrousel

### Marges & grille
- **Marge de sécurité 80 px** sur les 4 côtés
- Colonne de texte : largeur max ~920 px
- Espace généreux — le vide fait partie de la DA

### Constantes de marque (chaque slide)
- **Logo mamie-geo** : haut gauche, ≈ 36 px de haut, discret
- **Pagination** : indicateur bas de slide (ex. `2 / 7`)
- **Pied de marque** : `mamie-geo` ou URL, bas de slide, taille label

### Longueur recommandée
6 à 9 slides (sous 5 trop court, au-dessus de 10 on perd le lecteur).

---

## 6. Les 8 gabarits de slides (le Lego)

Chaque carrousel s'assemble à partir de ces blocs (versions mises en conformité v2) :

### 1. 🏡 La couverture (hook)
- **But** : arrêter le scroll, promettre
- **Structure** : titre énorme (Fraunces Black) aligné gauche + flèche `→` discrète + logo. Fond blanc (ou crème), 1 mot surligné miel ou en bleu brand
- *Ex. : « Pourquoi ChatGPT ne parle jamais de votre entreprise → »*

### 2. 📖 La définition de mamie
- **But** : désamorcer un terme GEO (anti-jargon)
- **Structure** : fiche de dictionnaire dans une carte arrondie — `mot` en gros, prononciation en petit, explication ultra-simple. Carte crème/sable sur fond blanc
- *Ex. : « GEO /jé-o/ — c'est faire en sorte que les IA recommandent votre boîte. »*

### 3. 🔢 Le chiffre qui parle
- **But** : une stat-héros marquante
- **Structure** : un seul **gros chiffre** (Fraunces, 200-300 px, encre ou bleu brand) + une ligne d'explication courte
- *Ex. : « 6 français sur 10 demandent à une IA avant d'acheter. »*

### 4. 📝 La recette / les étapes
- **But** : liste numérotée actionnable
- **Structure** : titre + 3-4 étapes `01 / 02 / 03`, numéro en pastille miel ou bleu brand, libellé court + une ligne d'explication
- *Ex. : « 3 gestes pour exister dans les réponses des IA. »*

### 5. 💬 Le conseil de mamie
- **But** : une astuce isolée, ton complice
- **Structure** : bulle de discussion (rappel UI sociale), éventuelle note Caveat si signifiante
- *Ex. : « Petit secret : les IA adorent les pages “FAQ”. »*

### 6. ⭐ Ce qu'on en dit (preuve / citation)
- **But** : témoignage, citation, preuve
- **Structure** : citation centrée dans une carte arrondie + nom/rôle en pill miel + photo ronde optionnelle

### 7. ⚖️ Avant / Après (ou Avec / Sans mamie-geo)
- **But** : contraste pédagogique
- **Structure** : deux colonnes ✗/✓ (pills) sur fond blanc — éviter le split full-bleed de couleurs chaudes en v2

### 8. 🤝 On en parle ? (CTA)
- **But** : dernière slide, dire **quoi faire maintenant**
- **Structure** : phrase d'invitation chaleureuse + bouton pill (bleu brand ou terracotta). Seule slide pouvant être full-bleed terracotta (CTA en crème)
- *Ex. : « Envie de voir où en est votre visibilité IA ? On regarde ça ensemble. »*

---

## 7. Structure type d'un carrousel

```
Slide 1  → 🏡 Couverture (hook + promesse + →)
Slide 2  → 📖 / 🔢 Mise en contexte (définition ou chiffre choc)
Slide 3  → Le problème (constat, ton bienveillant)
Slide 4  → 📝 Solution / étape 1
Slide 5  → 📝 Étape 2
Slide 6  → 📝 Étape 3
Slide 7  → ⭐ / ⚖️ Preuve ou récap
Slide 8  → 🤝 CTA « on en parle ? »
```

Règle d'or v2 : **fond blanc par défaut**, 1-2 slides crème pour rythmer, éventuelle CTA finale terracotta — même typo et mêmes constantes de marque partout.

---

## 8. Techniques de mise en valeur (v2)

À choisir **une seule** par slide :

1. **Le surligneur miel** — mot-clé dans une boîte arrondie miel (texte Encre). Technique privilégiée.
2. **Le mot en bleu brand** `#329CFF` — un mot clé du titre en bleu pour ancrer l'identité.
3. *L'italique Fraunces* — pour une nuance, un mot « du cœur ».
4. **La pill-étiquette** — label MAJUSCULE (ASTUCE, VRAI/FAUX, À RETENIR) en haut de slide.

> ❌ Retirés en v2 : souligné manuscrit (kitsch) ; Caveat comme technique d'emphase (→ usage rare et signifiant uniquement, cf. § 3).

---

## 9. Photos & illustrations

- Toujours en **coins arrondis** (rayon 48 px+)
- Crops **ronds** pour les visages (témoignages)
- Texture autorisée : léger **halftone/grain** chaud pour intégrer une photo froide
- Captures d'écran (résultats IA, dashboard) : dans un **mockup de téléphone** ou une carte arrondie, jamais nues
- Éviter les banques d'images « corporate bureau » → mains, objets, scènes douces, ou illustration plate

---

## 10. Ton du copywriting visuel (rappel)

- Tutoiement chaleureux ou vouvoiement doux selon la cible — **constant** sur le carrousel
- Phrases courtes, mots simples ; on explique comme à un proche
- Nommer un problème **sans culpabiliser** (« c'est normal de ne pas savoir »)
- Toujours finir par **une action concrète**
- Humour tendre OK ; jamais cynique ni « growth-bro »

---

## 11. À faire / À éviter

**À faire** ✅
- Un message par slide, gros et lisible au pouce
- Fond blanc par défaut, typo et constantes de marque identiques partout
- Toujours une slide CTA qui dit quoi faire
- Définir tout terme technique sur place
- Contraste AA respecté (AAA visé)

**À éviter** ❌
- Fond noir, fond gris corporate
- Plus de 2 couleurs d'accent par slide (hors blanc + encre + bleu brand)
- Fond plein terracotta hors slide CTA finale exceptionnelle
- Mélanger les ratios dans un carrousel
- **Marguerite, washi-tape, tampon « FAIT MAISON », stickers en général** (v1 archivé)
- Caveat en déco gratuite (max 1 par carrousel, seulement si sens)
- Souligné manuscrit comme emphase
- Jargon non expliqué (« optimisation sémantique », « LLM », « embeddings » → traduire)
- Texte qui touche les bords (marge 80 px)
- **Texte corps < 32 px** (illisible en vignette feed mobile)
- Texte blanc sur Miel ou Sauge (contraste insuffisant — toujours Encre)

---

## 12. Prompt réutilisable (pour générer une slide / un carrousel)

> Copie-colle en remplaçant le contenu :

```
Génère un carrousel LinkedIn pour mamie-geo en suivant linkedindesign.md (v2 — 2026-06-05 soir).
Format 1080×1350, [N] slides, marge 80px.
DA v2 : fond BLANC par défaut (crème occasionnelle 1-2 slides max),
couleur primaire BLEU BRAND #329CFF (logo + 1 accent typo/slide + CTA),
accents chauds rétrogradés (terracotta/miel/sauge en accents ponctuels, jamais fond plein sauf 1 slide CTA),
titres Fraunces Bold/Black, corps Hanken Grotesk min 32 px, coins arrondis 24-32 px,
logo mamie-geo en haut à gauche + pagination en bas, contraste AAA visé.
PAS DE marguerite, washi-tape, stickers décoratifs, souligné manuscrit (v1 archivé).

Sujet du post : [SUJET]
Angle / promesse : [PROMESSE]
Cible : [TPE/PME / solo / agence]

Structure souhaitée :
- Slide 1 : Couverture — hook : "[TITRE]"
- Slide 2 : [définition / chiffre] — "[CONTENU]"
- ...
- Dernière : CTA — "[INVITATION]"

Règles : 1 idée/slide, fond blanc dominant, 1 seule technique de mise en valeur par slide,
zéro jargon non expliqué, finir par une action concrète.
```

---

*Fichier de travail — DA mamie-geo. Faire évoluer au fil des tests A/B sur LinkedIn.*
