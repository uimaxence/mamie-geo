import { Logo } from "@/components/marketing/logo";

// Visuel LinkedIn 1080×1350 portrait : tableau comparatif SEO vs GEO
// pour le post du 2026-06-02 (amplification article geo-vs-seo).
//
// Direction visuelle : carousel-style « Unified » (cf. ref Pinterest
// partagée par Max 2026-06-04). Fond crème chaude `#fff4d6` + vagues
// organiques bleu brand en filigrane + paper-note card blanche pour la
// table compactée. Brand pill ronde noire en haut, footer minimal.
// Système réutilisable pour les futurs carousels LinkedIn.
//
// Tout est inline-styled pour garantir le rendu pixel-parfait par
// html-to-image (pas de dépendance à des CSS variables ou à du Tailwind
// qui pourrait ne pas être inliné par le scraper).

interface Row {
  criterion: string;
  seo: string;
  geo: string;
}

const ROWS: Row[] = [
  { criterion: "Objet optimisé", seo: "Une URL", geo: "Une marque" },
  { criterion: "Surface", seo: "SERP Google", geo: "Réponses IA" },
  { criterion: "Métrique clé", seo: "Position", geo: "Part de citation" },
  { criterion: "Levier", seo: "Backlinks + contenu", geo: "Autorité + structure citable" },
  { criterion: "Délai", seo: "3 à 6 mois", geo: "2 sem. à 18 mois" },
  { criterion: "Mesure", seo: "Outil unique", geo: "Distribution sur N runs" },
];

const INK = "#0a0a0a";
const INK_SOFT = "#404040";
const MUTED = "#737373";
const BORDER = "#e5e5e5";
const CREAM = "#fff4d6";
const CREAM_SOFT = "#fffbed";
const BLUE = "#329cff";
const BLUE_FAINT = "rgba(50, 156, 255, 0.18)";
const BLUE_SOFT = "#eaf4ff";

