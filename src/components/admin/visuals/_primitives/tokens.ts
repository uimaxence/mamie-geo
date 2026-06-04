// Tokens carousel — réutilisés par toutes les slides Mamie GEO.
// Hex literals (pas de CSS variables) pour rendu pixel-parfait par
// html-to-image. Cf. doc 10 § Système design carousels LinkedIn.

export const COLORS = {
  ink: "#0a0a0a",
  inkSoft: "#404040",
  muted: "#737373",
  faint: "#a3a3a3",
  border: "#e5e5e5",
  borderSoft: "rgba(10, 10, 10, 0.08)",
  white: "#ffffff",
  cream: "#fff4d6",
  creamSoft: "#fffbed",
  creamStrong: "#fcd34d",
  blue: "#329cff",
  blueDim: "#1d7ee5",
  blueSoft: "#eaf4ff",
  blueFaint: "rgba(50, 156, 255, 0.18)",
  bluePale: "rgba(50, 156, 255, 0.08)",
} as const;

export const FONT_FAMILY =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const FONT_FEATURES = '"cv11" on, "ss01" on, "tnum" on';

// 4 fonds combinables pour varier slide-à-slide.
export type SlideBackground = "cream" | "ink" | "blue" | "white";

interface BackgroundTheme {
  bg: string;
  text: string;
  textSoft: string;
  waveTint: string;
  /** Variant des primitives (pill, slide number) — light sur fond sombre. */
  dark: boolean;
}

export const BACKGROUND_THEMES: Record<SlideBackground, BackgroundTheme> = {
  cream: {
    bg: COLORS.cream,
    text: COLORS.ink,
    textSoft: COLORS.inkSoft,
    waveTint: COLORS.blueFaint,
    dark: false,
  },
  ink: {
    bg: COLORS.ink,
    text: COLORS.white,
    textSoft: "rgba(255, 255, 255, 0.72)",
    waveTint: "rgba(50, 156, 255, 0.28)",
    dark: true,
  },
  blue: {
    bg: COLORS.blue,
    text: COLORS.white,
    textSoft: "rgba(255, 255, 255, 0.85)",
    waveTint: "rgba(255, 255, 255, 0.18)",
    dark: true,
  },
  white: {
    bg: COLORS.white,
    text: COLORS.ink,
    textSoft: COLORS.inkSoft,
    waveTint: COLORS.bluePale,
    dark: false,
  },
};

export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1350;
