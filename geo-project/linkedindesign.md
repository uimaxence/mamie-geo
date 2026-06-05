# linkedindesign.md — Système de design des carrousels LinkedIn de mamie-geo

> Brief de génération visuelle pour les carrousels LinkedIn de **mamie-geo**.
> Objectif : produire des slides cohérents, chaleureux et zéro-jargon, prêts à habiller les posts LinkedIn.
> Ce fichier est pensé pour être **réutilisé tel quel comme consigne** (à Claude, à un designer, ou à un outil de génération).

> ⚠️ **Périmètre** (cadré 2026-06-05) : ce document s'applique **uniquement aux carrousels LinkedIn et visuels marketing externes** (OG images V1+, blog covers V1+). Il **ne s'applique PAS** à l'app `(app)/*` ni au site marketing (home, pricing, blog), qui restent en direction Airbnb-like minimaliste (blanc + nuances de gris + bleu brand `#329CFF` accent + Inter unique) actée doc 10 et confirmée 2026-06-03. Dual-DA volontaire — cf. doc 09 § 2026-06-05.

> 🔁 **Raffinement v2 (2026-06-05 soir)** après premier rendu du carrousel SEO vs GEO. Pivot vers plus de sobriété pro :
>
> 1. **Fond blanc par défaut**, plus crème (la crème/sable deviennent occasionnelles, max 1-2 par carrousel pour rythmer).
> 2. **Bleu brand `#329CFF` = couleur primaire visible sur chaque slide** (logo, accent typo, CTA). La palette chaude (terracotta, miel, sauge, rose) reste mais **rétrogradée à accents secondaires** — pas en fond plein de slide sauf 1 slide CTA exceptionnelle.
> 3. **Marguerite retirée** (trop kitsch). Pas non plus de washi-tape, tampon « FAIT MAISON », fleurs vintage. L'identité passe désormais par typo + logo + palette restreinte.
> 4. **Tailles corps relevées** (corps min 32 px, corps large 40-48 px, label 24-28 px) — précédent trop petit en vignette feed mobile.
> 5. **Contraste renforcé** — viser AAA. Texte sur fond bleu brand uniquement en titre ≥ 24 px bold.
>
> Le carrousel SEO vs GEO actuel (commit `c3b92e3`) a été construit selon la v1 et est conservé tel quel — toutes les **nouvelles slides** doivent suivre les règles ci-dessous, marquées « v2 » quand elles diffèrent.

---

## 0. Ce qu'on a appris des références (et ce qu'on en garde)

Six DA de réseaux sociaux analysées (Unified, Settle, Marketing.Co, lovebug.media, B Academy…). Les recettes qui reviennent **partout** :

| Pattern observé | Pourquoi ça marche | Notre version mamie |
|---|---|---|
| **Le titre EST le design** : un message énorme, peu d'éléments | Lisible au pouce, arrête le scroll | On garde. Titre qui mange 50–70 % de la slide. |
| **Palette resserrée** (1 dominante + 1-2 accents + neutre) | Reconnaissable, cohérent en feed | Palette chaude mamie figée plus bas. |
| **Tout arrondi** (cartes, pills, boîtes) | Doux, accessible, non-corporate | Coins très arrondis partout + bord festonné « napperon ». |
| **Un motif-signature** (astérisque, étoile, +) | Crée une identité instantanée | La **marguerite** mamie + le **feston**. |
| **Mimétisme UI sociale** (barre story, icônes, bulles) | Le contenu paraît « natif » | Bulles de discussion + petites étiquettes manuscrites. |
| **Types de cartes réutilisables** (hook, définition, chiffre, liste, citation, CTA) | On assemble un carrousel comme un Lego | 8 gabarits définis plus bas. |
| **Surlignage du mot-clé** (boîte colorée / souligné / italique) | Guide l'œil, hiérarchise | « Le surligneur de mamie » (miel) + souligné manuscrit. |
| **Stickers & textures** (fleurs, smileys, papier, halftone) | Chaleur, côté fait-main | Napperon, fleurs vintage, washi-tape, tampon « fait maison ». |
| **Flèche → / "swipe to read"** | Invite à continuer | On garde la flèche, version arrondie. |

