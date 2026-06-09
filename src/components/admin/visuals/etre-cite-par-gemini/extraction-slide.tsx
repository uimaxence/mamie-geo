import { FONTS } from "../_primitives/tokens";
import { NIGHT, NightShell } from "./night-shell";

// Slide 04 — « 3 réflexes d'extraction » : réponse directe au 1er
// paragraphe, FAQ balisée FAQPage, définition nommée en haut de page.

interface Props {
  index: number;
  total: number;
}

const REFLEXES = [
  {
    title: "Réponds dès le 1er paragraphe",
    note: "Une phrase autonome, hors contexte. C'est ce que le résumé IA extrait.",
  },
  {
    title: "Balise une FAQ (FAQPage)",
    note: "Chaque réponse doit tenir seule, sans le reste de la page.",
  },
  {
    title: "Pose une définition nommée",
    note: "En haut de page, le terme défini explicitement, prêt à être cité.",
  },
];

export function ExtractionSlide({ index, total }: Props) {
  return (
    <NightShell index={index} total={total}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h2
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: "-0.035em",
            color: NIGHT.white,
            margin: "0 0 12px",
          }}
        >
          3 réflexes d&apos;<span style={{ color: NIGHT.brandBlue }}>extraction</span>
        </h2>
        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 26,
            fontWeight: 500,
            color: NIGHT.whiteSoft,
            margin: "0 0 44px",
          }}
        >
          Ce que le résumé de Gemini va piocher sur ta page.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {REFLEXES.map((r, i) => (
            <div
              key={r.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                background: NIGHT.card,
                border: `1px solid ${NIGHT.cardBorder}`,
                borderRadius: 18,
                padding: "26px 30px",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: NIGHT.greenSoft,
                  color: NIGHT.green,
                  fontFamily: FONTS.hanken,
                  fontSize: 30,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {i + 1}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span
                  style={{
                    fontFamily: FONTS.hanken,
                    fontSize: 32,
                    fontWeight: 700,
                    color: NIGHT.white,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {r.title}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.hanken,
                    fontSize: 22,
                    fontWeight: 400,
                    color: NIGHT.whiteSoft,
                    lineHeight: 1.3,
                  }}
                >
                  {r.note}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </NightShell>
  );
}
