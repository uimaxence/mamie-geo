import { COLORS, FONTS } from "../_primitives/tokens";
import { BrandHeader } from "../_primitives/brand-header";
import { Highlight } from "../_primitives/highlight";

// Cover de l'article LinkedIn « étude 50 marques × 5 IA » — format
// 1920×1080 (16:9, taille recommandée des covers d'articles LinkedIn).
// Hors SlideShell (qui est verrouillé 1080×1350) : shell dédié avec les
// mêmes constantes de marque. DA v2 : fond blanc, surligneur miel,
// stats en pills bleu brand soft.

interface Props {
  index: number;
  total: number;
}

const STATS = [
  { value: "50", label: "marques françaises" },
  { value: "5", label: "IA testées" },
  { value: "200", label: "réponses" },
  { value: "613", label: "citations analysées" },
] as const;

export function ArticleCover(_props: Props) {
  return (
    <div
      style={{
        position: "relative",
        width: 1920,
        height: 1080,
        background: COLORS.white,
        color: COLORS.ink,
        fontFamily: FONTS.hanken,
        overflow: "hidden",
        boxSizing: "border-box",
        padding: "90px 110px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <BrandHeader tint={COLORS.brandBlue} textColor={COLORS.ink} />
        <span
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: COLORS.inkSoft,
          }}
        >
          Étude exclusive — juin 2026
        </span>
      </header>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 116,
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: "-0.035em",
            color: COLORS.ink,
            margin: 0,
            maxWidth: 1560,
          }}
        >
          On a demandé à{" "}
          <Highlight color={COLORS.honey} textColor={COLORS.ink} padX={26} padY={8}>
            5 IA
          </Highlight>{" "}
          de recommander 50 marques françaises.
        </h1>

        <p
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 52,
            fontWeight: 600,
            fontStyle: "italic",
            color: COLORS.inkSoft,
            marginTop: 44,
            letterSpacing: "-0.015em",
          }}
        >
          Les résultats devraient inquiéter les plus connues.
        </p>
      </div>

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {STATS.map(({ value, label }) => (
            <span
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 12,
                background: COLORS.brandBlueSoft,
                borderRadius: 9999,
                padding: "16px 30px",
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.fraunces,
                  fontSize: 36,
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
                  fontSize: 27,
                  fontWeight: 600,
                  color: COLORS.ink,
                }}
              >
                {label}
              </span>
            </span>
          ))}
        </div>
        <span
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 26,
            fontWeight: 600,
            color: COLORS.inkSoft,
            flexShrink: 0,
          }}
        >
          mamie-geo.fr
        </span>
      </footer>
    </div>
  );
}
