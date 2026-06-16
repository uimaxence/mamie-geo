// Tokens carrousels LinkedIn Mamie — source de vérité = linkedindesign.md
// (cadré 2026-06-05). Hex literals (pas de CSS vars) pour rendu pixel-
// parfait par html-to-image.
//
// ⚠️ Ces tokens NE SONT PAS utilisés dans l'app `(app)/*` ni dans le
// site marketing, qui restent en direction Airbnb-like minimaliste
// (Inter + blanc + gris + bleu brand `#329cff`). Cf. doc 09 § 2026-06-05
// pour le dual-DA volontaire.

export const COLORS = {
  // Neutres (fonds & texte)
  white: "#FFFFFF", // fond PAR DÉFAUT depuis la v2 (2026-06-05 soir)
  cream: "#FBF4E9", // fond alternatif occasionnel (1-2 slides max par carrousel en v2)
  sand: "#F0E3CF", // fond alternatif / cartes secondaires
  grayLine: "#F5F0E8", // séparateurs/bordures discrets sur fond blanc
  ink: "#2E2620", // texte principal (brun très foncé, jamais noir pur)
  inkSoft: "#5A4A3C", // texte secondaire

  // Couleurs de marque carousel (palette chaude Mamie)
  terracotta: "#DD6B45", // signature chaude (motif, CTA, accents forts)
  terracottaDim: "#B85838", // hover/active terracotta
  honey: "#F3B43F", // surligneur, étiquettes, énergie
  honeyDim: "#D69A2F",
  sage: "#7FA67C", // sérénité « tout va bien »
  rose: "#E59B96", // douceur, touches déco

  // ⚠️ COULEUR PRIMAIRE BRAND — toujours présente, c'est l'identité.
  // Remplace le « bleu pervenche » de linkedindesign.md (qui était `#A9C0D6`
  // pâle) par le vrai bleu brand du logo `#329CFF`. Apparaît au minimum
  // sur : le logo dans BrandHeader (variants cream/sand/sage), un
  // accent typo par slide (mot clé GEO en bleu), pagination dots.
  // Confirmé par Max 2026-06-05 (« garde bien le bleu actuel comme
  // couleur primaire »).
  brandBlue: "#329CFF",
  brandBlueDim: "#1D7EE5",
  brandBlueSoft: "#EAF4FF",

  // Pour le contraste sur fond terracotta
  creamSoft: "#FFFBF3",
} as const;

// Familles typographiques — chargées via next/font/google dans
// src/app/(app)/app/admin/layout.tsx. Les variables CSS sont définies
// sur le container admin, donc utilisables dans les inline-styles des
// composants slide via `var(--font-fraunces)`.
export const FONTS = {
  fraunces: "var(--font-fraunces), Georgia, serif",
  hanken: "var(--font-hanken), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  caveat: "var(--font-caveat), 'Brush Script MT', cursive",
} as const;

// Fonds combinables pour rythmer le carrousel. Depuis la v2 :
// BLANC par défaut, crème/sable occasionnels (1-2 max par carrousel),
// terracotta réservé à la slide CTA finale. Le rose et le pervenche
// sont des ACCENTS uniquement, jamais des fonds pleins de slide.
export type SlideBackground = "white" | "cream" | "sand" | "terracotta" | "honey" | "sage";

interface BackgroundTheme {
  bg: string;
  /** Couleur texte principale lisible sur ce fond (AA respecté). */
  text: string;
  textSoft: string;
  /** Couleur pour le logo et accents qui se posent sur ce fond. */
  brandTint: string;
  /** Si true, le fond est sombre → variants logo/text en clair. */
  dark: boolean;
}

export const BACKGROUND_THEMES: Record<SlideBackground, BackgroundTheme> = {
  white: {
    bg: COLORS.white,
    text: COLORS.ink,
    textSoft: COLORS.inkSoft,
    brandTint: COLORS.brandBlue,
    dark: false,
  },
  cream: {
    bg: COLORS.cream,
    text: COLORS.ink,
    textSoft: COLORS.inkSoft,
    brandTint: COLORS.brandBlue, // logo en bleu brand sur fond chaud = signature
    dark: false,
  },
  sand: {
    bg: COLORS.sand,
    text: COLORS.ink,
    textSoft: COLORS.inkSoft,
    brandTint: COLORS.brandBlue,
    dark: false,
  },
  terracotta: {
    bg: COLORS.terracotta,
    text: COLORS.cream,
    textSoft: "rgba(251, 244, 233, 0.78)",
    brandTint: COLORS.cream, // contraste sur fond terracotta : logo en crème
    dark: true,
  },
  honey: {
    bg: COLORS.honey,
    text: COLORS.ink, // jamais blanc sur miel (illisible)
    textSoft: COLORS.inkSoft,
    brandTint: COLORS.ink,
    dark: false,
  },
  sage: {
    bg: COLORS.sage,
    text: COLORS.ink,
    textSoft: COLORS.inkSoft,
    brandTint: COLORS.brandBlue, // bleu brand reste lisible sur sauge
    dark: false,
  },
};

export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1350;
/** Marge de sécurité 80 px sur les 4 côtés (cf. linkedindesign.md § 5). */
export const SLIDE_MARGIN = 80;
