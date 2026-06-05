import type { ReactNode } from "react";
import {
  BACKGROUND_THEMES,
  COLORS,
  FONTS,
  SLIDE_HEIGHT,
  SLIDE_MARGIN,
  SLIDE_WIDTH,
  type SlideBackground,
} from "./tokens";
import { BrandHeader } from "./brand-header";

// Canvas 1080×1350 d'une slide carrousel Mamie. Fournit :
//   - le fond (cream/sand/terracotta/honey/sage) avec son thème
//   - le brand header (logo + « mamie-geo ») en haut à gauche
//   - la pagination (`02 / 07` ou points festonnés) en bas centre
//   - le pied de marque URL en bas droite
//   - le slot `children` pour le contenu central
//
// Marge de sécurité 80 px sur 4 côtés (linkedindesign.md § 5).
// Les slides individuelles ne définissent que leur contenu central.

export interface SlideShellProps {
  index: number;
  total: number;
  background: SlideBackground;
  children: ReactNode;
  /** Pagination style. `dots` = points festonnés. Défaut : `numeric`. */
  paginationStyle?: "numeric" | "dots";
}

export function SlideShell({
  index,
  total,
  background,
  children,
  paginationStyle = "numeric",
}: SlideShellProps) {
  const theme = BACKGROUND_THEMES[background];

  return (
    <div
      style={{
        position: "relative",
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        background: theme.bg,
        color: theme.text,
        fontFamily: FONTS.hanken,
        overflow: "hidden",
        boxSizing: "border-box",
        padding: `${SLIDE_MARGIN}px ${SLIDE_MARGIN}px ${SLIDE_MARGIN - 24}px`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <BrandHeader tint={theme.brandTint} textColor={theme.text} />
      </header>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          marginTop: 24,
        }}
      >
        {children}
      </div>

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 24,
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: theme.textSoft,
            fontFamily: FONTS.hanken,
          }}
        >
          mamie-geo.fr
        </span>
        <Pagination
          index={index}
          total={total}
          style={paginationStyle}
          tint={theme.brandTint}
          textColor={theme.text}
          softColor={theme.textSoft}
        />
      </footer>
    </div>
  );
}

interface PaginationProps {
  index: number;
  total: number;
  style: "numeric" | "dots";
  tint: string;
  textColor: string;
  softColor: string;
}

function Pagination({ index, total, style, tint, textColor, softColor }: PaginationProps) {
  if (style === "dots") {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        {Array.from({ length: total }).map((_, i) => {
          const active = i + 1 === index;
          return (
            <span
              key={i}
              style={{
                width: active ? 16 : 8,
                height: 8,
                borderRadius: 9999,
                background: active ? tint : softColor,
                opacity: active ? 1 : 0.45,
                transition: "all 200ms ease",
              }}
            />
          );
        })}
      </div>
    );
  }
  return (
    <span
      style={{
        fontSize: 18,
        fontWeight: 600,
        color: textColor,
        fontFamily: FONTS.hanken,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {String(index).padStart(2, "0")}
      <span style={{ color: softColor, margin: "0 6px" }}>/</span>
      <span style={{ color: softColor }}>{String(total).padStart(2, "0")}</span>
    </span>
  );
}

/** Utilitaire pratique pour les composants slide qui ont besoin de
 *  référencer une couleur explicitement. Re-exporte les tokens. */
export { COLORS };
