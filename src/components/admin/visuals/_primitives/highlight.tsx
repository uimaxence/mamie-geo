import type { ReactNode } from "react";
import { COLORS } from "./tokens";

// Le « surligneur de mamie » — mot-clé dans une boîte arrondie miel
// (cf. linkedindesign.md § 8 Techniques de mise en valeur).
// Une seule technique d'emphase par slide.

interface HighlightProps {
  children: ReactNode;
  /** Couleur de fond du surligneur. Défaut : miel. */
  color?: string;
  /** Couleur du texte. Défaut : encre (jamais blanc sur miel). */
  textColor?: string;
  /** Padding horizontal/vertical en px. Défaut auto-scaled. */
  padX?: number;
  padY?: number;
}

export function Highlight({
  children,
  color = COLORS.honey,
  textColor = COLORS.ink,
  padX = 18,
  padY = 4,
}: HighlightProps) {
  return (
    <span
      style={{
        backgroundColor: color,
        color: textColor,
        padding: `${padY}px ${padX}px`,
        borderRadius: 14,
        // Léger décalage vertical pour rester ancré sur la baseline du texte.
        display: "inline-block",
        lineHeight: 1,
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
}
