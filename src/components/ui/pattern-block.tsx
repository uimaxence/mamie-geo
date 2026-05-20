import type { HTMLAttributes } from "react";

// PatternBlock — bloc décoratif posant le pattern signature damier
// diagonal (cf. doc 10 § Pattern signature). Wrapper léger autour de la
// classe utilitaire `.bg-pattern` avec une API de placement aux coins.
//
// Toujours `aria-hidden` + `pointer-events-none` : purement décoratif,
// jamais cliquable, jamais lu par les screen readers.
//
// Règle d'usage (cf. doc 10) : 1-2 placements par page maximum, ancré
// dans un coin ou une bande — pas en fond plein.

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type Tone = "primary" | "primary-soft" | "white" | "ink";
type Size = "sm" | "md" | "lg" | "xl";

// Largeurs en px par taille. Le carré déborde toujours hors du conteneur
// (offset négatif) pour un effet "signature qui sort du cadre" — ref
// banner LinkedIn fournie par Max.
const SIZE_PX: Record<Size, number> = {
  sm: 160,
  md: 240,
  lg: 360,
  xl: 520,
};

// Taille de tile selon le bloc — proportionné pour qu'on voie 2-4 tiles
// par côté (lisibilité du motif).
const TILE_PX: Record<Size, number> = {
  sm: 56,
  md: 72,
  lg: 88,
  xl: 104,
};

const cornerStyles: Record<Corner, string> = {
  "top-left": "top-0 left-0 -translate-x-1/3 -translate-y-1/3",
  "top-right": "top-0 right-0 translate-x-1/3 -translate-y-1/3",
  "bottom-left": "bottom-0 left-0 -translate-x-1/3 translate-y-1/3",
  "bottom-right": "bottom-0 right-0 translate-x-1/3 translate-y-1/3",
};

const toneClass: Record<Tone, string> = {
  primary: "",
  "primary-soft": "bg-pattern-soft",
  white: "bg-pattern-white",
  ink: "bg-pattern-ink",
};

export interface PatternBlockProps extends HTMLAttributes<HTMLDivElement> {
  corner?: Corner;
  tone?: Tone;
  size?: Size;
}

export function PatternBlock({
  corner = "bottom-left",
  tone = "primary",
  size = "md",
  className = "",
  style,
  ...props
}: PatternBlockProps) {
  const px = SIZE_PX[size];
  const tile = TILE_PX[size];
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${cornerStyles[corner]} ${className}`}
      style={{ width: px, height: px, ...style }}
      {...props}
    >
      <div
        className={`bg-pattern ${toneClass[tone]} h-full w-full`}
        style={{ ["--pattern-size" as string]: `${tile}px` }}
      />
    </div>
  );
}

// PatternBand — variante bande horizontale (en haut ou en bas d'une
// section). Utile pour les hero / headers où on veut une signature qui
// court sur toute la largeur sans dominer.

export interface PatternBandProps extends HTMLAttributes<HTMLDivElement> {
  position?: "top" | "bottom";
  tone?: Tone;
  /** Hauteur de la bande en px (default 24) */
  height?: number;
  /** Tile size en px (default 24 pour matcher height) */
  tile?: number;
}

export function PatternBand({
  position = "top",
  tone = "primary",
  height = 24,
  tile = 24,
  className = "",
  style,
  ...props
}: PatternBandProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute left-0 right-0 ${position === "top" ? "top-0" : "bottom-0"} ${className}`}
      style={{ height, ...style }}
      {...props}
    >
      <div
        className={`bg-pattern ${toneClass[tone]} h-full w-full`}
        style={{ ["--pattern-size" as string]: `${tile}px` }}
      />
    </div>
  );
}
