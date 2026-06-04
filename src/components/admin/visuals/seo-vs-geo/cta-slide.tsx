import { SlideShell } from "../_primitives/slide-shell";
import { COLORS } from "../_primitives/tokens";

// Slide 03 — CTA test gratuit. Fond bleu brand full bleed, headline
// blanc bold, white paper-note card avec le CTA URL + bullets gratuit /
// 60 sec / 5 IA + garantie 14j en footer.

interface Props {
  index: number;
  total: number;
}

export function CtaSlide({ index, total }: Props) {
  return (
    <SlideShell index={index} total={total} background="blue">
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255, 255, 255, 0.78)",
          }}
        >
          Pas le temps de scroller ?
        </div>

        <div
          style={{
            marginTop: 14,
            fontSize: 88,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 0.96,
            letterSpacing: "-0.04em",
          }}
        >
          Teste ta
          <br />
          visibilité IA
          <br />
          en 60 secondes.
        </div>

        <div
          style={{
            marginTop: 38,
            background: COLORS.white,
            borderRadius: 24,
            padding: "30px 32px",
            boxShadow: "0 24px 48px -16px rgba(10, 10, 10, 0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              paddingBottom: 22,
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: COLORS.blue,
                color: COLORS.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              →
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: COLORS.muted,
                }}
              >
                Outil gratuit
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: COLORS.ink,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.01em",
                  marginTop: 1,
                  wordBreak: "break-all",
                }}
              >
                mamie-geo.fr/outils/test-visibilite-ia
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 14,
            }}
          >
            <CtaBullet number="5" label="IA testées" sublabel="ChatGPT · Claude · Perplexity · Gemini · Le Chat" />
            <CtaBullet number="60s" label="Express" sublabel="Rapport instantané dans ta boîte" />
            <CtaBullet number="0 €" label="Gratuit" sublabel="Pas de carte demandée" />
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.92)",
            fontWeight: 500,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.18)",
              color: COLORS.white,
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            ✓
          </span>
          <span>
            Si tu deviens client ensuite : garantie remboursement{" "}
            <strong style={{ fontWeight: 700 }}>14 jours</strong>, sans engagement.
          </span>
        </div>
      </div>
    </SlideShell>
  );
}

function CtaBullet({
  number,
  label,
  sublabel,
}: {
  number: string;
  label: string;
  sublabel: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        paddingTop: 4,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: COLORS.blue,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: COLORS.ink,
          marginTop: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 11,
          color: COLORS.muted,
          lineHeight: 1.35,
          fontWeight: 500,
        }}
      >
        {sublabel}
      </div>
    </div>
  );
}