Ce qu'on **n'imite pas** : le côté froid/agence des fonds bleus saturés (Marketing.Co, image 4) et le fond noir (lovebug). Mamie est chaude, jamais clinique.

---

## 1. Principes directeurs (la philosophie mamie)

1. **Zéro jargon visible.** Si un terme GEO doit apparaître, il vient avec sa « définition de mamie » sur la slide.
2. **On tient la main.** Chaque carrousel se termine par *quoi faire ensuite* (jamais juste un constat).
3. **Chaleur > performance brute.** Crème, courbes, papier. On rassure avant d'impressionner.
4. **Une idée par slide.** Si deux idées veulent cohabiter → deux slides.
5. **Lisible au pouce.** Si le titre n'est pas lisible en vignette, il est trop petit.
6. **Cohérence > variété.** Mêmes couleurs, même motif, même grille sur tout le carrousel.
7. **Le sourire est permis.** Un sticker, un clin d'œil, un mot manuscrit — mais un seul par slide.

---

## 2. Palette de couleurs (v2 — 2026-06-05 soir)

Pivot vers une dominante pro : **blanc + bleu brand** comme socle, palette chaude rétrogradée en accents secondaires pour ponctuer.

### Neutres (fonds & texte)
- `Blanc` **#FFFFFF** — **fond par défaut**, sur ~80 % des slides (v2)
- `Crème` **#FBF4E9** — fond alternatif occasionnel, max 1-2 slides par carrousel pour rythmer
- `Sable` **#F0E3CF** — fond cartes secondaires, rare
- `Encre` **#2E2620** — texte principal (brun très foncé, jamais noir pur)
- `Encre douce` **#5A4A3C** — texte secondaire
- `Gris` **#F5F0E8** — séparateurs/bordures discrets (sur fond blanc, donne un beige imperceptible)

### Couleur primaire brand (présente sur chaque slide)
- `Bleu brand` **#329CFF** — **couleur principale** : logo, accents typo (1 mot clé par slide), CTAs, traits décoratifs, dots de pagination active. Confirmation Max 2026-06-05 (« garde bien le bleu actuel comme couleur primaire »).
- `Bleu brand dim` **#1D7EE5** — hover/pressed, contrastes plus durs sur fond clair
- `Bleu brand soft` **#EAF4FF` — fond de pill/badge bleu, cartes accent

### Couleurs d'accent chaud (jamais en fond plein de slide en v2)
- `Terracotta` **#DD6B45** — accent chaleur ponctuel (puce de liste, soulignage typo, pill CTA). **Exception** : 1 slide CTA finale peut être full-bleed terracotta pour clôturer le carrousel — pas plus.
- `Miel` **#F3B43F** — surligneur sur mot clé (technique de mise en valeur principale), pill « ASTUCE »
- `Sauge` **#7FA67C** — accent secondaire « tout va bien » (rare)
- `Rose ancien` **#E59B96** — touches déco rares

### Règles d'usage v2
- **Blanc en fond par défaut.** Crème/sable occasionnels (1-2 max par carrousel).
- **Bleu brand visible sur chaque slide** au minimum via le logo + 1 accent typo.
- **Pas de fond terracotta plein** sauf 1 slide CTA finale exceptionnelle.
- **Max 2 couleurs d'accent par slide** (hors blanc + encre + bleu brand qui sont la base).
- **Contraste AAA visé**, AA minimum strict :
  - Texte sur Blanc/Crème/Sable → `Encre #2E2620` (ratio ≥ 13:1 ✓ AAA)
  - Texte sur Bleu brand `#329CFF` → `Blanc` uniquement en titres ≥ 24 px bold (ratio 4.8:1 = AA Large only)
  - Texte sur Terracotta → `Crème` (ratio 5.2:1 ✓ AA)
  - Texte sur Miel → `Encre` (jamais blanc — ratio insuffisant)
  - Texte sur Sauge → `Encre` (jamais blanc)
- Le rose et la sauge ne sont jamais fonds de slide entiers — accents/déco uniquement.

---

## 3. Typographie

