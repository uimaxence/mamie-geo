import type { ReactNode } from "react";
import { BACKGROUND_THEMES, FONT_FAMILY, FONT_FEATURES, SLIDE_HEIGHT, SLIDE_WIDTH, type SlideBackground } from "./tokens";
import { BrandPill } from "./brand-pill";
import { SlideNumber } from "./slide-number";
import { WavesDecoration } from "./waves-decoration";

// Canvas 1080×1350 d'une slide carousel. Fournit :
//   - le fond (cream/ink/blue/white) avec son thème de teintes associé
//   - les vagues décoratives aux 2 coins (toggleable)
//   - le top bar avec brand pill + numéro de slide
//   - le slot `children` pour le contenu de la slide
//
// Les slides individuelles n'ont qu'à fournir leur contenu central et
// éventuellement un footer custom (sinon, footer minimal "mamie-geo.fr"
// auto-injecté).

export interface SlideShellProps {
  index: number;
  total: number;
  background: SlideBackground;
  /** Vagues organiques aux coins (défaut true). */
  waves?: boolean;
  /** Contenu central. */
  children: ReactNode;
  /** Footer custom — si non fourni, footer auto "mamie-geo.fr · SWIPE →". */
  footer?: ReactNode;
}

export function SlideShell({
  index,
  total,
  background,
  waves = true,
  children,
  footer,
}: SlideShellProps) {
  const theme = BACKGROUND_THEMES[background];
  const pillVariant = theme.dark ? "light" : "dark";

  return (
    <div
      style={{
        position: "relative",
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        background: theme.bg,
        color: theme.text,
        fontFamily: FONT_FAMILY,
        fontFeatureSettings: FONT_FEATURES,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {waves && (
        <>
          <WavesDecoration position="top-right" tint={theme.waveTint} />
          <WavesDecoration position="bottom-left" tint={theme.waveTint} />
        </>
      )}

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          padding: "60px 60px 50px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <BrandPill variant={pillVariant} />
          <SlideNumber index={index} total={total} variant={pillVariant} />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {children}
        </div>

        {footer ?? <DefaultFooter dark={theme.dark} index={index} total={total} />}
      </div>
    </div>
  );
}

function DefaultFooter({ dark, index, total }: { dark: boolean; index: number; total: number }) {
  const fg = dark ? "rgba(255, 255, 255, 0.7)" : "#404040";
  const accent = dark ? "rgba(255, 255, 255, 0.55)" : "#737373";
  const border = dark ? "rgba(255, 255, 255, 0.12)" : "rgba(10, 10, 10, 0.08)";
  const isLast = index === total;
  return (
    <div
      style={{
        marginTop: 20,
        paddingTop: 18,
        borderTop: `1px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: fg,
        fontSize: 14,
      }}
    >
      <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>mamie-geo.fr</span>
      <span
        style={{
          color: accent,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontSize: 11,
        }}
      >
        {isLast ? "Lien article en commentaire" : "Swipe →"}
      </span>
    </div>
  );
}
