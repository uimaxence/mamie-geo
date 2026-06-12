import { SlideShell } from "../_primitives/slide-shell";
import { COLORS, FONTS } from "../_primitives/tokens";
import { Highlight } from "../_primitives/highlight";

// Slide 01 — Couverture (hook) de l'étude 50 marques × 5 IA.
// (gabarit 🏡 La couverture, linkedindesign.md § 6 — règles v2 :
// fond blanc, surligneur miel comme unique technique d'emphase,
// stats en pills bleu brand soft.)

interface Props {
  index: number;
  total: number;
}

const STATS = [
  { value: "50", label: "marques FR" },
  { value: "5", label: "IA testées" },
  { value: "613", label: "citations analysées" },
] as const;

export function CoverSlide({ index, total }: Props) {
  return (
    <SlideShell index={index} total={total} background="white">
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: COLORS.inkSoft,
            marginBottom: 36,
          }}
        >
          Étude exclusive — juin 2026
        </p>

        <h1
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 108,
            fontWeight: 900,
            lineHeight: 0.98,
            letterSpacing: "-0.035em",
            color: COLORS.ink,
            margin: 0,
            maxWidth: 920,
          }}
        >
          50 marques françaises passées au crible de{" "}
          <Highlight color={COLORS.honey} textColor={COLORS.ink} padX={22} padY={8}>
            5 IA.
          </Highlight>
        </h1>

        <p
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 46,
            fontWeight: 600,
            fontStyle: "italic",
            color: COLORS.inkSoft,
            marginTop: 40,
            letterSpacing: "-0.015em",
          }}
        >
          3 résultats nous ont surpris.
        </p>

        <div style={{ display: "flex", gap: 16, marginTop: 64, flexWrap: "wrap" }}>
          {STATS.map(({ value, label }) => (
            <span
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 12,
                background: COLORS.brandBlueSoft,
                borderRadius: 9999,
                padding: "18px 32px",
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.fraunces,
                  fontSize: 40,
                  fontWeight: 900,
                  color: COLORS.brandBlueDim,
                  letterSpacing: "-0.02em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontFamily: FONTS.hanken,
                  fontSize: 28,
                  fontWeight: 600,
                  color: COLORS.ink,
                }}
              >
                {label}
              </span>
            </span>
          ))}
        </div>

        <div
          style={{
            marginTop: 64,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: FONTS.hanken,
            fontSize: 30,
            fontWeight: 500,
            color: COLORS.inkSoft,
          }}
        >
          <span>ChatGPT · Claude · Gemini · Perplexity · Le Chat</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 9999,
              background: COLORS.brandBlue,
              color: COLORS.white,
              fontSize: 30,
              fontWeight: 700,
              fontFamily: FONTS.fraunces,
              flexShrink: 0,
            }}
          >
            →
          </span>
        </div>
      </div>
    </SlideShell>
  );
}
