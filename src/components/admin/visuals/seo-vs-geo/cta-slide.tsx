import { SlideShell } from "../_primitives/slide-shell";
import { COLORS, FONTS } from "../_primitives/tokens";
import { Daisy } from "../_primitives/daisy";

// Slide 03 — On en parle ? (gabarit 🤝 CTA, cf. linkedindesign.md § 6).
// Fond crème, invitation chaleureuse Fraunces Black, card-CTA pill
// terracotta + URL outil + bullets gratuit/60s/5 IA, sticker Caveat
// « test gratuit ↘ » manuscrit, marguerite déco.

interface Props {
  index: number;
  total: number;
}

export function CtaSlide({ index, total }: Props) {
  return (
    <SlideShell index={index} total={total} background="cream">
      <Daisy
        size={180}
        petalColor={COLORS.terracotta}
        centerColor={COLORS.honey}
        opacity={0.7}
        style={{ position: "absolute", top: 70, right: 70, pointerEvents: "none" }}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: COLORS.inkSoft,
            marginBottom: 24,
          }}
        >
          On regarde ça ensemble ?
        </p>

        <h1
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
            color: COLORS.ink,
            margin: 0,
            maxWidth: 880,
          }}
        >
          Teste ta visibilité IA en{" "}
          <span style={{ fontStyle: "italic", color: COLORS.terracotta }}>60 secondes.</span>
        </h1>

        <p
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 26,
            fontWeight: 500,
            fontStyle: "italic",
            color: COLORS.inkSoft,
            marginTop: 22,
            maxWidth: 760,
            lineHeight: 1.4,
          }}
        >
          Gratuit, sans CB, et tu vois direct si ChatGPT, Claude ou Perplexity parlent de toi.
        </p>

        {/* Sticker manuscrit Caveat — clin d'œil mamie, max 1 par slide */}
        <div style={{ position: "relative", marginTop: 18 }}>
          <span
            style={{
              fontFamily: FONTS.caveat,
              fontSize: 38,
              fontWeight: 700,
              color: COLORS.terracotta,
              transform: "rotate(-3deg)",
              display: "inline-block",
            }}
          >
            ↘ c&apos;est juste là
          </span>
        </div>

        {/* Card CTA - bouton pill terracotta avec URL outil */}
        <div
          style={{
            marginTop: 22,
            background: COLORS.terracotta,
            borderRadius: 28,
            padding: "26px 30px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            boxShadow: "0 24px 48px -16px rgba(46, 38, 32, 0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: 9999,
                background: COLORS.cream,
                color: COLORS.terracotta,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 700,
                fontFamily: FONTS.fraunces,
                flexShrink: 0,
              }}
            >
              →
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontFamily: FONTS.hanken,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(251, 244, 233, 0.78)",
                  margin: 0,
                }}
              >
                Outil gratuit
              </p>
              <p
                style={{
                  fontFamily: FONTS.fraunces,
                  fontSize: 26,
                  fontWeight: 700,
                  color: COLORS.cream,
                  margin: 0,
                  marginTop: 2,
                  letterSpacing: "-0.015em",
                  wordBreak: "break-all",
                }}
              >
                mamie-geo.fr/outils/test-visibilite-ia
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              paddingTop: 18,
              borderTop: "1px solid rgba(251, 244, 233, 0.22)",
            }}
          >
            <CtaPerk
              title="5"
              subtitle="IA testées"
              detail="ChatGPT · Claude · Perplexity · Gemini · Le Chat"
            />
            <CtaPerk title="60s" subtitle="Express" detail="Rapport dans ta boîte" />
            <CtaPerk title="0 €" subtitle="Sans CB" detail="Garantie 14 j si client" />
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

function CtaPerk({ title, subtitle, detail }: { title: string; subtitle: string; detail: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontFamily: FONTS.fraunces,
          fontSize: 32,
          fontWeight: 900,
          color: COLORS.honey,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: FONTS.hanken,
          fontSize: 13,
          fontWeight: 700,
          color: COLORS.cream,
          marginTop: 4,
        }}
      >
        {subtitle}
      </span>
      <span
        style={{
          fontFamily: FONTS.hanken,
          fontSize: 11,
          color: "rgba(251, 244, 233, 0.78)",
          lineHeight: 1.35,
          fontWeight: 500,
        }}
      >
        {detail}
      </span>
    </div>
  );
}