export function SeoVsGeoVisual() {
  return (
    <div
      style={{
        position: "relative",
        width: 1080,
        height: 1350,
        background: CREAM,
        color: INK,
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        fontFeatureSettings: '"cv11" on, "ss01" on, "tnum" on',
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Vagues décoratives bleu pâle — coin top-right + bottom-left,
       * signature « Unified » mais sobre. SVG inline pour rendu fiable
       * dans html-to-image. */}
      <WavesDecoration position="top-right" />
      <WavesDecoration position="bottom-left" />

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
        {/* Top bar : brand pill + numéro de slide */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <BrandPill />
          <SlideNumber index={1} total={1} />
        </div>

        {/* Headline — grand, bold, multi-lignes */}
        <div style={{ marginTop: 40 }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              color: INK,
            }}
          >
            SEO <span style={{ color: MUTED, fontWeight: 500 }}>vs</span>
            <br />
            <span style={{ color: BLUE }}>GEO.</span>
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 22,
              color: INK_SOFT,
              lineHeight: 1.4,
              maxWidth: 760,
              fontWeight: 500,
            }}
          >
            Deux disciplines qui ne se font pas la guerre. Elles se superposent.
          </div>
        </div>

        {/* Paper-note card : la table comparée */}
        <div
          style={{
            marginTop: 30,
            background: "#ffffff",
            border: `1px solid ${BORDER}`,
            borderRadius: 24,
            boxShadow: "0 24px 48px -16px rgba(10, 10, 10, 0.10), 0 4px 12px -2px rgba(10, 10, 10, 0.05)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div
              style={{
                background: INK,
                color: "#ffffff",
                padding: "20px 26px",
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                borderTopLeftRadius: 24,
              }}
            >
              <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em" }}>SEO</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#a3a3a3",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Search engines
              </span>
            </div>
            <div
              style={{
                background: BLUE,
                color: "#ffffff",
                padding: "20px 26px",
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                borderTopRightRadius: 24,
              }}
            >
              <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em" }}>GEO</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.78)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Generative engines
              </span>
            </div>
          </div>

          {/* Rows compactées */}
          {ROWS.map((row, i) => (
            <div
              key={row.criterion}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                borderTop: `1px solid ${BORDER}`,
                flex: 1,
              }}
            >
              <div
                style={{
                  padding: "14px 26px",
                  background: i % 2 === 0 ? "#fafafa" : "#ffffff",
                  borderRight: `1px solid ${BORDER}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 3,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: MUTED,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {row.criterion}
                </div>
                <div style={{ fontSize: 19, fontWeight: 700, color: INK, lineHeight: 1.25 }}>
                  {row.seo}
                </div>
              </div>
              <div
                style={{
                  padding: "14px 26px",
                  background: i % 2 === 0 ? BLUE_SOFT : "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 3,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: BLUE,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {row.criterion}
                </div>
                <div style={{ fontSize: 19, fontWeight: 700, color: INK, lineHeight: 1.25 }}>
                  {row.geo}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Punchline + footer */}
        <div
          style={{
            marginTop: 22,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: INK,
              color: CREAM_SOFT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 19,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              flexShrink: 0,
            }}
          >
            ~80%
          </div>
          <div style={{ fontSize: 19, color: INK, lineHeight: 1.35, fontWeight: 600 }}>
            des signaux d&apos;autorité sont communs aux deux.
            <div style={{ fontSize: 14, color: INK_SOFT, fontWeight: 400, marginTop: 3 }}>
              Tu ne repars pas de zéro : tu ajoutes une couche de structure.
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            paddingTop: 18,
            borderTop: `1px solid rgba(10, 10, 10, 0.08)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: INK_SOFT,
            fontSize: 14,
          }}
        >
          <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
            mamie-geo.fr
          </span>
          <span style={{ color: MUTED, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 11 }}>
            Article complet, lien en commentaire
          </span>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Primitives carousel — réutilisables pour les futurs visuels.
// (Garder ici pour V0, splitter dans `_primitives/` si > 3 fichiers.)
// ──────────────────────────────────────────────────────────────────

/** Pill brand ronde, style « Unified ». À placer en haut à gauche. */
function BrandPill() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        padding: "8px 16px 8px 10px",
        background: INK,
        borderRadius: 9999,
        color: "#ffffff",
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: BLUE,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Logo size={14} color="#ffffff" />
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        Mamie GEO
      </span>
    </div>
  );
}

/** Numéro de slide « 01 / 05 ». Petit tag en haut à droite. */
function SlideNumber({ index, total }: { index: number; total: number }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        background: "rgba(10, 10, 10, 0.06)",
        borderRadius: 9999,
        color: INK,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.08em",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span>{String(index).padStart(2, "0")}</span>
      <span style={{ color: MUTED }}>/</span>
      <span style={{ color: MUTED }}>{String(total).padStart(2, "0")}</span>
    </div>
  );
}

/** Vagues organiques décoratives. Signature carousel Mamie GEO. */
function WavesDecoration({ position }: { position: "top-right" | "bottom-left" }) {
  const isTopRight = position === "top-right";
  return (
    <svg
      width={620}
      height={620}
      viewBox="0 0 620 620"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{
        position: "absolute",
        top: isTopRight ? -180 : "auto",
        right: isTopRight ? -180 : "auto",
        bottom: isTopRight ? "auto" : -180,
        left: isTopRight ? "auto" : -180,
        pointerEvents: "none",
        opacity: 0.55,
        transform: isTopRight ? "rotate(0deg)" : "rotate(180deg)",
      }}
    >
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const r = 80 + i * 36;
        return (
          <path
            key={i}
            d={`M ${310 - r} 310 a ${r} ${r} 0 1 1 ${r * 2} 0`}
            stroke={BLUE_FAINT}
            strokeWidth={3.5}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
