import { SlideShell } from "../_primitives/slide-shell";
import { COLORS } from "../_primitives/tokens";

// Slide 02 — Tableau comparatif SEO vs GEO. Fond crème chaude, headline
// massif avec « GEO » en bleu, paper-note card blanche pour la table
// 6 lignes (headers ink/blue, rangées alternées), pastille `~80 %`
// punchline en bas.

interface Props {
  index: number;
  total: number;
}

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

export function TableSlide({ index, total }: Props) {
  return (
    <SlideShell index={index} total={total} background="cream">
      <div style={{ marginTop: 32 }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            color: COLORS.ink,
          }}
        >
          SEO <span style={{ color: COLORS.muted, fontWeight: 500 }}>vs</span>{" "}
          <span style={{ color: COLORS.blue }}>GEO.</span>
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 21,
            color: COLORS.inkSoft,
            lineHeight: 1.4,
            maxWidth: 760,
            fontWeight: 500,
          }}
        >
          Deux disciplines qui ne se font pas la guerre. Elles se superposent.
        </div>
      </div>

      <div
        style={{
          marginTop: 26,
          background: COLORS.white,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 24,
          boxShadow:
            "0 24px 48px -16px rgba(10, 10, 10, 0.10), 0 4px 12px -2px rgba(10, 10, 10, 0.05)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div
            style={{
              background: COLORS.ink,
              color: COLORS.white,
              padding: "18px 26px",
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              borderTopLeftRadius: 24,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>SEO</span>
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
              background: COLORS.blue,
              color: COLORS.white,
              padding: "18px 26px",
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              borderTopRightRadius: 24,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>GEO</span>
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

        {ROWS.map((row, i) => (
          <div
            key={row.criterion}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              borderTop: `1px solid ${COLORS.border}`,
              flex: 1,
            }}
          >
            <div
              style={{
                padding: "12px 26px",
                background: i % 2 === 0 ? "#fafafa" : COLORS.white,
                borderRight: `1px solid ${COLORS.border}`,
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
                  color: COLORS.muted,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {row.criterion}
              </div>
              <div
                style={{ fontSize: 18, fontWeight: 700, color: COLORS.ink, lineHeight: 1.25 }}
              >
                {row.seo}
              </div>
            </div>
            <div
              style={{
                padding: "12px 26px",
                background: i % 2 === 0 ? COLORS.blueSoft : COLORS.white,
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
                  color: COLORS.blue,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {row.criterion}
              </div>
              <div
                style={{ fontSize: 18, fontWeight: 700, color: COLORS.ink, lineHeight: 1.25 }}
              >
                {row.geo}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: COLORS.ink,
            color: COLORS.creamSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            flexShrink: 0,
          }}
        >
          ~80%
        </div>
        <div style={{ fontSize: 18, color: COLORS.ink, lineHeight: 1.35, fontWeight: 600 }}>
          des signaux d&apos;autorité sont communs aux deux.
          <div
            style={{ fontSize: 14, color: COLORS.inkSoft, fontWeight: 400, marginTop: 2 }}
          >
            Tu ne repars pas de zéro — tu ajoutes une couche de structure.
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