Combo « mamie moderne » : un serif chaud + un sans rond + une touche manuscrite. Toutes des polices **gratuites (Google Fonts)** pour être utilisables partout.

| Rôle | Police | Style |
|---|---|---|
| **Titres / hooks** | `Fraunces` | Bold / Black, optical "soft" |
| **Sous-titres** | `Fraunces` | Semibold (ou italique pour l'emphase) |
| **Corps / labels** | `Hanken Grotesk` | Regular / Medium / Bold |
| **Note de mamie** (rare) | `Caveat` | manuscrit, accents seulement |

Alternatives équivalentes si besoin : *Recoleta* (≈ Fraunces), *General Sans* / *Inter* (≈ Hanken).

### Échelle typographique v2 (base format 1080 × 1350) — 2026-06-05 soir
- **Hook / display** : 120–150 px · Fraunces Black · interligne 0,95
- **Titre de slide (H1)** : 84–100 px · Fraunces Bold · interligne 1,0
- **H2** : 56–66 px · Fraunces Semibold
- **Corps large** : 40–48 px · Hanken Medium · interligne 1,35 *(v2 — précédent 36-40, illisible en vignette)*
- **Corps** : 32–36 px · Hanken Regular *(v2 — précédent 28-32)*
- **Label / pill** : 24–28 px · Hanken Bold · MAJUSCULES · interlettrage +4 % *(v2 — précédent 22-24)*
- **Note manuscrite Caveat** : 50–60 px — **usage rare**, max 1 par carrousel et seulement si elle apporte du sens (pas de déco gratuite)

### Règle de lisibilité durcie (v2)
Tout texte qui n'est ni footer ni mention légale doit être **≥ 32 px**. **Test obligatoire** : afficher la slide en vignette ~135 × 168 px (1/8 de la taille native) — si tu ne distingues plus le contenu, c'est trop petit. LinkedIn affiche les carrousels d'abord en vignette dans le feed.

### Règles générales
- Max **2 niveaux de hiérarchie** par slide.
- Titres **alignés à gauche** par défaut (centré seulement pour les cartes « définition » et « citation »).
- Jamais plus de ~7 mots dans un hook.
- L'emphase passe par : **surligneur miel** > *italique Fraunces* > **mot en bleu brand**. Une seule technique par slide. (v2 : le souligné manuscrit est retiré, trop kitsch.)

---

## 4. Système de formes (v2 — 2026-06-05 soir)

> 🔁 **Motif-signature retiré (v2)**. La marguerite proposée en v1 a été abandonnée après le premier rendu du carrousel SEO vs GEO — trop décorative, trop kitsch, ne sert pas le positionnement pro. Idem pour washi-tape, tampon « FAIT MAISON », fleurs vintage.
>
> **L'identité visuelle passe désormais par 3 éléments simples** :
> 1. Le **logo Mamie GEO** en bleu brand `#329CFF` (top-left chaque slide)
> 2. La **palette restreinte** (blanc dominant + bleu brand + 1-2 accents chauds occasionnels)
> 3. La **typographie Fraunces** (serif chaud, déjà signature en soi)

### Formes-conteneurs autorisées
- **Coins arrondis généreux** : rayon 24–32 px sur les cartes, 9999 px (pill) sur les boutons/labels/badges.
- **Cartes blanches sur fond crème** (ou inverse) avec border 1 px `#F0E3CF` + box-shadow subtile pour isoler du contenu structuré.
- **Traits de séparation** discrets (1 px `#F5F0E8`) entre sections d'une même slide.
- **Pas de bord festonné/napperon** en v2 (trop ornemental). Coins arrondis suffisent.

### Accents géométriques minimalistes (à doser)
- **Flèche `→`** dans une pill bleu brand ou cream — usage CTA et « swipe ».
- **Coche `✓`** ou croix `✗` simples dans une pill — pour les listes oui/non et Avant/Après.
- **Pastille ronde** colorée (bleu brand, miel, ou ink) contenant un chiffre ou icône Lucide simple.

### v1 archivé (à ne PAS utiliser)
- ❌ Marguerite signature 🌼
- ❌ Bord festonné / napperon
- ❌ Petits cœurs, étoiles 4 branches, pois vichy
- ❌ Fleurs vintage, washi-tape, tampon « FAIT MAISON », point de couture
- ❌ Stickers décoratifs en général

---

## 5. Grille & specs techniques

### Format
- **Carrousel LinkedIn** = post document, exporté en **PDF**.
- Dimension recommandée : **1080 × 1350 px (4:5, portrait)** → occupe le maximum d'écran mobile.
- Alternative : 1080 × 1080 (carré) si le visuel l'exige. **Ne jamais mélanger** les ratios dans un même carrousel.

### Marges & grille
- **Marge de sécurité** : 80 px sur les 4 côtés (rien d'important au-delà).
- Colonne de texte : largeur max ~920 px.
- Espace généreux : laisser « respirer », le vide chaleureux fait partie de la DA.

### Constantes de marque (présentes sur chaque slide)
- **Logo / nom mamie-geo** : en haut à gauche, petit (≈ 36 px de haut), discret.
- **Pagination** : petit indicateur en bas (ex. `2 / 7`) ou points festonnés.
- **Pied de marque** : `mamie-geo` ou l'URL, bas de slide, taille label.

### Longueur recommandée du carrousel
6 à 9 slides. Sous 5 c'est court, au-dessus de 10 on perd le lecteur.

---

## 6. Les 8 gabarits de slides (le Lego)

Chaque carrousel s'assemble à partir de ces blocs. Nom mamie + structure + quand l'utiliser.

### 1. 🏡 La couverture (hook)
- **But** : arrêter le scroll, promettre.
- **Structure** : titre énorme (Fraunces Black) aligné gauche + marguerite en accent + flèche `→` discrète + logo en haut.
- **Fond** : terracotta ou crème. 1 mot-clé peut être surligné miel.
- *Ex. : « Pourquoi ChatGPT ne parle jamais de votre entreprise → »*

### 2. 📖 La définition de mamie
- **But** : désamorcer un terme GEO (anti-jargon).
- **Structure** : format fiche de dictionnaire dans un napperon festonné — `mot` en gros, prononciation en petit, puis explication ultra-simple.
- **Fond** : sable ou sauge. Encadré crème festonné.
- *Ex. : « GEO /jé-o/ — c'est faire en sorte que les IA (ChatGPT, Gemini…) recommandent votre boîte. »*

### 3. 🔢 Le chiffre qui parle
- **But** : une stat-héros, marquante.
- **Structure** : un seul **gros chiffre** (Fraunces, 200–300 px) + une ligne d'explication courte en dessous.
- **Fond** : miel ou terracotta. Chiffre en Encre/Crème.
- *Ex. : « 6 français sur 10 demandent à une IA avant d'acheter. »*

### 4. 📝 La recette / les étapes
- **But** : liste numérotée, actionnable (le côté « tiens la main »).
- **Structure** : titre + 3 à 4 étapes `01 / 02 / 03`, numéro dans une pastille miel, libellé court + une ligne d'explication.
- **Fond** : crème. Pastilles colorées.
- *Ex. : « 3 gestes pour exister dans les réponses des IA. »*

### 5. 💬 Le conseil de mamie
- **But** : une astuce isolée, ton complice.
- **Structure** : bulle de discussion (rappel UI sociale) + petite scintille miel ou note manuscrite Caveat.
- **Fond** : sauge ou rose-sur-crème.
- *Ex. : « Petit secret : les IA adorent les pages “FAQ”. »*

### 6. ⭐ Ce qu'on en dit (preuve / citation)
- **But** : témoignage, citation, capture de preuve.
- **Structure** : citation centrée dans un napperon festonné + nom/rôle en pill miel + photo ronde optionnelle.
- **Fond** : sable ou crème.

### 7. ⚖️ Avant / Après (ou Avec / Sans mamie-geo)
- **But** : contraste clair, pédagogique.
- **Structure** : slide coupée en deux (gauche « avant » terne, droite « après » terracotta/sauge) OU deux colonnes ✗/✓.
- **Fond** : split de deux couleurs de la palette.

### 8. 🤝 On en parle ? (CTA)
- **But** : dernière slide, dire **quoi faire maintenant**.
- **Structure** : phrase d'invitation chaleureuse + bouton pill terracotta + sticker enveloppe/cœur.
- **Fond** : terracotta (CTA en crème) ou crème (CTA en terracotta).
- *Ex. : « Envie de voir où en est votre visibilité IA ? On regarde ça ensemble. »*

---

## 7. Structure type d'un carrousel

Séquence recommandée (adapter selon le post) :

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

Règle d'or : **alterner les fonds** (crème → sable → terracotta → crème…) pour le rythme, mais garder le **même motif et la même typo** partout.

---

## 8. Techniques de mise en valeur (v2)

À choisir **une seule** par slide :

1. **Le surligneur miel** — mot-clé dans une boîte arrondie miel (texte Encre dessus). Technique privilégiée.
2. **Le mot en bleu brand** `#329CFF` — un mot clé du titre en bleu brand pour ancrer l'identité.
3. *L'italique Fraunces* — pour une nuance, un mot « du cœur ».
4. **La pill-étiquette** — petit label MAJUSCULE (ASTUCE, VRAI/FAUX, À RETENIR) en haut de slide.

> ❌ **Retirés en v2** : le souligné manuscrit (trop kitsch). Caveat manuscrit comme technique d'emphase → demoted, voir § 3 (usage rare et signifiant uniquement).

---

## 9. Photos & illustrations

- Toujours en **coins arrondis** (rayon 48 px+) ou dans un **cadre festonné**.
- Crops **ronds** pour les visages (témoignages).
- Traitement texture autorisé : léger **halftone/grain** chaud pour intégrer une photo froide à la DA.
- Captures d'écran (résultats IA, dashboard mamie-geo) : posées dans un **mockup de téléphone** ou une carte arrondie, jamais nues.
- Éviter les banques d'images « corporate bureau » froides → préférer mains, objets, scènes douces, ou de l'illustration plate.

---

## 10. Ton du copywriting visuel (rappel)

- Tutoiement chaleureux ou vouvoiement doux selon la cible — **constant** sur le carrousel.
- Phrases courtes, mots simples. On explique comme à un proche.
- On nomme un problème **sans culpabiliser** (« c'est normal de ne pas savoir »).
- Toujours finir par **une action concrète**.
- Une pointe d'humour tendre OK ; jamais cynique ni « growth-bro ».

---

## 11. À faire / À éviter

**À faire** ✅
- Un message par slide, gros et lisible au pouce.
- Alterner les fonds, garder motif + typo identiques.
- Toujours une slide CTA qui dit quoi faire.
- Définir tout terme technique sur place.
- Contraste AA respecté.

**À éviter** ❌
- Fond noir, fond gris corporate.
- Plus de 2 couleurs d'accent par slide (hors blanc + encre + bleu brand qui sont la base).
- Fond plein terracotta hors slide CTA finale exceptionnelle.
- Mélanger les ratios dans un carrousel.
- **Marguerite, washi tape, tampon « FAIT MAISON », stickers en général** (v2 — trop kitsch, casse le positionnement pro).
- Caveat manuscrit en déco gratuite (max 1 par carrousel et seulement si sens).
- Souligné manuscrit comme technique d'emphase (v2 — retiré).
- Du jargon non expliqué (« optimisation sémantique », « LLM », « embeddings » → à traduire en langage simple).
- Texte qui touche les bords (respecter la marge 80 px).
- **Texte corps < 32 px** (v2 — illisible en vignette feed mobile, voir § 3).
- Texte blanc sur fond Miel ou Sauge (contraste insuffisant — toujours Encre dans ces cas).

---

## 12. Prompt réutilisable (pour générer une slide / un carrousel)

> Copie-colle ceci en remplaçant le contenu :

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

Règles : 1 idée/slide, alterner les fonds, 1 seule technique de mise en valeur par slide,
zéro jargon non expliqué, finir par une action concrète.
```

---

*Fichier de travail — DA mamie-geo. Faire évoluer au fil des tests A/B sur LinkedIn.*
