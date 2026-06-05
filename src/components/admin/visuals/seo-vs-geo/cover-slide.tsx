import { SlideShell } from "../_primitives/slide-shell";
import { COLORS, FONTS } from "../_primitives/tokens";
import { Daisy } from "../_primitives/daisy";
import { Highlight } from "../_primitives/highlight";

// Slide 01 — Couverture (hook) en DA Mamie.
// (gabarit 🏡 La couverture, cf. linkedindesign.md § 6)
//
// Fond terracotta + marguerite déco grande opacité 12 % dans coin
// bottom-right + hook Fraunces Black 110px aligné gauche avec
// surligneur miel sur « une IA » + flèche `→` arrondie discrète.

interface Props {
  index: number;
  total: number;
}

export function CoverSlide({ index, total }: Props) {
  return (
    <SlideShell index={index} total={total} background="terracotta">
      {/* Marguerite déco grande, posée dans le coin bottom-right de la
       *  zone safe, opacité basse pour ne pas charger. */}
      <Daisy
        size={420}
        petalColor={COLORS.cream}
        centerColor={COLORS.honey}
        opacity={0.13}
        style={{
          position: "absolute",
          right: -40,
          bottom: 60,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <p
          style={{
            fontFamily: FONTS.hanken,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(251, 244, 233, 0.78)",
            marginBottom: 28,
          }}
        >
          La vérité qui dérange
        </p>

        <h1
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 118,
            fontWeight: 900,
            lineHeight: 0.94,
            letterSpacing: "-0.035em",
            color: COLORS.cream,
            margin: 0,
            maxWidth: 880,
          }}
        >
          40&nbsp;% de tes prospects posent leur question à{" "}
          <Highlight color={COLORS.honey} textColor={COLORS.ink} padX={20} padY={6}>
            une IA.
          </Highlight>
        </h1>

        <p
          style={{
            fontFamily: FONTS.fraunces,
            fontSize: 44,
            fontWeight: 600,
            fontStyle: "italic",
            color: "rgba(251, 244, 233, 0.92)",
            marginTop: 36,
            letterSpacing: "-0.015em",
          }}
        >
          Pas à Google.
        </p>

        <div
          style={{
            marginTop: 56,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: FONTS.hanken,
            fontSize: 22,
            fontWeight: 500,
            color: "rgba(251, 244, 233, 0.88)",
          }}
        >
          <span>On t&apos;explique pourquoi en {total - 1} slides</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 50,
              height: 50,
              borderRadius: 9999,
              background: COLORS.cream,
              color: COLORS.terracotta,
              fontSize: 26,
              fontWeight: 700,
              fontFamily: FONTS.fraunces,
            }}
          >
            →
          </span>
        </div>
      </div>
    </SlideShell>
  );
}
