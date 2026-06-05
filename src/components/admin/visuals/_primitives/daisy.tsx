import { COLORS } from "./tokens";

// Motif-signature carrousel Mamie : marguerite 6 pétales.
// (cf. linkedindesign.md § 4 Système de formes & motif-signature)
//
// Usages : ponctuer un titre, remplir un coin vide, marquer une fin de
// section, servir de puce. Tailles : grande (déco de fond 300-500px,
// 8-15 % opacité), moyenne (à côté d'un titre, 80-120px), petite
// (puce de liste, 24-40px).

interface DaisyProps {
  /** Diamètre total du motif en px. */
  size?: number;
  /** Couleur des pétales. Défaut : terracotta. */
  petalColor?: string;
  /** Couleur du cœur. Défaut : miel. */
  centerColor?: string;
  /** Opacité globale (utile pour les marguerites de fond). Défaut : 1. */
  opacity?: number;
  /** Style additionnel (position absolute, etc.). */
  style?: React.CSSProperties;
}

export function Daisy({
  size = 120,
  petalColor = COLORS.terracotta,
  centerColor = COLORS.honey,
  opacity = 1,
  style,
}: DaisyProps) {
  // 6 pétales = ellipses radiales tous les 60°.
  // Centre = cercle miel.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ opacity, ...style }}
    >
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx={50}
          cy={24}
          rx={9}
          ry={20}
          fill={petalColor}
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
      <circle cx={50} cy={50} r={11} fill={centerColor} />
    </svg>
  );
}
