import { SlideShell } from "../_primitives/slide-shell";
import { COLORS, FONTS } from "../_primitives/tokens";

// Slide 05 — Bonus : la variance inter-LLM (cas Société Générale).
// Gabarit ⚖️ Avant/Après en deux colonnes ✗/✓ (linkedindesign.md § 6).
// Fond blanc v2, mot-clé « même banque » en bleu brand.

interface Props {
  index: number;
  total: number;
}

export function VarianceSlide({ index, total }: Props) {
  return (
    <SlideShell index={index} total={total} background="white">
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: COLORS.inkSoft,
            marginBottom: 28,
          }}
        >
          Bonus — le cas qui résume tout
        </p>

        <h1
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            color: COLORS.ink,
            margin: 0,
            maxWidth: 920,
          }}
        >
          La <span style={{ color: COLORS.brandBlue }}>même banque</span>, le même jour, les mêmes
          questions.
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginTop: 56 }}>
          <ScoreCard platform="Sur ChatGPT" score="6" verdict="Quasi invisible" negative />
          <ScoreCard platform="Sur Claude" score="53" verdict="Recommandée en 2e position" />
        </div>

        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 34,
            fontWeight: 500,
            lineHeight: 1.35,
            color: COLORS.inkSoft,
            marginTop: 52,
            maxWidth: 880,
          }}
        >
          Chaque IA a ses propres sources, son propre index, ses propres préférences. Mesurer sa
          visibilité sur une seule IA, c&apos;est ne rien mesurer.
        </p>
      </div>
    </SlideShell>
  );
}

function ScoreCard({
  platform,
  score,
  verdict,
  negative = false,
}: {
  platform: string;
  score: string;
  verdict: string;
  negative?: boolean;
}) {
  const accent = negative ? COLORS.terracotta : COLORS.sage;
  return (
    <div
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.sand}`,
        borderRadius: 32,
        padding: "44px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 20,
        boxShadow: "0 16px 36px -20px rgba(46, 38, 32, 0.25)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          background: negative ? "#FBEDE7" : "#EEF4ED",
          color: COLORS.ink,
          borderRadius: 9999,
          padding: "10px 24px",
          fontFamily: FONTS.hanken,
          fontSize: 26,
          fontWeight: 700,
        }}
      >
        <span style={{ color: accent, fontSize: 28, fontWeight: 900 }}>{negative ? "✗" : "✓"}</span>
        {platform}
      </span>
      <span
        style={{
          fontFamily: FONTS.fraunces,
          fontSize: 150,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: accent,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {score}
        <span style={{ fontSize: 44, fontWeight: 600, color: COLORS.inkSoft }}> /100</span>
      </span>
      <span
        style={{
          fontFamily: FONTS.hanken,
          fontSize: 32,
          fontWeight: 600,
          color: COLORS.ink,
          lineHeight: 1.25,
        }}
      >
        {verdict}
      </span>
    </div>
  );
}
