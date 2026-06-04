import { Logo } from "@/components/marketing/logo";

// Visuel LinkedIn 1080×1350 portrait : tableau comparatif SEO vs GEO
// pour le post du 2026-06-02 (amplification article geo-vs-seo).
//
// 6 lignes en 2 colonnes (SEO gris / GEO bleu brand), bandeau bas
// signalant que ~80 % des signaux sont communs aux deux. Tout est
// inline-styled pour garantir le rendu pixel-parfait par html-to-image
// (pas de dépendance à des CSS variables qui pourraient ne pas être
// inlinées par le scraper).

interface Row {
  criterion: string;
  seo: string;
  geo: string;
}

const ROWS: Row[] = [
  { criterion: "Objet optimisé", seo: "Une URL", geo: "Une marque" },
  { criterion: "Surface", seo: "SERP Google", geo: "Réponses IA" },
  { criterion: "Métrique clé", seo: "Position moyenne", geo: "Part de citation" },
  {
    criterion: "Levier principal",
    seo: "Backlinks + contenu",
    geo: "Autorité de marque + structure citable",
  },
  { criterion: "Délai pour bouger", seo: "3 à 6 mois", geo: "2 sem. à 18 mois" },
  { criterion: "Mesure", seo: "Outil unique", geo: "Distribution sur N runs" },
];

const INK = "#0a0a0a";
const INK_SOFT = "#404040";
const MUTED = "#737373";
const BORDER = "#e5e5e5";
const SURFACE = "#fafafa";
const SEO_HEAD_BG = "#262626";
const SEO_TINT = "#f5f5f5";
const GEO_BLUE = "#329cff";
const GEO_TINT = "#eaf4ff";

export function SeoVsGeoVisual() {
  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        background: "#ffffff",
        color: INK,
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        fontFeatureSettings: '"cv11" on, "ss01" on, "tnum" on',
        display: "flex",
        flexDirection: "column",
        padding: "72px 64px 56px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          Comparatif 2026
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.0,
            color: INK,
          }}
        >
          SEO <span style={{ color: MUTED, fontWeight: 500 }}>vs</span>{" "}
          <span style={{ color: GEO_BLUE }}>GEO</span>
        </div>
        <div
          style={{
            fontSize: 20,
            color: INK_SOFT,
            lineHeight: 1.4,
            marginTop: 4,
            maxWidth: 760,
          }}
        >
          Deux disciplines qui ne se font pas la guerre. Elles se superposent.
        </div>
      </div>

      {/* Tableau */}
      <div
        style={{
          marginTop: 40,
          border: `1px solid ${BORDER}`,
          borderRadius: 20,
          overflow: "hidden",
          background: "#fff",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div
            style={{
              background: SEO_HEAD_BG,
              color: "#fff",
              padding: "22px 28px",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              borderRight: `1px solid ${BORDER}`,
            }}
          >
            <span>SEO</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#a3a3a3", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Search engines
            </span>
          </div>
          <div
            style={{
              background: GEO_BLUE,
              color: "#fff",
              padding: "22px 28px",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "baseline",
              gap: 10,
            }}
          >
            <span>GEO</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.72)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Generative engines
            </span>
          </div>
        </div>

        {/* Rows */}
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
                padding: "22px 28px",
                background: i % 2 === 0 ? SURFACE : "#fff",
                borderRight: `1px solid ${BORDER}`,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: MUTED,
                }}
              >
                {row.criterion}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: INK, lineHeight: 1.3 }}>
                {row.seo}
              </div>
            </div>
            <div
              style={{
                padding: "22px 28px",
                background: i % 2 === 0 ? GEO_TINT : "#fff",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: GEO_BLUE,
                }}
              >
                {row.criterion}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: INK, lineHeight: 1.3 }}>
                {row.geo}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bandeau bas */}
      <div
        style={{
          marginTop: 28,
          padding: "20px 28px",
          background: SEO_TINT,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: GEO_BLUE,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}
        >
          ~80%
        </div>
        <div style={{ fontSize: 19, color: INK, lineHeight: 1.4, fontWeight: 500 }}>
          des signaux d&apos;autorité sont{" "}
          <strong style={{ fontWeight: 700 }}>communs aux deux disciplines.</strong>
          <div style={{ fontSize: 15, color: INK_SOFT, fontWeight: 400, marginTop: 4 }}>
            Tu ne repars pas de zéro : tu ajoutes une couche de structure et de mesure.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: MUTED,
          fontSize: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={26} color={GEO_BLUE} />
          <span style={{ color: INK, fontWeight: 600, fontSize: 16 }}>Mamie GEO</span>
        </div>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>mamie-geo.fr</span>
      </div>
    </div>
  );
}
