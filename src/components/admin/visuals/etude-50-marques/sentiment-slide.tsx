import { SlideShell } from "../_primitives/slide-shell";
import { COLORS, FONTS } from "../_primitives/tokens";

// Slide 03 — Résultat 2 : zéro sentiment négatif.
// Gabarit 🔢 « Le chiffre qui parle » (linkedindesign.md § 6) : un seul
// gros chiffre-héros. Fond crème (la slide crème autorisée du
// carrousel v2, pour rythmer), chiffre en bleu brand.

interface Props {
  index: number;
  total: number;
}

export function SentimentSlide({ index, total }: Props) {
  return (
    <SlideShell index={index} total={total} background="cream">
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: COLORS.inkSoft,
            marginBottom: 12,
          }}
        >
          Résultat 2 / 3
        </p>

        <p
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 300,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: COLORS.brandBlue,
            margin: 0,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          0&nbsp;%
        </p>

        <p
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: COLORS.ink,
            margin: 0,
            marginTop: 36,
            maxWidth: 860,
          }}
        >
          de sentiment négatif sur 613 citations.
        </p>

        <div
          style={{
            marginTop: 56,
            background: COLORS.white,
            border: `1px solid ${COLORS.sand}`,
            borderRadius: 32,
            padding: "40px 52px",
            maxWidth: 880,
            boxShadow: "0 16px 36px -20px rgba(46, 38, 32, 0.25)",
          }}
        >
          <p
            style={{
              fontFamily: FONTS.hanken,
              fontSize: 36,
              fontWeight: 500,
              lineHeight: 1.4,
              color: COLORS.ink,
              margin: 0,
            }}
          >
            Les IA ne disent <strong>jamais</strong> de mal d&apos;une marque. Elles font
            pire&nbsp;: <strong style={{ color: COLORS.terracotta }}>elles l&apos;oublient.</strong>
          </p>
        </div>

        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 32,
            fontWeight: 500,
            color: COLORS.inkSoft,
            marginTop: 40,
            maxWidth: 820,
            lineHeight: 1.35,
          }}
        >
          Le risque n&apos;est pas le bad buzz. C&apos;est l&apos;omission silencieuse — et aucun
          analytics ne la mesure.
        </p>
      </div>
    </SlideShell>
  );
}
