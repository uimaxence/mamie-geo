# linkedindesign.md — Système de design des carrousels LinkedIn de mamie-geo

> Brief de génération visuelle pour les carrousels LinkedIn de **mamie-geo**.
> Objectif : produire des slides cohérents, chaleureux et zéro-jargon, prêts à habiller les posts LinkedIn.
> Ce fichier est pensé pour être **réutilisé tel quel comme consigne** (à Claude, à un designer, ou à un outil de génération).

> ⚠️ **Périmètre** (cadré 2026-06-05) : ce document s'applique **uniquement aux carrousels LinkedIn et visuels marketing externes** (OG images V1+, blog covers V1+). Il **ne s'applique PAS** à l'app `(app)/*` ni au site marketing (home, pricing, blog), qui restent en direction Airbnb-like minimaliste (blanc + nuances de gris + bleu brand `#329CFF` accent + Inter unique) actée doc 10 et confirmée 2026-06-03. Le SaaS reste froid et data-driven ; les carrousels portent la persona « Mamie » chaude et humaine. Dual-DA volontaire — cf. doc 09 § 2026-06-05.

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

## 2. Palette de couleurs

Chaude, accessible, légèrement « pop » pour rester moderne (pas vieillot).

### Neutres (fonds & texte)
- `Crème` **#FBF4E9** — fond par défaut le plus fréquent
- `Sable` **#F0E3CF** — fond alternatif / cartes secondaires
- `Encre` **#2E2620** — texte principal (brun très foncé, jamais noir pur)
- `Encre douce` **#5A4A3C** — texte secondaire

### Couleurs de marque
- `Terracotta` **#DD6B45** — **couleur signature** (motif, accents forts, CTA)
- `Miel` **#F3B43F** — surligneur, étiquettes, énergie
- `Sauge` **#7FA67C** — vert doux, sérénité / "tout va bien"
- `Rose ancien` **#E59B96** — douceur, touches déco
- `Bleu pervenche` **#A9C0D6** — accent froid optionnel (rare, pour respirer)

### Règles d'usage
- **1 fond + 1 dominante par slide.** Pas plus de 3 couleurs par slide (hors neutres).
- Une slide = un fond plein (crème, sable, terracotta, sauge ou miel). On alterne les fonds le long du carrousel pour le rythme.
- **Contraste obligatoire** (AA mini) :
  - Texte sur Crème/Sable → `Encre`.
  - Texte sur Terracotta → `Crème` (#FBF4E9).
  - Texte sur Sauge → `Encre` ou `Crème`.
  - Texte sur Miel → `Encre` (jamais blanc).
- Le **rose** et le **pervenche** ne sont jamais des fonds de slide entiers → seulement accents/déco.

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

### Échelle typographique (base format 1080 × 1350)
- **Hook / display** : 110–140 px · Fraunces Black · interligne 0,95
- **Titre de slide (H1)** : 76–92 px · Fraunces Bold · interligne 1,0
- **H2** : 52–60 px · Fraunces Semibold
- **Corps large** : 36–40 px · Hanken Medium · interligne 1,3
- **Corps** : 28–32 px · Hanken Regular
- **Label / pill** : 22–24 px · Hanken Bold · MAJUSCULES · interlettrage +4 %
- **Note manuscrite** : 44–56 px · Caveat

### Règles
- Max **2 niveaux de hiérarchie** par slide.
- Titres **alignés à gauche** par défaut (centré seulement pour les cartes « définition » et « citation »).
- Jamais plus de ~7 mots dans un hook.
- L'emphase passe par : **surligneur miel** > *italique Fraunces* > souligné manuscrit. Une seule technique par slide.

---

## 4. Système de formes & motif-signature

C'est ce qui rend la DA reconnaissable d'un coup d'œil.

### Le motif-signature : la **marguerite** 🌼
L'équivalent de l'astérisque de Settle, mais chaleureux.
- Marguerite stylisée à 6 pétales, terracotta ou miel.
- Usages : ponctuer un titre, remplir un coin vide, marquer une fin de section, servir de puce.
- Tailles : grande (déco de fond, 300–500 px, 8–15 % d'opacité possible), moyenne (accent à côté du titre), petite (puce de liste).

### La forme-conteneur : le **napperon festonné**
L'équivalent des blobs/scallops des références, version dentelle de mamie.
- Bord festonné (suite de demi-cercles) pour : cadres de photo, encadrés de citation, séparateurs.
- Sinon, **coins arrondis généreux** : rayon 48–64 px sur les cartes, 999 px (pill) sur les boutons/labels.

### Motifs secondaires (à doser)
- Petit **cœur** plein (rose ou terracotta) — affection, « on est avec toi ».
- **Étoile 4 branches / scintille** (miel) — « astuce », « bonne nouvelle ».
- **Pois / petits points** réguliers en fond (façon nappe vichy douce, très basse opacité).

### Stickers façon mamie (déco, 0 à 1 par slide)
Fleurs vintage, ruban washi-tape (effet collé légèrement de travers), tampon « FAIT MAISON », petit point de couture. Toujours discrets, jamais sur le texte.

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

## 8. Techniques de mise en valeur

À choisir **une seule** par slide :

1. **Le surligneur de mamie** — mot-clé dans une boîte arrondie miel (texte Encre dessus).
2. **Le souligné manuscrit** — trait Caveat/marqueur terracotta sous le mot-clé.
3. *L'italique Fraunces* — pour une nuance, un mot « du cœur ».
4. **La pill-étiquette** — petit label MAJUSCULE (ASTUCE, VRAI/FAUX, À RETENIR) en haut de slide.

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
- Fond noir, bleus saturés froids, gris corporate.
- Plus de 3 couleurs (hors neutres) sur une slide.
- Mélanger les ratios dans un carrousel.
- Plus d'un sticker/déco par slide.
- Du jargon non expliqué (« optimisation sémantique », « LLM », « embeddings » → à traduire en langage mamie).
- Texte qui touche les bords (respecter la marge 80 px).

---

## 12. Prompt réutilisable (pour générer une slide / un carrousel)

> Copie-colle ceci en remplaçant le contenu :

```
Génère un carrousel LinkedIn pour mamie-geo en suivant linkedindesign.md.
Format 1080×1350, [N] slides, marge 80px.
DA : palette chaude (Crème #FBF4E9, Terracotta #DD6B45, Miel #F3B43F, Sauge #7FA67C, Encre #2E2620),
titres Fraunces Bold, corps Hanken Grotesk, motif marguerite + bord festonné, coins très arrondis,
logo mamie-geo en haut à gauche + pagination en bas.

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
