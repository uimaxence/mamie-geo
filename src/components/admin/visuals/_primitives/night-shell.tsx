import type { ReactNode } from "react";
import { Logo } from "@/components/marketing/logo";
import { FONTS, SLIDE_HEIGHT, SLIDE_MARGIN, SLIDE_WIDTH } from "./tokens";

// Shell « bleu nuit » partagé (promu depuis le carrousel Gemini le
// 2026-06-16, quand un 2e visuel a réutilisé le style — cf. note d'origine).
//
// ⚠️ Volontairement HORS de la palette chaude Mamie : DA bleu nuit + accents
// vert «OK» / orange «attention», typo 100 % sans-serif Hanken. On garde la
// même structure que SlideShell (header logo, footer url + pagination, marge
// 80px) pour la cohérence. L'`eyebrow` (haut droite) est paramétrable par
// visuel (« GEMINI · GEO », « GEO · LE DÉBAT »…).

export const NIGHT = {
  bg: "#0B1B34", // bleu nuit profond
  bgTop: "#102544", // dégradé léger en haut
  card: "#13294D", // blocs / cartes internes
  cardBorder: "rgba(255,255,255,0.10)",
  white: "#FFFFFF",
  whiteSoft: "rgba(255,255,255,0.74)",
  whiteFaint: "rgba(255,255,255,0.50)",
  brandBlue: "#329CFF",
  green: "#34D399", // « OK / accès »
  greenSoft: "rgba(52,211,153,0.14)",
  orange: "#F5A623", // « attention / usage IA »
  orangeSoft: "rgba(245,166,35,0.16)",
  red: "#F87171", // « erreur / blocage »
  redSoft: "rgba(248,113,113,0.13)",
} as const;

export const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

interface NightShellProps {
  index: number;
  total: number;
  children: ReactNode;
  /** Variante de footer logo agrandi (cover/CTA). */
  brandLockup?: "header" | "footer";
  /** Étiquette haut-droite (uppercase, tracking large). Ex: « GEMINI · GEO ». */
  eyebrow?: string;
}

export function NightShell({ index, total, children, brandLockup = "header", eyebrow }: NightShellProps) {
  return (
    <div
      style={{
        position: "relative",
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        background: `linear-gradient(180deg, ${NIGHT.bgTop} 0%, ${NIGHT.bg} 42%)`,
        color: NIGHT.white,
        fontFamily: FONTS.hanken,
        overflow: "hidden",
        boxSizing: "border-box",
        padding: `${SLIDE_MARGIN}px ${SLIDE_MARGIN}px ${SLIDE_MARGIN - 24}px`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {brandLockup === "header" ? <BrandMark /> : <span />}
        {eyebrow ? (
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: NIGHT.whiteFaint,
            }}
          >
            {eyebrow}
          </span>
        ) : (
          <span />
        )}
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
        {brandLockup === "footer" ? (
          <BrandMark size={32} />
        ) : (
          <span style={{ fontSize: 18, fontWeight: 500, color: NIGHT.whiteSoft }}>
            mamie-geo.fr
          </span>
        )}
        <Pagination index={index} total={total} />
      </footer>
    </div>
  );
}

export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <Logo size={size} color={NIGHT.brandBlue} />
      <span
        style={{
          fontFamily: FONTS.hanken,
          fontWeight: 700,
          fontSize: size === 36 ? 24 : 22,
          letterSpacing: "-0.02em",
          color: NIGHT.white,
        }}
      >
        mamie-geo
      </span>
    </div>
  );
}

function Pagination({ index, total }: { index: number; total: number }) {
  // Sur un visuel mono-slide (total = 1), la pagination « 01 / 01 » n'a pas
  // de sens : on la masque.
  if (total <= 1) return <span />;
  return (
    <span
      style={{
        fontSize: 18,
        fontWeight: 700,
        color: NIGHT.white,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {String(index).padStart(2, "0")}
      <span style={{ color: NIGHT.whiteFaint, margin: "0 6px" }}>/</span>
      <span style={{ color: NIGHT.whiteFaint }}>{String(total).padStart(2, "0")}</span>
    </span>
  );
}
