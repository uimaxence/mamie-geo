import { SlideShell } from "../_primitives/slide-shell";
import { COLORS } from "../_primitives/tokens";

// Slide 01 — Cover hook. Fond ink noir, hook punchy `40 %` en bleu
// brand massif, sous-titre + précision en blanc-soft. Variation
// chromatique forte (ink vs cream du slide 2) pour le scroll-stop dans
// le feed LinkedIn.

interface Props {
  index: number;
  total: number;
}

export function CoverSlide({ index, total }: Props) {
  return (
    <SlideShell index={index} total={total} background="ink">
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
            fontSize: 240,
            fontWeight: 900,
            color: COLORS.blue,
            lineHeight: 0.85,
            letterSpacing: "-0.06em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          40&nbsp;%
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 54,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            maxWidth: 880,
          }}
        >
          de tes prospects posent déjà leur question à une IA.
        </div>

        <div
          style={{
            marginTop: 22,
            fontSize: 30,
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.55)",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          Pas à Google.
        </div>

        <div
          style={{
            marginTop: 56,
            paddingTop: 28,
            borderTop: "1px solid rgba(255, 255, 255, 0.14)",
            fontSize: 19,
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.75)",
            lineHeight: 1.45,
            maxWidth: 820,
          }}
        >
          Et sur cette part, ce n&apos;est pas ton site qui répond. C&apos;est celui que{" "}
          <strong style={{ color: COLORS.white, fontWeight: 700 }}>ChatGPT</strong>,{" "}
          <strong style={{ color: COLORS.white, fontWeight: 700 }}>Claude</strong> ou{" "}
          <strong style={{ color: COLORS.white, fontWeight: 700 }}>Perplexity</strong> décide de
          citer.
        </div>
      </div>
    </SlideShell>
  );
}
